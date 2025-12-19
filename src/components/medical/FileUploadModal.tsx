"use client";

import { useState, useRef } from "react";
import { createPortal } from "react-dom";
import { X, Upload, FileText, Image, Trash2, Eye, Loader2 } from "lucide-react";

type FileUploadModalProps = {
    isOpen: boolean;
    onClose: () => void;
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

export default function FileUploadModal({ isOpen, onClose }: FileUploadModalProps) {
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

    const handleFiles = async (fileList: FileList) => {
        setIsUploading(true);

        const newFiles: UploadedFile[] = [];

        for (const file of Array.from(fileList)) {
            if (file.type.startsWith('image/') || file.type === 'application/pdf') {
                const base64 = file.type.startsWith('image/') ? await fileToBase64(file) : undefined;
                newFiles.push({
                    id: `file-${Date.now()}-${Math.random()}`,
                    name: file.name,
                    type: file.type.includes('pdf') ? 'pdf' : 'image',
                    uploadedAt: new Date().toLocaleString('ko-KR'),
                    base64,
                    mimeType: file.type
                });
            }
        }

        setFiles(prev => [...newFiles, ...prev].slice(0, 5));
        setIsUploading(false);
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            handleFiles(e.target.files);
        }
    };

    const removeFile = (fileId: string) => {
        setFiles(prev => prev.filter(f => f.id !== fileId));
    };

    const analyzeFile = async (fileId: string) => {
        const file = files.find(f => f.id === fileId);
        if (!file || !file.base64 || file.type !== 'image') return;

        setFiles(prev => prev.map(f =>
            f.id === fileId ? { ...f, isAnalyzing: true } : f
        ));

        try {
            const response = await fetch('/api/medical/analyze-image', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    image: file.base64,
                    mimeType: file.mimeType,
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

    if (!isOpen) return null;

    const modalContent = (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="bg-orange-50 p-4 flex justify-between items-center border-b border-orange-100">
                    <div className="flex items-center gap-2">
                        <Upload className="w-5 h-5 text-orange-600" />
                        <h3 className="font-bold text-lg text-gray-900">문서 업로드</h3>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6">
                    {selectedAnalysis ? (
                        <div className="space-y-4">
                            <button
                                onClick={() => setSelectedAnalysis(null)}
                                className="text-sm text-orange-600 hover:underline"
                            >
                                ← 목록으로 돌아가기
                            </button>
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                                <h4 className="font-bold text-gray-900 mb-3">AI 분석 결과</h4>
                                <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">
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
                                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${dragActive ? 'border-orange-500 bg-orange-50' : 'border-gray-300 hover:border-orange-300'}`}
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*,.pdf"
                                    multiple
                                    onChange={handleFileInput}
                                    className="hidden"
                                />
                                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-sm text-gray-600 font-medium mb-1">
                                    {isUploading ? '업로드 중...' : '파일을 드래그하거나 클릭하세요'}
                                </p>
                                <p className="text-xs text-gray-400">JPG, PNG, PDF 지원</p>
                            </div>

                            {/* File List */}
                            {files.length > 0 && (
                                <div className="mt-6 space-y-3">
                                    <h4 className="text-sm font-medium text-gray-700">업로드된 파일 ({files.length})</h4>
                                    {files.map(file => (
                                        <div key={file.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                            {file.type === 'pdf' ? (
                                                <FileText className="w-8 h-8 text-red-500 flex-shrink-0" />
                                            ) : (
                                                <Image className="w-8 h-8 text-blue-500 flex-shrink-0" />
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-700 truncate">{file.name}</p>
                                                <p className="text-xs text-gray-400">{file.uploadedAt}</p>
                                            </div>
                                            <div className="flex gap-1">
                                                {file.type === 'image' && (
                                                    file.analysis ? (
                                                        <button
                                                            onClick={() => setSelectedAnalysis(file.analysis!)}
                                                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                            title="분석 결과 보기"
                                                        >
                                                            <Eye size={16} />
                                                        </button>
                                                    ) : file.isAnalyzing ? (
                                                        <div className="p-2">
                                                            <Loader2 size={16} className="animate-spin text-orange-500" />
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={() => analyzeFile(file.id)}
                                                            className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors text-xs font-medium"
                                                            title="AI 분석"
                                                        >
                                                            분석
                                                        </button>
                                                    )
                                                )}
                                                <button
                                                    onClick={() => removeFile(file.id)}
                                                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Info */}
                            <div className="mt-6 bg-blue-50 p-4 rounded-xl border border-blue-100">
                                <p className="text-xs text-blue-800">
                                    <strong>💡 팁:</strong> 이미지 업로드 후 "분석" 버튼을 누르면 AI가 내용을 분석합니다.
                                </p>
                            </div>
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-100">
                    <button
                        onClick={onClose}
                        className="w-full py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors"
                    >
                        완료
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
