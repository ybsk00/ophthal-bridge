"use client";

import { useState } from "react";
import { MapPin, Phone, Clock, ChevronDown, ArrowRight, Eye } from "lucide-react";
import Link from "next/link";

// 서울 한강 남쪽 지역 (강남아이디안과 추천 대상)
const SOUTH_SEOUL_DISTRICTS = [
    "강남구", "서초구", "송파구", "강동구", "동작구", "관악구", "금천구", "영등포구", "양천구", "구로구", "성동구"
];

// 강남아이디안과 정보
const GANGNAM_EYEDI = {
    name: "강남아이디안과",
    addr: "서울특별시 서초구 서초대로77길 3",
    tel: "02-XXX-XXXX",
    district: "서초구",
    hours: {
        weekday: "09:00 - 18:00",
        saturday: "09:00 - 13:00",
        sunday: "휴진"
    },
    features: ["시력교정", "드라이아이", "녹내장", "백내장", "눈건강검진"]
};

export default function ClinicSearchModule() {
    const [selectedDistrict, setSelectedDistrict] = useState("서초구");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [showResult, setShowResult] = useState(false);

    // 검색 실행
    const handleSearch = () => {
        setShowResult(true);
    };

    // 추천 대상 지역인지 확인
    const isRecommendedDistrict = SOUTH_SEOUL_DISTRICTS.includes(selectedDistrict);

    return (
        <div className="space-y-6">
            {/* 지역 선택 */}
            <div className="space-y-3">
                <label className="text-sm text-skin-subtext font-medium">서울 지역 선택</label>
                <div className="relative">
                    <button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="w-full flex items-center justify-between px-4 py-3 bg-skin-bg border border-white/20 rounded-xl text-skin-text hover:border-skin-primary/50 transition-colors"
                    >
                        <span>{selectedDistrict}</span>
                        <ChevronDown className={`w-5 h-5 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isDropdownOpen && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-skin-surface border border-white/10 rounded-xl shadow-xl z-20 max-h-60 overflow-y-auto">
                            {SOUTH_SEOUL_DISTRICTS.map((district) => (
                                <button
                                    key={district}
                                    onClick={() => {
                                        setSelectedDistrict(district);
                                        setIsDropdownOpen(false);
                                        setShowResult(false);
                                    }}
                                    className={`w-full text-left px-4 py-3 hover:bg-white/10 transition-colors ${selectedDistrict === district ? 'bg-skin-primary/20 text-skin-primary' : 'text-skin-text'
                                        }`}
                                >
                                    {district}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* 검색 버튼 */}
            <button
                onClick={handleSearch}
                className="w-full py-3 bg-skin-primary text-white font-semibold rounded-xl hover:bg-skin-accent transition-colors shadow-lg shadow-skin-primary/30"
            >
                가까운 안과 찾기
            </button>

            {/* 검색 결과 */}
            {showResult && isRecommendedDistrict && (
                <div className="space-y-4 animate-in fade-in duration-300">
                    <div className="flex items-center gap-2 text-skin-primary">
                        <Eye className="w-5 h-5" />
                        <span className="font-medium">추천 안과</span>
                    </div>

                    {/* 강남아이디안과 카드 */}
                    <div className="bg-gradient-to-br from-skin-primary/10 to-skin-accent/10 rounded-2xl p-5 border border-skin-primary/30">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h3 className="text-lg font-bold text-skin-text">{GANGNAM_EYEDI.name}</h3>
                                <span className="inline-block mt-1 px-2 py-0.5 bg-skin-primary/20 text-skin-primary text-xs rounded-full">
                                    {selectedDistrict} 추천
                                </span>
                            </div>
                            <div className="w-12 h-12 bg-skin-primary rounded-full flex items-center justify-center">
                                <span className="text-2xl">👁️</span>
                            </div>
                        </div>

                        <div className="space-y-2 text-sm text-skin-subtext">
                            <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 flex-shrink-0" />
                                <span>{GANGNAM_EYEDI.addr}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4 flex-shrink-0" />
                                <span>{GANGNAM_EYEDI.tel}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 flex-shrink-0" />
                                <span>평일 {GANGNAM_EYEDI.hours.weekday} | 토 {GANGNAM_EYEDI.hours.saturday}</span>
                            </div>
                        </div>

                        {/* 특징 태그 */}
                        <div className="flex flex-wrap gap-2 mt-4">
                            {GANGNAM_EYEDI.features.map((feature) => (
                                <span
                                    key={feature}
                                    className="px-2 py-1 bg-white/10 rounded-lg text-xs text-skin-subtext"
                                >
                                    {feature}
                                </span>
                            ))}
                        </div>

                        {/* 예약 버튼 */}
                        <Link
                            href="/login"
                            className="flex items-center justify-center gap-2 w-full mt-4 py-3 bg-skin-primary text-white font-semibold rounded-xl hover:bg-skin-accent transition-colors"
                        >
                            상담 예약하기
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            )}

            {/* 눈 건강 체크 CTA */}
            <div className="mt-6 pt-6 border-t border-white/10">
                <p className="text-skin-subtext text-sm mb-3 font-medium text-center">
                    👁️ 눈 건강 습관이 궁금하다면?
                </p>
                <Link
                    href="/eye-care?topic=condition"
                    className="group relative w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 bg-white/10 backdrop-blur-sm text-skin-text border border-white/20 text-base font-medium rounded-full hover:bg-skin-primary hover:text-white hover:border-skin-primary transition-all duration-300 mx-auto block"
                >
                    <span className="relative flex items-center gap-2">
                        눈 컨디션 체크 시작 <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                </Link>
            </div>
        </div>
    );
}
