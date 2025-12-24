import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Bell, Mic, ChevronRight, Calendar, FileText, Pill, MessageSquare, Building2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { TrackReturningCustomerView } from '@/components/marketing/MarketingTracker'

export default async function PatientHome() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // NextAuth 세션 확인 (네이버 로그인용)
    const nextAuthSession = await getServerSession(authOptions)

    // Supabase 또는 NextAuth 중 하나라도 로그인되어 있으면 통과
    const isAuthenticated = !!user || !!nextAuthSession?.user

    // Redirect to home (intro page) if not authenticated
    if (!isAuthenticated) {
        redirect('/patient/home')
    }

    // 이름 결정: NextAuth 세션 우선, 그 다음 Supabase
    let patientName = '환자'

    if (nextAuthSession?.user?.name) {
        patientName = nextAuthSession.user.name
    } else if (user) {
        // Fetch patient profile using user_id
        const { data: profile } = await supabase
            .from('patient_profiles')
            .select('full_name')
            .eq('user_id', user.id)
            .single()

        if (profile) {
            patientName = profile.full_name || '환자'
        }
    }

    let upcomingAppointment = null

    if (user) {
        // Supabase Auth 사용자: user.id로 예약 조회
        const { data: appointment } = await supabase
            .from('appointments')
            .select('*')
            .eq('user_id', user.id)
            .in('status', ['scheduled', 'confirmed', 'pending'])
            .gte('scheduled_at', new Date().toISOString())
            .order('scheduled_at', { ascending: true })
            .limit(1)
            .single()

        if (appointment) {
            upcomingAppointment = appointment
        }
    } else if (nextAuthSession?.user?.id) {
        // NextAuth 사용자 (네이버 로그인): naver_user_id로 예약 조회
        const { data: appointment } = await supabase
            .from('appointments')
            .select('*')
            .eq('naver_user_id', nextAuthSession.user.id)
            .in('status', ['scheduled', 'confirmed', 'pending'])
            .gte('scheduled_at', new Date().toISOString())
            .order('scheduled_at', { ascending: true })
            .limit(1)
            .single()

        if (appointment) {
            upcomingAppointment = appointment
        }
    }

    return (
        <TrackReturningCustomerView>
            <div className="min-h-screen pb-24" style={{ backgroundColor: '#0a0f1a' }}>
                <div className="max-w-lg mx-auto px-4 pt-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full overflow-hidden" style={{ backgroundColor: '#374151' }}>
                                <div className="w-full h-full flex items-center justify-center text-blue-400 text-lg font-bold">
                                    {patientName.charAt(0)}
                                </div>
                            </div>
                            <div>
                                <p className="text-sm text-gray-400">환영합니다</p>
                                <h1 className="text-xl font-bold text-white">{patientName}님</h1>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-xl font-bold text-white">아이니의원</span>
                            <button className="relative p-2 rounded-full hover:bg-white/10 transition-colors">
                                <Bell size={24} className="text-gray-400" />
                                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
                            </button>
                        </div>
                    </div>

                    {/* Condition Check */}
                    <div className="mb-8">
                        <p className="text-gray-400 text-sm mb-1">피부 고민이</p>
                        <h2 className="text-3xl font-bold text-white mb-6">어떠신가요?</h2>

                        {/* AI Intake Card */}
                        <Link href="/patient/chat">
                            <div
                                className="relative p-6 rounded-2xl overflow-hidden cursor-pointer transition-transform hover:scale-[1.02]"
                                style={{ background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)' }}
                            >
                                {/* Decorative Stars */}
                                <div className="absolute top-4 right-4 opacity-30">
                                    <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
                                        <path d="M30 0L32 28L60 30L32 32L30 60L28 32L0 30L28 28L30 0Z" fill="white" />
                                    </svg>
                                </div>
                                <div className="absolute top-16 right-16 opacity-20">
                                    <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
                                        <path d="M15 0L16 14L30 15L16 16L15 30L14 16L0 15L14 14L15 0Z" fill="white" />
                                    </svg>
                                </div>

                                <span className="inline-block px-3 py-1 text-xs font-medium text-blue-100 bg-white/20 rounded-full mb-4">
                                    AI 예진 상담 (참고용)
                                </span>
                                <h3 className="text-xl font-bold text-white mb-2">피부 고민 정리</h3>
                                <p className="text-sm text-blue-100 mb-6 leading-relaxed">
                                    불편을 입력하면 AI가 상담 전<br />
                                    예진 정보를 정리해드립니다.
                                </p>

                                <div
                                    className="flex items-center justify-between p-3 rounded-xl"
                                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)' }}
                                >
                                    <span className="text-sm text-gray-500">증상을 입력해주세요...</span>
                                    <div className="p-2 rounded-lg" style={{ backgroundColor: '#3b82f6' }}>
                                        <Mic size={18} className="text-white" />
                                    </div>
                                </div>
                            </div>
                        </Link>
                    </div>

                    {/* Quick Menu */}
                    <div className="grid grid-cols-5 gap-3 mb-8">
                        <Link href="/patient/appointments/new" className="flex flex-col items-center gap-2">
                            <div
                                className="w-12 h-12 rounded-2xl flex items-center justify-center"
                                style={{ backgroundColor: '#1f2937' }}
                            >
                                <Calendar size={22} className="text-blue-400" />
                            </div>
                            <span className="text-xs text-gray-400">진료예약</span>
                        </Link>
                        <Link href="/patient/history" className="flex flex-col items-center gap-2">
                            <div
                                className="w-12 h-12 rounded-2xl flex items-center justify-center"
                                style={{ backgroundColor: '#1f2937' }}
                            >
                                <FileText size={22} className="text-blue-400" />
                            </div>
                            <span className="text-xs text-gray-400">예약기록</span>
                        </Link>
                        <Link href="/patient/medications" className="flex flex-col items-center gap-2">
                            <div
                                className="w-12 h-12 rounded-2xl flex items-center justify-center"
                                style={{ backgroundColor: '#1f2937' }}
                            >
                                <Pill size={22} className="text-green-400" />
                            </div>
                            <span className="text-xs text-gray-400">복약관리</span>
                        </Link>
                        <Link href="/patient/hospitals" className="flex flex-col items-center gap-2">
                            <div
                                className="w-12 h-12 rounded-2xl flex items-center justify-center"
                                style={{ backgroundColor: '#1f2937' }}
                            >
                                <Building2 size={22} className="text-purple-400" />
                            </div>
                            <span className="text-xs text-gray-400">병원조회</span>
                        </Link>
                        <Link href="/patient/chat" className="flex flex-col items-center gap-2">
                            <div
                                className="w-12 h-12 rounded-2xl flex items-center justify-center"
                                style={{ backgroundColor: '#1f2937' }}
                            >
                                <MessageSquare size={22} className="text-blue-400" />
                            </div>
                            <span className="text-xs text-gray-400">1:1상담</span>
                        </Link>
                    </div>

                    {/* Upcoming Appointment */}
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-white">다가오는 예약</h3>
                        </div>

                        {upcomingAppointment ? (
                            <div
                                className="p-4 rounded-2xl flex items-center gap-4"
                                style={{ backgroundColor: '#1a2332', border: '1px solid #1f2937' }}
                            >
                                {/* Date Box */}
                                <div
                                    className="flex flex-col items-center justify-center w-16 h-20 rounded-xl"
                                    style={{ backgroundColor: '#111827' }}
                                >
                                    <span className="text-xs text-gray-400">
                                        {new Date(upcomingAppointment.scheduled_at).getDate() === new Date().getDate() + 1 ? '내일' : ''}
                                    </span>
                                    <span className="text-2xl font-bold text-white">
                                        {new Date(upcomingAppointment.scheduled_at).getDate()}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                        {String(new Date(upcomingAppointment.scheduled_at).getMinutes()).padStart(2, '0')}
                                    </span>
                                </div>

                                {/* Appointment Info */}
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="px-2 py-0.5 text-xs font-medium text-green-400 bg-green-500/20 rounded">
                                            예약확정
                                        </span>
                                        <span className="text-xs text-gray-400">
                                            오후 {new Date(upcomingAppointment.scheduled_at).toLocaleTimeString('ko-KR', { hour: 'numeric', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <h4 className="text-white font-bold mb-0.5">진료 예약</h4>
                                    <p className="text-sm text-gray-400">
                                        {upcomingAppointment.notes || '아이니의원'}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div
                                className="p-6 rounded-2xl text-center"
                                style={{ backgroundColor: '#1a2332', border: '1px solid #1f2937' }}
                            >
                                <p className="text-gray-400">예정된 예약이 없습니다.</p>
                                <Link
                                    href="/patient/appointments/new"
                                    className="inline-block mt-3 text-sm text-blue-400 hover:text-blue-300"
                                >
                                    예약하기 →
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Notification Banner */}
                    <div
                        className="p-4 rounded-2xl flex items-center gap-3"
                        style={{ backgroundColor: '#1a2332', border: '1px solid #1f2937' }}
                    >
                        <div
                            className="w-10 h-10 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: 'rgba(251, 191, 36, 0.2)' }}
                        >
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#fbbf24' }}></div>
                        </div>
                        <div className="flex-1">
                            <h4 className="text-sm font-bold text-white">피부 관리 안내</h4>
                            <p className="text-xs text-gray-400">정기적인 피부 관리로 건강한 피부를 유지하세요.</p>
                        </div>
                        <button className="text-gray-500 hover:text-gray-300 p-1">
                            ×
                        </button>
                    </div>
                </div>
            </div>
        </TrackReturningCustomerView>
    )
}
