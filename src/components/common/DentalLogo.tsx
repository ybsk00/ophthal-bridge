"use client";

// 아이니의원 로고 (피부과 테마)
// 파일명 유지 (DentalLogo) - 기존 참조 호환성

export default function DentalLogo({ className = "", size = 40 }: { className?: string; size?: number }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 100 100"
            width={size}
            height={size}
            className={className}
        >
            <defs>
                <linearGradient id="skinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#E91E8C" />
                    <stop offset="100%" stopColor="#C026D3" />
                </linearGradient>
                <linearGradient id="bgGradSkin" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#0A1A2A" />
                    <stop offset="100%" stopColor="#0F2535" />
                </linearGradient>
            </defs>

            {/* Background Circle */}
            <circle cx="50" cy="50" r="48" fill="url(#bgGradSkin)" stroke="#1E3A5F" strokeWidth="2" />

            {/* Sparkle Star (피부과 테마) */}
            <path
                d="M50 20 
           L54 40 L74 44 L54 48 L50 68 
           L46 48 L26 44 L46 40 Z"
                fill="url(#skinGrad)"
                opacity="0.95"
            />

            {/* Inner sparkle */}
            <circle cx="50" cy="44" r="8" fill="#E91E8C" opacity="0.6" />

            {/* Highlight accents */}
            <circle cx="62" cy="32" r="3" fill="#14B8A6" opacity="0.8" />
            <circle cx="38" cy="56" r="2" fill="#14B8A6" opacity="0.5" />
            <circle cx="68" cy="50" r="2" fill="#C026D3" opacity="0.6" />
        </svg>
    );
}
