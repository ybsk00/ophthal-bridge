"use client";

import { useState, useRef } from "react";
import { createPortal } from "react-dom";
import { X, Pill, Camera, AlertCircle, Loader2, CheckCircle } from "lucide-react";

type MedicationModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onComplete?: (analysisResult: string) => void;
};

export default function MedicationModal({ isOpen, onClose, onComplete }: MedicationModalProps) {
    const [step, setStep] = useState<'upload' | 'result'>('upload');
    const [isProcessing, setIsProcessing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<string>('');
    const [error, setError] = useState<string>('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setError('이미지 파일만 업로드 가능합니다.');
            return;
        }

        setIsProcessing(true);
        setError('');

        try {
            // Convert to base64
            const base64 = await fileToBase64(file);

            // Call Gemini Vision API with medication-specific prompt
            const response = await fetch('/api/medical/analyze-medication', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    image: base64,
                    mimeType: file.type
                })
            });

            if (!response.ok) {
                throw new Error('분석 중 오류가 발생했습니다.');
            }

            const data = await response.json();
            setAnalysisResult(data.content);
            setStep('result');
        } catch (err: any) {
            setError(err.message || '분석 중 오류가 발생했습니다.');
        } finally {
            setIsProcessing(false);
        }
    };

    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                const result = reader.result as string;
                // Remove data:image/xxx;base64, prefix
                const base64 = result.split(',')[1];
                resolve(base64);
            };
            reader.onerror = error => reject(error);
        });
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    const resetAndClose = () => {
        setStep('upload');
        setIsProcessing(false);
        setAnalysisResult('');
        setError('');
        onClose();
    };

    // 완료 버튼 클릭 시 분석 결과를 채팅으로 전달
    const handleComplete = () => {
        if (analysisResult && onComplete) {
            const fullMessage = `복약도우미 분석 결과입니다.\n\n${analysisResult}\n\n---\n\n저는 현재 위 약을 복용 중입니다. 복용 목적과 관련 증상에 대해 상담해주세요.`;
            onComplete(fullMessage);
        }
        resetAndClose();
    };

    if (!isOpen) return null;

    const modalContent = (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-[#1e293b] rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col border border-gray-700">
                {/* Header */}
                <div className="bg-gray-800 p-4 flex justify-between items-center border-b border-gray-700">
                    <div className="flex items-center gap-2">
                        <Pill className="w-5 h-5 text-purple-400" />
                        <h3 className="font-bold text-lg text-white">복약 도우미</h3>
                    </div>
                    <button onClick={resetAndClose} className="text-gray-400 hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6">
                    {step === 'upload' ? (
                        <div className="space-y-4">
                            <div className="bg-purple-500/10 p-4 rounded-xl border border-purple-500/30">
                                <p className="text-sm text-purple-300">
                                    <strong>약봉지</strong> 또는 <strong>처방전</strong> 사진을 업로드하면<br />
                                    AI가 복용 방법을 분석해드립니다.
                                </p>
                            </div>

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                capture="environment"
                                onChange={handleFileSelect}
                                className="hidden"
                            />

                            <div
                                onClick={triggerFileInput}
                                className="border-2 border-dashed border-gray-600 rounded-xl p-8 text-center hover:border-purple-400 transition-colors cursor-pointer bg-gray-800/50"
                            >
                                {isProcessing ? (
                                    <div className="animate-pulse">
                                        <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
                                        </div>
                                        <p className="text-sm text-purple-300 font-medium">AI 분석 중...</p>
                                        <p className="text-xs text-gray-500 mt-1">잠시만 기다려주세요</p>
                                    </div>
                                ) : (
                                    <>
                                        <Camera className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                                        <p className="text-sm text-gray-300 font-medium mb-1">
                                            사진을 촬영하거나 선택하세요
                                        </p>
                                        <p className="text-xs text-gray-500">약봉지, 처방전, 약 포장지</p>
                                    </>
                                )}
                            </div>

                            {error && (
                                <div className="bg-red-500/10 p-4 rounded-xl border border-red-500/30 flex items-start gap-3">
                                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                                    <p className="text-sm text-red-300">{error}</p>
                                </div>
                            )}

                            <div className="bg-amber-500/10 p-4 rounded-xl border border-amber-500/30 flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                                <p className="text-xs text-amber-300">
                                    이 기능은 <strong>일반적인 복용 안내</strong>를 제공합니다.<br />
                                    정확한 복용법은 처방 의사/약사와 상담하세요.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="bg-green-500/10 p-4 rounded-xl border border-green-500/30">
                                <p className="text-sm text-green-300 font-medium mb-2">✅ AI 분석 완료</p>
                                <p className="text-xs text-green-400">아래는 AI가 분석한 복용 안내입니다.</p>
                            </div>

                            {/* AI Analysis Result */}
                            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
                                <div className="prose prose-sm max-w-none prose-invert">
                                    {analysisResult.split('\n').map((line, idx) => {
                                        if (line.startsWith('**') && line.endsWith('**')) {
                                            return <h4 key={idx} className="font-bold text-white mt-3 mb-2">{line.replace(/\*\*/g, '')}</h4>;
                                        }
                                        if (line.startsWith('- ') || line.startsWith('• ')) {
                                            return <li key={idx} className="text-gray-300 text-sm ml-4">{line.replace(/^[-•]\s*/, '')}</li>;
                                        }
                                        if (line.trim()) {
                                            return <p key={idx} className="text-gray-300 text-sm mb-2">{line}</p>;
                                        }
                                        return null;
                                    })}
                                </div>
                            </div>

                            <div className="bg-blue-500/10 p-4 rounded-xl border border-blue-500/30">
                                <p className="text-xs text-blue-300">
                                    💡 <strong>궁금한 점</strong>은 처방 의사 또는 약사에게 문의하세요.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-700">
                    {step === 'result' && (
                        <button
                            onClick={() => setStep('upload')}
                            className="w-full py-3 mb-2 border border-purple-500/50 text-purple-300 rounded-xl font-medium hover:bg-purple-500/10 transition-colors"
                        >
                            다른 사진 분석하기
                        </button>
                    )}
                    <button
                        onClick={step === 'result' && analysisResult ? handleComplete : resetAndClose}
                        className="w-full py-3 bg-purple-500 text-white rounded-xl font-medium hover:bg-purple-600 transition-colors flex items-center justify-center gap-2"
                    >
                        {step === 'upload' ? (
                            '닫기'
                        ) : (
                            <>
                                <CheckCircle size={18} />
                                분석 결과로 상담 시작
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );

    if (typeof document !== 'undefined') {
        return createPortal(modalContent, document.body);
    }
    return modalContent;
}
