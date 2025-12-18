import { createClient } from '@/lib/supabase/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { AppointmentDetailClient } from './AppointmentDetailClient'
import { redirect } from 'next/navigation'

export default async function AppointmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const nextAuthSession = await getServerSession(authOptions)

    // 인증 확인
    if (!user && !nextAuthSession?.user) {
        redirect('/patient/login')
    }

    let appointment = null

    // 예약 조회 - user_id 또는 naver_user_id로 필터링
    if (user) {
        const { data } = await supabase
            .from('appointments')
            .select('*')
            .eq('id', id)
            .eq('user_id', user.id)
            .single()
        appointment = data
    } else if (nextAuthSession?.user?.id) {
        const { data } = await supabase
            .from('appointments')
            .select('*')
            .eq('id', id)
            .eq('naver_user_id', nextAuthSession.user.id)
            .single()
        appointment = data
    }

    return <AppointmentDetailClient appointment={appointment} />
}
