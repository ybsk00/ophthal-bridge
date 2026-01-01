"use client";

import { useState, useCallback } from "react";
import { Search, Sun, Moon, Calendar, Loader2, MapPin, Phone, Clock, AlertCircle, RefreshCw, ArrowRight, ChevronDown } from "lucide-react";
import Link from "next/link";
import LoginRequiredModal from "./LoginRequiredModal";

// 클리닉 타입
interface Clinic {
    name: string;
    addr: string;
    tel: string;
    lat?: number;
    lng?: number;
    closeTime?: string;
    openToday?: boolean;
    night?: boolean;
    holiday?: boolean;
}

// 검색 상태
type SearchState = "idle" | "loading" | "success" | "error" | "empty" | "auto-expanded";

// 서울 지역 목록
const SEOUL_REGIONS = [
    "강남구", "강동구", "강북구", "강서구", "관악구",
    "광진구", "구로구", "금천구", "노원구", "도봉구",
    "동대문구", "동작구", "마포구", "서대문구", "서초구",
    "성동구", "성북구", "송파구", "양천구", "영등포구",
    "용산구", "은평구", "종로구", "중구", "중랑구"
];

// 경기도 지역 목록 (주요 지역)
const GYEONGGI_REGIONS = [
    "의정부시", "양주시", "포천시", "고양시", "구리시", "남양주시",
    "동두천시", "성남시", "수원시", "안양시", "용인시", "파주시"
];

// 추천 병원 노출 대상 지역
const TARGET_REGIONS = ["의정부시", "양주시", "포천시", "고양시", "도봉구", "노원구"];

// 피부과 검색 키워드
const SKIN_KEYWORDS = ["피부과", "피부의원", "피부클리닉", "더마", "derma"];

// 오늘 요일 계산 (1=월 ~ 7=일)
function getTodayQt(): string {
    const day = new Date().getDay();
    return day === 0 ? "7" : String(day);
}

// 공휴일 판별
function isHoliday(): boolean {
    return false;
}

