import { Calendar, Clock, User, ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function ReservationHistoryPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    let appointments: any[] = []
    if (user) {
        // Fetch all appointments for this user
        const { data } = await supabase
            .from('appointments')
            .select('*')
            .eq('user_id', user.id)
            .order('scheduled_at', { ascending: false })
        if (data) appointments = data
    }

    const getStatusBadge = (status: string, scheduledAt: string) => {
        const isPast = new Date(scheduledAt) < new Date()

        if (status === 'cancelled') {
            return { label: '취소됨', bg: 'bg-red-500/20', text: 'text-red-400' }
        }
        if (isPast && status !== 'cancelled') {
            return { label: '완료', bg: 'bg-green-500/20', text: 'text-green-400' }
        }
        if (status === 'confirmed') {
            return { label: '예약확정', bg: 'bg-blue-500/20', text: 'text-blue-400' }
        }
        return { label: '대기중', bg: 'bg-yellow-500/20', text: 'text-yellow-400' }
    }

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
                    <h1 className="text-xl font-bold text-white">예약 기록</h1>
                </div>

                {/* Appointment List */}
                {appointments.length > 0 ? (
                    <div className="space-y-3">
                        {appointments.map((apt) => {
                            const status = getStatusBadge(apt.status, apt.scheduled_at)
                            const date = new Date(apt.scheduled_at)

                            return (
                                <div
                                    key={apt.id}
                                    className="p-4 rounded-2xl"
                                    style={{ backgroundColor: '#1a2332', border: '1px solid #1f2937' }}
                                >
                                    <div className="flex items-start gap-4">
                                        {/* Date Box */}
                                        <div
                                            className="flex flex-col items-center justify-center w-14 h-16 rounded-xl flex-shrink-0"
                                            style={{ backgroundColor: '#111827' }}
                                        >
                                            <span className="text-xs text-gray-400">
                                                {date.getMonth() + 1}월
                                            </span>
                                            <span className="text-xl font-bold text-white">
                                                {date.getDate()}
                                            </span>
                                        </div>

                                        {/* Appointment Info */}
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-1">
                                                <h4 className="text-white font-bold">
                                                    {apt.type || '진료 예약'}
                                                </h4>
                                                <span className={`px-2 py-0.5 text-xs font-medium rounded ${status.bg} ${status.text}`}>
                                                    {status.label}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-4 text-sm text-gray-400">
                                                <div className="flex items-center gap-1">
                                                    <Clock size={14} />
                                                    <span>
                                                        {date.toLocaleTimeString('ko-KR', {
                                                            hour: 'numeric',
                                                            minute: '2-digit',
                                                            hour12: true
                                                        })}
                                                    </span>
                                                </div>
                                                {apt.doctor_name && (
                                                    <div className="flex items-center gap-1">
                                                        <User size={14} />
                                                        <span>{apt.doctor_name}</span>
                                                    </div>
                                                )}
                                            </div>

                                            {apt.notes && (
                                                <p className="mt-2 text-xs text-gray-500 line-clamp-2">
                                                    {apt.notes}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                ) : (
                    <div
                        className="flex flex-col items-center justify-center p-8 rounded-2xl text-center"
                        style={{ backgroundColor: '#1a2332', border: '1px solid #1f2937' }}
                    >
                        <div
                            className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                            style={{ backgroundColor: '#111827' }}
                        >
                            <Calendar className="w-8 h-8 text-gray-500" />
                        </div>
                        <h2 className="text-lg font-bold text-white mb-2">예약 기록이 없습니다</h2>
                        <p className="text-gray-400 text-sm mb-4">아직 예약 내역이 없습니다.</p>
                        <Link
                            href="/patient/appointments/new"
                            className="px-6 py-2.5 rounded-xl text-white font-medium"
                            style={{ backgroundColor: '#3b82f6' }}
                        >
                            예약하기
                        </Link>
                    </div>
                )}
            </div>
        </div>
    )
}
