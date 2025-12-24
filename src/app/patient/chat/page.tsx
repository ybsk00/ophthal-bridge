'use client'

import { useState, useRef, useEffect } from 'react'
import { ArrowLeft, Mic, ChevronUp, X, Calendar, Stethoscope, Camera, Image as ImageIcon, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

type Message = {
    id: string
    role: 'user' | 'assistant' | 'system'
    content: string
    timestamp?: Date
}

const quickReplies = ['여드름이 심해요', '피부가 건조해요', '피부 트러블 상담', '홍조가 있어요']

export default function ChatPage() {
    const router = useRouter()
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'init',
            role: 'assistant',
            content: '안녕하세요, 아이니의원 AI 예진 상담입니다. 🦷\n\n피부 고민이 무엇인가요? 불편한 부분을 말씀해주시면 예진 정리를 도와드리겠습니다. (진단/치료 아님)',
            timestamp: new Date()
        }
    ])
    const [input, setInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [turnCount, setTurnCount] = useState(0)
    const [showAppointmentModal, setShowAppointmentModal] = useState(false)
    const [selectedImage, setSelectedImage] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setSelectedImage(file)
            const reader = new FileReader()
            reader.onloadend = () => {
                setImagePreview(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const removeImage = () => {
        setSelectedImage(null)
        setImagePreview(null)
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault()
        if ((!input.trim() && !selectedImage) || isLoading) return

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input || '사진을 첨부했습니다.',
            timestamp: new Date()
        }

        setMessages(prev => [...prev, userMessage])
        const userInput = input
        setInput('')
        removeImage()
        setIsLoading(true)

        const newTurnCount = turnCount + 1
        setTurnCount(newTurnCount)

        try {
            // Call centralized API (uses prompts.ts)
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userInput,
                    history: messages.map(m => ({
                        role: m.role === 'assistant' ? 'ai' : 'user',
                        content: m.content
                    })),
                    turnCount: newTurnCount
                })
            })

            const data = await response.json()

            // Check for reservation trigger
            let aiContent = data.content || ''
            const hasReservationTrigger = aiContent.includes('[RESERVATION_TRIGGER]')
            aiContent = aiContent.replace('[RESERVATION_TRIGGER]', '').trim()

            const aiMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: aiContent,
                timestamp: new Date()
            }
            setMessages(prev => [...prev, aiMessage])

            if (hasReservationTrigger) {
                setTimeout(() => setShowAppointmentModal(true), 800)
            }
        } catch (error) {
            console.error('Chat error:', error)
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: '죄송합니다. 일시적인 오류가 발생했습니다. 다시 시도해주세요.',
                timestamp: new Date()
            }
            setMessages(prev => [...prev, errorMessage])
        } finally {
            setIsLoading(false)
        }
    }

    const handleQuickReply = (text: string) => {
        setInput(text)
    }

    const handleFinish = async () => {
        if (!confirm('상담을 종료하시겠습니까?')) return
        router.push('/patient')
    }

    const handleBookAppointment = () => {
        setShowAppointmentModal(false)
        router.push('/patient/appointments/new')
    }

    const formatTime = (date?: Date) => {
        if (!date) return ''
        return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
    }

    // 메시지 렌더링 (마크다운 볼드 처리)
    const renderMessage = (content: string) => {
        const parts = content.split(/(\*\*[^*]+\*\*)/g)
        return parts.map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={i} className="text-blue-400">{part.slice(2, -2)}</strong>
            }
            return part
        })
    }

    return (
        <div className="flex flex-col h-screen" style={{ backgroundColor: '#0a0f1a' }}>
            {/* Header */}
            <header className="sticky top-0 z-10 px-4 py-3" style={{ backgroundColor: '#0a0f1a', borderBottom: '1px solid #1f2937' }}>
                <div className="flex items-center justify-between max-w-lg mx-auto">
                    <Link href="/patient">
                        <button className="p-2 -ml-2 text-white hover:bg-white/10 rounded-full transition-colors">
                            <ArrowLeft size={24} />
                        </button>
                    </Link>
                    <div className="text-center">
                        <h1 className="text-lg font-bold text-white">아이니의원 AI 예진</h1>
                        <div className="flex items-center justify-center gap-1.5 mt-0.5">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                            <span className="text-xs text-gray-400">상담 중 ({turnCount}턴)</span>
                        </div>
                    </div>
                    <button
                        onClick={handleFinish}
                        className="p-2 text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors text-sm font-medium"
                    >
                        종료
                    </button>
                </div>
            </header>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-6" style={{ backgroundColor: '#0a0f1a' }}>
                <div className="max-w-lg mx-auto space-y-6">
                    {/* Date Badge */}
                    <div className="flex justify-center">
                        <span className="px-4 py-1.5 text-xs text-gray-400 rounded-full" style={{ backgroundColor: '#1f2937' }}>
                            오늘 {formatTime(new Date())}
                        </span>
                    </div>

                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {msg.role === 'assistant' && (
                                <div className="flex gap-3">
                                    <div className="flex-shrink-0 w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                                        <span className="text-white text-lg">🦷</span>
                                    </div>
                                    <div className="flex flex-col gap-1 max-w-[75%]">
                                        <span className="text-xs text-gray-500">아이니의원</span>
                                        <div
                                            className="px-4 py-3 text-sm text-white leading-relaxed whitespace-pre-line"
                                            style={{
                                                backgroundColor: '#374151',
                                                borderRadius: '16px 16px 16px 4px'
                                            }}
                                        >
                                            {renderMessage(msg.content)}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {msg.role === 'user' && (
                                <div className="flex gap-3 justify-end">
                                    <div className="flex flex-col items-end gap-1 max-w-[75%]">
                                        <span className="text-xs text-gray-500">나</span>
                                        <div
                                            className="px-4 py-3 text-sm text-white leading-relaxed"
                                            style={{
                                                backgroundColor: '#2563eb',
                                                borderRadius: '16px 16px 4px 16px'
                                            }}
                                        >
                                            {msg.content}
                                        </div>
                                    </div>
                                    <div className="flex-shrink-0 w-10 h-10 rounded-full overflow-hidden bg-gray-600 flex items-center justify-center">
                                        <span className="text-white font-bold">나</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}

                    {/* Typing Indicator */}
                    {isLoading && (
                        <div className="flex gap-3">
                            <div className="flex-shrink-0 w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                                <span className="text-white text-lg">🦷</span>
                            </div>
                            <div
                                className="px-4 py-3 flex gap-1.5"
                                style={{
                                    backgroundColor: '#374151',
                                    borderRadius: '16px 16px 16px 4px'
                                }}
                            >
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input Area */}
            <div className="sticky bottom-0 border-t" style={{ backgroundColor: '#0a0f1a', borderColor: '#1f2937' }}>
                {/* Quick Replies */}
                <div className="px-4 py-3 overflow-x-auto">
                    <div className="flex gap-2 max-w-lg mx-auto">
                        {quickReplies.map((chip) => (
                            <button
                                key={chip}
                                onClick={() => handleQuickReply(chip)}
                                className="flex-shrink-0 px-4 py-2 text-sm text-gray-300 rounded-full border transition-colors hover:bg-white/5"
                                style={{ borderColor: '#374151', backgroundColor: 'transparent' }}
                            >
                                {chip}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Image Preview */}
                {imagePreview && (
                    <div className="px-4 py-2" style={{ backgroundColor: '#111827' }}>
                        <div className="max-w-lg mx-auto">
                            <div className="relative inline-block">
                                <img
                                    src={imagePreview}
                                    alt="미리보기"
                                    className="h-20 w-auto rounded-lg"
                                />
                                <button
                                    onClick={removeImage}
                                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center"
                                >
                                    <X size={14} className="text-white" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Image Upload Actions */}
                <div className="px-4 py-2">
                    <div className="flex gap-2 max-w-lg mx-auto">
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            capture="environment"
                            onChange={handleImageSelect}
                            className="hidden"
                        />
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="flex items-center gap-2 px-3 py-1.5 text-xs text-gray-300 rounded-full border transition-colors hover:bg-white/5"
                            style={{ borderColor: '#374151' }}
                        >
                            <Camera size={14} />
                            증상 사진
                        </button>
                        <button
                            onClick={() => {
                                if (fileInputRef.current) {
                                    fileInputRef.current.removeAttribute('capture')
                                    fileInputRef.current.click()
                                    setTimeout(() => {
                                        fileInputRef.current?.setAttribute('capture', 'environment')
                                    }, 100)
                                }
                            }}
                            className="flex items-center gap-2 px-3 py-1.5 text-xs text-gray-300 rounded-full border transition-colors hover:bg-white/5"
                            style={{ borderColor: '#374151' }}
                        >
                            <ImageIcon size={14} />
                            갤러리
                        </button>
                    </div>
                </div>

                {/* Input Row */}
                <div className="px-4 pb-20 pt-2">
                    <div className="flex items-center gap-3 max-w-lg mx-auto">
                        <div className="flex-1 flex items-center gap-2 px-4 py-3 rounded-full" style={{ backgroundColor: '#1f2937' }}>
                            <input
                                type="text"
                                placeholder="증상을 입력해주세요..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault()
                                        handleSubmit()
                                    }
                                }}
                                className="flex-1 bg-transparent text-white text-sm outline-none placeholder-gray-500"
                            />
                            <button className="text-gray-400 hover:text-white transition-colors">
                                <Mic size={20} />
                            </button>
                        </div>

                        <button
                            onClick={() => handleSubmit()}
                            disabled={isLoading || (!input.trim() && !selectedImage)}
                            className="p-3 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{ backgroundColor: '#10b981' }}
                        >
                            <ChevronUp size={20} className="text-white" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Appointment Modal */}
            {
                showAppointmentModal && (
                    <div className="fixed inset-0 flex items-center justify-center z-50 px-4">
                        <div
                            className="absolute inset-0 bg-black/60"
                            onClick={() => setShowAppointmentModal(false)}
                        ></div>
                        <div
                            className="relative w-full max-w-sm rounded-2xl overflow-hidden"
                            style={{ backgroundColor: '#1a2332' }}
                        >
                            {/* Modal Header */}
                            <div
                                className="p-5"
                                style={{ background: 'linear-gradient(135deg, #059669, #10b981)' }}
                            >
                                <button
                                    onClick={() => setShowAppointmentModal(false)}
                                    className="absolute top-4 right-4 text-white/70 hover:text-white"
                                >
                                    <X size={20} />
                                </button>
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                                        <Stethoscope size={24} className="text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white">아이니의원 예약</h3>
                                        <p className="text-sm text-blue-100">상담 분석 완료</p>
                                    </div>
                                </div>
                            </div>

                            {/* Modal Body */}
                            <div className="p-5">
                                {/* Warning */}
                                <div className="mb-4 p-3 rounded-xl flex items-start gap-2" style={{ backgroundColor: '#dbeafe' }}>
                                    <AlertTriangle size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
                                    <p className="text-xs text-blue-800">
                                        AI 예진은 참고용입니다. 정확한 진단을 위해 반드시 전문 피부과 의료진의 진료를 받으세요.
                                    </p>
                                </div>

                                <p className="text-sm text-gray-300 mb-5 leading-relaxed">
                                    전문 피부과 의료진의 상담을 받아보시겠어요? 지금 바로 예약하시면 빠른 시일 내에 진료받으실 수 있습니다.
                                </p>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setShowAppointmentModal(false)}
                                        className="flex-1 py-3 rounded-xl text-gray-400 font-medium border transition-colors hover:bg-white/5"
                                        style={{ borderColor: '#374151' }}
                                    >
                                        나중에
                                    </button>
                                    <button
                                        onClick={handleBookAppointment}
                                        className="flex-1 py-3 rounded-xl text-white font-bold flex items-center justify-center gap-2"
                                        style={{ backgroundColor: '#10b981' }}
                                    >
                                        <Calendar size={18} />
                                        예약하기
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
        </div>
    )
}
