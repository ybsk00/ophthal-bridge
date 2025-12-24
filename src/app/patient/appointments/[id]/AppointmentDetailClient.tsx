'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Calendar, Clock, User, MapPin, Edit2, X, CheckCircle } from 'lucide-react'

type AppointmentDetailProps = {
    appointment: {
        id: string
        scheduled_at: string
        status: string
        notes?: string
        doctor_name?: string
        type?: string
    } | null
}

export function AppointmentDetailClient({ appointment }: AppointmentDetailProps) {
    const router = useRouter()
    const [showCancelModal, setShowCancelModal] = useState(false)
    const [showRescheduleModal, setShowRescheduleModal] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [cancelReason, setCancelReason] = useState('')

    if (!appointment) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0a0f1a' }}>
                <div className="text-center">
                    <h2 className="text-xl font-bold text-white mb-2">예약을 찾을 수 없습니다</h2>
                    <p className="text-gray-400 mb-4">요청한 예약 정보가 존재하지 않습니다.</p>
                    <Link href="/patient" className="text-blue-400 hover:text-blue-300">
                        홈으로 돌아가기
                    </Link>
                </div>
            </div>
        )
    }

    const date = new Date(appointment.scheduled_at)
    const isPast = date < new Date()
    const isCancelled = appointment.status === 'cancelled'

    const formatDate = (d: Date) => {
        const year = d.getFullYear()
        const month = d.getMonth() + 1
        const day = d.getDate()
        const weekday = ['일', '월', '화', '수', '목', '금', '토'][d.getDay()]
        return `${year}년 ${month}월 ${day}일 (${weekday})`
    }

    const formatTime = (d: Date) => {
        return d.toLocaleTimeString('ko-KR', { hour: 'numeric', minute: '2-digit', hour12: true })
    }

    const getStatusBadge = () => {
        if (isCancelled) return { label: '취소됨', bg: 'bg-red-500/20', text: 'text-red-400' }
        if (isPast) return { label: '완료', bg: 'bg-green-500/20', text: 'text-green-400' }
        if (appointment.status === 'confirmed') return { label: '예약확정', bg: 'bg-blue-500/20', text: 'text-blue-400' }
        return { label: '대기중', bg: 'bg-yellow-500/20', text: 'text-yellow-400' }
    }

    const handleCancel = async () => {
        setIsLoading(true)
        try {
            const response = await fetch(`/api/patient/appointments/${appointment.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'cancelled', cancel_reason: cancelReason })
            })

            if (response.ok) {
                router.refresh()
                setShowCancelModal(false)
            } else {
                alert('예약 취소에 실패했습니다.')
            }
        } catch (error) {
            alert('오류가 발생했습니다.')
        } finally {
            setIsLoading(false)
        }
    }

    const status = getStatusBadge()

    return (
        <div className="min-h-screen pb-24" style={{ backgroundColor: '#0a0f1a' }}>
            <div className="max-w-lg mx-auto px-4 pt-6">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <Link href="/patient">
                        <button className="p-2 -ml-2 text-white hover:bg-white/10 rounded-full transition-colors">
                            <ArrowLeft size={24} />
                        </button>
                    </Link>
                    <h1 className="text-xl font-bold text-white">예약 상세</h1>
                </div>

                {/* Status Card */}
                <div
                    className="p-6 rounded-2xl mb-6"
                    style={{ backgroundColor: '#1a2332', border: '1px solid #1f2937' }}
                >
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-2xl font-bold text-white">{appointment.type || '진료 예약'}</h2>
                        <span className={`px-3 py-1 text-sm font-medium rounded-full ${status.bg} ${status.text}`}>
                            {status.label}
                        </span>
                    </div>

                    <div className="space-y-4">
                        {/* Date */}
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#111827' }}>
                                <Calendar size={18} className="text-blue-400" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-400">예약 날짜</p>
                                <p className="text-white font-medium">{formatDate(date)}</p>
                            </div>
                        </div>

                        {/* Time */}
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#111827' }}>
                                <Clock size={18} className="text-green-400" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-400">예약 시간</p>
                                <p className="text-white font-medium">{formatTime(date)}</p>
                            </div>
                        </div>

                        {/* Location */}
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#111827' }}>
                                <MapPin size={18} className="text-purple-400" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-400">진료 장소</p>
                                <p className="text-white font-medium">아이니의원</p>
                            </div>
                        </div>

                        {/* Notes */}
                        {appointment.notes && (
                            <div className="pt-4 border-t border-gray-700">
                                <p className="text-sm text-gray-400 mb-2">메모</p>
                                <p className="text-gray-300">{appointment.notes}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Action Buttons */}
                {!isPast && !isCancelled && (
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={() => setShowRescheduleModal(true)}
                            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-white font-medium transition-colors"
                            style={{ backgroundColor: '#374151' }}
                        >
                            <Edit2 size={18} />
                            예약 변경
                        </button>
                        <button
                            onClick={() => setShowCancelModal(true)}
                            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-red-400 font-medium border border-red-400/30 hover:bg-red-400/10 transition-colors"
                        >
                            <X size={18} />
                            예약 취소
                        </button>
                    </div>
                )}

                {isCancelled && (
                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30">
                        <div className="flex items-center gap-2 text-red-400">
                            <X size={18} />
                            <span className="font-medium">이 예약은 취소되었습니다</span>
                        </div>
                    </div>
                )}

                {isPast && !isCancelled && (
                    <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30">
                        <div className="flex items-center gap-2 text-green-400">
                            <CheckCircle size={18} />
                            <span className="font-medium">진료가 완료되었습니다</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Cancel Modal */}
            {showCancelModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
                    <div className="w-full max-w-sm rounded-2xl p-6" style={{ backgroundColor: '#1a2332' }}>
                        <h3 className="text-xl font-bold text-white mb-4">예약을 취소하시겠습니까?</h3>
                        <p className="text-gray-400 mb-4">취소 후에는 다시 예약해야 합니다.</p>

                        <div className="mb-4">
                            <label className="block text-sm text-gray-400 mb-2">취소 사유 (선택)</label>
                            <select
                                value={cancelReason}
                                onChange={(e) => setCancelReason(e.target.value)}
                                className="w-full p-3 rounded-xl bg-gray-800 text-white border border-gray-700"
                            >
                                <option value="">선택해주세요</option>
                                <option value="일정 변경">일정 변경</option>
                                <option value="건강 상태 호전">건강 상태 호전</option>
                                <option value="다른 병원 방문">다른 병원 방문</option>
                                <option value="기타">기타</option>
                            </select>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowCancelModal(false)}
                                className="flex-1 py-3 rounded-xl text-white font-medium"
                                style={{ backgroundColor: '#374151' }}
                            >
                                돌아가기
                            </button>
                            <button
                                onClick={handleCancel}
                                disabled={isLoading}
                                className="flex-1 py-3 rounded-xl text-white font-medium bg-red-500 hover:bg-red-600 disabled:opacity-50"
                            >
                                {isLoading ? '처리중...' : '예약 취소'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reschedule Modal */}
            {showRescheduleModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
                    <div className="w-full max-w-sm rounded-2xl p-6" style={{ backgroundColor: '#1a2332' }}>
                        <h3 className="text-xl font-bold text-white mb-4">예약 변경</h3>
                        <p className="text-gray-400 mb-6">새로운 예약을 하시려면 기존 예약을 취소 후 다시 예약해주세요.</p>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowRescheduleModal(false)}
                                className="flex-1 py-3 rounded-xl text-white font-medium"
                                style={{ backgroundColor: '#374151' }}
                            >
                                닫기
                            </button>
                            <Link
                                href="/patient/appointments/new"
                                className="flex-1 py-3 rounded-xl text-white font-medium bg-blue-500 hover:bg-blue-600 text-center"
                            >
                                새 예약하기
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
