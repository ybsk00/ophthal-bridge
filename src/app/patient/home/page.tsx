'use client'

import Link from 'next/link'
import { Building2, Calendar, MessageSquare, Pill, Heart, ArrowRight, ShieldCheck } from 'lucide-react'

export default function PatientHomePage() {
    return (
        <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#0a0f1a' }}>
            {/* Header */}
            <header className="px-4 py-4">
                <div className="w-full max-w-md mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center"
                            style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}
                        >
                            <Building2 size={20} className="text-white" />
                        </div>
                        <span className="text-lg font-bold text-white">아이니의원</span>
                    </div>
                    <Link
                        href="/patient/login"
                        className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors"
                        style={{ backgroundColor: '#3b82f6' }}
                    >
                        로그인
                    </Link>
                </div>
            </header>

            {/* Hero Section */}
            <main className="flex-1 flex flex-col items-center justify-center px-6 text-center">
                <div
                    className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6"
                    style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}
                >
                    <Building2 size={40} className="text-white" />
                </div>

                <h1 className="text-3xl font-bold text-white mb-3">
                    아이니의원 환자 포털
                </h1>
                <p className="text-gray-400 mb-8 max-w-sm leading-relaxed">
                    예약과 상담 준비, 복약 기록을<br />
                    한 곳에서 관리하세요.
                </p>

                <Link
                    href="/patient/login"
                    className="flex items-center gap-2 px-8 py-4 text-white font-bold rounded-xl transition-all hover:opacity-90 mb-12"
                    style={{ backgroundColor: '#3b82f6' }}
                >
                    시작하기 <ArrowRight size={20} />
                </Link>

                {/* Features Grid */}
                <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
                    <div
                        className="p-4 rounded-xl text-left"
                        style={{ backgroundColor: '#1a2332', border: '1px solid #1f2937' }}
                    >
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3" style={{ backgroundColor: '#1e3a5f' }}>
                            <MessageSquare size={20} className="text-blue-400" />
                        </div>
                        <h3 className="text-sm font-bold text-white mb-1">상담 준비</h3>
                        <p className="text-xs text-gray-400">불편한 점을 정리해 상담에 도움을 드립니다.</p>
                    </div>

                    <div
                        className="p-4 rounded-xl text-left"
                        style={{ backgroundColor: '#1a2332', border: '1px solid #1f2937' }}
                    >
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3" style={{ backgroundColor: '#1e3a5f' }}>
                            <Calendar size={20} className="text-blue-400" />
                        </div>
                        <h3 className="text-sm font-bold text-white mb-1">진료 예약</h3>
                        <p className="text-xs text-gray-400">예약·변경·확인을 빠르게 진행하세요.</p>
                    </div>

                    <div
                        className="p-4 rounded-xl text-left"
                        style={{ backgroundColor: '#1a2332', border: '1px solid #1f2937' }}
                    >
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3" style={{ backgroundColor: '#1e3a5f' }}>
                            <Pill size={20} className="text-green-400" />
                        </div>
                        <h3 className="text-sm font-bold text-white mb-1">복약 기록</h3>
                        <p className="text-xs text-gray-400">복용 시간을 기록하고 알림을 설정할 수 있습니다.</p>
                    </div>

                    <div
                        className="p-4 rounded-xl text-left"
                        style={{ backgroundColor: '#1a2332', border: '1px solid #1f2937' }}
                    >
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3" style={{ backgroundColor: '#1e3a5f' }}>
                            <Heart size={20} className="text-red-400" />
                        </div>
                        <h3 className="text-sm font-bold text-white mb-1">나의 기록</h3>
                        <p className="text-xs text-gray-400">체크 결과와 방문 기록을 모아볼 수 있습니다.</p>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="px-6 py-6 text-center">
                <div className="flex items-center justify-center gap-2 text-gray-500 text-xs mb-2">
                    <ShieldCheck size={14} />
                    <span>개인정보 보호 · 안전한 의료 정보 관리</span>
                </div>
                <p className="text-gray-600 text-xs">© 2025 아이니의원. All rights reserved.</p>
            </footer>
        </div>
    )
}
