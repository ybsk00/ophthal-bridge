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
            <footer className="py-16 bg-skin-bg border-t border-white/10 relative z-10">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-start gap-12">
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">👁️</span>
                            <span className="text-xl font-bold text-skin-text font-serif">강남아이디안과</span>
                        </div>
                        <div className="text-sm text-skin-subtext space-y-2 font-light">
                            <p>강남아이디안과 ㅣ 서울특별시 서초구 서초대로77길 3</p>
                            <p>Tel: 02-XXX-XXXX</p>
                            <p className="mt-2 text-xs text-skin-subtext/60">사업자등록번호: XXX-XX-XXXXX</p>
                        </div>
                    </div>

                    <div className="flex gap-16 text-sm text-skin-subtext">
                        <div className="space-y-4">
                            <h4 className="font-bold text-skin-text text-base">지원</h4>
                            <ul className="space-y-3">
                                <li>
                                    <button
                                        onClick={() => openModal('terms')}
                                        className="hover:text-skin-primary transition-colors"
                                    >
                                        이용약관
                                    </button>
                                </li>
                                <li>
                                    <button
                                        onClick={() => openModal('privacy')}
                                        className="hover:text-skin-primary transition-colors"
                                    >
                                        개인정보처리방침
                                    </button>
                                </li>
                                <li>
                                    <Link href="/eye-care?topic=condition" className="hover:text-skin-primary transition-colors">
                                        문의하기
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto px-6 mt-12 pt-8 border-t border-white/10 text-center text-xs text-skin-subtext/60 font-light">
                    <p>© 2025 강남아이디안과. All rights reserved. 본 사이트의 콘텐츠는 저작권법의 보호를 받습니다.</p>
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
