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
            console.log('Auth Callback: User authenticated', data.user.id)

            // 헬스케어 로그인: 역할에 따라 분기
            const { data: staffUser } = await supabase
                .from('staff_users')
                .select('role')
                .eq('user_id', data.user.id)
                .single()

            console.log('Auth Callback: Staff role', staffUser?.role)

            // admin/doctor/staff는 /admin으로
            if (staffUser?.role === 'admin' || staffUser?.role === 'doctor' || staffUser?.role === 'staff') {
                console.log('Auth Callback: Redirecting to /admin')
                return NextResponse.redirect(`${origin}/admin`)
            }

            // 환자 정보 확인
            const { data: patient } = await supabase
                .from('patients')
                .select('id')
                .eq('user_id', data.user.id)
                .single()

            console.log('Auth Callback: Patient found', !!patient)

            // 환자 정보가 없으면 추가 정보 입력 페이지로 이동
            if (!patient) {
                console.log('Auth Callback: Redirecting to signup')
                return NextResponse.redirect(`${origin}/patient/signup/social`)
            }

            // If explicit next is provided, use it (CRM uses ?next=/patient)
            if (next) {
                console.log('Auth Callback: Redirecting to next', next)
                return NextResponse.redirect(`${origin}${next}`)
            }

            console.log('Auth Callback: Redirecting to /patient')
            return NextResponse.redirect(`${origin}/patient`)
        }
    }

    // return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}

