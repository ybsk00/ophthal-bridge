"use client";

import { useState, useEffect, useCallback } from "react";
import { X, AlertCircle, Sparkles, Zap, Droplet, Sun, Clock, ChevronRight } from "lucide-react";
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

interface HistorySession {
    id: string;
    status: string;
    createdAt: string;
    variantKey: string;
    variantLabel: string;
    thumbnailUrl: string | null;
}

interface FaceSimulationModalProps {
    isOpen: boolean;
    onClose: () => void;
    isMobile?: boolean;
}

export default function FaceSimulationModal({ isOpen, onClose, isMobile = false }: FaceSimulationModalProps) {
    const [step, setStep] = useState<Step>("consent");
    const [selectedVariant, setSelectedVariant] = useState<VariantKey | null>(null);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const [history, setHistory] = useState<HistorySession[]>([]);
    const [historyLoading, setHistoryLoading] = useState(false);

    // 히스토리 로드
    const loadHistory = useCallback(async () => {
        setHistoryLoading(true);
        try {
            const res = await fetch("/api/face-style/session/list");
            if (res.ok) {
                const data = await res.json();
                setHistory(data.sessions || []);
            }
        } catch (err) {
            console.error("History load error:", err);
        } finally {
            setHistoryLoading(false);
        }
    }, []);

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

    // select 단계에서 히스토리 로드
    useEffect(() => {
        if (step === "select" && isOpen) {
            loadHistory();
        }
    }, [step, isOpen, loadHistory]);

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

    // 히스토리 클릭 핸들러
    const handleHistoryClick = useCallback((session: HistorySession) => {
        setSessionId(session.id);
        setSelectedVariant(session.variantKey as VariantKey);
        setStep("result");
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
        loadHistory(); // 히스토리 새로고침
    }, [loadHistory]);

    // 날짜 포맷
    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
    };

    if (!isVisible) return null;

    const selectedVariantLabel = VARIANT_OPTIONS.find(v => v.key === selectedVariant)?.label || "";

    return (
        <div className="fixed inset-0 z-50">
            {/* 배경 오버레이 */}
            <div
                className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isAnimating ? "opacity-100" : "opacity-0"
                    }`}
                onClick={onClose}
            />

            {/* 모달 */}
            <div
                className={`absolute flex flex-col overflow-hidden transition-all duration-300 ${isMobile
                    ? "inset-0 rounded-none bg-[#0f172a]"
                    : "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md max-h-[90vh] rounded-2xl shadow-2xl border border-gray-700 bg-[#1e293b]"
                    } ${isAnimating ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}
                style={isMobile ? { maxWidth: '480px', margin: '0 auto', left: 0, right: 0 } : undefined}
                onClick={(e) => e.stopPropagation()}
            >
                {/* 헤더 */}
                <div className="flex items-center justify-between p-4 border-b border-gray-700 flex-shrink-0">
                    <div>
                        <h2 className="text-lg font-bold text-white">
                            가상 시뮬레이션<span className="text-gray-400 font-normal ml-1">(참고용)</span>
                        </h2>
                        <p className="text-xs text-gray-400">
                            {step === "select" && "어떤 시술이 궁금하세요?"}
                            {step === "upload" && `${selectedVariantLabel} - 사진 업로드`}
                            {step === "generating" && `${selectedVariantLabel} 변환 중...`}
                            {step === "result" && `${selectedVariantLabel} 결과`}
                            {step === "consent" && "시작하기 전 동의가 필요합니다"}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                {/* 콘텐츠 */}
                <div className="flex-1 overflow-y-auto p-4">
                    {step === "consent" && (
                        <ConsentGate onConsent={handleConsent} />
                    )}

                    {step === "select" && (
                        <div className="space-y-6">
                            {/* 메뉴 선택 */}
                            <div>
                                <h3 className="text-center text-base font-semibold text-white mb-4">
                                    어떤 시술이 궁금하세요?
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    {VARIANT_OPTIONS.map((option) => {
                                        const Icon = option.icon;
                                        return (
                                            <button
                                                key={option.key}
                                                onClick={() => handleSelectVariant(option.key)}
                                                className="flex flex-col items-center gap-3 p-5 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700 hover:border-pink-500/50 rounded-2xl transition-all group"
                                            >
                                                <div className={`w-14 h-14 ${option.color} rounded-full flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform`}>
                                                    <Icon className="w-7 h-7 text-white" />
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-base font-medium text-white">{option.label}</p>
                                                    <p className="text-xs text-gray-500 mt-0.5">{option.description}</p>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* 히스토리 */}
                            {history.length > 0 && (
                                <div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <Clock className="w-4 h-4 text-gray-500" />
                                        <span className="text-sm font-medium text-gray-400">이전 생성 기록</span>
                                    </div>
                                    <div className="space-y-2">
                                        {history.map((session) => (
                                            <button
                                                key={session.id}
                                                onClick={() => handleHistoryClick(session)}
                                                className="w-full flex items-center justify-between p-3 bg-gray-800/30 hover:bg-gray-700/50 border border-gray-700/50 rounded-lg transition-colors group"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden">
                                                        {session.thumbnailUrl ? (
                                                            <img
                                                                src={session.thumbnailUrl}
                                                                alt=""
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <Sparkles className="w-5 h-5 text-gray-500" />
                                                        )}
                                                    </div>
                                                    <div className="text-left">
                                                        <p className="text-sm font-medium text-white">{session.variantLabel}</p>
                                                        <p className="text-xs text-gray-500">{formatDate(session.createdAt)}</p>
                                                    </div>
                                                </div>
                                                <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors" />
                                            </button>
                                        ))}
                                    </div>
                                    <p className="text-xs text-gray-500 text-center mt-3">
                                        ℹ️ 3일 저장 후 자동삭제됩니다
                                    </p>
                                </div>
                            )}

                            {historyLoading && (
                                <p className="text-xs text-gray-500 text-center">불러오는 중...</p>
                            )}
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
                        <div className="space-y-4">
                            <FaceSwapViewer
                                sessionId={sessionId}
                                selectedVariant={selectedVariant || undefined}
                            />
                            <div className="flex flex-col gap-2">
                                <button
                                    onClick={handleSelectOtherStyle}
                                    className="w-full px-4 py-3 bg-gray-700/50 text-white font-medium rounded-xl hover:bg-gray-600/50 transition-colors"
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

                {/* 하단 고지 */}
                <div className="flex-shrink-0 p-3 border-t border-gray-700 bg-gray-800/50">
                    <div className="flex items-start gap-2 text-xs text-gray-500">
                        <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <p>
                            참고용 시각화이며 실제 시술 결과를 예측/보장하지 않습니다.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