export default function ClinicSearchModule() {
    // 지역 선택
    const [selectedCity, setSelectedCity] = useState("경기도");
    const [selectedRegion, setSelectedRegion] = useState("의정부시");

    // 토글 상태
    const [todayOpen, setTodayOpen] = useState(true);
    const [nightOpen, setNightOpen] = useState(false);
    const [holidayOpen, setHolidayOpen] = useState(isHoliday());

    // 검색 상태
    const [searchState, setSearchState] = useState<SearchState>("idle");
    const [clinics, setClinics] = useState<Clinic[]>([]);
    const [errorMessage, setErrorMessage] = useState("");
    const [autoExpanded, setAutoExpanded] = useState(false);

    // 로그인 모달 상태
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

    // 검색 실행
    const handleSearch = useCallback(async (expandToCity: boolean = false) => {
        setSearchState("loading");
        setErrorMessage("");
        setAutoExpanded(false);

        try {
            let qt = getTodayQt();
            if (holidayOpen) {
                qt = "8";
            }

            // 키워드 조합 (피부과 관련)
            const qn = "피부과";

            const params = new URLSearchParams({
                q0: selectedCity,
                ...(expandToCity ? {} : { q1: selectedRegion }),
                qn,
            });

            const res = await fetch(`/api/clinics/search?${params.toString()}`);

            if (!res.ok) {
                throw new Error("API 호출 실패");
            }

            const data = await res.json();

            if (data.error) {
                throw new Error(data.error);
            }

            let results: Clinic[] = data.clinics || [];

            // 피부과 관련 키워드 필터
            results = results.filter((c) =>
                SKIN_KEYWORDS.some(kw => c.name.toLowerCase().includes(kw.toLowerCase()))
            );

            // 야간 진료 필터
            if (nightOpen) {
                results = results.filter((c) => c.night);
            }

            if (results.length === 0) {
                if (!expandToCity && !autoExpanded) {
                    // 자동으로 서울 전체 확장 재검색
                    setAutoExpanded(true);
                    handleSearch(true);
                    return;
                }
                setSearchState("empty");
            } else {
                if (expandToCity) {
                    setSearchState("auto-expanded");
                } else {
                    setSearchState("success");
                }
            }

            setClinics(results);
        } catch (error) {
            console.error("Search error:", error);
            setErrorMessage(
                error instanceof Error
                    ? error.message
                    : "일시적으로 조회가 어렵습니다. 잠시 후 다시 시도해 주세요."
            );
            setSearchState("error");
        }
    }, [holidayOpen, nightOpen, selectedCity, selectedRegion, autoExpanded]);

    // 상담 연결 클릭
    const handleConnect = () => {
        setIsLoginModalOpen(true);
    };

    // 세그먼트 컨트롤 스타일 칩 컴포넌트 (글로우 금지, 테두리/채움만)
    const SegmentChip = ({
        label,
        icon,
        active,
        onChange,
        ariaLabel,
    }: {
        label: string;
        icon: React.ReactNode;
        active: boolean;
        onChange: () => void;
        ariaLabel: string;
    }) => (
        <button
            onClick={onChange}
            aria-pressed={active}
            aria-label={ariaLabel}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${active
                ? "bg-skin-primary text-white"
                : "bg-transparent text-skin-subtext border border-white/20 hover:border-white/40"
                }`}
        >
            {icon}
            {label}
        </button>
    );

    return (
        <>
            {/* 조회 모듈 - Row 기반 레이아웃 */}
            <div className="w-full space-y-6">
                {/* Row 1: 지역 드롭다운 */}
                <div className="flex justify-center gap-3">
                    <div className="relative">
                        <select
                            value={selectedCity}
                            onChange={(e) => {
                                const city = e.target.value;
                                setSelectedCity(city);
                                // 도시 변경 시 기본 지역 설정
                                if (city === "서울") setSelectedRegion("강남구");
                                else if (city === "경기도") setSelectedRegion("의정부시");
                            }}
                            className="appearance-none bg-skin-bg border border-white/20 rounded-xl px-4 py-3 pr-10 text-skin-text text-sm font-medium focus:outline-none focus:border-skin-primary cursor-pointer"
                        >
                            <option value="서울">서울</option>
                            <option value="경기도">경기도</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-skin-subtext pointer-events-none" />
                    </div>
                    <div className="relative">
                        <select
                            value={selectedRegion}
                            onChange={(e) => setSelectedRegion(e.target.value)}
                            className="appearance-none bg-skin-bg border border-white/20 rounded-xl px-4 py-3 pr-10 text-skin-text text-sm font-medium focus:outline-none focus:border-skin-primary cursor-pointer"
                        >
                            {(selectedCity === "서울" ? SEOUL_REGIONS : GYEONGGI_REGIONS).map((region) => (
                                <option key={region} value={region}>{region}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-skin-subtext pointer-events-none" />
                    </div>
                </div>

                {/* Row 2: 운영 필터 세그먼트 칩 */}
                <div className="flex justify-center gap-2">
                    <SegmentChip
                        label="오늘 운영"
                        icon={<Sun size={16} />}
                        active={todayOpen}
                        onChange={() => setTodayOpen(!todayOpen)}
                        ariaLabel="오늘 운영 필터"
                    />
                    <SegmentChip
                        label="야간 운영"
                        icon={<Moon size={16} />}
                        active={nightOpen}
                        onChange={() => setNightOpen(!nightOpen)}
                        ariaLabel="야간 운영 필터"
                    />
                    <SegmentChip
                        label="공휴일 운영"
                        icon={<Calendar size={16} />}
                        active={holidayOpen}
                        onChange={() => setHolidayOpen(!holidayOpen)}
                        ariaLabel="공휴일 운영 필터"
                    />
                </div>

                {/* Row 3: 검색 버튼 (Primary - 글로우 허용) */}
                <div className="flex justify-center">
                    <button
                        onClick={() => handleSearch(false)}
                        disabled={searchState === "loading"}
                        className="inline-flex items-center justify-center px-8 py-4 bg-skin-primary text-white text-base font-bold rounded-2xl shadow-lg shadow-skin-primary/30 hover:bg-skin-accent hover:shadow-xl transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {searchState === "loading" ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                조회 중...
                            </>
                        ) : (
                            <>
                                <Search className="w-5 h-5 mr-2" />
                                오늘 운영 피부과 확인
                            </>
                        )}
                    </button>
                </div>

                {/* 검색 결과 영역 */}
                <div
                    aria-live="polite"
                    className={`transition-all duration-500 ${searchState !== "idle" ? "opacity-100" : "opacity-0"}`}
                >
                    {searchState !== "idle" && (
                        <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-4 mt-4 max-h-[60vh] overflow-y-auto">
                            {/* 초기화 버튼 */}
                            <div className="flex justify-end mb-3">
                                <button
                                    onClick={() => {
                                        setSearchState("idle");
                                        setClinics([]);
                                    }}
                                    className="text-xs text-skin-subtext hover:text-white transition-colors flex items-center gap-1"
                                >
                                    ✕ 닫기
                                </button>
                            </div>

                            {/* 자동 확장 안내 */}
                            {searchState === "auto-expanded" && (
                                <div className="mb-4 px-3 py-2 bg-skin-secondary/20 text-skin-secondary rounded-lg text-sm">
                                    📍 {selectedRegion}에 결과가 없어 {selectedCity} 전체로 확장하여 검색했습니다.
                                </div>
                            )}

                            {/* 로딩 */}
                            {searchState === "loading" && (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="w-8 h-8 animate-spin text-skin-primary" />
                                </div>
                            )}

                            {/* 에러 */}
                            {searchState === "error" && (
                                <div className="text-center py-8 space-y-4">
                                    <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
                                    <p className="text-skin-subtext">{errorMessage}</p>
                                    <button
                                        onClick={() => handleSearch(false)}
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-skin-primary text-white rounded-lg hover:bg-skin-accent transition-colors"
                                    >
                                        <RefreshCw size={16} />
                                        다시 시도
                                    </button>
                                </div>
                            )}

                            {/* 빈 결과 */}
                            {searchState === "empty" && (
                                <div className="text-center py-8">
                                    <p className="text-skin-subtext">
                                        선택한 조건에 맞는 결과가 없습니다.
                                        <br />
                                        다른 지역을 선택해보세요.
                                    </p>
                                </div>
                            )}

                            {/* 성공 - 결과 리스트 */}
                            {(searchState === "success" || searchState === "auto-expanded") && clinics.length > 0 && (
                                <div className="space-y-4">
                                    {/* 세인트의원 추천 카드 (타겟 지역에서만 표시) */}
                                    {TARGET_REGIONS.includes(selectedRegion) && (
                                        <div className="relative bg-gradient-to-r from-skin-primary/20 to-skin-accent/20 rounded-xl p-4 border border-skin-primary/30">
                                            <span className="absolute -top-2 left-4 px-2 py-0.5 bg-skin-primary text-white text-xs font-bold rounded-full">
                                                추천 피부과
                                            </span>

                                            <div className="pt-2">
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="flex-1">
                                                        <h3 className="text-lg font-bold text-white">
                                                            세인트의원
                                                        </h3>
                                                        <div className="flex flex-wrap gap-2 mt-2">
                                                            <span className="px-2 py-0.5 bg-skin-secondary/30 text-skin-secondary text-xs font-medium rounded-full">
                                                                프리미엄 케어
                                                            </span>
                                                            <span className="px-2 py-0.5 bg-skin-primary/30 text-skin-primary text-xs font-medium rounded-full">
                                                                피부미용 전문
                                                            </span>
                                                        </div>
                                                        <p className="text-skin-subtext text-sm mt-2 flex items-center gap-1">
                                                            <MapPin size={14} />
                                                            경기 의정부시 평화로 540 태평양타워 6층
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex gap-2 mt-4">
                                                    <button
                                                        onClick={handleConnect}
                                                        className="flex-1 py-2.5 bg-skin-primary text-white rounded-lg font-medium hover:bg-skin-accent transition-colors text-sm"
                                                    >
                                                        상담 예약
                                                    </button>
                                                    <a
                                                        href="tel:1899-1150"
                                                        className="flex items-center justify-center gap-1 px-4 py-2.5 bg-white/10 text-white rounded-lg font-medium hover:bg-white/20 transition-colors text-sm"
                                                    >
                                                        <Phone size={16} />
                                                        전화
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* 변동 고지 문구 */}
                                    <p className="text-xs text-skin-subtext/70 text-center bg-white/5 rounded-lg py-2">
                                        ⚠️ 운영정보는 변동될 수 있어요. 방문 전 확인이 필요합니다.
                                    </p>

                                    {/* 검색 결과 목록 */}
                                    <div className="space-y-2">
                                        <h4 className="text-sm font-medium text-skin-subtext px-1">
                                            검색 결과 ({clinics.length}개)
                                        </h4>
                                        {clinics.slice(0, 10).map((clinic, idx) => (
                                            <div
                                                key={idx}
                                                className="bg-white/5 rounded-xl p-4 border border-white/5 hover:border-white/20 transition-colors"
                                            >
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <h4 className="text-white font-medium truncate">
                                                                {clinic.name}
                                                            </h4>
                                                            {clinic.night && (
                                                                <span className="flex-shrink-0 px-1.5 py-0.5 bg-amber-500/30 text-amber-400 text-[10px] font-medium rounded">
                                                                    야간
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-skin-subtext text-xs mt-1 truncate flex items-center gap-1">
                                                            <MapPin size={12} />
                                                            {clinic.addr}
                                                        </p>
                                                        {clinic.closeTime && (
                                                            <p className="text-skin-subtext/60 text-xs mt-1 flex items-center gap-1">
                                                                <Clock size={12} />
                                                                종료 {clinic.closeTime.substring(0, 2)}:{clinic.closeTime.substring(2, 4)}
                                                            </p>
                                                        )}
                                                    </div>
                                                    {clinic.tel && (
                                                        <a
                                                            href={`tel:${clinic.tel}`}
                                                            className="flex-shrink-0 p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                                                            aria-label={`${clinic.name} 전화하기`}
                                                        >
                                                            <Phone size={16} className="text-skin-subtext" />
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {clinics.length > 10 && (
                                        <p className="text-center text-skin-subtext text-sm">
                                            외 {clinics.length - 10}개 결과가 더 있습니다
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>

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

            {/* 로그인 필요 모달 */}
            <LoginRequiredModal
                isOpen={isLoginModalOpen}
                onClose={() => setIsLoginModalOpen(false)}
                returnUrl="/medical/patient-dashboard"
            />
        </>
    );
}

