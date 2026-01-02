'use client';

import { ClipboardList, Eye, MessageCircle, ArrowRight } from 'lucide-react';
import type { HealthcareSummary } from '@/types/healthcare';

interface HealthcareSummaryCardProps {
    summary: HealthcareSummary;
    onStartConsult?: () => void;
}

/**
 * 헬스케어 요약 카드 컴포넌트
 * 메디컬 상담 시작 시 이전 헬스케어 세션 정보를 표시
 */
export default function HealthcareSummaryCard({
    summary,
    onStartConsult
}: HealthcareSummaryCardProps) {
    const { context, simulator, chat_tags, handoff_note } = summary;

    return (
        <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-2xl p-4 space-y-4">
            {/* 헤더 */}
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center">
                    <ClipboardList size={20} className="text-emerald-400" />
                </div>
                <div>
                    <h3 className="text-sm font-semibold text-white">상담용 요약</h3>
                    <p className="text-xs text-skin-subtext">이전 체험에서 정리된 내용입니다</p>
                </div>
            </div>

            {/* 주요 상황 */}
            <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-skin-subtext">
                    <Eye size={14} />
                    <span>선택한 상황</span>
                </div>
                <div className="flex flex-wrap gap-2">
                    <span className="px-2.5 py-1 bg-white/10 rounded-full text-xs text-white">
                        {context.primary_situation}
                    </span>
                    {context.secondary_situation && (
                        <span className="px-2.5 py-1 bg-white/10 rounded-full text-xs text-white">
                            {context.secondary_situation}
                        </span>
                    )}
                </div>
            </div>

            {/* 시뮬레이터 설정 */}
            <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-white/5 rounded-lg p-2">
                    <p className="text-xs text-skin-subtext mb-1">흐림</p>
                    <p className="text-sm font-medium text-white">{Math.round(simulator.blur * 100)}%</p>
                </div>
                <div className="bg-white/5 rounded-lg p-2">
                    <p className="text-xs text-skin-subtext mb-1">눈부심</p>
                    <p className="text-sm font-medium text-white">{Math.round(simulator.glare * 100)}%</p>
                </div>
                <div className="bg-white/5 rounded-lg p-2">
                    <p className="text-xs text-skin-subtext mb-1">대비</p>
                    <p className="text-sm font-medium text-white">{Math.round(simulator.contrast * 100)}%</p>
                </div>
            </div>

            {/* 채팅 태그 */}
            {chat_tags.length > 0 && (
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-skin-subtext">
                        <MessageCircle size={14} />
                        <span>관심 키워드</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                        {chat_tags.map((tag, index) => (
                            <span
                                key={index}
                                className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded text-xs"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* 핸드오프 노트 */}
            {handoff_note && (
                <p className="text-xs text-skin-subtext bg-white/5 rounded-lg p-3 italic">
                    ""{handoff_note}""
                </p>
            )}

            {/* 상담 시작 버튼 */}
            {onStartConsult && (
                <button
                    onClick={onStartConsult}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-500 text-white rounded-xl font-medium hover:bg-emerald-600 transition-colors"
                >
                    이어서 상담 시작하기
                    <ArrowRight size={18} />
                </button>
            )}
        </div>
    );
}
