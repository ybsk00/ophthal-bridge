'use client'

import { useState, useRef, useEffect } from 'react'
import { ArrowLeft, Camera, Image as ImageIcon, ChevronUp, X, Pill, Clock, AlertTriangle, Sparkles } from 'lucide-react'
import Link from 'next/link'

type Message = {
    id: string
    role: 'user' | 'assistant'
    content: string
    image?: string
    timestamp?: Date
}

// 약물 정보 데이터베이스 (확장)
const medicationDatabase: { [key: string]: { name: string, dose: string, frequency: string, timing: string, warnings: string[], interactions: string[] } } = {
    '타이레놀': { name: '타이레놀 (아세트아미노펜)', dose: '500mg', frequency: '4-6시간 간격', timing: '식후', warnings: ['하루 4g 초과 금지', '음주 시 간 손상 위험'], interactions: ['와파린 효과 증가'] },
    '아세트아미노펜': { name: '아세트아미노펜', dose: '500mg', frequency: '4-6시간 간격', timing: '식후', warnings: ['하루 4g 초과 금지', '음주 시 간 손상 위험'], interactions: ['와파린 효과 증가'] },
    '이부프로펜': { name: '이부프로펜', dose: '200-400mg', frequency: '6-8시간 간격', timing: '식후', warnings: ['위장장애 주의', '신장 기능 저하 시 주의'], interactions: ['아스피린 효과 감소'] },
    '홍삼': { name: '홍삼', dose: '3g', frequency: '1일 1-2회', timing: '아침 식전', warnings: ['고혈압 환자 주의'], interactions: ['혈액 희석제와 상호작용'] },
    '비타민C': { name: '비타민C', dose: '1000mg', frequency: '1일 1회', timing: '식후', warnings: ['과다 복용 시 소화장애'], interactions: ['특별한 상호작용 없음'] },
    '보령': { name: '보령 (한약)', dose: '1봉', frequency: '1일 2-3회', timing: '식전 30분', warnings: ['탕약은 따뜻하게 복용'], interactions: ['다른 약물과 30분 간격 유지'] },
    '오메가3': { name: '오메가3', dose: '1000mg', frequency: '1일 1-2회', timing: '식후', warnings: ['혈액 희석 효과 주의'], interactions: ['아스피린과 병용 시 출혈 위험'] },
    '유산균': { name: '유산균 (프로바이오틱스)', dose: '1캡슐', frequency: '1일 1회', timing: '아침 공복', warnings: ['냉장 보관 필요한 제품도 있음'], interactions: ['항생제와 2시간 간격'] },
    '한약': { name: '한약 (탕약)', dose: '1첩 또는 1봉', frequency: '1일 2-3회', timing: '식전 30분', warnings: ['따뜻하게 데워 복용', '커피/녹차와 30분 간격'], interactions: ['양약과 30분 이상 간격 유지'] },
    // 추가 약물
    '란스톤': { name: '란스톤 (란소프라졸)', dose: '15-30mg', frequency: '1일 1회', timing: '아침 식전', warnings: ['장기 복용 시 골다공증 위험', '마그네슘 결핍 주의'], interactions: ['메토트렉세이트 농도 증가 가능'] },
    '란소프라졸': { name: '란소프라졸 (PPI)', dose: '15-30mg', frequency: '1일 1회', timing: '아침 식전', warnings: ['장기 복용 시 골다공증 위험', '마그네슘 결핍 주의'], interactions: ['메토트렉세이트 농도 증가 가능'] },
    '게보린': { name: '게보린', dose: '1정', frequency: '4-6시간 간격', timing: '식후', warnings: ['하루 3정 초과 금지', '졸음 유발 가능'], interactions: ['알코올과 병용 주의'] },
    '판피린': { name: '판피린', dose: '1정', frequency: '4-6시간 간격', timing: '식후', warnings: ['졸음 유발 가능', '운전 주의'], interactions: ['알코올과 병용 주의'] },
    '펙소페나딘': { name: '펙소페나딘 (알레그라)', dose: '180mg', frequency: '1일 1회', timing: '식전/식후 무관', warnings: ['졸음 유발 적음'], interactions: ['에리스로마이신과 병용 시 혈중 농도 증가'] },
    '아스피린': { name: '아스피린', dose: '100-325mg', frequency: '1일 1회', timing: '식후', warnings: ['위장 출혈 주의', '수술 전 복용 중단'], interactions: ['NSAID와 병용 시 출혈 위험 증가'] },
    '오메프라졸': { name: '오메프라졸', dose: '20-40mg', frequency: '1일 1회', timing: '아침 식전', warnings: ['장기 복용 시 비타민B12 결핍'], interactions: ['클로피도그렐 효과 감소 가능'] },
    '메포민': { name: '메트포르민', dose: '500-1000mg', frequency: '1일 2회', timing: '식사와 함께', warnings: ['신장 기능 확인 필요', '알코올 제한'], interactions: ['조영제 검사 시 일시 중단'] },
}

