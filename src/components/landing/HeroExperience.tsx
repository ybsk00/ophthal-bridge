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

const BRUSH_SIZE = 35; // 브러시 반경 (px)
const MIN_ZOOM = 1;
const MAX_ZOOM = 2;

export default function HeroExperience({ className = "" }: HeroExperienceProps) {
    const [selectedVariant, setSelectedVariant] = useState<VariantKey>("makeup");
    const [isPainting, setIsPainting] = useState(false);
    const [hasPainted, setHasPainted] = useState(false);
    const [maskUrl, setMaskUrl] = useState<string | null>(null);
    const [zoomLevel, setZoomLevel] = useState(1);
    const [initialPinchDistance, setInitialPinchDistance] = useState<number | null>(null);
    const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(null);

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const lastPosRef = useRef<{ x: number; y: number } | null>(null);
    const rafRef = useRef<number | null>(null);

    // Canvas 초기화
    const initCanvas = useCallback(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;

        const rect = container.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;

        const ctx = canvas.getContext("2d");
        if (ctx) {
            // 완전히 투명하게 초기화
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
        setMaskUrl(null);
        setHasPainted(false);
    }, []);

    // 창 크기 변경 시 Canvas 재초기화
    useEffect(() => {
        initCanvas();
        window.addEventListener("resize", initCanvas);
        return () => window.removeEventListener("resize", initCanvas);
    }, [initCanvas]);

    // 마스크 URL 업데이트 (throttled)
    const updateMaskUrl = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        setMaskUrl(canvas.toDataURL("image/png"));
    }, []);

    // 부드러운 브러시로 페인팅
    const paintAt = useCallback((x: number, y: number) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // 부드러운 원형 브러시 (radial gradient)
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, BRUSH_SIZE);
        gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
        gradient.addColorStop(0.7, "rgba(255, 255, 255, 0.8)");
        gradient.addColorStop(1, "rgba(255, 255, 255, 0)");

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, BRUSH_SIZE, 0, Math.PI * 2);
        ctx.fill();

        setHasPainted(true);

        // requestAnimationFrame으로 마스크 업데이트 (성능 최적화)
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        rafRef.current = requestAnimationFrame(updateMaskUrl);
    }, [updateMaskUrl]);

    // 선을 그리며 페인팅 (드래그 시 부드러운 연결)
    const paintLine = useCallback((fromX: number, fromY: number, toX: number, toY: number) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // 두 점 사이를 보간하여 부드럽게 연결
        const distance = Math.sqrt((toX - fromX) ** 2 + (toY - fromY) ** 2);
        const steps = Math.max(1, Math.floor(distance / 3));

        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const x = fromX + (toX - fromX) * t;
            const y = fromY + (toY - fromY) * t;

            const gradient = ctx.createRadialGradient(x, y, 0, x, y, BRUSH_SIZE);
            gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
            gradient.addColorStop(0.7, "rgba(255, 255, 255, 0.8)");
            gradient.addColorStop(1, "rgba(255, 255, 255, 0)");

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(x, y, BRUSH_SIZE, 0, Math.PI * 2);
            ctx.fill();
        }

        setHasPainted(true);

        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        rafRef.current = requestAnimationFrame(updateMaskUrl);
    }, [updateMaskUrl]);

    // 좌표 계산
    const getCanvasCoords = useCallback((clientX: number, clientY: number) => {
        const container = containerRef.current;
        if (!container) return null;

        const rect = container.getBoundingClientRect();
        return {
            x: clientX - rect.left,
            y: clientY - rect.top,
        };
    }, []);

    // 마우스 휠 줌
    const handleWheel = useCallback((e: React.WheelEvent) => {
        e.preventDefault();
        e.stopPropagation();

        const delta = e.deltaY > 0 ? -0.15 : 0.15;
        setZoomLevel(prev => Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, prev + delta)));
    }, []);

    // 마우스 이벤트
    const handleMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        const coords = getCanvasCoords(e.clientX, e.clientY);
        if (!coords) return;

        setIsPainting(true);
        paintAt(coords.x, coords.y);
        lastPosRef.current = coords;
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        const coords = getCanvasCoords(e.clientX, e.clientY);
        if (coords) {
            setCursorPos(coords);
        }

        if (!isPainting || !coords) return;

        if (lastPosRef.current) {
            paintLine(lastPosRef.current.x, lastPosRef.current.y, coords.x, coords.y);
        } else {
            paintAt(coords.x, coords.y);
        }
        lastPosRef.current = coords;
    };

    const handleMouseUp = () => {
        setIsPainting(false);
        lastPosRef.current = null;
    };

    const handleMouseLeave = () => {
        setIsPainting(false);
        lastPosRef.current = null;
        setCursorPos(null);
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
            const distance = getTouchDistance(e.touches);
            setInitialPinchDistance(distance);
        } else if (e.touches.length === 1) {
            const coords = getCanvasCoords(e.touches[0].clientX, e.touches[0].clientY);
            if (coords) {
                setIsPainting(true);
                paintAt(coords.x, coords.y);
                lastPosRef.current = coords;
            }
        }
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        e.preventDefault();

        if (e.touches.length === 2 && initialPinchDistance !== null) {
            const currentDistance = getTouchDistance(e.touches);
            const scale = currentDistance / initialPinchDistance;
            setZoomLevel(prev => Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, prev * scale)));
            setInitialPinchDistance(currentDistance);
        } else if (e.touches.length === 1 && isPainting) {
            const coords = getCanvasCoords(e.touches[0].clientX, e.touches[0].clientY);
            if (coords) {
                if (lastPosRef.current) {
                    paintLine(lastPosRef.current.x, lastPosRef.current.y, coords.x, coords.y);
                } else {
                    paintAt(coords.x, coords.y);
                }
                lastPosRef.current = coords;
            }
        }
    };

    const handleTouchEnd = () => {
        setIsPainting(false);
        setInitialPinchDistance(null);
        lastPosRef.current = null;
    };

    // 리셋
    const handleReset = () => {
        initCanvas();
        setZoomLevel(1);
    };

    // 컴포넌트 언마운트 시 정리
    useEffect(() => {
        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, []);

    const selectedStyle = STYLE_VARIANTS.find((v) => v.key === selectedVariant)!;
    const baseStyle = STYLE_VARIANTS.find((v) => v.key === "natural")!;

    return (
        <div className={`relative ${className}`}>
            {/* 이미지 뷰어 컨테이너 */}
            <div
                ref={containerRef}
                className="relative w-full aspect-[3/4] max-w-xl mx-auto rounded-3xl overflow-hidden shadow-2xl shadow-skin-primary/20 border border-white/10 select-none"
                style={{ touchAction: "none", cursor: "none" }}
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
                    {/* Base 이미지 (항상 표시) */}
                    <Image
                        src={baseStyle.image}
                        alt={baseStyle.label}
                        fill
                        className="object-cover object-top pointer-events-none"
                        priority
                        unoptimized
                    />

                    {/* Reveal 이미지 (Canvas 마스크로 부분 표시) */}
                    {selectedVariant !== "natural" && maskUrl && (
                        <div
                            className="absolute inset-0 pointer-events-none"
                            style={{
                                maskImage: `url(${maskUrl})`,
                                WebkitMaskImage: `url(${maskUrl})`,
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

                {/* Hidden Canvas for painting */}
                <canvas
                    ref={canvasRef}
                    className="absolute inset-0 pointer-events-none opacity-0"
                />

                {/* 오버레이 그라데이션 */}
                <div className="absolute inset-0 bg-gradient-to-t from-skin-bg/80 via-transparent to-transparent pointer-events-none" />

                {/* 커스텀 브러시 커서 */}
                {cursorPos && (
                    <div
                        className="absolute pointer-events-none z-20 transition-transform duration-75"
                        style={{
                            left: cursorPos.x - BRUSH_SIZE,
                            top: cursorPos.y - BRUSH_SIZE,
                            width: BRUSH_SIZE * 2,
                            height: BRUSH_SIZE * 2,
                        }}
                    >
                        <div
                            className={`w-full h-full rounded-full border-2 transition-all duration-75 ${isPainting
                                    ? "border-skin-primary bg-skin-primary/30 scale-95"
                                    : "border-white/60 bg-white/10"
                                }`}
                            style={{
                                boxShadow: isPainting
                                    ? "0 0 20px rgba(236, 72, 153, 0.5)"
                                    : "0 0 10px rgba(255,255,255,0.2)",
                            }}
                        />
                    </div>
                )}

                {/* 하단 라벨 */}
                <div className="absolute bottom-0 left-0 right-0 p-4 text-center pointer-events-none">
                    <p className="text-lg font-bold text-white drop-shadow-lg">
                        {hasPainted ? `${selectedStyle.label} 미리보기` : "내추럴"}
                    </p>
                    <p className="text-sm text-white/80 drop-shadow">
                        {hasPainted
                            ? "칠한 영역에 스타일이 적용됩니다"
                            : "사진 위를 드래그하여 스타일을 칠해보세요"}
                    </p>
                </div>

                {/* 줌 인디케이터 */}
                {zoomLevel > 1 && (
                    <div className="absolute top-3 left-3 px-2 py-1 bg-black/50 rounded-lg flex items-center gap-1 text-white text-xs z-10">
                        <ZoomIn className="w-3 h-3" />
                        {Math.round(zoomLevel * 100)}%
                    </div>
                )}

                {/* 리셋 버튼 */}
                {(hasPainted || zoomLevel > 1) && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleReset();
                        }}
                        className="absolute top-3 right-3 w-10 h-10 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors z-20"
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
                🖌️ 드래그하여 스타일 변화 영역을 칠해보세요
            </p>
        </div>
    );
}
