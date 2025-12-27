"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { RefreshCw, AlertCircle } from "lucide-react";

interface Variant {
    key: string;
    status: string;
    url: string | null;
}

interface FaceSwapViewerProps {
    sessionId: string;
    selectedVariant?: string; // 선택된 단일 variant
}

// 4종 시술 설정
const VARIANT_CONFIG: Record<string, { label: string; description: string }> = {
    laser: { label: "결·톤 정돈", description: "레이저 느낌" },
    botox: { label: "표정주름 완화", description: "보톡스 느낌" },
    filler: { label: "볼륨감 변화", description: "필러 느낌" },
    booster: { label: "광채/물광", description: "스킨부스터 느낌" },
    // 기존 variant (호환성)
    natural: { label: "내추럴", description: "피부결/톤 정리" },
    makeup: { label: "메이크업 느낌", description: "색감/채도 조정" },
    bright: { label: "밝은 톤", description: "밝기/화이트밸런스" },
};

export default function FaceSwapViewer({ sessionId, selectedVariant }: FaceSwapViewerProps) {
    const [variants, setVariants] = useState<Variant[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchSession = async () => {
        try {
            setIsLoading(true);
            const res = await fetch(`/api/face-style/session/get?sessionId=${sessionId}`);

            if (!res.ok) {
                throw new Error("세션 조회 실패");
            }

            const data = await res.json();
            setVariants(data.variants || []);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchSession();
        // URL 갱신을 위해 4분마다 재조회 (5분 만료 전)
        const interval = setInterval(fetchSession, 240000);
        return () => clearInterval(interval);
    }, [sessionId]);

    // 선택된 variant의 정보
    const activeVariant = selectedVariant || variants[0]?.key || "laser";
    const activeConfig = VARIANT_CONFIG[activeVariant] || { label: activeVariant, description: "" };
    const activeUrl = variants.find(v => v.key === activeVariant)?.url;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-16">
                <RefreshCw className="w-8 h-8 text-skin-primary animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-md mx-auto p-6 bg-red-500/10 border border-red-500/30 rounded-2xl">
                <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-5 h-5 text-red-400" />
                    <span className="text-red-400 font-medium">오류 발생</span>
                </div>
                <p className="text-sm text-red-300">{error}</p>
                <button
                    onClick={fetchSession}
                    className="mt-4 px-4 py-2 bg-red-500/20 rounded-lg text-red-300 text-sm hover:bg-red-500/30 transition-colors"
                >
                    다시 시도
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-lg mx-auto">
            {/* 이미지 뷰어 */}
            <div className="relative aspect-[3/4] rounded-3xl overflow-hidden shadow-2xl shadow-skin-primary/20 border border-white/10 mb-6">
                {activeUrl ? (
                    <>
                        <Image
                            src={activeUrl}
                            alt={activeConfig.label}
                            fill
                            className="object-cover object-top"
                            unoptimized // Signed URL이므로 최적화 비활성화
                        />

                        {/* 오버레이 */}
                        <div className="absolute inset-0 bg-gradient-to-t from-skin-bg/80 via-transparent to-transparent" />

                        {/* 하단 라벨 */}
                        <div className="absolute bottom-0 left-0 right-0 p-4 text-center">
                            <p className="text-lg font-bold text-white drop-shadow-lg">
                                {activeConfig.label}
                            </p>
                            <p className="text-sm text-white/80 drop-shadow">
                                {activeConfig.description}
                            </p>
                        </div>
                    </>
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-skin-surface">
                        <p className="text-skin-muted">이미지를 불러올 수 없습니다.</p>
                    </div>
                )}
            </div>

            {/* 안내 */}
            <p className="text-xs text-skin-muted text-center">
                ⚠️ 참고용 시각화이며, 실제 시술 결과와 다를 수 있습니다.
            </p>
        </div>
    );
}
