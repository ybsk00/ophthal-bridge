'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { patientLogin, patientSignup, signInWithGoogle, signInWithKakao } from './actions'
import { Building2, Mail, Lock, User, Phone, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'

function LoginContent() {
    const searchParams = useSearchParams()
    const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login')
    const [error, setError] = useState<string | null>(null)
    const [message, setMessage] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        const errorParam = searchParams.get('error')
        const messageParam = searchParams.get('message')
        const tabParam = searchParams.get('tab')

        if (errorParam) setError(errorParam)
        if (messageParam) setMessage(messageParam)
        if (tabParam === 'signup') setActiveTab('signup')
    }, [searchParams])

    const handleTabChange = (tab: 'login' | 'signup') => {
        setActiveTab(tab)
        setError(null)
        setMessage(null)
    }

    const handleGoogleLogin = async () => {
        setIsLoading(true)
        setError(null)
        const result = await signInWithGoogle()
        if (result.error) {
            setError(result.error)
            setIsLoading(false)
        } else if (result.url) {
            window.location.href = result.url
        }
    }

    const handleKakaoLogin = async () => {
        setIsLoading(true)
        setError(null)
        const result = await signInWithKakao()
        if (result.error) {
            setError(result.error)
            setIsLoading(false)
        } else if (result.url) {
            window.location.href = result.url
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#0a0f1a' }}>
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div
                        className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                        style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}
                    >
                        <Building2 size={32} className="text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-white">AI한의원</h1>
                    <p className="text-gray-400 text-sm mt-1">환자 포탈</p>
                </div>

                {/* Card */}
                <div
                    className="rounded-2xl p-6"
                    style={{ backgroundColor: '#1a2332', border: '1px solid #1f2937' }}
                >
                    {/* Tab Switcher */}
                    <div
                        className="flex p-1 rounded-xl mb-6"
                        style={{ backgroundColor: '#111827' }}
                    >
                        <button
                            type="button"
                            onClick={() => handleTabChange('login')}
                            className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${activeTab === 'login'
                                ? 'bg-blue-500 text-white'
                                : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            로그인
                        </button>
                        <button
                            type="button"
                            onClick={() => handleTabChange('signup')}
                            className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${activeTab === 'signup'
                                ? 'bg-blue-500 text-white'
                                : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            회원가입
                        </button>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div
                            className="flex items-center gap-3 p-3 rounded-xl mb-4"
                            style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)' }}
                        >
                            <AlertCircle size={20} className="text-red-400 flex-shrink-0" />
                            <p className="text-sm text-red-400">{error}</p>
                        </div>
                    )}

                    {/* Success Message */}
                    {message && (
                        <div
                            className="flex items-center gap-3 p-3 rounded-xl mb-4"
                            style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)' }}
                        >
                            <CheckCircle size={20} className="text-green-400 flex-shrink-0" />
                            <p className="text-sm text-green-400">{message}</p>
                        </div>
                    )}

                    {/* Form */}
                    <form className="space-y-4" autoComplete="off">
                        {activeTab === 'signup' && (
                            <>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">이름</label>
                                    <div className="relative">
                                        <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                                        <input
                                            type="text"
                                            name="name"
                                            placeholder="홍길동"
                                            className="w-full pl-10 pr-4 py-3 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            style={{ backgroundColor: '#111827', border: '1px solid #374151' }}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">전화번호</label>
                                    <div className="relative">
                                        <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                                        <input
                                            type="tel"
                                            name="phone"
                                            placeholder="010-0000-0000"
                                            className="w-full pl-10 pr-4 py-3 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            style={{ backgroundColor: '#111827', border: '1px solid #374151' }}
                                        />
                                    </div>
                                </div>
                            </>
                        )}

                        <div>
                            <label className="block text-sm text-gray-400 mb-2">이메일</label>
                            <div className="relative">
                                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                                <input
                                    type="email"
                                    name="patient-email"
                                    autoComplete="new-email"
                                    placeholder="example@email.com"
                                    required
                                    className="w-full pl-10 pr-4 py-3 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    style={{ backgroundColor: '#111827', border: '1px solid #374151' }}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm text-gray-400 mb-2">비밀번호</label>
                            <div className="relative">
                                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                                <input
                                    type="password"
                                    name="patient-password"
                                    autoComplete="new-password"
                                    placeholder="••••••••"
                                    required
                                    minLength={6}
                                    className="w-full pl-10 pr-4 py-3 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    style={{ backgroundColor: '#111827', border: '1px solid #374151' }}
                                />
                            </div>
                            {activeTab === 'signup' && (
                                <p className="text-xs text-gray-500 mt-1">비밀번호는 6자 이상이어야 합니다.</p>
                            )}
                        </div>

                        <button
                            type="submit"
                            formAction={activeTab === 'login' ? patientLogin : patientSignup}
                            className="w-full py-3 rounded-xl text-white font-bold transition-all hover:opacity-90"
                            style={{ backgroundColor: '#3b82f6' }}
                        >
                            {activeTab === 'login' ? '로그인' : '회원가입'}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="flex items-center gap-4 my-6">
                        <div className="flex-1 h-px" style={{ backgroundColor: '#374151' }}></div>
                        <span className="text-sm text-gray-500">또는</span>
                        <div className="flex-1 h-px" style={{ backgroundColor: '#374151' }}></div>
                    </div>

                    {/* Social Login Buttons */}
                    <div className="space-y-3">
                        <button
                            type="button"
                            onClick={handleGoogleLogin}
                            disabled={isLoading}
                            className="w-full flex items-center justify-center gap-3 py-3 rounded-xl font-medium transition-all hover:opacity-90 disabled:opacity-50"
                            style={{ backgroundColor: '#ffffff', color: '#1f2937' }}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            {isLoading ? '로딩 중...' : 'Google로 계속하기'}
                        </button>

                        <button
                            type="button"
                            onClick={handleKakaoLogin}
                            disabled={isLoading}
                            className="w-full flex items-center justify-center gap-3 py-3 rounded-xl font-medium transition-all hover:opacity-90 disabled:opacity-50"
                            style={{ backgroundColor: '#FEE500', color: '#3C1E1E' }}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24">
                                <path fill="#3C1E1E" d="M12 3C6.477 3 2 6.477 2 10.5c0 2.49 1.611 4.69 4.041 5.986l-1.02 3.785a.5.5 0 00.75.57l4.35-2.877c.613.073 1.24.036 1.879.036 5.523 0 10-3.477 10-7.5S17.523 3 12 3z" />
                            </svg>
                            {isLoading ? '로딩 중...' : '카카오로 계속하기'}
                        </button>
                    </div>

                    {activeTab === 'login' && (
                        <p className="text-center text-sm text-gray-500 mt-4">
                            계정이 없으신가요?{' '}
                            <button
                                type="button"
                                onClick={() => handleTabChange('signup')}
                                className="text-blue-400 hover:text-blue-300"
                            >
                                회원가입
                            </button>
                        </p>
                    )}
                </div>

                {/* Back to home */}
                <div className="text-center mt-6">
                    <Link href="/" className="text-gray-500 hover:text-gray-400 text-sm">
                        ← 홈으로 돌아가기
                    </Link>
                </div>
            </div>
        </div>
    )
}

function LoginLoading() {
    return (
        <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0a0f1a' }}>
            <div className="flex flex-col items-center gap-4">
                <Loader2 size={40} className="text-blue-500 animate-spin" />
                <p className="text-gray-400">로딩 중...</p>
            </div>
        </div>
    )
}

export default function PatientLoginPage() {
    return (
        <Suspense fallback={<LoginLoading />}>
            <LoginContent />
        </Suspense>
    )
}
