'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, ArrowLeft, Plus, Mic, ChevronUp, X, Calendar, Clock, Stethoscope, Camera, Image as ImageIcon } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

type Message = {
    id: string
    role: 'user' | 'assistant' | 'system'
    content: string
    timestamp?: Date
}

const quickReplies = ['체온 측정 안 함', '37.5도 이상', '오한 있음', '기침/가래']

export default function ChatPage() {
    const router = useRouter()
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'init',
            role: 'assistant',
            content: '안녕하세요. 오늘 어디가 불편하신가요? 자세히 말씀해 주시면 진료에 도움이 됩니다.',
            timestamp: new Date()
        }
    ])
    const [input, setInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [turnCount, setTurnCount] = useState(0)
    const [showAppointmentModal, setShowAppointmentModal] = useState(false)
    const [suggestedConditions, setSuggestedConditions] = useState<string[]>([])
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
        setInput('')
        removeImage()
        setIsLoading(true)

        const newTurnCount = turnCount + 1
        setTurnCount(newTurnCount)

        // Simulate AI response
        setTimeout(() => {
            let aiContent = ''
            if (newTurnCount === 1) {
                aiContent = '증상에 대해 더 자세히 알려주세요. 언제부터 증상이 시작되었나요?'
            } else if (newTurnCount === 2) {
                aiContent = '증상의 정도는 어떠신가요? 일상생활에 지장이 있으신가요?'
            } else if (newTurnCount === 3) {
                aiContent = '다른 동반 증상이 있으신가요? 예를 들어 두통, 발열, 피로감 등이요.'
            } else if (newTurnCount >= 4) {
                aiContent = '지금까지 말씀해주신 증상을 종합하면, 전문의 상담이 필요해 보입니다. 예약을 도와드릴까요?'
                setSuggestedConditions(['일반 진료', '정밀 검사'])
                setTimeout(() => setShowAppointmentModal(true), 1000)
            }

            const aiMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: aiContent,
                timestamp: new Date()
            }
            setMessages(prev => [...prev, aiMessage])
            setIsLoading(false)
        }, 1500)
    }

    const handleQuickReply = (text: string) => {
        setInput(text)
    }

    const handleFinish = async () => {
        if (!confirm('문진을 종료하고 제출하시겠습니까?')) return
        alert('문진이 완료되었습니다. 예약 페이지로 이동합니다.')
        router.push('/patient/appointments')
    }

    const handleBookAppointment = () => {
        setShowAppointmentModal(false)
        router.push('/patient/appointments/new')
    }

    const formatTime = (date?: Date) => {
        if (!date) return ''
        return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
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
                        <h1 className="text-lg font-bold text-white">AI 문진</h1>
                        <div className="flex items-center justify-center gap-1.5 mt-0.5">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                            <span className="text-xs text-gray-400">진행 중 ({turnCount}/10턴)</span>
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
                            오늘 오전 {formatTime(new Date())}
                        </span>
                    </div>

                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {msg.role === 'assistant' && (
                                <div className="flex gap-3">
                                    <div className="flex-shrink-0 w-10 h-10 rounded-full overflow-hidden bg-blue-500 flex items-center justify-center">
                                        <span className="text-white font-bold">AI</span>
                                    </div>
                                    <div className="flex flex-col gap-1 max-w-[75%]">
                                        <span className="text-xs text-gray-500">AI 어시스턴트</span>
                                        <div
                                            className="px-4 py-3 text-sm text-white leading-relaxed"
                                            style={{
                                                backgroundColor: '#374151',
                                                borderRadius: '16px 16px 16px 4px'
                                            }}
                                        >
                                            {msg.content}
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
                            <div className="flex-shrink-0 w-10 h-10 rounded-full overflow-hidden bg-blue-500 flex items-center justify-center">
                                <span className="text-white font-bold">AI</span>
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
                            style={{ backgroundColor: '#3b82f6' }}
                        >
                            <ChevronUp size={20} className="text-white" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Appointment Modal */}
            {showAppointmentModal && (
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
                            style={{ background: 'linear-gradient(135deg, #1e40af, #3b82f6)' }}
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
                                    <h3 className="text-lg font-bold text-white">진료 예약 안내</h3>
                                    <p className="text-sm text-blue-100">증상 분석 완료</p>
                                </div>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div className="p-5">
                            {suggestedConditions.length > 0 && (
                                <div className="mb-4 p-4 rounded-xl" style={{ backgroundColor: '#111827' }}>
                                    <p className="text-sm text-gray-400 mb-2">추천 진료</p>
                                    <div className="space-y-2">
                                        {suggestedConditions.map((condition, i) => (
                                            <div key={i} className="flex items-center gap-2">
                                                <span className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-xs text-blue-400">
                                                    {i + 1}
                                                </span>
                                                <span className="text-sm text-white">{condition}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <p className="text-sm text-gray-300 mb-5 leading-relaxed">
                                정확한 진단을 위해 의사 선생님과 상담하시는 것이 좋겠습니다. 지금 바로 예약하시겠습니까?
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
                                    style={{ backgroundColor: '#3b82f6' }}
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
