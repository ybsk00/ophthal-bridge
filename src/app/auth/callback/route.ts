import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    const next = searchParams.get('next')

    if (code) {
        const supabase = await createClient()
        const { error, data } = await supabase.auth.exchangeCodeForSession(code)

        if (!error && data.user) {
            // If explicit next is provided, use it (CRM uses ?next=/patient)
            if (next) {
                return NextResponse.redirect(`${origin}${next}`)
            }

            // 헬스케어 로그인: 역할에 따라 분기
            const { data: staffUser } = await supabase
                .from('staff_users')
                .select('role')
                .eq('user_id', data.user.id)
                .single()

            // admin/doctor/staff는 /admin으로, 일반 사용자는 /medical/dashboard로
            if (staffUser?.role === 'admin' || staffUser?.role === 'doctor' || staffUser?.role === 'staff') {
                return NextResponse.redirect(`${origin}/admin`)
            }

            return NextResponse.redirect(`${origin}/medical/dashboard`)
        }
    }

    // return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}

