'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, Info, Eye, EyeOff, LogIn, Shuffle } from 'lucide-react';
import { useMarketingTracker } from '@/hooks/useMarketingTracker';

// ===== 타입 정의 =====
type VisionMode = 'sample' | 'live';
type ViewMode = 'before' | 'after';

// ===== 상수 =====
const SAMPLE_IMAGES = [
    { src: '/samples/vision/street_night.jpg', label: '야간 도로' },
    { src: '/samples/vision/text_board.jpg', label: '글자/간판' },
    { src: '/samples/vision/office_screen.jpg', label: '실내 화면' },
    { src: '/samples/vision/street_day.jpg', label: '밝은 야외' },
];

// 교정 전 효과 설정 (번짐)
const BEFORE_EFFECT = {
    blur: 0.5,      // 흐림
    glare: 0.2,     // 눈부심
    contrast: -0.1, // 대비 감소
};

interface VisionSimulatorProps {
    isLoggedIn?: boolean;
}

// ===== 컴포넌트 =====
export default function VisionSimulator({ isLoggedIn = false }: VisionSimulatorProps) {
    const { track } = useMarketingTracker();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);
    const animationRef = useRef<number | null>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const [mode, setMode] = useState<VisionMode>('sample');
    const [viewMode, setViewMode] = useState<ViewMode>('before'); // 기본값: 교정 전(번짐)
    const [sampleSrc, setSampleSrc] = useState(SAMPLE_IMAGES[0].src);
    const [isImageLoaded, setIsImageLoaded] = useState(false);
    const [cameraError, setCameraError] = useState<string | null>(null);

    const pressStartTimeRef = useRef<number>(0);

    // 이벤트: vision_open
    useEffect(() => {
        track('vision_open', { metadata: { initial_mode: mode } });
    }, []);

    // 카메라 시작 (로그인 사용자만)
    const startCamera = useCallback(async () => {
        if (!isLoggedIn) {
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
            setMode('live');
            setCameraError(null);
            track('mode_switch', { metadata: { from: 'sample', to: 'live' } });
        } catch (err: any) {
            setCameraError('카메라를 사용할 수 없습니다.');
        }
    }, [isLoggedIn, track]);

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

    // Canvas에 필터 적용하여 그리기
    const drawFrame = useCallback((source: HTMLVideoElement | HTMLImageElement) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Canvas 크기 설정 (9:16 비율)
        const maxWidth = 360;
        const maxHeight = 640;
        canvas.width = maxWidth;
        canvas.height = maxHeight;

        // 소스 크기
        const srcWidth = source instanceof HTMLVideoElement ? source.videoWidth : source.naturalWidth;
        const srcHeight = source instanceof HTMLVideoElement ? source.videoHeight : source.naturalHeight;

        if (srcWidth === 0 || srcHeight === 0) return;

        // 중앙 크롭 계산
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

        // 교정 전/후에 따른 필터 적용
        if (viewMode === 'before') {
            // 교정 전: 번짐 효과 적용
            const blurPx = BEFORE_EFFECT.blur * 8;
            const brightness = 1 + BEFORE_EFFECT.glare * 0.3;
            const contrastVal = 1 + BEFORE_EFFECT.contrast;
            ctx.filter = `blur(${blurPx}px) brightness(${brightness}) contrast(${contrastVal})`;
        } else {
            // 교정 후: 또렷하게 (필터 없음)
            ctx.filter = 'none';
        }

        // 그리기
        ctx.drawImage(source, sx, sy, sw, sh, 0, 0, maxWidth, maxHeight);

        // 교정 전: 눈부심 오버레이
        if (viewMode === 'before' && BEFORE_EFFECT.glare > 0.1) {
            const gradient = ctx.createRadialGradient(
                maxWidth / 2, maxHeight / 3, 0,
                maxWidth / 2, maxHeight / 3, maxWidth * 0.8
            );
            gradient.addColorStop(0, `rgba(255, 255, 255, ${BEFORE_EFFECT.glare * 0.3})`);
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            ctx.filter = 'none';
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, maxWidth, maxHeight);
        }
    }, [viewMode]);

    // Sample 모드: 이미지 변경 시에만 그리기
    useEffect(() => {
        if (mode === 'sample' && imageRef.current && isImageLoaded) {
            drawFrame(imageRef.current);
        }
    }, [mode, sampleSrc, isImageLoaded, drawFrame, viewMode]);

    // Live 모드: rAF 루프
    useEffect(() => {
        if (mode !== 'live' || !videoRef.current) return;

        const loop = () => {
            if (videoRef.current && videoRef.current.readyState >= 2) {
                drawFrame(videoRef.current);
            }
            animationRef.current = requestAnimationFrame(loop);
        };

        loop();

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [mode, drawFrame]);

    // 교정 전/후 토글
    const handleViewModeToggle = useCallback(() => {
        const newMode = viewMode === 'before' ? 'after' : 'before';
        setViewMode(newMode);
        track('before_after_toggle', { metadata: { viewMode: newMode } });
    }, [viewMode, track]);

    // Press-to-compare (누르면 교정 후, 떼면 교정 전)
    const handlePressStart = useCallback(() => {
        pressStartTimeRef.current = Date.now();
        setViewMode('after');
    }, []);

    const handlePressEnd = useCallback(() => {
        const duration = Date.now() - pressStartTimeRef.current;
        setViewMode('before');
        if (duration > 100) {
            track('before_after_hold', { metadata: { duration_ms: duration } });
        }
    }, [track]);

    // 다음 샘플로 변경
    const handleNextSample = useCallback(() => {
        const currentIndex = SAMPLE_IMAGES.findIndex(s => s.src === sampleSrc);
        const nextIndex = (currentIndex + 1) % SAMPLE_IMAGES.length;
        setSampleSrc(SAMPLE_IMAGES[nextIndex].src);
        setIsImageLoaded(false);
    }, [sampleSrc]);

    // 현재 샘플 라벨
    const currentSampleLabel = SAMPLE_IMAGES.find(s => s.src === sampleSrc)?.label || '';

    return (
        <div className="flex flex-col gap-4">
            {/* 디스클레이머 */}
            <div className="flex items-start gap-2 p-3 bg-skin-muted/30 rounded-xl text-xs text-skin-subtext">
                <Info size={14} className="mt-0.5 flex-shrink-0" />
                <span>본 기능은 참고용 체감 시뮬레이션이며 의료적 판단을 제공하지 않습니다.</span>
            </div>

            {/* 카메라 에러 메시지 */}
            {cameraError && (
                <div className="p-3 bg-orange-500/20 rounded-xl text-sm text-orange-300">
                    {cameraError}
                </div>
            )}

            {/* Canvas 영역 */}
            <div className="relative bg-black rounded-2xl overflow-hidden aspect-[9/16] max-h-[500px] mx-auto w-full max-w-[360px]">
                <canvas
                    ref={canvasRef}
                    className="w-full h-full object-contain"
                />
                {/* 숨겨진 이미지 로더 */}
                <img
                    ref={imageRef}
                    src={sampleSrc}
                    alt="Sample"
                    className="hidden"
                    onLoad={() => setIsImageLoaded(true)}
                    crossOrigin="anonymous"
                />
                {/* 숨겨진 비디오 */}
                <video
                    ref={videoRef}
                    className="hidden"
                    playsInline
                    muted
                />

                {/* 상단 상태 표시 */}
                <div className="absolute top-3 left-3 right-3 flex justify-between items-center">
                    <div className="px-3 py-1.5 bg-black/60 rounded-full text-xs text-white font-medium">
                        {mode === 'live' ? '🎥 내 카메라' : `🖼️ ${currentSampleLabel}`}
                    </div>
                    <div className={`px-3 py-1.5 rounded-full text-xs font-bold ${viewMode === 'before'
                            ? 'bg-orange-500/80 text-white'
                            : 'bg-emerald-500/80 text-white'
                        }`}>
                        {viewMode === 'before' ? '교정 전' : '교정 후'}
                    </div>
                </div>
            </div>

            {/* 교정 전/후 비교 버튼 */}
            <div className="flex flex-col gap-3">
                {/* 토글 버튼 */}
                <div className="grid grid-cols-2 gap-2">
                    <button
                        onClick={() => setViewMode('before')}
                        className={`flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all ${viewMode === 'before'
                                ? 'bg-orange-500 text-white'
                                : 'bg-white/10 text-skin-subtext hover:bg-white/20'
                            }`}
                    >
                        <EyeOff size={18} />
                        교정 전 (번짐)
                    </button>
                    <button
                        onClick={() => setViewMode('after')}
                        className={`flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all ${viewMode === 'after'
                                ? 'bg-emerald-500 text-white'
                                : 'bg-white/10 text-skin-subtext hover:bg-white/20'
                            }`}
                    >
                        <Eye size={18} />
                        교정 후 (또렷)
                    </button>
                </div>

                {/* Press-to-compare 버튼 */}
                <button
                    onPointerDown={handlePressStart}
                    onPointerUp={handlePressEnd}
                    onPointerCancel={handlePressEnd}
                    onPointerLeave={handlePressEnd}
                    className="w-full py-3 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 text-emerald-300 rounded-xl text-sm font-medium hover:from-emerald-500/30 hover:to-teal-500/30 transition-all touch-none select-none"
                >
                    👆 누르고 있으면 또렷하게 보기
                </button>
            </div>

            {/* 샘플 변경 버튼 (샘플 모드일 때만) */}
            {mode === 'sample' && (
                <button
                    onClick={handleNextSample}
                    className="flex items-center justify-center gap-2 py-2.5 bg-white/10 text-skin-subtext rounded-xl hover:bg-white/20 transition-colors"
                >
                    <Shuffle size={16} />
                    <span className="text-sm">다른 샘플 보기</span>
                </button>
            )}

            {/* 카메라 버튼 / 로그인 유도 */}
            {mode === 'sample' && (
                isLoggedIn ? (
                    <button
                        onClick={startCamera}
                        className="flex items-center justify-center gap-2 py-3 bg-skin-primary text-white rounded-xl font-medium hover:bg-skin-primary/90 transition-colors"
                    >
                        <Camera size={18} />
                        내 시야로 체험하기
                    </button>
                ) : (
                    <div className="bg-gradient-to-r from-skin-primary/20 to-emerald-500/20 border border-skin-primary/30 rounded-xl p-4 space-y-3">
                        <p className="text-sm text-white font-medium text-center">
                            내 카메라로 직접 체험해보세요!
                        </p>
                        <p className="text-xs text-skin-subtext text-center">
                            로그인하면 카메라로 실시간 교정 비교가 가능합니다.
                        </p>
                        <button
                            onClick={() => {
                                track('cta_click', { metadata: { cta_type: 'login_for_camera' } });
                                window.location.href = '/login?redirect=/medical&source=healthcare';
                            }}
                            className="w-full flex items-center justify-center gap-2 py-3 bg-skin-primary text-white rounded-xl font-medium hover:bg-skin-primary/90 transition-colors"
                        >
                            <LogIn size={18} />
                            로그인하고 체험하기
                        </button>
                    </div>
                )
            )}

            {/* 하단 안내 문구 */}
            <div className="text-center space-y-1">
                <p className="text-xs text-skin-subtext/70">
                    본 기능은 참고용 체감 비교이며, 실제 상태·결과를 예측하거나 보장하지 않습니다.
                </p>
            </div>
        </div>
    );
}
