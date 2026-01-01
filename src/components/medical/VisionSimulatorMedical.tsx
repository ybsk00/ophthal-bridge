'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, RefreshCw, Shuffle, Eye, CloudFog, Sun, Sparkles, Info, ArrowLeftRight } from 'lucide-react';
import type { SimulationMenuType } from './MedicalSimulationMenu';

// ===== 타입 정의 =====
type VisionMode = 'sample' | 'live';
type VisionPreset = 'clear' | 'blur' | 'glare' | 'mist';

interface VisionState {
    mode: VisionMode;
    preset: VisionPreset;
    blur: number;
    glare: number;
    contrast: number;
    sampleSrc: string;
    view: 'before' | 'after'; // Before/After 토글
}

// ===== 상수 =====
const SAMPLE_IMAGES = [
    { src: '/samples/vision/street_night.jpg', label: '야간 도로' },
    { src: '/samples/vision/text_board.jpg', label: '글자/간판' },
    { src: '/samples/vision/office_screen.jpg', label: '실내 화면' },
    { src: '/samples/vision/street_day.jpg', label: '밝은 야외' },
];

const PRESETS: Record<VisionPreset, { blur: number; glare: number; contrast: number; label: string; icon: typeof Eye }> = {
    clear: { blur: 0, glare: 0, contrast: 0, label: '또렷', icon: Eye },
    blur: { blur: 0.5, glare: 0.1, contrast: 0, label: '번짐', icon: CloudFog },
    glare: { blur: 0.2, glare: 0.6, contrast: -0.1, label: '눈부심', icon: Sun },
    mist: { blur: 0.4, glare: 0.3, contrast: -0.2, label: '안개', icon: Sparkles },
};

// 메뉴별 기본 프리셋 설정
const MENU_PRESETS: Record<SimulationMenuType, { blur: number; glare: number; contrast: number }> = {
    clarity: { blur: 0.5, glare: 0, contrast: 0.1 },      // 선명도: blur↑, contrast↑
    contrast: { blur: 0.1, glare: 0, contrast: -0.2 },    // 대비: contrast↓
    nightGlare: { blur: 0.15, glare: 0.6, contrast: 0 },  // 야간빛번짐: glare↑
    pattern: { blur: 0.3, glare: 0.2, contrast: -0.1 },   // 시야패턴: mix
};

const CAMERA_ERROR_MESSAGES: Record<string, string> = {
    NotAllowedError: '권한이 차단되어 샘플 모드로 진행합니다.',
    NotFoundError: '웹캠이 없어 샘플 모드로 진행합니다.',
    NotReadableError: '다른 앱이 카메라를 사용 중일 수 있습니다.',
    HTTPS: 'HTTPS 연결에서만 웹캠 사용이 가능합니다.',
};

interface Props {
    menuType: SimulationMenuType;
    defaultPreset: VisionPreset;
    onClose: () => void;
}

export default function VisionSimulatorMedical({ menuType, defaultPreset, onClose }: Props) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);
    const animationRef = useRef<number | null>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const menuPreset = MENU_PRESETS[menuType];

    const [state, setState] = useState<VisionState>({
        mode: 'sample',
        preset: defaultPreset,
        blur: menuPreset.blur,
        glare: menuPreset.glare,
        contrast: menuPreset.contrast,
        sampleSrc: menuType === 'nightGlare' ? SAMPLE_IMAGES[0].src : SAMPLE_IMAGES[1].src,
        view: 'after',
    });

    const [cameraError, setCameraError] = useState<string | null>(null);
    const [isImageLoaded, setIsImageLoaded] = useState(false);

    // 프리셋 적용
    const applyPreset = useCallback((preset: VisionPreset) => {
        const values = PRESETS[preset];
        setState(prev => ({
            ...prev,
            preset,
            blur: values.blur,
            glare: values.glare,
            contrast: values.contrast,
        }));
    }, []);

    // 메뉴별 기본값으로 리셋
    const handleReset = useCallback(() => {
        setState(prev => ({
            ...prev,
            blur: menuPreset.blur,
            glare: menuPreset.glare,
            contrast: menuPreset.contrast,
            preset: defaultPreset,
        }));
    }, [menuPreset, defaultPreset]);

    // Random Sample
    const handleRandomSample = useCallback(() => {
        const currentIndex = SAMPLE_IMAGES.findIndex(s => s.src === state.sampleSrc);
        const nextIndex = (currentIndex + 1) % SAMPLE_IMAGES.length;
        setState(prev => ({ ...prev, sampleSrc: SAMPLE_IMAGES[nextIndex].src }));
        setIsImageLoaded(false);
    }, [state.sampleSrc]);

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
        if (state.mode === 'sample' && imageRef.current && isImageLoaded) {
            const applyFilter = state.view === 'after';
            drawFrame(imageRef.current, applyFilter);
        }
    }, [state.mode, state.blur, state.glare, state.contrast, state.sampleSrc, state.view, isImageLoaded, drawFrame]);

    // Live 모드: rAF 루프
    useEffect(() => {
        if (state.mode !== 'live' || !videoRef.current) return;

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
    }, [state.mode, state.view, drawFrame]);

    // 슬라이더 핸들러
    const handleSliderChange = (key: 'blur' | 'glare' | 'contrast', value: number) => {
        setState(prev => ({ ...prev, [key]: value }));
    };

    return (
        <div className="flex flex-col gap-4 max-w-md mx-auto">
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
                    {state.view === 'before' ? 'Before (원본)' : 'After (적용)'}
                </button>
            </div>

            {/* Canvas 영역 */}
            <div className="relative bg-black rounded-2xl overflow-hidden aspect-[9/16] max-h-[450px] mx-auto">
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
                        {state.view === 'before' ? 'Before' : 'After'}
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

            {/* 프리셋 버튼 */}
            <div className="grid grid-cols-4 gap-2">
                {(Object.entries(PRESETS) as [VisionPreset, typeof PRESETS['clear']][]).map(([key, preset]) => {
                    const IconComponent = preset.icon;
                    return (
                        <button
                            key={key}
                            onClick={() => applyPreset(key)}
                            className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all ${state.preset === key
                                    ? 'bg-cyan-500 text-white'
                                    : 'bg-white/10 text-gray-400 hover:bg-white/20'
                                }`}
                        >
                            <IconComponent size={20} />
                            <span className="text-xs font-medium">{preset.label}</span>
                        </button>
                    );
                })}
            </div>

            {/* 슬라이더 */}
            <div className="space-y-4 bg-white/5 rounded-xl p-4">
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
                    onClick={handleRandomSample}
                    className="flex items-center justify-center gap-2 py-2.5 bg-white/10 text-gray-400 rounded-xl hover:bg-white/20 transition-colors"
                >
                    <Shuffle size={16} />
                    <span className="text-sm">다른 샘플</span>
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
    );
}
