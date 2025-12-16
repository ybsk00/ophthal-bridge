'use client'

import { useState } from 'react'
import { ArrowLeft, Clock, Sun, Moon, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react'
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

    // Time slots
    const morningSlots = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30']
    const afternoonSlots = ['14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00']

    const doctors = ['전체', '김태희', '이진수', '박지민']

    // Generate week days
    const weekDays = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(weekStart)
        date.setDate(weekStart.getDate() + i)
        return date
    })

    const dayNames = ['월', '화', '수', '목', '금', '토', '일']

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
        if (!selectedTime || isLoading) return
        setIsLoading(true)

        try {
            // Combine date and time
            const [hours, minutes] = selectedTime.split(':').map(Number)
            const scheduledAt = new Date(selectedDate)
            scheduledAt.setHours(hours, minutes, 0, 0)

            const response = await fetch('/api/patient/appointments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    scheduled_at: scheduledAt.toISOString(),
                    notes: selectedDoctor === '전체' ? 'AI한의원 진료' : `AI한의원 진료 (${selectedDoctor} 원장)`
                })
            })

            const data = await response.json()
            if (data.success) {
                setShowConfirmModal(true)
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

    // 과거 날짜인지 확인
    const isPastDate = (date: Date) => {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const checkDate = new Date(date)
        checkDate.setHours(0, 0, 0, 0)
        return checkDate < today
    }

    // 과거 시간인지 확인 (오늘의 경우)
    const isPastTime = (time: string) => {
        if (!isToday(selectedDate)) return false
        const [hours, minutes] = time.split(':').map(Number)
        const now = new Date()
        const slotTime = new Date()
        slotTime.setHours(hours, minutes, 0, 0)
        return slotTime <= now
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

                {/* Week Calendar */}
                <div
                    className="p-4 rounded-2xl mb-6"
                    style={{ backgroundColor: '#1a2332', border: '1px solid #1f2937' }}
                >
                    {/* Month Header */}
                    <div className="flex items-center justify-between mb-4">
                        <button
                            onClick={handlePrevWeek}
                            className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <span className="text-lg font-bold text-white">
                            {weekStart.getFullYear()}년 {weekStart.getMonth() + 1}월
                        </span>
                        <button
                            onClick={handleNextWeek}
                            className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>

                    {/* Week Days Grid */}
                    <div className="grid grid-cols-7 gap-2">
                        {weekDays.map((date, i) => {
                            const past = isPastDate(date)
                            return (
                                <button
                                    key={i}
                                    onClick={() => {
                                        if (past) return
                                        setSelectedDate(date)
                                        setSelectedTime(null)
                                    }}
                                    disabled={past}
                                    className={`flex flex-col items-center py-3 rounded-xl transition-all ${past
                                        ? 'text-gray-600 cursor-not-allowed opacity-50'
                                        : isSelected(date)
                                            ? 'bg-blue-500 text-white'
                                            : isToday(date)
                                                ? 'bg-blue-500/20 text-blue-400'
                                                : 'text-gray-400 hover:bg-white/5'
                                        }`}
                                >
                                    <span className="text-xs mb-1">{dayNames[i]}</span>
                                    <span className="text-lg font-bold">{date.getDate()}</span>
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* Doctor Selection */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                    {doctors.map((doctor) => (
                        <button
                            key={doctor}
                            onClick={() => setSelectedDoctor(doctor)}
                            className={`flex-shrink-0 px-4 py-2.5 text-sm font-medium rounded-full transition-all ${selectedDoctor === doctor
                                ? 'bg-blue-500 text-white'
                                : 'text-gray-400 border hover:bg-white/5'
                                }`}
                            style={{
                                borderColor: selectedDoctor === doctor ? 'transparent' : '#374151'
                            }}
                        >
                            {doctor}
                        </button>
                    ))}
                </div>

                {/* AI Recommendation */}
                <div
                    className="p-4 rounded-2xl flex items-start gap-4 mb-6"
                    style={{ backgroundColor: '#1a2332', border: '1px solid #1f2937' }}
                >
                    <div
                        className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}
                    >
                        <Sparkles size={20} className="text-white" />
                    </div>
                    <div className="flex-1">
                        <h4 className="text-sm font-bold text-white mb-1">AI 추천 시간</h4>
                        <p className="text-sm text-gray-400 leading-relaxed">
                            고객님의 지난 방문 패턴을 분석하여 <span className="text-blue-400 font-bold">오후 2시 이후</span>를 추천합니다.
                        </p>
                    </div>
                </div>

                {/* Time Slots - Morning */}
                <div className="mb-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Sun size={18} className="text-yellow-400" />
                        <span className="text-sm font-bold text-white">오전</span>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                        {morningSlots.map(time => {
                            const past = isPastTime(time)
                            return (
                                <button
                                    key={time}
                                    onClick={() => !past && setSelectedTime(time)}
                                    disabled={past}
                                    className={`py-3 rounded-xl text-sm font-medium transition-all ${past
                                        ? 'text-gray-600 cursor-not-allowed opacity-50'
                                        : selectedTime === time
                                            ? 'bg-blue-500 text-white'
                                            : 'text-gray-400 hover:bg-white/5'
                                        }`}
                                    style={{
                                        backgroundColor: past ? '#111827' : selectedTime === time ? '#3b82f6' : '#1f2937',
                                        border: selectedTime === time ? 'none' : '1px solid #374151'
                                    }}
                                >
                                    {time}
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* Time Slots - Afternoon */}
                <div className="mb-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Moon size={18} className="text-purple-400" />
                        <span className="text-sm font-bold text-white">오후</span>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                        {afternoonSlots.map(time => {
                            const past = isPastTime(time)
                            return (
                                <button
                                    key={time}
                                    onClick={() => !past && setSelectedTime(time)}
                                    disabled={past}
                                    className={`py-3 rounded-xl text-sm font-medium transition-all ${past
                                        ? 'text-gray-600 cursor-not-allowed opacity-50'
                                        : selectedTime === time
                                            ? 'bg-blue-500 text-white'
                                            : 'text-gray-400 hover:bg-white/5'
                                        }`}
                                    style={{
                                        backgroundColor: past ? '#111827' : selectedTime === time ? '#3b82f6' : '#1f2937',
                                        border: selectedTime === time ? 'none' : '1px solid #374151'
                                    }}
                                >
                                    {time}
                                </button>
                            )
                        })}
                    </div>
                </div>
            </div>

            {/* Bottom Action */}
            <div
                className="fixed bottom-16 left-0 right-0 px-4 py-4"
                style={{ backgroundColor: '#0a0f1a', borderTop: '1px solid #1f2937' }}
            >
                <div className="max-w-lg mx-auto">
                    <button
                        onClick={handleConfirm}
                        disabled={!selectedTime}
                        className="w-full py-4 rounded-xl text-white font-bold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ backgroundColor: '#3b82f6' }}
                    >
                        예약 확정
                    </button>
                </div>
            </div>

            {/* Confirmation Modal */}
            {showConfirmModal && (
                <div className="fixed inset-0 flex items-center justify-center z-50 px-4">
                    <div
                        className="absolute inset-0 bg-black/60"
                        onClick={() => setShowConfirmModal(false)}
                    ></div>
                    <div
                        className="relative w-full max-w-sm p-6 rounded-2xl"
                        style={{ backgroundColor: '#1a2332' }}
                    >
                        <h2 className="text-xl font-bold text-white mb-4 text-center">예약 완료</h2>
                        <p className="text-center text-gray-300 mb-6">
                            {formatDate(selectedDate)} {selectedTime}에<br />
                            예약이 신청되었습니다.
                        </p>
                        <button
                            onClick={handleModalClose}
                            className="w-full py-3 rounded-xl text-white font-bold"
                            style={{ backgroundColor: '#3b82f6' }}
                        >
                            확인
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
