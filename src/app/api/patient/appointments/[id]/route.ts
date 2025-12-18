import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const nextAuthSession = await getServerSession(authOptions)

    // 인증 확인
    if (!user && !nextAuthSession?.user) {
        return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
    }

    try {
        const body = await request.json()
        const { status, cancel_reason } = body

        console.log('[PATCH] Request:', { id, status, cancel_reason, naverUserId: nextAuthSession?.user?.id })

        // 먼저 예약이 해당 사용자의 것인지 확인
        let appointment = null

        if (user) {
            const { data } = await supabase
                .from('appointments')
                .select('id')
                .eq('id', id)
                .eq('user_id', user.id)
                .single()
            appointment = data
        } else if (nextAuthSession?.user?.id) {
            const { data } = await supabase
                .from('appointments')
                .select('id')
                .eq('id', id)
                .eq('naver_user_id', nextAuthSession.user.id)
                .single()
            appointment = data
            console.log('[PATCH] NextAuth appointment lookup:', { appointment, naverUserId: nextAuthSession.user.id })
        }

        if (!appointment) {
            console.log('[PATCH] Appointment not found for user')
            return NextResponse.json({ error: '예약을 찾을 수 없습니다.' }, { status: 404 })
        }

        // 예약 상태 업데이트 (cancel_reason은 notes에 저장)
        const updateData: any = {}

        if (status) {
            updateData.status = status
        }
        if (cancel_reason) {
            updateData.notes = cancel_reason
        }
        if (body.scheduled_at) {
            updateData.scheduled_at = body.scheduled_at
        }

        console.log('[PATCH] Update data:', updateData)

        const { data, error } = await supabase
            .from('appointments')
            .update(updateData)
            .eq('id', id)
            .select()
            .single()

        if (error) {
            console.error('Appointment update error:', error)
            return NextResponse.json({ error: '예약 업데이트에 실패했습니다.', details: error.message }, { status: 500 })
        }

        console.log('[PATCH] Update successful:', data)
        return NextResponse.json({ success: true, appointment: data })
    } catch (error) {
        console.error('Appointment API error:', error)
        return NextResponse.json({ error: '서버 오류가 발생했습니다.', details: String(error) }, { status: 500 })
    }
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const nextAuthSession = await getServerSession(authOptions)

    // 인증 확인
    if (!user && !nextAuthSession?.user) {
        return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
    }

    let appointment = null

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

    if (!appointment) {
        return NextResponse.json({ error: '예약을 찾을 수 없습니다.' }, { status: 404 })
    }

    return NextResponse.json({ appointment })
}
