'use client'

import Link from 'next/link'
import { Building2, Calendar, MessageSquare, Pill, Heart, ArrowRight, ShieldCheck } from 'lucide-react'

export default function PatientHomePage() {
    return (
        <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#0a0f1a' }}>
            {/* Hero Section */}
            <main className="flex-1 flex flex-col items-center justify-center px-6 text-center">
                <div
                    className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6"
                    style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}
                >
                    <Building2 size={40} className="text-white" />
                </div>

                <h1 className="text-3xl font-bold text-white mb-3">
                    AI한의원 환자 포탈
                </h1>
                <p className="text-gray-400 mb-8 max-w-sm leading-relaxed">
                    AI 기반 건강 상담부터 진료 예약까지<br />
                    한 곳에서 편리하게 관리하세요
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
                        <h3 className="text-sm font-bold text-white mb-1">AI 상담</h3>
                        <p className="text-xs text-gray-400">증상 맞춤 AI 상담</p>
                    </div>

                    <div
                        className="p-4 rounded-xl text-left"
                        style={{ backgroundColor: '#1a2332', border: '1px solid #1f2937' }}
                    >
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3" style={{ backgroundColor: '#1e3a5f' }}>
                            <Calendar size={20} className="text-blue-400" />
                        </div>
                        <h3 className="text-sm font-bold text-white mb-1">간편 예약</h3>
                        <p className="text-xs text-gray-400">원클릭 진료 예약</p>
                    </div>

                    <div
                        className="p-4 rounded-xl text-left"
                        style={{ backgroundColor: '#1a2332', border: '1px solid #1f2937' }}
                    >
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3" style={{ backgroundColor: '#1e3a5f' }}>
                            <Pill size={20} className="text-green-400" />
                        </div>
                        <h3 className="text-sm font-bold text-white mb-1">복약 관리</h3>
                        <p className="text-xs text-gray-400">처방약 일정 관리</p>
                    </div>

                    <div
                        className="p-4 rounded-xl text-left"
                        style={{ backgroundColor: '#1a2332', border: '1px solid #1f2937' }}
                    >
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3" style={{ backgroundColor: '#1e3a5f' }}>
                            <Heart size={20} className="text-red-400" />
                        </div>
                        <h3 className="text-sm font-bold text-white mb-1">건강 기록</h3>
                        <p className="text-xs text-gray-400">나의 건강 히스토리</p>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="px-6 py-6 text-center">
                <div className="flex items-center justify-center gap-2 text-gray-500 text-xs mb-2">
                    <ShieldCheck size={14} />
                    <span>개인정보 보호 · 안전한 의료 정보 관리</span>
                </div>
                <p className="text-gray-600 text-xs">© 2025 AI한의원. All rights reserved.</p>
            </footer>
        </div>
    )
}
