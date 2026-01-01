"use client";

import Link from "next/link";
import { Timer, Camera, MapPin, ChevronRight } from "lucide-react";

const STEPS = [
    {
        icon: Timer,
        title: "30초 체크",
        description: "눈 건강 습관을 빠르게 정리",
        label: "비로그인 가능",
        labelColor: "bg-skin-primary",
        href: "/eye-care?topic=condition",
    },
    {
        icon: Camera,
        title: "사진으로 확인하기",
        description: "로그인/동의 후 내 사진으로 예시 확인",
        label: "로그인 필요",
        labelColor: "bg-skin-secondary",
        href: "/login?redirect=/eye-care/face-style",
    },
    {
        icon: MapPin,
        title: "가까운 안과 찾기",
        description: "지역·시간 기준으로 바로 탐색",
        label: "바로 검색",
        labelColor: "bg-skin-muted",
        href: "#clinic-search",
    },
] as const;

interface HowItWorksCardsProps {
    className?: string;
}

export default function HowItWorksCards({ className = "" }: HowItWorksCardsProps) {
    return (
        <section className={`py-16 px-6 ${className}`}>
            <div className="max-w-5xl mx-auto">
                {/* 섹션 타이틀 */}
                <div className="text-center mb-12">
                    <span className="text-skin-primary font-bold tracking-widest uppercase text-sm mb-2 block">
                        How It Works
                    </span>
                    <h2 className="text-3xl md:text-4xl font-bold text-skin-text font-sans tracking-tight">
                        간단한 3단계
                    </h2>
                    <p className="text-skin-subtext mt-3 max-w-lg mx-auto text-sm">
                        눈 건강 체크부터 안과 찾기까지, 빠르게 시작하세요.
                    </p>
                </div>

                {/* 3단 카드 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {STEPS.map((step, idx) => {
                        const IconComponent = step.icon;
                        const isAnchor = step.href.startsWith("#");

                        const cardContent = (
                            <div className="group h-full bg-white/5 rounded-2xl p-6 border border-white/10 hover:bg-white/10 hover:border-skin-primary/30 transition-all duration-300 hover:-translate-y-1 cursor-pointer">
                                {/* 스텝 번호 + 아이콘 */}
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-10 h-10 bg-skin-primary/20 rounded-full flex items-center justify-center text-skin-primary font-bold text-lg">
                                        {idx + 1}
                                    </div>
                                    <div className="w-12 h-12 bg-skin-surface rounded-xl flex items-center justify-center border border-white/10">
                                        <IconComponent className="w-6 h-6 text-skin-primary" />
                                    </div>
                                </div>

                                {/* 타이틀 & 설명 */}
                                <h3 className="text-lg font-bold text-skin-text mb-2">
                                    {step.title}
                                </h3>
                                <p className="text-skin-subtext text-sm leading-relaxed mb-4">
                                    {step.description}
                                </p>

                                {/* 라벨 + 화살표 */}
                                <div className="flex items-center justify-between">
                                    <span
                                        className={`inline-flex items-center px-3 py-1 rounded-lg text-[11px] font-semibold ${step.labelColor} text-white`}
                                    >
                                        {step.label}
                                    </span>
                                    <ChevronRight className="w-5 h-5 text-skin-muted group-hover:text-skin-primary group-hover:translate-x-1 transition-all" />
                                </div>
                            </div>
                        );

                        if (isAnchor) {
                            return (
                                <a key={step.title} href={step.href}>
                                    {cardContent}
                                </a>
                            );
                        }

                        return (
                            <Link key={step.title} href={step.href}>
                                {cardContent}
                            </Link>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
