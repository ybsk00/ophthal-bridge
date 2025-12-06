"use client";

import { motion } from "framer-motion";
import { Activity, Tag, FileText, ArrowRight, RefreshCw } from "lucide-react";
import Link from "next/link";
import { SummaryResult } from "@/lib/ai/summary";

interface ConditionReportProps {
    result: SummaryResult;
    onRetry: () => void;
}

export default function ConditionReport({ result, onRetry }: ConditionReportProps) {
    // Determine color based on score
    const getScoreColor = (score: number) => {
        if (score >= 90) return "text-green-600";
        if (score >= 70) return "text-blue-600";
        if (score >= 50) return "text-orange-500";
        return "text-red-500";
    };

    const getScoreLabel = (score: number) => {
        if (score >= 90) return "매우 양호";
        if (score >= 70) return "양호";
        if (score >= 50) return "주의 필요";
        return "관리 필요";
    };

    return (
        <div className="flex flex-col h-full bg-traditional-bg font-sans overflow-y-auto">
            <div className="p-6 space-y-8 pb-20">

                {/* Header */}
                <div className="text-center space-y-2">
                    <h2 className="text-2xl font-bold text-traditional-text">나의 건강 리듬 리포트</h2>
                    <p className="text-sm text-traditional-subtext">AI가 분석한 현재 컨디션입니다.</p>
                </div>

                {/* Score Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-3xl p-8 shadow-lg border border-traditional-muted text-center relative overflow-hidden"
                >
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-traditional-secondary to-traditional-accent opacity-30" />

                    <div className="space-y-4">
                        <h3 className="text-traditional-subtext font-medium">종합 리듬 점수</h3>
                        <div className={`text-6xl font-black ${getScoreColor(result.rhythm_score)}`}>
                            {result.rhythm_score}
                            <span className="text-2xl text-traditional-subtext font-normal ml-1">점</span>
                        </div>
                        <div className={`inline-block px-4 py-1 rounded-full text-sm font-bold bg-traditional-muted/20 ${getScoreColor(result.rhythm_score)}`}>
                            {getScoreLabel(result.rhythm_score)}
                        </div>
                    </div>
                </motion.div>

                {/* Key Patterns */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="space-y-4"
                >
                    <div className="flex items-center gap-2 text-traditional-text font-bold text-lg">
                        <Tag size={20} className="text-traditional-secondary" />
                        <h3>핵심 패턴 태그</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {result.pattern_tags.map((tag, i) => (
                            <span key={i} className="px-4 py-2 bg-white border border-traditional-muted rounded-xl text-traditional-text font-medium shadow-sm">
                                #{tag}
                            </span>
                        ))}
                    </div>
                </motion.div>

                {/* Summary Text */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-4"
                >
                    <div className="flex items-center gap-2 text-traditional-text font-bold text-lg">
                        <FileText size={20} className="text-traditional-secondary" />
                        <h3>AI 분석 요약</h3>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-traditional-muted shadow-sm leading-relaxed text-traditional-text">
                        {result.summary_text}
                    </div>
                </motion.div>

                {/* Main Concern */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-red-50 p-6 rounded-2xl border border-red-100 space-y-2"
                >
                    <h4 className="text-red-800 font-bold flex items-center gap-2">
                        <Activity size={18} />
                        주요 관리 포인트
                    </h4>
                    <p className="text-red-600 font-medium">
                        {result.main_concern}
                    </p>
                </motion.div>

                {/* CTA Actions */}
                <div className="space-y-3 pt-4">
                    <Link href="/login" className="block w-full py-4 bg-traditional-text text-white rounded-xl font-bold text-center shadow-md hover:bg-black transition-colors">
                        로그인하고 전체 리포트 저장하기
                    </Link>
                    <button
                        onClick={onRetry}
                        className="block w-full py-4 bg-white border border-traditional-muted text-traditional-subtext rounded-xl font-medium text-center hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                    >
                        <RefreshCw size={18} />
                        다시 상담하기
                    </button>
                </div>

            </div>
        </div>
    );
}
