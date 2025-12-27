"use client";

import { useEffect, useState } from "react";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";

interface ProgressPanelProps {
    sessionId: string;
    onComplete: () => void;
    onError: (error: string) => void;
    selectedVariant?: string; // 선택된 단일 variant
}

type ProgressStatus = "generating" | "done" | "error";

// 4종 시술 라벨
const VARIANT_LABELS: Record<string, string> = {
    laser: "결·톤 정돈",
    botox: "표정주름 완화",
    filler: "볼륨감 변화",
    booster: "광채/물광",
    // 기존 variant (호환성)
    natural: "내추럴",
    makeup: "메이크업 느낌",
    bright: "밝은 톤",
};

export default function ProgressPanel({ sessionId, onComplete, onError, selectedVariant }: ProgressPanelProps) {
    const [status, setStatus] = useState<ProgressStatus>("generating");
    const [progress, setProgress] = useState(0);

    const variantLabel = selectedVariant ? VARIANT_LABELS[selectedVariant] || selectedVariant : "스타일";

    useEffect(() => {
        let isCancelled = false;

        const runGeneration = async () => {
            try {
                // 변환 시작 (variant 전달)
                const generateRes = await fetch("/api/face-style/session/generate", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ sessionId, variant: selectedVariant }),
                });

                if (!generateRes.ok) {
                    const data = await generateRes.json();
                    throw new Error(data.error || "변환 실패");
                }

                const result = await generateRes.json();

                if (isCancelled) return;

                if (result.success) {
                    setStatus("done");
                    setTimeout(() => !isCancelled && onComplete(), 1500);
                } else {
                    setStatus("error");
                    onError("변환에 실패했습니다.");
                }

            } catch (err) {
                if (!isCancelled) {
                    setStatus("error");
                    onError(err instanceof Error ? err.message : "변환 중 오류가 발생했습니다.");
                }
            }
        };

        // 진행률 애니메이션 (0% → 90% 서서히)
        const progressInterval = setInterval(() => {
            setProgress(prev => Math.min(prev + 5, 90));
        }, 500);

        runGeneration();

        return () => {
            isCancelled = true;
            clearInterval(progressInterval);
        };
    }, [sessionId, selectedVariant, onComplete, onError]);

    // 완료 시 100%로
    useEffect(() => {
        if (status === "done") {
            setProgress(100);
        }
    }, [status]);

    return (
        <div className="max-w-md mx-auto p-6 bg-skin-surface rounded-2xl border border-white/10 shadow-xl">
            {/* 헤더 */}
            <div className="text-center mb-6">
                {status === "generating" && (
                    <div className="w-16 h-16 bg-skin-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Loader2 className="w-8 h-8 text-skin-primary animate-spin" />
                    </div>
                )}
                {status === "done" && (
                    <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-8 h-8 text-green-400" />
                    </div>
                )}
                {status === "error" && (
                    <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="w-8 h-8 text-red-400" />
                    </div>
                )}

                <h2 className="text-xl font-bold text-skin-text mb-2">
                    {status === "generating" && `${variantLabel} 변환 중...`}
                    {status === "done" && "변환 완료!"}
                    {status === "error" && "변환 오류"}
                </h2>
                <p className="text-sm text-skin-subtext">
                    {status === "generating" && "잠시만 기다려주세요."}
                    {status === "done" && "결과를 확인해보세요."}
                    {status === "error" && "변환에 문제가 발생했습니다."}
                </p>
            </div>

            {/* 진행률 바 */}
            <div className="space-y-2">
                <div className="flex justify-between text-xs text-skin-muted">
                    <span>{variantLabel}</span>
                    <span>{progress}%</span>
                </div>
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-skin-primary to-skin-accent transition-all duration-500 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>
        </div>
    );
}
