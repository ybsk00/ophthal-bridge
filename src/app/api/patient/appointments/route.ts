import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(request: NextRequest) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // NextAuth 세션 확인 (네이버 로그인용)
    const nextAuthSession = await getServerSession(authOptions)

    // Supabase 또는 NextAuth 중 하나라도 있어야 함
    if (!user && !nextAuthSession?.user) {
        return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
    }

    // 사용자 정보 결정 (Supabase 우선, 없으면 NextAuth)
    const userId = user?.id || null
    const naverUserId = nextAuthSession?.user?.id || null  // 네이버 사용자 ID
    const userName = user?.user_metadata?.name || nextAuthSession?.user?.name || '환자'
    const userEmail = user?.email || nextAuthSession?.user?.email || null

    try {
        const body = await request.json()
        const { scheduled_at, notes } = body

        if (!scheduled_at) {
            return NextResponse.json({ error: '예약 날짜/시간이 필요합니다.' }, { status: 400 })
        }

        // 1. 사용자가 이미 환자 테이블에 있는지 확인 (user_id 또는 email로)
        let existingPatient = null

        // user_id로 먼저 확인 (Supabase Auth 사용자만)
        if (userId) {
            const { data: patientByUserId } = await supabase
                .from('patients')
                .select('id')
                .eq('user_id', userId)
                .single()

            if (patientByUserId) {
                existingPatient = patientByUserId
            }
        }

        // user_id로 없으면 email로 확인
        if (!existingPatient && userEmail) {
            const { data: patientByEmail } = await supabase
                .from('patients')
                .select('id')
                .eq('email', userEmail)
                .single()

            if (patientByEmail) {
                existingPatient = patientByEmail

                // 기존 환자에 user_id 연결 (Supabase Auth 사용자인 경우만)
                if (userId) {
                    await supabase
                        .from('patients')
                        .update({ user_id: userId })
                        .eq('id', patientByEmail.id)
                }
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
                    user_id: userId,  // null if NextAuth only
                    name: userName,
                    email: userEmail,
                    phone: user?.user_metadata?.phone || null,
                    time: timeStr,
                    type: '신규 환자',
                    complaint: notes || 'AI한의원 진료 예약',
                    status: 'pending'
                })
                .select('id')
                .single()

            if (patientError) {
                console.error('Patient creation error:', patientError)
                // 환자 생성 실패해도 예약은 진행
            } else {
                patientId = newPatient?.id
            }
        }

        // 3. 예약 생성
        const appointmentData: any = {
            scheduled_at,
            notes: notes || 'AI한의원 진료',
            status: 'scheduled',
        }

        // user_id가 있으면 추가 (Supabase Auth 사용자)
        if (userId) {
            appointmentData.user_id = userId
        }

        // naver_user_id 추가 (NextAuth 네이버 사용자 조회용)
        if (naverUserId) {
            appointmentData.naver_user_id = naverUserId
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


