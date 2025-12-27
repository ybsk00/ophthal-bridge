"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { RotateCcw, ZoomIn } from "lucide-react";

// 샘플 이미지 매핑 (동일 인물 3장)
const STYLE_VARIANTS = [
    {
        key: "natural",
        label: "내추럴",
        description: "피부결/톤 정리",
        image: "/base.png",
    },
    {
        key: "makeup",
        label: "메이크업 느낌",
        description: "색감/채도 조정",
        image: "/makeup.png",
    },
    {
        key: "bright",
        label: "밝은 톤",
        description: "밝기/화이트밸런스",
        image: "/highlight.png",
    },
] as const;

type VariantKey = (typeof STYLE_VARIANTS)[number]["key"];

interface HeroExperienceProps {
    className?: string;
}

const BRUSH_SIZE = 50;
const MIN_ZOOM = 1;
const MAX_ZOOM = 2;

export default function HeroExperience({ className = "" }: HeroExperienceProps) {
    const [selectedVariant, setSelectedVariant] = useState<VariantKey>("makeup");
    const [isPainting, setIsPainting] = useState(false);
    const [maskDataUrl, setMaskDataUrl] = useState<string | null>(null);
    const [zoomLevel, setZoomLevel] = useState(1);
    const [initialPinchDistance, setInitialPinchDistance] = useState<number | null>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Canvas 초기화
    const initCanvas = useCallback(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;

        const rect = container.getBoundingClientRect();
        canvas.width = rect.width * 2; // 고해상도
        canvas.height = rect.height * 2;

        const ctx = canvas.getContext("2d");
        if (ctx) {
            ctx.fillStyle = "black";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        setMaskDataUrl(null);
    }, []);

    // 창 크기 변경 시 Canvas 재초기화
    useEffect(() => {
        initCanvas();
        window.addEventListener("resize", initCanvas);
        return () => window.removeEventListener("resize", initCanvas);
    }, [initCanvas]);

    // 페인팅 함수
    const paint = useCallback((clientX: number, clientY: number) => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;

        const rect = container.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const x = (clientX - rect.left) * scaleX;
        const y = (clientY - rect.top) * scaleY;

        const ctx = canvas.getContext("2d");
        if (ctx) {
            ctx.fillStyle = "white";
            ctx.beginPath();
            ctx.arc(x, y, BRUSH_SIZE * scaleX, 0, Math.PI * 2);
            ctx.fill();

            // Canvas를 dataURL로 변환
            setMaskDataUrl(canvas.toDataURL());
        }
    }, []);

    // 마우스 휠 줌 (이미지 영역에서만)
    const handleWheel = useCallback((e: React.WheelEvent) => {
        e.preventDefault();
        e.stopPropagation();

        const delta = e.deltaY > 0 ? -0.15 : 0.15;
        setZoomLevel(prev => Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, prev + delta)));
    }, []);

    // 마우스 이벤트
    const handleMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsPainting(true);
        paint(e.clientX, e.clientY);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isPainting) return;
        paint(e.clientX, e.clientY);
    };

    const handleMouseUp = () => {
        setIsPainting(false);
    };

    const handleMouseLeave = () => {
        setIsPainting(false);
    };

    // 두 터치 포인트 거리 계산
    const getTouchDistance = (touches: React.TouchList) => {
        const dx = touches[0].clientX - touches[1].clientX;
        const dy = touches[0].clientY - touches[1].clientY;
        return Math.sqrt(dx * dx + dy * dy);
    };

    // 터치 이벤트
    const handleTouchStart = (e: React.TouchEvent) => {
        e.preventDefault();

        if (e.touches.length === 2) {
            // 핀치 줌 시작
            const distance = getTouchDistance(e.touches);
            setInitialPinchDistance(distance);
        } else if (e.touches.length === 1) {
            // 페인팅 시작
            setIsPainting(true);
            const touch = e.touches[0];
            paint(touch.clientX, touch.clientY);
        }
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        e.preventDefault();

        if (e.touches.length === 2 && initialPinchDistance !== null) {
            // 핀치 줌
            const currentDistance = getTouchDistance(e.touches);
            const scale = currentDistance / initialPinchDistance;
            setZoomLevel(prev => Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, prev * scale)));
            setInitialPinchDistance(currentDistance);
        } else if (e.touches.length === 1 && isPainting) {
            // 페인팅
            const touch = e.touches[0];
            paint(touch.clientX, touch.clientY);
        }
    };

    const handleTouchEnd = () => {
        setIsPainting(false);
        setInitialPinchDistance(null);
    };

    // 리셋
    const handleReset = () => {
        initCanvas();
        setZoomLevel(1);
    };

    const selectedStyle = STYLE_VARIANTS.find((v) => v.key === selectedVariant)!;
    const baseStyle = STYLE_VARIANTS.find((v) => v.key === "natural")!;

    return (
        <div className={`relative ${className}`}>
            {/* 이미지 뷰어 컨테이너 */}
            <div
                ref={containerRef}
                className="relative w-full aspect-[3/4] max-w-xl mx-auto rounded-3xl overflow-hidden shadow-2xl shadow-skin-primary/20 border border-white/10 select-none"
                style={{ touchAction: "none" }}
                onWheel={handleWheel}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseLeave}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                {/* 줌 가능한 이미지 래퍼 */}
                <div
                    className="absolute inset-0 transition-transform duration-150 ease-out origin-center"
                    style={{ transform: `scale(${zoomLevel})` }}
                >
                    {/* Base 이미지 (항상 표시) - 원본 해상도 */}
                    <Image
                        src={baseStyle.image}
                        alt={baseStyle.label}
                        fill
                        className="object-cover object-top pointer-events-none"
                        priority
                        unoptimized
                    />

                    {/* Reveal 이미지 (마스크로 표시) - 마스크가 없으면 숨김 */}
                    {selectedVariant !== "natural" && (
                        <div
                            className="absolute inset-0 pointer-events-none transition-opacity duration-100"
                            style={{
                                opacity: maskDataUrl ? 1 : 0,
                                maskImage: maskDataUrl ? `url(${maskDataUrl})` : undefined,
                                WebkitMaskImage: maskDataUrl ? `url(${maskDataUrl})` : undefined,
                                maskSize: "100% 100%",
                                WebkitMaskSize: "100% 100%",
                            }}
                        >
                            <Image
                                src={selectedStyle.image}
                                alt={selectedStyle.label}
                                fill
                                className="object-cover object-top"
                                unoptimized
                            />
                        </div>
                    )}
                </div>

                {/* Hidden Canvas for mask */}
                <canvas
                    ref={canvasRef}
                    className="absolute inset-0 pointer-events-none opacity-0"
                />

                {/* 오버레이 그라데이션 */}
                <div className="absolute inset-0 bg-gradient-to-t from-skin-bg/80 via-transparent to-transparent pointer-events-none" />

                {/* 커서 표시 */}
                <div
                    className={`absolute inset-0 ${isPainting ? 'cursor-none' : 'cursor-crosshair'}`}
                    style={{ pointerEvents: 'none' }}
                />

                {/* 하단 라벨 */}
                <div className="absolute bottom-0 left-0 right-0 p-4 text-center pointer-events-none">
                    <p className="text-lg font-bold text-white drop-shadow-lg">
                        {selectedVariant === "natural" ? "내추럴" : `${selectedStyle.label} 미리보기`}
                    </p>
                    <p className="text-sm text-white/80 drop-shadow">
                        {zoomLevel > 1
                            ? `${Math.round(zoomLevel * 100)}% · 드래그하여 칠하기`
                            : "스크롤로 확대 · 드래그로 칠하기"}
                    </p>
                </div>

                {/* 줌 인디케이터 */}
                {zoomLevel > 1 && (
                    <div className="absolute top-3 left-3 px-2 py-1 bg-black/50 rounded-lg flex items-center gap-1 text-white text-xs">
                        <ZoomIn className="w-3 h-3" />
                        {Math.round(zoomLevel * 100)}%
                    </div>
                )}

                {/* 리셋 버튼 */}
                {(maskDataUrl || zoomLevel > 1) && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleReset();
                        }}
                        className="absolute top-3 right-3 w-10 h-10 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors z-10"
                    >
                        <RotateCcw className="w-5 h-5" />
                    </button>
                )}

                {/* 페인팅 중 효과 */}
                {isPainting && (
                    <div className="absolute inset-0 ring-2 ring-skin-primary/50 rounded-3xl pointer-events-none" />
                )}
            </div>

            {/* 스타일 선택 버튼 */}
            <div className="flex justify-center gap-2 mt-6">
                {STYLE_VARIANTS.filter(v => v.key !== "natural").map((variant) => (
                    <button
                        key={variant.key}
                        onClick={() => {
                            setSelectedVariant(variant.key);
                            initCanvas();
                        }}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${variant.key === selectedVariant
                            ? "bg-skin-primary text-white shadow-lg shadow-skin-primary/30"
                            : "bg-white/10 text-skin-subtext hover:bg-white/20 hover:text-white"
                            }`}
                    >
                        {variant.label}
                    </button>
                ))}
            </div>

            {/* 안내 문구 */}
            <p className="text-center text-xs text-skin-muted mt-4">
                🖱️ 휠로 확대 · 드래그로 스타일 칠하기 | 📱 핀치 줌 · 터치 드래그
            </p>
        </div>
    );
}
