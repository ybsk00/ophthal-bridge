'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function patientLogin(formData: FormData): Promise<{ error?: string; success?: boolean }> {
    const supabase = await createClient()

    const email = formData.get('patient-email') as string
    const password = formData.get('patient-password') as string

    if (!email || !password) {
        return { error: '이메일과 비밀번호를 입력해주세요.' }
    }

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        const errorMessage = getKoreanErrorMessage(error.message)
        return { error: errorMessage }
    }

    revalidatePath('/', 'layout')

    // Admin redirection logic
    if (data.user?.email === 'admin@admin.com' || data.user?.user_metadata?.role === 'admin') {
        redirect('/admin')
    }

    redirect('/patient')
}

export async function patientSignup(formData: FormData): Promise<{ error?: string; message?: string }> {
    const supabase = await createClient()

    const email = formData.get('patient-email') as string
    const password = formData.get('patient-password') as string
    const name = formData.get('name') as string || email.split('@')[0]
    const phone = formData.get('phone') as string

    if (!email || !password) {
        return { error: '이메일과 비밀번호를 입력해주세요.' }
    }

    if (password.length < 6) {
        return { error: '비밀번호는 6자 이상이어야 합니다.' }
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
        return { error: errorMessage }
    }

    // Check if email confirmation is required
    if (data.user?.identities?.length === 0) {
        return { message: '이미 가입된 이메일입니다. 로그인해주세요.' }
    }

    return { message: '회원가입 완료! 이메일을 확인해주세요.' }
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
            redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://www.widamcare.co.kr'}/auth/callback?next=/patient`,
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
            redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://www.widamcare.co.kr'}/auth/callback?next=/patient`,
        },
    })

    if (error) {
        return { error: '카카오 로그인에 실패했습니다.' }
    }

    return { url: data.url }
}


export async function completeSocialSignup(formData: FormData) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { error: '로그인이 필요합니다.' }
    }

    const name = formData.get('name') as string
    const phone = formData.get('phone') as string
    const email = user.email

    if (!name || !phone) {
        return { error: '이름과 전화번호를 입력해주세요.' }
    }

    // Update user metadata
    await supabase.auth.updateUser({
        data: {
            name: name,
            phone: phone,
            role: 'patient',
        }
    })

    const { data: existingPatient } = await supabase
        .from('patients')
        .select('id')
        .eq('user_id', user.id)
        .single()

    if (existingPatient) {
        await supabase
            .from('patients')
            .update({
                name: name,
                phone: phone,
                email: email,
            })
            .eq('id', existingPatient.id)
    } else {
        await supabase
            .from('patients')
            .insert({
                user_id: user.id,
                name: name,
                phone: phone,
                email: email,
                status: 'pending',
            })
    }

    return { success: true }
}
