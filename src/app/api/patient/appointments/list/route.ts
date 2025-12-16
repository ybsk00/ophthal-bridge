import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
    }

    try {
        console.log('Fetching appointments for user:', user.id)
        const { data, error } = await supabase
            .from('appointments')
            .select('*')
            .eq('user_id', user.id)
            .order('scheduled_at', { ascending: true })

        console.log('Appointments found:', data?.length, 'Error:', error)

        if (error) {
            console.error('Appointments fetch error:', error)
            return NextResponse.json({ error: '예약 목록 조회에 실패했습니다.' }, { status: 500 })
        }

        return NextResponse.json({ appointments: data || [] })
    } catch (error) {
        console.error('Appointments list API error:', error)
        return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
    }
}
