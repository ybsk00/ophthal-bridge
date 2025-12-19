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
            <footer className="py-16 bg-traditional-bg border-t border-traditional-muted/50">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-start gap-12">
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-traditional-primary rounded-lg flex items-center justify-center">
                                <span className="text-white text-xs font-bold font-serif">JK</span>
                            </div>
                            <span className="text-xl font-bold text-traditional-text font-serif">위담한방병원</span>
                        </div>
                        <div className="text-sm text-traditional-subtext space-y-2 font-light">
                            <p>위담한방병원 ㅣ 대표 최서형 ㅣ 사업자등록번호 106-93-45419</p>
                            <p>서울특별시 강남구 삼성로 402 (대치동 960-5)</p>
                            <p className="mt-2 text-xs text-traditional-subtext/60">0507-1390-5121 | 9시부터 18시까지 근무 (일요일 휴무)</p>
                        </div>
                    </div>

                    <div className="flex gap-16 text-sm text-traditional-subtext">
                        <div className="space-y-4">
                            <h4 className="font-bold text-traditional-text text-base">지원</h4>
                            <ul className="space-y-3">
                                <li>
                                    <button
                                        onClick={() => openModal('terms')}
                                        className="hover:text-traditional-primary transition-colors"
                                    >
                                        이용약관
                                    </button>
                                </li>
                                <li>
                                    <button
                                        onClick={() => openModal('privacy')}
                                        className="hover:text-traditional-primary transition-colors"
                                    >
                                        개인정보처리방침
                                    </button>
                                </li>
                                <li>
                                    <Link href="/healthcare/chat" className="hover:text-traditional-primary transition-colors">
                                        문의하기
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto px-6 mt-12 pt-8 border-t border-traditional-muted/50 text-center text-xs text-traditional-subtext/60 font-light">
                    <p>© 2025 위담한방병원. All rights reserved. 본 사이트의 콘텐츠는 저작권법의 보호를 받습니다.</p>
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
