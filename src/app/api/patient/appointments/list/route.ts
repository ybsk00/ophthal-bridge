import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
    }

    try {
        console.log('=== APPOINTMENTS LIST DEBUG ===')
        console.log('User ID:', user.id)
        console.log('User email:', user.email)

        // 1. user_id로 직접 연결된 예약 조회
        const { data: directAppointments, error: directError } = await supabase
            .from('appointments')
            .select('*')
            .eq('user_id', user.id)
            .order('scheduled_at', { ascending: true })

        console.log('Direct appointments query result:', {
            count: directAppointments?.length || 0,
            error: directError,
            data: directAppointments
        })

        // 2. patient_id를 통해 연결된 예약도 조회 (환자 레코드의 user_id가 현재 사용자인 경우)
        const { data: patientRecord } = await supabase
            .from('patients')
            .select('id')
            .eq('user_id', user.id)
            .single()

        let patientAppointments: any[] = []
        if (patientRecord?.id) {
            const { data: patientAppts } = await supabase
                .from('appointments')
                .select('*')
                .eq('patient_id', patientRecord.id)
                .is('user_id', null) // user_id가 없는 것만 (중복 방지)
                .order('scheduled_at', { ascending: true })

            patientAppointments = patientAppts || []
        }

        // 3. 두 결과 합치기 (중복 제거)
        const allAppointments = [...(directAppointments || []), ...patientAppointments]
        const uniqueAppointments = allAppointments.filter((appt, index, self) =>
            index === self.findIndex(a => a.id === appt.id)
        )

        // 날짜순 정렬
        uniqueAppointments.sort((a, b) =>
            new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()
        )

        console.log('Appointments found:', uniqueAppointments.length)

        if (directError) {
            console.error('Appointments fetch error:', directError)
            return NextResponse.json({ error: '예약 목록 조회에 실패했습니다.' }, { status: 500 })
        }

        return NextResponse.json({ appointments: uniqueAppointments })
    } catch (error) {
        console.error('Appointments list API error:', error)
        return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
    }
}
