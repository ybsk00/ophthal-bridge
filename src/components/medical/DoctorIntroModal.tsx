'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Calendar, MapPin, Star, User, X } from 'lucide-react';

interface Doctor {
    name: string;
    title: string;
    education: string;
    specialty: string[];
    tracks: string[];
}

interface DoctorIntroModalProps {
    isOpen: boolean;
    onClose: () => void;
    doctors: Doctor[];
    onReservation?: () => void;
    onReviewTabClick?: () => void;
    onMapTabClick?: () => void;
}

const doctorImages: Record<string, string> = {
    '김민승': '/images/doctors/kim-minseung.jpg',
    '조병옥': '/images/doctors/jo-byeongok.jpg',
};

export default function DoctorIntroModal({
    isOpen,
    onClose,
    doctors,
    onReservation,
    onReviewTabClick,
    onMapTabClick
}: DoctorIntroModalProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);

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
            const timer = setTimeout(() => setIsVisible(false), 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* 배경 오버레이 */}
            <div
                className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isAnimating ? 'opacity-100' : 'opacity-0'}`}
                onClick={onClose}
            />

            {/* 모달 */}
            <div
                className={`relative w-full max-w-lg max-h-[90vh] bg-[#1e293b] rounded-2xl shadow-2xl border border-gray-700 overflow-hidden transition-all duration-300 ${isAnimating ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* 헤더 */}
                <div className="flex items-center justify-between p-4 border-b border-gray-700">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-pink-500/20 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-pink-400" />
                        </div>
                        <h3 className="font-bold text-white">강남아이디안과 의료진</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
                    >
                        <X className="w-4 h-4 text-gray-400" />
                    </button>
                </div>

                {/* 콘텐츠 */}
                <div className="p-4 space-y-4 overflow-y-auto max-h-[calc(90vh-180px)]">
                    {/* 고지 문구 */}
                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 text-sm text-amber-300">
                        <p className="text-xs">
                            아래 의료진은 사용자의 불편 양상에 따라 자주 다루는 진료 범위를 기준으로 안내됩니다.
                            질환 매칭이 아니며, 정확한 상담은 내원 진료가 필요합니다.
                        </p>
                    </div>

                    {/* 의료진 카드 목록 */}
                    {doctors.map((doctor) => (
                        <div
                            key={doctor.name}
                            className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 hover:bg-gray-700/50 transition-colors"
                        >
                            <div className="flex gap-4">
                                {/* 프로필 이미지 */}
                                <div className="w-20 h-20 relative rounded-xl overflow-hidden bg-gray-700 flex-shrink-0 border-2 border-pink-500/20">
                                    {doctorImages[doctor.name] ? (
                                        <Image
                                            src={doctorImages[doctor.name]}
                                            alt={doctor.name}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <User className="w-10 h-10 text-gray-500" />
                                        </div>
                                    )}
                                </div>

                                {/* 의료진 정보 */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <p className="font-bold text-lg text-white">{doctor.name}</p>
                                        <span className={`px-2 py-0.5 text-xs rounded-full ${doctor.title === '이사장'
                                            ? 'bg-yellow-500/20 text-yellow-400'
                                            : 'bg-gray-600 text-gray-300'
                                            }`}>
                                            {doctor.title}
                                        </span>
                                    </div>

                                    <p className="text-xs text-gray-400 mb-2">{doctor.education}</p>

                                    <div className="flex flex-wrap gap-1">
                                        {doctor.specialty.slice(0, 5).map((spec) => (
                                            <span
                                                key={spec}
                                                className="px-2 py-0.5 text-xs border border-green-500/50 text-green-400 rounded-full"
                                            >
                                                {spec}
                                            </span>
                                        ))}
                                        {doctor.specialty.length > 5 && (
                                            <span className="px-2 py-0.5 text-xs bg-gray-700 text-gray-400 rounded-full">
                                                +{doctor.specialty.length - 5}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* 하단 CTA 버튼 */}
                <div className="p-4 border-t border-gray-700 bg-gray-800/50">
                    <div className="grid grid-cols-3 gap-2">
                        <button
                            onClick={() => {
                                onReservation?.();
                                onClose();
                            }}
                            className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-colors text-sm"
                        >
                            <Calendar className="w-4 h-4" />
                            <span>예약하기</span>
                        </button>
                        <button
                            onClick={() => {
                                onReviewTabClick?.();
                                onClose();
                            }}
                            className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 rounded-xl font-medium transition-colors text-sm border border-amber-500/30"
                        >
                            <Star className="w-4 h-4" />
                            <span>후기보기</span>
                        </button>
                        <button
                            onClick={() => {
                                onMapTabClick?.();
                                onClose();
                            }}
                            className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 rounded-xl font-medium transition-colors text-sm border border-rose-500/30"
                        >
                            <MapPin className="w-4 h-4" />
                            <span>위치보기</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

