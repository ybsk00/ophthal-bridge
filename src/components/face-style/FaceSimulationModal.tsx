"use client";

import { useState, useEffect, useCallback } from "react";
import { X, AlertCircle, Sparkles, Zap, Droplet, Sun } from "lucide-react";
import ConsentGate from "./ConsentGate";
import PhotoUploader from "./PhotoUploader";
import ProgressPanel from "./ProgressPanel";
import FaceSwapViewer from "./FaceSwapViewer";
import DeleteMyPhotosButton from "./DeleteMyPhotosButton";

type Step = "consent" | "select" | "upload" | "generating" | "result";
type VariantKey = "laser" | "botox" | "filler" | "booster";

// 4종 시술 메뉴 설정
const VARIANT_OPTIONS: { key: VariantKey; label: string; description: string; icon: React.ElementType; color: string }[] = [
    { key: "laser", label: "결·톤 정돈", description: "레이저 느낌", icon: Zap, color: "bg-blue-500" },
    { key: "botox", label: "표정주름 완화", description: "보톡스 느낌", icon: Sparkles, color: "bg-purple-500" },
    { key: "filler", label: "볼륨감 변화", description: "필러 느낌", icon: Droplet, color: "bg-pink-500" },
    { key: "booster", label: "광채/물광", description: "스킨부스터 느낌", icon: Sun, color: "bg-amber-500" },
];

interface FaceSimulationModalProps {
    isOpen: boolean;
    onClose: () => void;
    isMobile?: boolean; // 모바일 여부 (기본: false)
}

export default function FaceSimulationModal({ isOpen, onClose, isMobile = false }: FaceSimulationModalProps) {
    const [step, setStep] = useState<Step>("consent");
    const [selectedVariant, setSelectedVariant] = useState<VariantKey | null>(null);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);

    // 모달 열기/닫기 애니메이션
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

    // 동의 완료 핸들러
    const handleConsent = useCallback(() => {
        setStep("select");
    }, []);

    // 메뉴 선택 핸들러
    const handleSelectVariant = useCallback((variant: VariantKey) => {
        setSelectedVariant(variant);
        setStep("upload");
    }, []);

    // 업로드 완료 핸들러
    const handleUploadComplete = useCallback((newSessionId: string) => {
        setSessionId(newSessionId);
        setStep("generating");
    }, []);

    // 생성 완료 핸들러
    const handleGenerateComplete = useCallback(() => {
        setStep("result");
    }, []);

    // 생성 에러 핸들러
    const handleGenerateError = useCallback((error: string) => {
        console.error("Generate error:", error);
        setStep("result");
    }, []);

    // 다른 스타일 선택 핸들러
    const handleSelectOtherStyle = useCallback(() => {
        setStep("select");
    }, []);

    // 삭제 완료 핸들러
    const handleDeleteComplete = useCallback(() => {
        setSessionId(null);
        setSelectedVariant(null);
        setStep("select");
    }, []);

    if (!isVisible) return null;

    // 선택된 variant 라벨
    const selectedVariantLabel = VARIANT_OPTIONS.find(v => v.key === selectedVariant)?.label || "";

    return (
        <div className="fixed inset-0 z-50">
            {/* 배경 오버레이 */}
            <div
                className={`absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300 ${isAnimating ? "opacity-100" : "opacity-0"
                    }`}
                onClick={onClose}
            />

            {/* 모달 - 모바일: 전체화면, 데스크톱: 중앙 모달 */}
            <div
                className={`absolute bg-skin-bg flex flex-col overflow-hidden transition-all duration-300 ${isMobile
                        ? "inset-0 rounded-none" // 모바일: 전체 화면
                        : "inset-4 md:inset-8 lg:inset-16 rounded-2xl shadow-2xl border border-white/10" // 데스크톱
                    } ${isAnimating ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* 헤더 */}
                <div className="flex items-center justify-between p-4 border-b border-white/10 flex-shrink-0">
                    <div>
                        <h2 className="text-lg font-bold text-skin-text">
                            가상 시각화<span className="text-skin-muted font-normal">(참고용)</span>
                        </h2>
                        <p className="text-xs text-skin-subtext">
                            {step === "select" ? "어떤 시술이 궁금하세요?" :
                                step === "upload" ? `${selectedVariantLabel} - 사진을 업로드하세요` :
                                    step === "generating" ? `${selectedVariantLabel} 변환 중...` :
                                        step === "result" ? `${selectedVariantLabel} 결과` :
                                            "내 사진을 기반으로 피부 표현을 시각화합니다"}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
                    >
                        <X className="w-5 h-5 text-skin-subtext" />
                    </button>
                </div>

                {/* 콘텐츠 */}
                <div className="flex-1 overflow-y-auto p-4 md:p-6">
                    {step === "consent" && (
                        <ConsentGate onConsent={handleConsent} />
                    )}

                    {step === "select" && (
                        <div className="max-w-md mx-auto">
                            <h3 className="text-center text-lg font-semibold text-skin-text mb-6">
                                어떤 시술이 궁금하세요?
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                {VARIANT_OPTIONS.map((option) => {
                                    const Icon = option.icon;
                                    return (
                                        <button
                                            key={option.key}
                                            onClick={() => handleSelectVariant(option.key)}
                                            className="flex flex-col items-center gap-3 p-6 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-skin-primary/50 rounded-2xl transition-all duration-300 group"
                                        >
                                            <div className={`w-14 h-14 ${option.color} rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                                                <Icon className="w-7 h-7 text-white" />
                                            </div>
                                            <div className="text-center">
                                                <p className="font-semibold text-skin-text">{option.label}</p>
                                                <p className="text-xs text-skin-muted">{option.description}</p>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                            <p className="text-xs text-skin-muted text-center mt-6">
                                ⚠️ 참고용 시각화이며 실제 시술 결과와 다를 수 있습니다
                            </p>
                        </div>
                    )}

                    {step === "upload" && (
                        <PhotoUploader
                            onUploadComplete={handleUploadComplete}
                            selectedVariant={selectedVariant || undefined}
                        />
                    )}

                    {step === "generating" && sessionId && (
                        <ProgressPanel
                            sessionId={sessionId}
                            onComplete={handleGenerateComplete}
                            onError={handleGenerateError}
                            selectedVariant={selectedVariant || undefined}
                        />
                    )}

                    {step === "result" && sessionId && (
                        <div className="space-y-6">
                            <FaceSwapViewer
                                sessionId={sessionId}
                                selectedVariant={selectedVariant || undefined}
                            />
                            <div className="flex flex-col sm:flex-row justify-center gap-3">
                                <button
                                    onClick={handleSelectOtherStyle}
                                    className="px-6 py-3 bg-white/10 text-skin-text font-medium rounded-xl hover:bg-white/20 transition-colors"
                                >
                                    다른 스타일 보기
                                </button>
                                <DeleteMyPhotosButton
                                    sessionId={sessionId}
                                    onDeleteComplete={handleDeleteComplete}
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* 하단 고지 (상시 노출) */}
                <div className="flex-shrink-0 p-4 border-t border-white/10 bg-skin-bg">
                    <div className="flex items-start gap-2 text-xs text-skin-muted">
                        <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <p>
                            참고용 시각화이며 실제 시술 결과를 예측/보장하지 않습니다.
                            개인 상태에 따라 달라질 수 있습니다.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
