"use client";

import Link from "next/link";
import { User } from "lucide-react";

export default function PatientHeader() {
    return (
        <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-20">
            <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-green-600 rounded-sm flex items-center justify-center">
                    <span className="text-white text-xs font-bold">L</span>
                </div>
                <span className="text-lg font-bold text-gray-900">죽전한의원 메디컬 케어</span>
            </div>

            <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-500">
                <Link href="/medical/care" className="text-green-600 font-bold">대시보드</Link>
                <Link href="/medical/chat" className="hover:text-green-600 transition-colors">AI 상담</Link>
                <Link href="#" className="hover:text-green-600 transition-colors">리포트</Link>
                <Link href="#" className="hover:text-green-600 transition-colors">예약/알림</Link>
            </nav>

            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-full">
                    <span className="text-sm font-bold text-green-700">김환자님</span>
                </div>
                <button className="text-sm text-gray-500 hover:text-gray-900">로그아웃</button>
                <div className="w-8 h-8 rounded-full bg-orange-200 overflow-hidden border border-orange-300">
                    {/* Profile Image Placeholder */}
                    <User className="w-full h-full p-1 text-orange-500" />
                </div>
            </div>
        </header>
    );
}
