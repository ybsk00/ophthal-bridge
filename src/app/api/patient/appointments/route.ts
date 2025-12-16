import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
    }

    try {
        const body = await request.json()
        const { scheduled_at, notes } = body

        if (!scheduled_at) {
            return NextResponse.json({ error: '예약 날짜/시간이 필요합니다.' }, { status: 400 })
        }

        // 1. 사용자가 이미 환자 테이블에 있는지 확인 (user_id 또는 email로)
        let existingPatient = null

        // user_id로 먼저 확인
        const { data: patientByUserId } = await supabase
            .from('patients')
            .select('id')
            .eq('user_id', user.id)
            .single()

        if (patientByUserId) {
            existingPatient = patientByUserId
        } else if (user.email) {
            // email로 확인
            const { data: patientByEmail } = await supabase
                .from('patients')
                .select('id')
                .eq('email', user.email)
                .single()

            if (patientByEmail) {
                existingPatient = patientByEmail

                // 기존 환자에 user_id 연결 (없는 경우)
                await supabase
                    .from('patients')
                    .update({ user_id: user.id })
                    .eq('id', patientByEmail.id)
            }
        }

        let patientId = existingPatient?.id

        // 2. 환자 레코드가 없으면 자동 생성 (사용자 → 환자 전환)
        if (!patientId) {
            const scheduledDate = new Date(scheduled_at)
            const timeStr = scheduledDate.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })

            const { data: newPatient, error: patientError } = await supabase
                .from('patients')
                .insert({
                    user_id: user.id,
                    name: user.user_metadata?.name || user.email?.split('@')[0] || '환자',
                    email: user.email,
                    phone: user.user_metadata?.phone || null,
                    time: timeStr,
                    type: '신규 환자',
                    complaint: notes || 'AI한의원 진료 예약',
                    status: 'pending'
                })
                .select('id')
                .single()

            if (patientError) {
                console.error('Patient creation error:', patientError)
                // 환자 생성 실패해도 예약은 진행 (user_id로만 연결)
            } else {
                patientId = newPatient?.id
            }
        }

        // 3. 예약 생성
        const appointmentData: any = {
            user_id: user.id,
            scheduled_at,
            notes: notes || 'AI한의원 진료',
            status: 'scheduled',
        }

        // patient_id가 있으면 연결
        if (patientId) {
            appointmentData.patient_id = patientId
        }

        const { data, error } = await supabase
            .from('appointments')
            .insert(appointmentData)
            .select()
            .single()

        if (error) {
            console.error('Appointment creation error:', error)
            return NextResponse.json({ error: '예약 생성에 실패했습니다.' }, { status: 500 })
        }

        return NextResponse.json({
            success: true,
            appointment: data,
            patientCreated: !existingPatient,
            patientId: patientId
        })
    } catch (error) {
        console.error('Appointment API error:', error)
        return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
    }
}


