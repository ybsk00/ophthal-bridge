"use client";

import { useState, useEffect } from "react";
import { X, Eye } from "lucide-react";
import VisionSimulator from "@/components/eye-care/VisionSimulator";
import Link from "next/link";

interface PhotoSlideOverProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function PhotoSlideOver({ isOpen, onClose }: PhotoSlideOverProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
            // 다음 프레임에서 애니메이션 시작
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    setIsAnimating(true);
                });
            });
        } else {
            setIsAnimating(false);
            // 애니메이션 완료 후 숨김
            const timer = setTimeout(() => {
                setIsVisible(false);
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    // ESC 키로 닫기
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isOpen) {
                onClose();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, onClose]);

    // 스크롤 방지
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [isOpen]);

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-50">
            {/* 배경 오버레이 */}
            <div
                className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isAnimating ? "opacity-100" : "opacity-0"
                    }`}
                onClick={onClose}
            />

            {/* SlideOver 패널 */}
            <div
                className={`absolute top-0 right-0 h-full w-full max-w-lg bg-skin-bg border-l border-white/10 shadow-2xl transition-transform duration-300 ease-out ${isAnimating ? "translate-x-0" : "translate-x-full"
                    }`}
            >
                {/* 헤더 */}
                <div className="flex items-center justify-between p-4 border-b border-white/10">
                    <div className="flex items-center gap-2">
                        <Eye className="w-5 h-5 text-skin-primary" />
                        <span className="font-semibold text-skin-text">시야 체감 시뮬레이터(참고용)</span>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
                        aria-label="닫기"
                    >
                        <X className="w-5 h-5 text-skin-subtext" />
                    </button>
                </div>

                {/* 콘텐츠 */}
                <div className="h-[calc(100%-65px)] overflow-y-auto p-4 overscroll-y-contain">
                    <VisionSimulator />

                    {/* CTA: 저장하기 */}
                    <div className="mt-6 pt-4 border-t border-white/10">
                        <Link
                            href="/login"
                            className="flex items-center justify-center gap-2 w-full py-3 bg-skin-primary text-white font-semibold rounded-xl hover:bg-skin-accent transition-colors shadow-lg shadow-skin-primary/30"
                        >
                            이 설정을 저장하기 (로그인)
                        </Link>
                        <p className="text-xs text-skin-muted text-center mt-2">
                            로그인 후 기록을 저장하고 비교할 수 있습니다
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
