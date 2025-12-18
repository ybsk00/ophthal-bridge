'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Clock, Sun, Moon, ChevronLeft, ChevronRight, Sparkles, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function NewAppointmentPage() {
    const router = useRouter()
    const [selectedDate, setSelectedDate] = useState<Date>(new Date())
    const [selectedTime, setSelectedTime] = useState<string | null>(null)
    const [selectedDoctor, setSelectedDoctor] = useState<string>('전체')
    const [weekStart, setWeekStart] = useState<Date>(() => {
        const today = new Date()
        const day = today.getDay()
        const diff = today.getDate() - day + (day === 0 ? -6 : 1)
        return new Date(today.setDate(diff))
    })
    const [showConfirmModal, setShowConfirmModal] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [availableSlots, setAvailableSlots] = useState<string[]>([])
    const [bookedSlots, setBookedSlots] = useState<string[]>([])
    const [isLoadingSlots, setIsLoadingSlots] = useState(false)

    const doctors = ['전체', '최서형 이사장', '노기환 원장', '나병조 원장', '최규호 원장']

    // Generate week days
    const weekDays = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(weekStart)
        date.setDate(weekStart.getDate() + i)
        return date
    })

    const dayNames = ['월', '화', '수', '목', '금', '토', '일']

    // 예약 가능 시간 조회
    useEffect(() => {
        const fetchAvailableSlots = async () => {
            setIsLoadingSlots(true)
            try {
                const dateStr = selectedDate.toISOString().split('T')[0]
                const doctorParam = selectedDoctor !== '전체' ? `&doctor_name=${encodeURIComponent(selectedDoctor)}` : ''

                const response = await fetch(`/api/appointments/available-slots?date=${dateStr}${doctorParam}`)
                const data = await response.json()

                if (data.available_slots) {
                    setAvailableSlots(data.available_slots)
                    setBookedSlots(data.booked_slots || [])
                }
            } catch (error) {
                console.error('Error fetching slots:', error)
            } finally {
                setIsLoadingSlots(false)
            }
        }

        fetchAvailableSlots()
    }, [selectedDate, selectedDoctor])

    // 선택한 시간이 불가능해지면 초기화
    useEffect(() => {
        if (selectedTime && !availableSlots.includes(selectedTime)) {
            setSelectedTime(null)
        }
    }, [availableSlots, selectedTime])

    // 시간 슬롯을 오전/오후로 분류
    const morningSlots = availableSlots.filter(t => {
        const hour = parseInt(t.split(':')[0])
        return hour < 12
    })

    const afternoonSlots = availableSlots.filter(t => {
        const hour = parseInt(t.split(':')[0])
        return hour >= 12
    })

    const handlePrevWeek = () => {
        const newStart = new Date(weekStart)
        newStart.setDate(weekStart.getDate() - 7)
        setWeekStart(newStart)
    }

    const handleNextWeek = () => {
        const newStart = new Date(weekStart)
        newStart.setDate(weekStart.getDate() + 7)
        setWeekStart(newStart)
    }

    const handleConfirm = async () => {
        if (!selectedTime || isLoading || selectedDoctor === '전체') return
        setIsLoading(true)

        try {
            const [hours, minutes] = selectedTime.split(':').map(Number)
            const scheduledAt = new Date(selectedDate)
            scheduledAt.setHours(hours, minutes, 0, 0)

            const response = await fetch('/api/patient/appointments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    scheduled_at: scheduledAt.toISOString(),
                    notes: selectedDoctor === '전체' ? '위담한방병원 진료' : `위담한방병원 진료 (${selectedDoctor})`,
                    doctor_name: selectedDoctor  // 의사 이름 추가
                })
            })

            const data = await response.json()
            if (data.success) {
                setShowConfirmModal(true)
            } else if (data.code === 'DUPLICATE_APPOINTMENT') {
                alert('이미 예약된 시간입니다. 다른 시간을 선택해주세요.')
                // 시간 슬롯 새로고침
                const dateStr = selectedDate.toISOString().split('T')[0]
                const doctorParam = selectedDoctor !== '전체' ? `&doctor_name=${encodeURIComponent(selectedDoctor)}` : ''
                const refreshResponse = await fetch(`/api/appointments/available-slots?date=${dateStr}${doctorParam}`)
                const refreshData = await refreshResponse.json()
                if (refreshData.available_slots) {
                    setAvailableSlots(refreshData.available_slots)
                    setBookedSlots(refreshData.booked_slots || [])
                }
            } else {
                alert(data.error || '예약에 실패했습니다.')
            }
        } catch (error) {
            console.error('Appointment error:', error)
            alert('예약 중 오류가 발생했습니다.')
        } finally {
            setIsLoading(false)
        }
    }

    const handleModalClose = () => {
        setShowConfirmModal(false)
        router.push('/patient/appointments')
    }

    const isToday = (date: Date) => {
        const today = new Date()
        return date.toDateString() === today.toDateString()
    }

    const isSelected = (date: Date) => {
        return date.toDateString() === selectedDate.toDateString()
    }

    const isPastDate = (date: Date) => {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const checkDate = new Date(date)
        checkDate.setHours(0, 0, 0, 0)
        return checkDate < today
    }

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' })
    }

    return (
        <div className="min-h-screen pb-24" style={{ backgroundColor: '#0a0f1a' }}>
            <div className="max-w-lg mx-auto px-4 pt-6">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <Link href="/patient/appointments">
                        <button className="p-2 -ml-2 text-white hover:bg-white/10 rounded-full transition-colors">
                            <ArrowLeft size={24} />
                        </button>
                    </Link>
                    <h1 className="text-xl font-bold text-white">예약 시간 선택</h1>
                </div>

                {/* Calendar Section */}
                <div
                    className="p-4 rounded-2xl mb-6"
                    style={{ backgroundColor: '#1a2332', border: '1px solid #1f2937' }}
                >
                    {/* Month Navigation */}
                    <div className="flex items-center justify-between mb-4">
                        <button
                            onClick={handlePrevWeek}
                            className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <span className="text-white font-medium">
                            {weekStart.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' })}
                        </span>
                        <button
                            onClick={handleNextWeek}
                            className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>

                    {/* Week Days */}
                    <div className="flex justify-between">
                        {weekDays.map((date, index) => {
                            const isPast = isPastDate(date)
                            const isSelectedDay = isSelected(date)
                            const isTodayDate = isToday(date)

                            return (
                                <button
                                    key={index}
                                    onClick={() => !isPast && setSelectedDate(date)}
                                    disabled={isPast}
                                    className={`flex flex-col items-center py-2 px-3 rounded-xl transition-all ${isPast
                                        ? 'opacity-30 cursor-not-allowed'
                                        : isSelectedDay
                                            ? 'bg-blue-500 text-white'
                                            : 'text-gray-400 hover:bg-white/10'
                                        }`}
                                >
                                    <span className={`text-xs mb-1 ${isSelectedDay ? 'text-white' : isTodayDate ? 'text-blue-400' : ''}`}>
                                        {dayNames[index]}
                                    </span>
                                    <span className={`text-lg font-bold ${isSelectedDay ? 'text-white' : isTodayDate ? 'text-blue-400' : 'text-white'}`}>
                                        {date.getDate()}
                                    </span>
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* Doctor Selection */}
                <div className="mb-6">
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        {doctors.map(doctor => (
                            <button
                                key={doctor}
                                onClick={() => setSelectedDoctor(doctor)}
                                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${selectedDoctor === doctor
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                                    }`}
                            >
                                {doctor}
                            </button>
                        ))}
                    </div>
                </div>

                {/* AI Recommendation */}
                <div
                    className="p-4 rounded-2xl mb-6"
                    style={{ background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(59, 130, 246, 0.15))', border: '1px solid rgba(139, 92, 246, 0.3)' }}
                >
                    <div className="flex items-start gap-3">
                        <div
                            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{ background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)' }}
                        >
                            <Sparkles size={20} className="text-white" />
                        </div>
                        <div>
                            <h4 className="text-white font-bold mb-1">AI 추천 시간</h4>
                            <p className="text-sm text-gray-300">
                                고객님의 지난 방문 패턴을 분석하여 <span className="text-purple-400 font-medium">오후 2시 이후</span>를 추천합니다.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Loading Indicator */}
                {isLoadingSlots && (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="animate-spin text-blue-400" size={32} />
                        <span className="ml-2 text-gray-400">예약 가능 시간 조회중...</span>
                    </div>
                )}

                {!isLoadingSlots && (
                    <>
                        {/* Morning Time Slots */}
                        <div className="mb-6">
                            <div className="flex items-center gap-2 mb-3">
                                <Sun size={18} className="text-yellow-400" />
                                <h3 className="text-white font-medium">오전</h3>
                                <span className="text-xs text-gray-500">({morningSlots.length}개 가능)</span>
                            </div>
                            {morningSlots.length > 0 ? (
                                <div className="grid grid-cols-4 gap-2">
                                    {morningSlots.map(time => (
                                        <button
                                            key={time}
                                            onClick={() => setSelectedTime(time)}
                                            className={`py-3 px-2 rounded-xl text-sm font-medium transition-all ${selectedTime === time
                                                ? 'bg-blue-500 text-white'
                                                : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700 border border-gray-700'
                                                }`}
                                        >
                                            {time}
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 text-sm">예약 가능한 시간이 없습니다.</p>
                            )}
                        </div>

                        {/* Afternoon Time Slots */}
                        <div className="mb-6">
                            <div className="flex items-center gap-2 mb-3">
                                <Moon size={18} className="text-blue-400" />
                                <h3 className="text-white font-medium">오후</h3>
                                <span className="text-xs text-gray-500">({afternoonSlots.length}개 가능)</span>
                            </div>
                            {afternoonSlots.length > 0 ? (
                                <div className="grid grid-cols-4 gap-2">
                                    {afternoonSlots.map(time => (
                                        <button
                                            key={time}
                                            onClick={() => setSelectedTime(time)}
                                            className={`py-3 px-2 rounded-xl text-sm font-medium transition-all ${selectedTime === time
                                                ? 'bg-blue-500 text-white'
                                                : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700 border border-gray-700'
                                                }`}
                                        >
                                            {time}
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 text-sm">예약 가능한 시간이 없습니다.</p>
                            )}
                        </div>

                        {/* No Available Slots Message */}
                        {morningSlots.length === 0 && afternoonSlots.length === 0 && (
                            <div
                                className="p-6 rounded-2xl text-center mb-6"
                                style={{ backgroundColor: '#1a2332', border: '1px solid #1f2937' }}
                            >
                                <p className="text-gray-400 mb-2">이 날짜에 예약 가능한 시간이 없습니다.</p>
                                <p className="text-sm text-gray-500">다른 날짜나 의사를 선택해주세요.</p>
                            </div>
                        )}
                    </>
                )}

                {/* Confirm Button */}
                <button
                    onClick={handleConfirm}
                    disabled={!selectedTime || isLoading || selectedDoctor === '전체'}
                    className={`w-full py-4 rounded-full font-bold text-lg transition-all ${selectedTime && !isLoading && selectedDoctor !== '전체'
                            ? 'bg-blue-500 text-white hover:bg-blue-600'
                            : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                        }`}
                >
                    {isLoading ? '예약 중...' : selectedDoctor === '전체' ? '의사를 선택해주세요' : '예약 확정'}
                </button>
            </div>

            {/* Confirmation Modal */}
            {showConfirmModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
                    <div
                        className="w-full max-w-sm rounded-2xl p-6 text-center"
                        style={{ backgroundColor: '#1a2332' }}
                    >
                        <h3 className="text-xl font-bold text-white mb-4">예약 완료</h3>
                        <p className="text-gray-300 mb-6">
                            {formatDate(selectedDate)} {selectedTime}에<br />
                            예약이 신청되었습니다.
                        </p>
                        <button
                            onClick={handleModalClose}
                            className="w-full py-3 bg-blue-500 text-white font-medium rounded-xl hover:bg-blue-600 transition-colors"
                        >
                            확인
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
