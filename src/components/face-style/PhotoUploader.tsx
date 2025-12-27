"use client";

import { useState, useRef } from "react";
import { Upload, Camera, X, AlertCircle } from "lucide-react";
import Image from "next/image";

interface PhotoUploaderProps {
    onUploadComplete: (sessionId: string) => void;
    isLoading?: boolean;
    selectedVariant?: string; // 선택된 시술 타입
}

const MAX_FILE_SIZE = 8 * 1024 * 1024; // 8MB
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export default function PhotoUploader({ onUploadComplete, isLoading = false, selectedVariant }: PhotoUploaderProps) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (file: File) => {
        setError(null);

        // 파일 유형 검사
        if (!ACCEPTED_TYPES.includes(file.type)) {
            setError("JPG, PNG, WebP 형식만 지원됩니다.");
            return;
        }

        // 파일 크기 검사
        if (file.size > MAX_FILE_SIZE) {
            setError("파일 크기는 8MB 이하여야 합니다.");
            return;
        }

        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) handleFileSelect(file);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleFileSelect(file);
    };

    const handleClear = () => {
        setSelectedFile(null);
        setPreviewUrl(null);
        setError(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) return;

        setUploading(true);
        setError(null);

        try {
            // 1. 세션 생성 API 호출
            const createRes = await fetch("/api/face-style/session/create", {
                method: "POST",
            });

            if (!createRes.ok) {
                const data = await createRes.json();
                if (data.code === "CONSENT_REQUIRED") {
                    throw new Error("동의가 필요합니다. 페이지를 새로고침해주세요.");
                }
                throw new Error(data.error || "세션 생성 실패");
            }

            const { sessionId, signedUploadUrl } = await createRes.json();

            // 2. Signed URL로 파일 업로드
            const uploadRes = await fetch(signedUploadUrl, {
                method: "PUT",
                body: selectedFile,
                headers: {
                    "Content-Type": selectedFile.type,
                },
            });

            if (!uploadRes.ok) {
                throw new Error("파일 업로드 실패");
            }

            // 3. 업로드 완료 마킹 (variant 전달)
            const markRes = await fetch("/api/face-style/session/mark-uploaded", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ sessionId, variant: selectedVariant }),
            });

            if (!markRes.ok) {
                throw new Error("업로드 마킹 실패");
            }

            onUploadComplete(sessionId);

        } catch (err) {
            console.error("Upload error:", err);
            setError(err instanceof Error ? err.message : "업로드 중 오류가 발생했습니다.");
        } finally {
            setUploading(false);
        }
    };

    const isUploading = uploading || isLoading;

    return (
        <div className="max-w-md mx-auto">
            {/* 파일 선택 영역 */}
            {!previewUrl ? (
                <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-white/20 rounded-2xl p-8 text-center cursor-pointer hover:border-skin-primary/50 hover:bg-white/5 transition-all"
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept={ACCEPTED_TYPES.join(",")}
                        onChange={handleInputChange}
                        className="hidden"
                    />
                    <div className="w-16 h-16 bg-skin-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Camera className="w-8 h-8 text-skin-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-skin-text mb-2">
                        사진 업로드
                    </h3>
                    <p className="text-sm text-skin-subtext mb-4">
                        클릭하거나 드래그하여 사진을 업로드하세요
                    </p>
                    <div className="flex items-center justify-center gap-2">
                        <Upload className="w-4 h-4 text-skin-muted" />
                        <span className="text-xs text-skin-muted">
                            JPG, PNG, WebP · 최대 8MB
                        </span>
                    </div>
                </div>
            ) : (
                /* 미리보기 */
                <div className="relative">
                    <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-white/10">
                        <Image
                            src={previewUrl}
                            alt="선택한 사진"
                            fill
                            className="object-cover"
                        />
                    </div>
                    <button
                        onClick={handleClear}
                        disabled={isUploading}
                        className="absolute top-3 right-3 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* 에러 메시지 */}
            {error && (
                <div className="flex items-center gap-2 p-3 mt-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                    <AlertCircle className="w-4 h-4 text-red-400" />
                    <span className="text-sm text-red-400">{error}</span>
                </div>
            )}

            {/* 업로드 버튼 */}
            {selectedFile && (
                <button
                    onClick={handleUpload}
                    disabled={isUploading}
                    className={`w-full mt-4 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${isUploading
                        ? "bg-white/10 text-skin-muted cursor-not-allowed"
                        : "bg-skin-primary text-white hover:bg-skin-accent shadow-lg shadow-skin-primary/30"
                        }`}
                >
                    {isUploading ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            업로드 중...
                        </>
                    ) : (
                        <>
                            <Upload className="w-4 h-4" />
                            변환 시작
                        </>
                    )}
                </button>
            )}

            {/* 안내 문구 */}
            <p className="text-xs text-skin-muted text-center mt-4">
                💡 정면에 가깝고, 얼굴이 잘 보이는 사진이 결과가 안정적입니다.
            </p>
        </div>
    );
}
