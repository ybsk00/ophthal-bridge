import { createClient } from '@/lib/supabase/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { AppointmentsClientPage } from './AppointmentsClient'

export default async function AppointmentsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // NextAuth 세션 확인 (네이버 로그인용)
    const nextAuthSession = await getServerSession(authOptions)

    let appointments: any[] = []

    if (user) {
        // Supabase Auth 사용자: user.id로 예약 조회
        const { data } = await supabase
            .from('appointments')
            .select('*')
            .eq('user_id', user.id)
            .order('scheduled_at', { ascending: true })
        if (data) appointments = data
    } else if (nextAuthSession?.user?.id) {
        // NextAuth 사용자 (네이버 로그인): naver_user_id로 예약 조회
        const { data } = await supabase
            .from('appointments')
            .select('*')
            .eq('naver_user_id', nextAuthSession.user.id)
            .order('scheduled_at', { ascending: true })
        if (data) appointments = data
    }

    return <AppointmentsClientPage initialAppointments={appointments} />
}