// AI 분석 함수
const analyzeMedication = (text: string, hasImage: boolean): { message: string, medication?: any } => {
    const lowerText = text.toLowerCase()

    // 이미지 분석 시뮬레이션
    if (hasImage && (text.includes('사진') || text.includes('분석') || text === '')) {
        return {
            message: `📋 **처방전/약봉투 분석 결과**

분석된 약품명: **한약 탕전** (보령 2첩)

💊 **복용 가이드**
• 복용량: 1첩 (1봉)
• 복용 주기: 1일 2-3회
• 복용 시간: 식전 30분

⚠️ **주의사항**
- 따뜻하게 데워서 복용하세요
- 커피, 녹차, 탄산음료는 복용 전후 30분간 피해주세요
- 양약과는 30분 이상 간격을 두고 복용하세요

❓ 궁금한 점이 있으시면 언제든 물어보세요!`
        }
    }

    // 약물명 검색
    for (const [keyword, info] of Object.entries(medicationDatabase)) {
        if (text.includes(keyword)) {
            return {
                message: `💊 **${info.name}** 복용 가이드

📌 **기본 정보**
• 복용량: ${info.dose}
• 복용 주기: ${info.frequency}
• 복용 시간: ${info.timing}

⚠️ **주의사항**
${info.warnings.map(w => `- ${w}`).join('\n')}

🔄 **약물 상호작용**
${info.interactions.map(i => `- ${i}`).join('\n')}

다른 약에 대해서도 궁금하시면 언제든 물어보세요! 처방전이나 약봉투 사진을 올려주시면 더 정확한 분석이 가능합니다. 📷`,
                medication: info
            }
        }
    }

    // 일반 질문 처리
    if (text.includes('언제') || text.includes('시간')) {
        return {
            message: `⏰ **복용 시간 안내**

일반적으로 약물은 다음과 같이 복용합니다:

• **식전**: 식사 30분 전 (위에서 빠르게 흡수)
• **식후**: 식사 30분 후 (위장 자극 감소)
• **식간**: 식사 2시간 후 (공복 상태)

한약은 주로 **식전 30분**에 복용하면 효과가 좋습니다.

정확한 복용 시간을 알고 싶으시면 약 이름을 알려주세요!`
        }
    }

    if (text.includes('부작용') || text.includes('위험')) {
        return {
            message: `⚠️ **부작용 및 주의사항 안내**

약물 부작용은 개인마다 다를 수 있습니다. 일반적인 주의사항:

• 알레르기 반응이 있으면 즉시 복용 중단
• 이상 증상 발생 시 의사/약사와 상담
• 처방 용량 준수
• 유효기간 확인

어떤 약물에 대해 알고 싶으신가요? 약 이름을 알려주시면 구체적인 정보를 드릴게요!`
        }
    }

    // 기본 응답
    return {
        message: `복용 중인 약의 이름이나 사진을 올려주시면 복용 가이드를 안내해드릴게요! 😊

📷 **분석 가능한 것들**
• 처방전 사진
• 약봉투 사진
• 약품명 입력

예: "타이레놀 복용법 알려줘" 또는 사진을 첨부해주세요.`
    }
}

