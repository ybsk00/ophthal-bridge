'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { X, AlertCircle, Eye, Contrast, Camera, RefreshCw, ArrowLeftRight, Info } from 'lucide-react';

// ===== 타입 정의 =====
type OphthalCategory = 'lasik' | 'cataract';
type VisionMode = 'sample' | 'live';

interface VisionState {
    category: OphthalCategory | null;
    mode: VisionMode;
    blur: number;
    glare: number;
    contrast: number;
    sampleSrc: string;
    view: 'before' | 'after';
}

// ===== 상수 =====
const SAMPLE_IMAGES = [
    { src: '/samples/vision/street_night.jpg', label: '야간 도로' },
    { src: '/samples/vision/text_board.jpg', label: '글자/간판' },
    { src: '/samples/vision/office_screen.jpg', label: '실내 화면' },
    { src: '/samples/vision/street_day.jpg', label: '밝은 야외' },
];

// 카테고리별 기본 효과 설정
const CATEGORY_PRESETS: Record<OphthalCategory, { blur: number; glare: number; contrast: number; description: string }> = {
    lasik: { blur: 0.35, glare: 0.1, contrast: 0.08, description: '또렷함/번짐 체감 비교' },
    cataract: { blur: 0.25, glare: 0.55, contrast: -0.1, description: '대비/안개·눈부심 체감 비교' },
};

const MENU_OPTIONS = [
    {
        key: 'lasik' as OphthalCategory,
        title: '교정 전후 (라식/라섹)',
        description: '또렷함/번짐 체감 비교',
        icon: Eye,
        color: 'bg-cyan-500',
    },
    {
        key: 'cataract' as OphthalCategory,
        title: '교정 전후 (녹내장/백내장)',
        description: '대비/안개·눈부심 체감 비교',
        icon: Contrast,
        color: 'bg-purple-500',
    },
];

const CAMERA_ERROR_MESSAGES: Record<string, string> = {
    NotAllowedError: '권한이 차단되어 샘플 모드로 진행합니다.',
    NotFoundError: '웹캠이 없어 샘플 모드로 진행합니다.',
    NotReadableError: '다른 앱이 카메라를 사용 중일 수 있습니다.',
    HTTPS: 'HTTPS 연결에서만 웹캠 사용이 가능합니다.',
};

