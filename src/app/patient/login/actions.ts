'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function patientLogin(formData: FormData) {
    const supabase = await createClient()

    const email = formData.get('patient-email') as string
    const password = formData.get('patient-password') as string

    if (!email || !password) {
        redirect('/patient/login?error=' + encodeURIComponent('이메일과 비밀번호를 입력해주세요.'))
    }

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        const errorMessage = getKoreanErrorMessage(error.message)
        redirect('/patient/login?error=' + encodeURIComponent(errorMessage))
    }

    revalidatePath('/', 'layout')
    redirect('/patient')
}

export async function patientSignup(formData: FormData) {
    const supabase = await createClient()

    const email = formData.get('patient-email') as string
    const password = formData.get('patient-password') as string
    const name = formData.get('name') as string || email.split('@')[0]
    const phone = formData.get('phone') as string

    if (!email || !password) {
        redirect('/patient/login?error=' + encodeURIComponent('이메일과 비밀번호를 입력해주세요.') + '&tab=signup')
    }

    if (password.length < 6) {
        redirect('/patient/login?error=' + encodeURIComponent('비밀번호는 6자 이상이어야 합니다.') + '&tab=signup')
    }

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            emailRedirectTo: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/auth/callback?next=/patient`,
            data: {
                role: 'patient',
                name: name,
                phone: phone,
            },
        },
    })

    if (error) {
        const errorMessage = getKoreanErrorMessage(error.message)
        redirect('/patient/login?error=' + encodeURIComponent(errorMessage) + '&tab=signup')
    }

    // Check if email confirmation is required
    if (data.user?.identities?.length === 0) {
        redirect('/patient/login?message=' + encodeURIComponent('이미 가입된 이메일입니다. 로그인해주세요.'))
    }

    redirect('/patient/login?message=' + encodeURIComponent('회원가입 완료! 이메일을 확인해주세요.'))
}

function getKoreanErrorMessage(message: string): string {
    if (message.includes('Invalid login credentials')) {
        return '이메일 또는 비밀번호가 올바르지 않습니다.'
    }
    if (message.includes('Email not confirmed')) {
        return '이메일 인증이 완료되지 않았습니다. 이메일을 확인해주세요.'
    }
    if (message.includes('User already registered')) {
        return '이미 가입된 이메일입니다.'
    }
    if (message.includes('Password should be')) {
        return '비밀번호는 6자 이상이어야 합니다.'
    }
    if (message.includes('rate limit')) {
        return '너무 많은 시도가 있었습니다. 잠시 후 다시 시도해주세요.'
    }
    return message
}

export async function signInWithGoogle() {
    const supabase = await createClient()

    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://jukjeon-haniwon-ai-healthcare.vercel.app'}/auth/callback?next=/patient`,
        },
    })

    if (error) {
        return { error: 'Google 로그인에 실패했습니다.' }
    }

    return { url: data.url }
}

export async function signInWithKakao() {
    const supabase = await createClient()

    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'kakao',
        options: {
            redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://jukjeon-haniwon-ai-healthcare.vercel.app'}/auth/callback?next=/patient`,
        },
    })

    if (error) {
        return { error: '카카오 로그인에 실패했습니다.' }
    }

    return { url: data.url }
}
