"use client";

import { useState, useRef } from "react";
import { createPortal } from "react-dom";
import { X, Upload, FileText, Image, Trash2, Eye, Loader2, CheckCircle } from "lucide-react";

type FileUploadModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onComplete?: (analysisResult: string) => void;
};

type UploadedFile = {
    id: string;
    name: string;
    type: 'image' | 'pdf';
    uploadedAt: string;
    base64?: string;
    mimeType?: string;
    analysis?: string;
    isAnalyzing?: boolean;
};

export default function FileUploadModal({ isOpen, onClose, onComplete }: FileUploadModalProps) {
    const [files, setFiles] = useState<UploadedFile[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [selectedAnalysis, setSelectedAnalysis] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFiles(e.dataTransfer.files);
        }
    };

    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                const result = reader.result as string;
                const base64 = result.split(',')[1];
                resolve(base64);
            };
            reader.onerror = error => reject(error);
        });
    };

    // 파일 업로드 후 자동 분석
    const handleFiles = async (fileList: FileList) => {
        setIsUploading(true);

        for (const file of Array.from(fileList)) {
            if (file.type.startsWith('image/') || file.type === 'application/pdf') {
                const base64 = file.type.startsWith('image/') ? await fileToBase64(file) : undefined;
                const newFile: UploadedFile = {
                    id: `file-${Date.now()}-${Math.random()}`,
                    name: file.name,
                    type: file.type.includes('pdf') ? 'pdf' : 'image',
                    uploadedAt: new Date().toLocaleString('ko-KR'),
                    base64,
                    mimeType: file.type,
                    isAnalyzing: file.type.startsWith('image/') // 이미지면 자동 분석 시작
                };

                setFiles(prev => [newFile, ...prev].slice(0, 5));

                // 이미지 파일이면 자동 분석
                if (file.type.startsWith('image/') && base64) {
                    autoAnalyzeFile(newFile.id, base64, file.type);
                }
            }
        }

        setIsUploading(false);
    };

    // 자동 분석 함수
    const autoAnalyzeFile = async (fileId: string, base64: string, mimeType: string) => {
        try {
            const response = await fetch('/api/medical/analyze-image', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    image: base64,
                    mimeType: mimeType,
                    history: []
                })
            });

            if (!response.ok) throw new Error('분석 실패');

            const data = await response.json();

            setFiles(prev => prev.map(f =>
                f.id === fileId ? { ...f, analysis: data.content, isAnalyzing: false } : f
            ));
        } catch (error) {
            setFiles(prev => prev.map(f =>
                f.id === fileId ? { ...f, isAnalyzing: false } : f
            ));
        }
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            handleFiles(e.target.files);
        }
    };

    const removeFile = (fileId: string) => {
        setFiles(prev => prev.filter(f => f.id !== fileId));
    };

    // 완료 버튼 클릭 시 분석 결과를 채팅으로 전달
    const handleComplete = () => {
        const analyzedFiles = files.filter(f => f.analysis);
        if (analyzedFiles.length > 0 && onComplete) {
            const summary = analyzedFiles.map(f =>
                `**[${f.name}] 분석 결과:**\n${f.analysis}`
            ).join('\n\n---\n\n');

            const fullMessage = `검사결과지 분석 결과입니다.\n\n${summary}\n\n위 분석 결과를 바탕으로 상담을 진행해주세요.`;
            onComplete(fullMessage);
        }
        setFiles([]);
        setSelectedAnalysis(null);
        onClose();
    };

    const hasAnalyzedFiles = files.some(f => f.analysis);
    const isAnyAnalyzing = files.some(f => f.isAnalyzing);

    if (!isOpen) return null;

    const modalContent = (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-[#1e293b] rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col border border-gray-700">
                {/* Header */}
                <div className="bg-gray-800 p-4 flex justify-between items-center border-b border-gray-700">
                    <div className="flex items-center gap-2">
                        <Upload className="w-5 h-5 text-orange-400" />
                        <h3 className="font-bold text-lg text-white">검사결과지 분석</h3>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6">
                    {selectedAnalysis ? (
                        <div className="space-y-4">
                            <button
                                onClick={() => setSelectedAnalysis(null)}
                                className="text-sm text-orange-400 hover:underline"
                            >
                                ← 목록으로 돌아가기
                            </button>
                            <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700">
                                <h4 className="font-bold text-white mb-3">AI 분석 결과</h4>
                                <div className="prose prose-sm max-w-none text-gray-300 whitespace-pre-wrap">
                                    {selectedAnalysis}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Upload Zone */}
                            <div
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onDragOver={handleDrag}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current?.click()}
                                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer bg-gray-800/50 ${dragActive ? 'border-orange-500 bg-orange-500/10' : 'border-gray-600 hover:border-orange-400'}`}
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*,.pdf"
                                    multiple
                                    onChange={handleFileInput}
                                    className="hidden"
                                />
                                <Upload className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                                <p className="text-sm text-gray-300 font-medium mb-1">
                                    {isUploading ? '업로드 중...' : '파일을 드래그하거나 클릭하세요'}
                                </p>
                                <p className="text-xs text-gray-500">JPG, PNG, PDF 지원 (이미지는 자동 분석)</p>
                            </div>

                            {/* File List */}
                            {files.length > 0 && (
                                <div className="mt-6 space-y-3">
                                    <h4 className="text-sm font-medium text-gray-300">업로드된 파일 ({files.length})</h4>
                                    {files.map(file => (
                                        <div key={file.id} className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-xl border border-gray-700">
                                            {file.type === 'pdf' ? (
                                                <FileText className="w-8 h-8 text-red-400 flex-shrink-0" />
                                            ) : (
                                                <Image className="w-8 h-8 text-blue-400 flex-shrink-0" />
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-200 truncate">{file.name}</p>
                                                <p className="text-xs text-gray-500">
                                                    {file.isAnalyzing ? '분석 중...' : file.analysis ? '✅ 분석 완료' : file.uploadedAt}
                                                </p>
                                            </div>
                                            <div className="flex gap-1">
                                                {file.type === 'image' && (
                                                    file.analysis ? (
                                                        <button
                                                            onClick={() => setSelectedAnalysis(file.analysis!)}
                                                            className="p-2 text-green-400 hover:bg-green-500/10 rounded-lg transition-colors"
                                                            title="분석 결과 보기"
                                                        >
                                                            <Eye size={16} />
                                                        </button>
                                                    ) : file.isAnalyzing ? (
                                                        <div className="p-2">
                                                            <Loader2 size={16} className="animate-spin text-orange-400" />
                                                        </div>
                                                    ) : null
                                                )}
                                                <button
                                                    onClick={() => removeFile(file.id)}
                                                    className="p-2 text-gray-500 hover:text-red-400 transition-colors"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Info */}
                            <div className="mt-6 bg-blue-500/10 p-4 rounded-xl border border-blue-500/30">
                                <p className="text-xs text-blue-300">
                                    <strong>💡 자동 분석:</strong> 이미지 업로드 시 자동으로 AI가 분석합니다. 완료 후 상담으로 연결됩니다.
                                </p>
                            </div>
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-700">
                    <button
                        onClick={handleComplete}
                        disabled={isAnyAnalyzing}
                        className={`w-full py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 ${hasAnalyzedFiles
                            ? 'bg-orange-500 text-white hover:bg-orange-600'
                            : 'bg-gray-700 text-gray-400'
                            } disabled:opacity-50`}
                    >
                        {isAnyAnalyzing ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                분석 중...
                            </>
                        ) : hasAnalyzedFiles ? (
                            <>
                                <CheckCircle size={18} />
                                분석 결과로 상담 시작
                            </>
                        ) : (
                            '완료'
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