interface OphthalSimulationModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function OphthalSimulationModal({ isOpen, onClose }: OphthalSimulationModalProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);
    const animationRef = useRef<number | null>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const [isVisible, setIsVisible] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const [cameraError, setCameraError] = useState<string | null>(null);
    const [isImageLoaded, setIsImageLoaded] = useState(false);

    const [state, setState] = useState<VisionState>({
        category: null,
        mode: 'sample',
        blur: 0,
        glare: 0,
        contrast: 0,
        sampleSrc: SAMPLE_IMAGES[0].src,
        view: 'after',
    });

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
                // 모달 닫을 때 상태 초기화
                setState({
                    category: null,
                    mode: 'sample',
                    blur: 0,
                    glare: 0,
                    contrast: 0,
                    sampleSrc: SAMPLE_IMAGES[0].src,
                    view: 'after',
                });
                stopCamera();
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    // ESC 키로 닫기
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                if (state.category) {
                    handleBack();
                } else {
                    onClose();
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, state.category, onClose]);

    // 스크롤 방지
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    // 카테고리 선택
    const handleSelectCategory = useCallback((category: OphthalCategory) => {
        const preset = CATEGORY_PRESETS[category];
        setState(prev => ({
            ...prev,
            category,
            blur: preset.blur,
            glare: preset.glare,
            contrast: preset.contrast,
            sampleSrc: category === 'cataract' ? SAMPLE_IMAGES[0].src : SAMPLE_IMAGES[1].src,
        }));
        setIsImageLoaded(false);
    }, []);

    // 뒤로가기
    const handleBack = useCallback(() => {
        stopCamera();
        setState(prev => ({
            ...prev,
            category: null,
            mode: 'sample',
        }));
    }, []);

    // Before/After 토글
    const toggleView = useCallback(() => {
        setState(prev => ({ ...prev, view: prev.view === 'before' ? 'after' : 'before' }));
    }, []);

    // 카메라 시작
    const startCamera = useCallback(async () => {
        if (typeof window !== 'undefined' && window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
            setCameraError(CAMERA_ERROR_MESSAGES.HTTPS);
            return;
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment', width: { ideal: 720 }, height: { ideal: 1280 } }
            });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                await videoRef.current.play();
            }
            setState(prev => ({ ...prev, mode: 'live' }));
            setCameraError(null);
        } catch (err: any) {
            const errorName = err.name || 'Unknown';
            setCameraError(CAMERA_ERROR_MESSAGES[errorName] || '카메라를 사용할 수 없습니다.');
        }
    }, []);

    // 카메라 정지
    const stopCamera = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
            animationRef.current = null;
        }
    }, []);

    // 컴포넌트 언마운트 시 카메라 정지
    useEffect(() => {
        return () => stopCamera();
    }, [stopCamera]);

    // Canvas 그리기
    const drawFrame = useCallback((source: HTMLVideoElement | HTMLImageElement, applyFilter: boolean) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const maxWidth = 360;
        const maxHeight = 640;
        canvas.width = maxWidth;
        canvas.height = maxHeight;

        const srcWidth = source instanceof HTMLVideoElement ? source.videoWidth : source.naturalWidth;
        const srcHeight = source instanceof HTMLVideoElement ? source.videoHeight : source.naturalHeight;

        if (srcWidth === 0 || srcHeight === 0) return;

        // 중앙 크롭
        const targetRatio = maxWidth / maxHeight;
        const srcRatio = srcWidth / srcHeight;
        let sx = 0, sy = 0, sw = srcWidth, sh = srcHeight;

        if (srcRatio > targetRatio) {
            sw = srcHeight * targetRatio;
            sx = (srcWidth - sw) / 2;
        } else {
            sh = srcWidth / targetRatio;
            sy = (srcHeight - sh) / 2;
        }

        // 필터 적용 여부
        if (applyFilter) {
            const blurPx = state.blur * 8;
            const brightness = 1 + state.glare * 0.5;
            const contrastVal = 1 + state.contrast;
            ctx.filter = `blur(${blurPx}px) brightness(${brightness}) contrast(${contrastVal})`;
        } else {
            ctx.filter = 'none';
        }

        ctx.drawImage(source, sx, sy, sw, sh, 0, 0, maxWidth, maxHeight);

        // Glare 오버레이
        if (applyFilter && state.glare > 0.1) {
            const gradient = ctx.createRadialGradient(
                maxWidth / 2, maxHeight / 3, 0,
                maxWidth / 2, maxHeight / 3, maxWidth * 0.8
            );
            gradient.addColorStop(0, `rgba(255, 255, 255, ${state.glare * 0.4})`);
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            ctx.filter = 'none';
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, maxWidth, maxHeight);
        }
    }, [state.blur, state.glare, state.contrast]);

    // Sample 모드: 이미지 그리기
    useEffect(() => {
        if (state.mode === 'sample' && state.category && imageRef.current && isImageLoaded) {
            const applyFilter = state.view === 'after';
            drawFrame(imageRef.current, applyFilter);
        }
    }, [state.mode, state.category, state.blur, state.glare, state.contrast, state.sampleSrc, state.view, isImageLoaded, drawFrame]);

    // Live 모드: rAF 루프
    useEffect(() => {
        if (state.mode !== 'live' || !state.category || !videoRef.current) return;

        const loop = () => {
            if (videoRef.current && videoRef.current.readyState >= 2) {
                const applyFilter = state.view === 'after';
                drawFrame(videoRef.current, applyFilter);
            }
            animationRef.current = requestAnimationFrame(loop);
        };

        loop();

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [state.mode, state.category, state.view, drawFrame]);

    // 슬라이더 핸들러
    const handleSliderChange = (key: 'blur' | 'glare' | 'contrast', value: number) => {
        setState(prev => ({ ...prev, [key]: value }));
    };

    // 리셋
    const handleReset = useCallback(() => {
        if (state.category) {
            const preset = CATEGORY_PRESETS[state.category];
            setState(prev => ({
                ...prev,
                blur: preset.blur,
                glare: preset.glare,
                contrast: preset.contrast,
            }));
        }
    }, [state.category]);

    if (!isVisible) return null;

    const selectedCategory = MENU_OPTIONS.find(m => m.key === state.category);

    return (
        <div className="fixed inset-0 z-50">
            {/* 배경 오버레이 */}
            <div
                className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isAnimating ? 'opacity-100' : 'opacity-0'}`}
                onClick={onClose}
            />

            {/* 모달 */}
            <div
                className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md max-h-[90vh] rounded-2xl shadow-2xl border border-gray-700 bg-[#1e293b] flex flex-col overflow-hidden transition-all duration-300 ${isAnimating ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* 헤더 */}
                <div className="flex items-center justify-between p-4 border-b border-gray-700 flex-shrink-0">
                    <div>
                        <h2 className="text-lg font-bold text-white">
                            가상 시뮬레이션<span className="text-gray-400 font-normal ml-1">(참고용)</span>
                        </h2>
                        <p className="text-xs text-gray-400">
                            {!state.category && '어떤 교정 전후가 궁금하세요?'}
                            {state.category && selectedCategory?.title}
                        </p>
                    </div>
                    <button
                        onClick={state.category ? handleBack : onClose}
                        className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                {/* 콘텐츠 */}
                <div className="flex-1 overflow-y-auto p-4">
                    {/* 메뉴 선택 화면 */}
                    {!state.category && (
                        <div className="space-y-4">
                            <h3 className="text-center text-base font-semibold text-white mb-4">
                                어떤 교정 전후가 궁금하세요?
                            </h3>
                            <div className="grid grid-cols-1 gap-4">
                                {MENU_OPTIONS.map((option) => {
                                    const Icon = option.icon;
                                    return (
                                        <button
                                            key={option.key}
                                            onClick={() => handleSelectCategory(option.key)}
                                            className="flex items-center gap-4 p-5 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700 hover:border-cyan-500/50 rounded-2xl transition-all group"
                                        >
                                            <div className={`w-14 h-14 ${option.color} rounded-full flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform`}>
                                                <Icon className="w-7 h-7 text-white" />
                                            </div>
                                            <div className="text-left">
                                                <p className="text-base font-medium text-white">{option.title}</p>
                                                <p className="text-xs text-gray-500 mt-0.5">{option.description}</p>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="text-center text-xs text-gray-500 pt-4">
                                <p>PC에서는 샘플 이미지 기반 전/후 비교</p>
                                <p>웹캠 사용 가능 시 실시간 체험 제공</p>
                            </div>
                        </div>
                    )}

                    {/* 시뮬레이터 화면 */}
                    {state.category && (
                        <div className="flex flex-col gap-4">
                            {/* 디스클레이머 */}
                            <div className="flex items-start gap-2 p-3 bg-cyan-500/10 rounded-xl text-xs text-cyan-300">
                                <Info size={14} className="mt-0.5 flex-shrink-0" />
                                <span>본 기능은 참고용 체감 시뮬레이션이며 의료적 판단을 제공하지 않습니다.</span>
                            </div>

                            {/* 카메라 에러 */}
                            {cameraError && (
                                <div className="p-3 bg-orange-500/20 rounded-xl text-sm text-orange-300">
                                    {cameraError}
                                </div>
                            )}

                            {/* Before/After 토글 버튼 */}
                            <div className="flex justify-center">
                                <button
                                    onClick={toggleView}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all ${state.view === 'before'
                                        ? 'bg-gray-600 text-white'
                                        : 'bg-cyan-500 text-white'
                                        }`}
                                >
                                    <ArrowLeftRight size={16} />
                                    {state.view === 'before' ? '교정 전 (기본)' : '교정 후 (설정)'}
                                </button>
                            </div>

                            {/* Canvas 영역 */}
                            <div className="relative bg-black rounded-2xl overflow-hidden aspect-[9/16] max-h-[350px] mx-auto">
                                <canvas ref={canvasRef} className="w-full h-full object-contain" />
                                <img
                                    ref={imageRef}
                                    src={state.sampleSrc}
                                    alt="Sample"
                                    className="hidden"
                                    onLoad={() => setIsImageLoaded(true)}
                                    crossOrigin="anonymous"
                                />
                                <video ref={videoRef} className="hidden" playsInline muted />

                                {/* 모드/뷰 표시 */}
                                <div className="absolute top-3 left-3 flex gap-2">
                                    <span className="px-2 py-1 bg-black/50 rounded-full text-xs text-white">
                                        {state.mode === 'live' ? '🎥 웹캠' : '🖼️ 샘플'}
                                    </span>
                                    <span className={`px-2 py-1 rounded-full text-xs ${state.view === 'before' ? 'bg-gray-600' : 'bg-cyan-500'} text-white`}>
                                        {state.view === 'before' ? '교정 전' : '교정 후'}
                                    </span>
                                </div>
                            </div>

                            {/* Sample 선택 */}
                            {state.mode === 'sample' && (
                                <div className="flex gap-2 overflow-x-auto pb-2">
                                    {SAMPLE_IMAGES.map((sample) => (
                                        <button
                                            key={sample.src}
                                            onClick={() => {
                                                setState(prev => ({ ...prev, sampleSrc: sample.src }));
                                                setIsImageLoaded(false);
                                            }}
                                            className={`flex-shrink-0 px-3 py-2 rounded-lg text-xs font-medium transition-all ${state.sampleSrc === sample.src
                                                ? 'bg-cyan-500 text-white'
                                                : 'bg-white/10 text-gray-400 hover:bg-white/20'
                                                }`}
                                        >
                                            {sample.label}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* 슬라이더 */}
                            <div className="space-y-3 bg-white/5 rounded-xl p-4">
                                <div>
                                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                                        <span>흐림</span>
                                        <span>{Math.round(state.blur * 100)}%</span>
                                    </div>
                                    <input
                                        type="range" min={0} max={1} step={0.01}
                                        value={state.blur}
                                        onChange={(e) => handleSliderChange('blur', parseFloat(e.target.value))}
                                        className="w-full accent-cyan-500"
                                    />
                                </div>
                                <div>
                                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                                        <span>눈부심</span>
                                        <span>{Math.round(state.glare * 100)}%</span>
                                    </div>
                                    <input
                                        type="range" min={0} max={1} step={0.01}
                                        value={state.glare}
                                        onChange={(e) => handleSliderChange('glare', parseFloat(e.target.value))}
                                        className="w-full accent-cyan-500"
                                    />
                                </div>
                                <div>
                                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                                        <span>대비</span>
                                        <span>{Math.round(state.contrast * 100)}%</span>
                                    </div>
                                    <input
                                        type="range" min={-0.3} max={0.3} step={0.01}
                                        value={state.contrast}
                                        onChange={(e) => handleSliderChange('contrast', parseFloat(e.target.value))}
                                        className="w-full accent-cyan-500"
                                    />
                                </div>
                            </div>

                            {/* 버튼 그룹 */}
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    onClick={handleReset}
                                    className="flex items-center justify-center gap-2 py-2.5 bg-white/10 text-gray-400 rounded-xl hover:bg-white/20 transition-colors"
                                >
                                    <RefreshCw size={16} />
                                    <span className="text-sm">초기화</span>
                                </button>
                                <button
                                    onClick={handleBack}
                                    className="flex items-center justify-center gap-2 py-2.5 bg-white/10 text-gray-400 rounded-xl hover:bg-white/20 transition-colors"
                                >
                                    <span className="text-sm">다른 메뉴 보기</span>
                                </button>
                            </div>

                            {/* 웹캠 전환 */}
                            {state.mode === 'sample' && (
                                <button
                                    onClick={startCamera}
                                    className="flex items-center justify-center gap-2 py-3 bg-white/5 border border-white/10 text-gray-400 rounded-xl hover:bg-white/10 transition-colors"
                                >
                                    <Camera size={18} />
                                    <span className="text-sm">웹캠으로 체험하기 (선택)</span>
                                </button>
                            )}
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
