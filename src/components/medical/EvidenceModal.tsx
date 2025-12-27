'use client';

import { useState, useEffect } from 'react';
import { FileText, ExternalLink, Users, Calendar, X } from 'lucide-react';

interface SciEvidence {
    journal: string;
    title: string;
    date: string;
    authors: string;
    link: string;
}

interface EvidenceModalProps {
    isOpen: boolean;
    onClose: () => void;
    evidence: SciEvidence;
}

export default function EvidenceModal({
    isOpen,
    onClose,
    evidence
}: EvidenceModalProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    setIsAnimating(true);
                });
            });
        } else {
            setIsAnimating(false);
            const timer = setTimeout(() => setIsVisible(false), 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* 배경 오버레이 */}
            <div
                className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isAnimating ? 'opacity-100' : 'opacity-0'}`}
                onClick={onClose}
            />

            {/* 모달 */}
            <div
                className={`relative w-full max-w-md bg-[#1e293b] rounded-2xl shadow-2xl border border-gray-700 overflow-hidden transition-all duration-300 ${isAnimating ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* 헤더 */}
                <div className="flex items-center justify-between p-4 border-b border-gray-700">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                            <FileText className="w-4 h-4 text-blue-400" />
                        </div>
                        <h3 className="font-bold text-white">SCI 학술 논문 안내</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
                    >
                        <X className="w-4 h-4 text-gray-400" />
                    </button>
                </div>

                {/* 콘텐츠 */}
                <div className="p-4 space-y-4">
                    {/* 고지 문구 */}
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-3 text-sm text-blue-300">
                        <p className="text-xs">
                            아래 논문은 아이니의원 연구진이 참여한 SCI 국제학술지 게재 논문입니다.
                            치료 효과를 보장하거나 우월성을 주장하는 자료가 아님을 안내드립니다.
                        </p>
                    </div>

                    {/* 논문 카드 */}
                    <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-5">
                        {/* 저널 뱃지 */}
                        <div className="flex items-center gap-2 mb-3">
                            <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-sm font-medium rounded-full">
                                {evidence.journal}
                            </span>
                            <span className="px-2 py-0.5 border border-green-500/50 text-green-400 text-xs rounded-full">
                                SCI 등재
                            </span>
                        </div>

                        {/* 논문 제목 */}
                        <p className="font-medium text-sm text-white leading-relaxed mb-4">
                            {evidence.title}
                        </p>

                        {/* 저자/일자 */}
                        <div className="space-y-2 text-sm text-gray-400">
                            <div className="flex items-center gap-2">
                                <Users className="w-3.5 h-3.5" />
                                <span className="text-xs">{evidence.authors}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar className="w-3.5 h-3.5" />
                                <span className="text-xs">게시일: {evidence.date}</span>
                            </div>
                        </div>
                    </div>

                    {/* 면책 */}
                    <p className="text-xs text-gray-500 text-center">
                        본 논문은 학술적 연구 결과이며, 개인별 치료 효과는 다를 수 있습니다.
                    </p>

                    {/* 버튼 */}
                    <div className="grid grid-cols-2 gap-2">
                        <a
                            href={evidence.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-xl font-medium transition-colors text-sm border border-blue-500/30"
                        >
                            <ExternalLink className="w-4 h-4" />
                            <span>논문 원문 보기</span>
                        </a>
                        <button
                            onClick={onClose}
                            className="px-4 py-2.5 bg-gray-700/50 hover:bg-gray-600/50 text-white rounded-xl font-medium transition-colors text-sm"
                        >
                            닫기
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