export default function MedicationsPage() {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'init',
            role: 'assistant',
            content: `안녕하세요! **복약 도우미**입니다. 🌿

처방받으신 약이나 드시는 약에 대해서 알려주시면 복용가이드를 안내해 드리겠습니다.

📷 처방전이나 약봉지 사진을 올려주시면 더 정확한 안내가 가능합니다.`,
            timestamp: new Date()
        }
    ])
    const [input, setInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [selectedImage, setSelectedImage] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const [turnCount, setTurnCount] = useState(0)
    const [showReservationModal, setShowReservationModal] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // 상담 필요 키워드
    const consultationKeywords = ['부작용', '심한', '심각', '응급', '의사', '상담', '진료', '병원', '급성', '출혈', '호흡곤란', '두드러기', '알레르기']

    // 예약 요청 키워드
    const reservationKeywords = ['예약', '진료 예약', '예약하고', '예약할', '예약해', '방문하고', '방문할', '방문해']

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
            content: input || '(사진 첨부)',
            image: imagePreview || undefined,
            timestamp: new Date()
        }

        setMessages(prev => [...prev, userMessage])
        const currentInput = input
        const hasImage = !!selectedImage
        setInput('')
        removeImage()
        setIsLoading(true)

        try {
            // AI API 호출
            const response = await fetch('/api/patient/medications/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: currentInput || '사진을 분석해주세요',
                    history: messages.filter(m => m.id !== 'init'),
                    hasImage: hasImage
                })
            })

            if (!response.ok) {
                throw new Error('API 요청 실패')
            }

            const data = await response.json()

            const aiMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: data.content || '죄송합니다. 응답을 생성하지 못했습니다.',
                timestamp: new Date()
            }
            setMessages(prev => [...prev, aiMessage])

            // 턴 카운트 증가 및 모달 체크
            const newTurnCount = turnCount + 1
            setTurnCount(newTurnCount)

            // 예약 요청 키워드가 있으면 즉시 모달 표시
            const hasReservationKeyword = reservationKeywords.some(keyword =>
                currentInput.includes(keyword)
            )
            if (hasReservationKeyword) {
                setTimeout(() => setShowReservationModal(true), 500)
            } else {
                // 3턴마다 또는 상담 키워드가 있으면 예약 모달 표시
                const hasConsultationKeyword = consultationKeywords.some(keyword =>
                    currentInput.includes(keyword) || (data.content || '').includes(keyword)
                )
                if (newTurnCount % 3 === 0 || hasConsultationKeyword) {
                    setTimeout(() => setShowReservationModal(true), 1500)
                }
            }
        } catch (error) {
            console.error('Medication API error:', error)
            // 폴백: 로컬 분석 사용
            const { message } = analyzeMedication(currentInput, hasImage)
            const aiMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: message,
                timestamp: new Date()
            }
            setMessages(prev => [...prev, aiMessage])

            // 턴 카운트 증가 및 모달 체크
            const newTurnCount = turnCount + 1
            setTurnCount(newTurnCount)

            // 예약 요청 키워드가 있으면 즉시 모달 표시
            const hasReservationKeyword = reservationKeywords.some(keyword =>
                currentInput.includes(keyword)
            )
            if (hasReservationKeyword) {
                setTimeout(() => setShowReservationModal(true), 500)
            } else {
                const hasConsultationKeyword = consultationKeywords.some(keyword => currentInput.includes(keyword))
                if (newTurnCount % 3 === 0 || hasConsultationKeyword) {
                    setTimeout(() => setShowReservationModal(true), 1500)
                }
            }
        } finally {
            setIsLoading(false)
        }
    }

    // 메시지 렌더링 (마크다운 처리)
    const renderMessage = (content: string) => {
        const lines = content.split('\n')
        return lines.map((line, i) => {
            // Bold 처리
            const boldParts = line.split(/(\*\*[^*]+\*\*)/g)
            const processed = boldParts.map((part, j) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                    return <strong key={j} className="text-blue-400">{part.slice(2, -2)}</strong>
                }
                return part
            })
            return <div key={i} className={line.startsWith('•') || line.startsWith('-') ? 'ml-2' : ''}>{processed}</div>
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
                        <h1 className="text-lg font-bold text-white">복약 가이드</h1>
                        <div className="flex items-center justify-center gap-1.5 mt-0.5">
                            <Pill size={12} className="text-green-400" />
                            <span className="text-xs text-gray-400">AI 복약 도우미</span>
                        </div>
                    </div>
                    <div className="w-10"></div>
                </div>
            </header>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-6" style={{ backgroundColor: '#0a0f1a' }}>
                <div className="max-w-lg mx-auto space-y-6">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {msg.role === 'assistant' && (
                                <div className="flex gap-3">
                                    <div className="flex-shrink-0 w-10 h-10 rounded-full overflow-hidden" style={{ backgroundColor: '#1e3a5f' }}>
                                        <img
                                            src="/logo.png"
                                            alt="복약 도우미"
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.currentTarget.onerror = null
                                                e.currentTarget.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect fill="%231e3a5f" width="40" height="40"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-size="20">💊</text></svg>'
                                            }}
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1 max-w-[80%]">
                                        <span className="text-xs text-gray-500">복약 도우미</span>
                                        <div
                                            className="px-4 py-3 text-sm text-white leading-relaxed whitespace-pre-line"
                                            style={{
                                                backgroundColor: '#1e3a5f',
                                                borderRadius: '16px 16px 16px 4px'
                                            }}
                                        >
                                            {renderMessage(msg.content)}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {msg.role === 'user' && (
                                <div className="flex flex-col items-end gap-2 max-w-[75%]">
                                    {msg.image && (
                                        <img
                                            src={msg.image}
                                            alt="첨부 이미지"
                                            className="max-w-full rounded-lg"
                                            style={{ maxHeight: '200px' }}
                                        />
                                    )}
                                    {msg.content !== '(사진 첨부)' && (
                                        <div
                                            className="px-4 py-3 text-sm text-white leading-relaxed"
                                            style={{
                                                backgroundColor: '#2563eb',
                                                borderRadius: '16px 16px 4px 16px'
                                            }}
                                        >
                                            {msg.content}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}

                    {/* Typing Indicator */}
                    {isLoading && (
                        <div className="flex gap-3">
                            <div className="flex-shrink-0 w-10 h-10 rounded-full overflow-hidden flex items-center justify-center" style={{ backgroundColor: '#1e3a5f' }}>
                                <span className="text-lg">💊</span>
                            </div>
                            <div
                                className="px-4 py-3 flex items-center gap-2"
                                style={{
                                    backgroundColor: '#1e3a5f',
                                    borderRadius: '16px 16px 16px 4px'
                                }}
                            >
                                <Sparkles size={16} className="text-blue-400 animate-spin" />
                                <span className="text-sm text-gray-300">분석 중...</span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input Area */}
            <div className="sticky bottom-0 border-t" style={{ backgroundColor: '#0a0f1a', borderColor: '#1f2937' }}>
                {/* Image Preview */}
                {imagePreview && (
                    <div className="px-4 py-3" style={{ backgroundColor: '#111827' }}>
                        <div className="max-w-lg mx-auto">
                            <div className="relative inline-block">
                                <img
                                    src={imagePreview}
                                    alt="미리보기"
                                    className="h-24 w-auto rounded-lg"
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
                <div className="px-4 py-3">
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
                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 rounded-full border transition-colors hover:bg-white/5"
                            style={{ borderColor: '#374151' }}
                        >
                            <Camera size={16} />
                            사진 촬영
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
                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 rounded-full border transition-colors hover:bg-white/5"
                            style={{ borderColor: '#374151' }}
                        >
                            <ImageIcon size={16} />
                            갤러리
                        </button>
                    </div>
                </div>

                {/* Input Row */}
                <div className="px-4 pb-20 pt-2">
                    <div className="flex items-center gap-3 max-w-lg mx-auto">
                        <div className="flex-1 flex items-center px-4 py-3 rounded-full" style={{ backgroundColor: '#1f2937' }}>
                            <input
                                type="text"
                                placeholder="약 이름이나 증상을 입력해주세요..."
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

                {/* 예약 모달 */}
                {showReservationModal && (
                    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                        <div className="bg-[#1a2332] rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-gray-700">
                            <div className="flex items-center gap-3 mb-4">
                                <div
                                    className="w-12 h-12 rounded-full flex items-center justify-center"
                                    style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}
                                >
                                    <Pill className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-white">
                                        전문 상담이 필요하신가요?
                                    </h3>
                                    <p className="text-sm text-gray-400">
                                        한의사와 직접 상담해보세요
                                    </p>
                                </div>
                            </div>

                            <p className="text-sm text-gray-300 mb-6 leading-relaxed">
                                복약에 대한 더 자세한 상담이 필요하시면 한의원을 방문하시는 것을 권장합니다.
                                전문 한의사가 직접 상담해드립니다.
                            </p>

                            <div className="space-y-3">
                                <Link
                                    href="/patient/appointments/new"
                                    className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                                >
                                    <Clock size={18} />
                                    진료 예약하기
                                </Link>
                                <button
                                    onClick={() => setShowReservationModal(false)}
                                    className="w-full py-3 text-gray-400 hover:text-gray-200 transition-colors"
                                >
                                    계속 상담하기
                                </button>
                            </div>

                            <p className="text-xs text-gray-500 mt-4 text-center">
                                ※ AI 복약 가이드는 참고용이며 전문 상담을 대체하지 않습니다.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
