"use client";

import { useState } from "react";
import Link from "next/link";
import PrivacyPolicyModal from "@/components/common/PrivacyPolicyModal";

export default function Footer() {
    const [showPrivacyModal, setShowPrivacyModal] = useState(false);
    const [initialTab, setInitialTab] = useState<'privacy' | 'terms'>('privacy');

    const openModal = (tab: 'privacy' | 'terms') => {
        setInitialTab(tab);
        setShowPrivacyModal(true);
    };

    return (
        <>
            <footer className="py-6 bg-skin-bg border-t border-white/10 relative z-10">
                <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-start gap-4">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <span className="text-base">👁️</span>
                            <span className="text-sm font-bold text-skin-text">강남아이디안과</span>
                        </div>
                        <div className="text-xs text-skin-subtext/70 space-y-0.5">
                            <p>서울특별시 서초구 서초대로77길 3 ㅣ Tel: 02-XXX-XXXX</p>
                            <p>사업자등록번호: XXX-XX-XXXXX</p>
                        </div>
                    </div>

                    <div className="text-xs text-skin-subtext/70 flex gap-3">
                        <button
                            onClick={() => openModal('terms')}
                            className="hover:text-skin-primary transition-colors"
                        >
                            이용약관
                        </button>
                        <span>|</span>
                        <button
                            onClick={() => openModal('privacy')}
                            className="hover:text-skin-primary transition-colors"
                        >
                            개인정보처리방침
                        </button>
                        <span>|</span>
                        <Link href="/eye-care?topic=condition" className="hover:text-skin-primary transition-colors">
                            문의하기
                        </Link>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto px-4 mt-3 pt-3 border-t border-white/5 text-center text-[10px] text-skin-subtext/50">
                    <p>© 2025 강남아이디안과. All rights reserved.</p>
                </div>
            </footer>

            <PrivacyPolicyModal
                isOpen={showPrivacyModal}
                onClose={() => setShowPrivacyModal(false)}
                initialTab={initialTab}
            />
        </>
    );
}
