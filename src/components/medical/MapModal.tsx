'use client';

import { useState, useEffect } from 'react';
import { MapPin, Navigation, ExternalLink, X } from 'lucide-react';

interface MapModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const HOSPITAL_NAME = '아이니의원';
const HOSPITAL_ADDRESS = '서울 강남구 압구정로 152 극동타워 A동 3층';
const MAP_QUERY = encodeURIComponent(HOSPITAL_ADDRESS);

export default function MapModal({ isOpen, onClose }: MapModalProps) {
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

    const handleNaverMap = () => {
        const url = `https://map.naver.com/v5/search/${MAP_QUERY}`;
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    const handleGoogleMap = () => {
        const url = `https://www.google.com/maps/search/?api=1&query=${MAP_QUERY}`;
        window.open(url, '_blank', 'noopener,noreferrer');
    };

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
                className={`relative w-full max-w-sm bg-[#1e293b] rounded-2xl shadow-2xl border border-gray-700 overflow-hidden transition-all duration-300 ${isAnimating ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* 헤더 */}
                <div className="flex items-center justify-between p-4 border-b border-gray-700">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                            <MapPin className="w-4 h-4 text-blue-400" />
                        </div>
                        <h3 className="font-bold text-white">위치 보기</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
                    >
                        <X className="w-4 h-4 text-gray-400" />
                    </button>
                </div>

                {/* 콘텐츠 */}
                <div className="p-6 space-y-5">
                    {/* 병원 정보 */}
                    <div className="text-center">
                        <p className="text-lg font-bold text-white">{HOSPITAL_NAME}</p>
                        <p className="text-sm text-gray-400 mt-1">{HOSPITAL_ADDRESS}</p>
                    </div>

                    {/* 구분선 */}
                    <div className="border-t border-gray-700" />

                    {/* 버튼 */}
                    <div className="space-y-3">
                        <button
                            onClick={handleNaverMap}
                            className="w-full flex items-center justify-between px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-colors"
                        >
                            <div className="flex items-center gap-2">
                                <Navigation className="w-5 h-5" />
                                <span>네이버 지도에서 보기</span>
                            </div>
                            <ExternalLink className="w-4 h-4 opacity-70" />
                        </button>

                        <button
                            onClick={handleGoogleMap}
                            className="w-full flex items-center justify-between px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
                        >
                            <div className="flex items-center gap-2">
                                <MapPin className="w-5 h-5" />
                                <span>구글 지도에서 보기</span>
                            </div>
                            <ExternalLink className="w-4 h-4 opacity-70" />
                        </button>
                    </div>

                    {/* 안내 */}
                    <p className="text-xs text-gray-500 text-center">
                        클릭 시 외부 지도 앱/웹으로 이동합니다.
                    </p>
                </div>
            </div>
        </div>
    );
}

/* 
 * 기존 Mantine 버전 (주석 처리)
 * 
 * import { Modal, Button, Stack, Text, Group, ThemeIcon, Divider } from '@mantine/core';
 * 
 * return (
 *     <Modal opened={isOpen} onClose={onClose} title={...} centered radius="lg" size="sm">
 *         <Stack gap="md" py="md">
 *             <div className="text-center">
 *                 <Text size="lg" fw={600} c="dark">{HOSPITAL_NAME}</Text>
 *                 <Text size="sm" c="dimmed">{HOSPITAL_ADDRESS}</Text>
 *             </div>
 *             <Divider />
 *             <Stack gap="sm">
 *                 <Button fullWidth size="lg" color="green" onClick={handleNaverMap}>네이버 지도에서 보기</Button>
 *                 <Button fullWidth size="lg" color="blue" onClick={handleGoogleMap}>구글 지도에서 보기</Button>
 *             </Stack>
 *             <Text size="xs" c="dimmed" ta="center">클릭 시 외부 지도 앱/웹으로 이동합니다.</Text>
 *         </Stack>
 *     </Modal>
 * );
 */
