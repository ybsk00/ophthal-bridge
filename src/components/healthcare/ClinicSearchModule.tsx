"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Sun, Moon, Calendar, Loader2, MapPin, Phone, Star, Clock, AlertCircle, RefreshCw } from "lucide-react";
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
type SearchState = "idle" | "loading" | "success" | "error" | "empty";

// 오늘 요일 계산 (1=월 ~ 7=일)
function getTodayQt(): string {
    const day = new Date().getDay();
    return day === 0 ? "7" : String(day);
}

// 공휴일 판별 (간단한 버전 - 추후 API로 대체 가능)
function isHoliday(): boolean {
    // TODO: 한국 공휴일 API 연동 또는 정적 데이터 활용
    return false;
}

export default function ClinicSearchModule() {
    // 토글 상태
    const [todayOpen, setTodayOpen] = useState(true);
    const [nightOpen, setNightOpen] = useState(false);
    const [holidayOpen, setHolidayOpen] = useState(isHoliday());

    // 검색 상태
    const [searchState, setSearchState] = useState<SearchState>("idle");
    const [clinics, setClinics] = useState<Clinic[]>([]);
    const [errorMessage, setErrorMessage] = useState("");

    // 로그인 모달 상태
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

    // 검색 실행
    const handleSearch = useCallback(async () => {
        setSearchState("loading");
        setErrorMessage("");

        try {
            // 요일 결정
            let qt = getTodayQt();
            if (holidayOpen) {
                qt = "8"; // 공휴일
            }

            const params = new URLSearchParams({
                q0: "경기도",
                q1: "안양시 동안구",
                qt,
                keyword: "치과",
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

            // 야간 진료 필터
            if (nightOpen) {
                results = results.filter((c) => c.night);
            }

            if (results.length === 0) {
                setSearchState("empty");
            } else {
                setSearchState("success");
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
    }, [holidayOpen, nightOpen]);

    // 상담 연결 클릭
    const handleConnect = () => {
        setIsLoginModalOpen(true);
    };

    // 토글 버튼 컴포넌트
    const Toggle = ({
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
            className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${active
                    ? "bg-dental-primary text-white shadow-lg shadow-dental-primary/30"
                    : "bg-white/10 text-dental-subtext hover:bg-white/20 border border-white/10"
                }`}
        >
            {icon}
            {label}
        </button>
    );

    return (
        <>
            {/* 조회 모듈 */}
            <div className="w-full max-w-2xl mx-auto space-y-6">
                {/* 토글 그룹 */}
                <div className="flex flex-wrap justify-center gap-3">
                    <Toggle
                        label="오늘 진료"
                        icon={<Sun size={16} />}
                        active={todayOpen}
                        onChange={() => setTodayOpen(!todayOpen)}
                        ariaLabel="오늘 진료 필터"
                    />
                    <Toggle
                        label="야간 진료"
                        icon={<Moon size={16} />}
                        active={nightOpen}
                        onChange={() => setNightOpen(!nightOpen)}
                        ariaLabel="야간 진료 필터"
                    />
                    <Toggle
                        label="공휴일 진료"
                        icon={<Calendar size={16} />}
                        active={holidayOpen}
                        onChange={() => setHolidayOpen(!holidayOpen)}
                        ariaLabel="공휴일 진료 필터"
                    />
                </div>

                {/* 검색 버튼 */}
                <button
                    onClick={handleSearch}
                    disabled={searchState === "loading"}
                    className="group relative w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-dental-primary to-dental-accent text-white text-lg font-bold rounded-full overflow-hidden shadow-xl shadow-dental-primary/40 hover:shadow-2xl hover:shadow-dental-primary/50 transition-all duration-300 hover:-translate-y-1 disabled:opacity-70 disabled:cursor-not-allowed mx-auto block"
                >
                    <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
                    <span className="relative flex items-center gap-2">
                        {searchState === "loading" ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                조회 중입니다...
                            </>
                        ) : (
                            <>
                                <Search className="w-5 h-5" />
                                오늘 진료 치과 바로 확인
                            </>
                        )}
                    </span>
                </button>

                {/* 검색 결과 영역 */}
                <div
                    aria-live="polite"
                    className={`transition-all duration-500 ${searchState !== "idle" ? "opacity-100" : "opacity-0"
                        }`}
                >
                    {/* 결과 컨테이너 */}
                    {searchState !== "idle" && (
                        <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-4 mt-4 max-h-[60vh] overflow-y-auto">
                            {/* 로딩 */}
                            {searchState === "loading" && (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="w-8 h-8 animate-spin text-dental-primary" />
                                </div>
                            )}

                            {/* 에러 */}
                            {searchState === "error" && (
                                <div className="text-center py-8 space-y-4">
                                    <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
                                    <p className="text-dental-subtext">{errorMessage}</p>
                                    <button
                                        onClick={handleSearch}
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-dental-primary text-white rounded-lg hover:bg-dental-accent transition-colors"
                                    >
                                        <RefreshCw size={16} />
                                        다시 시도
                                    </button>
                                </div>
                            )}

                            {/* 빈 결과 */}
                            {searchState === "empty" && (
                                <div className="text-center py-8">
                                    <p className="text-dental-subtext">
                                        선택한 조건에 맞는 결과가 없습니다.
                                        <br />
                                        조건을 바꿔 다시 조회해 주세요.
                                    </p>
                                </div>
                            )}

                            {/* 성공 - 결과 리스트 */}
                            {searchState === "success" && clinics.length > 0 && (
                                <div className="space-y-4">
                                    {/* 평촌이생각치과 추천 카드 (상단 고정) */}
                                    <div className="relative bg-gradient-to-r from-dental-primary/20 to-dental-accent/20 rounded-xl p-4 border border-dental-primary/30">
                                        {/* 추천 라벨 */}
                                        <span className="absolute -top-2 left-4 px-2 py-0.5 bg-dental-primary text-white text-xs font-bold rounded-full">
                                            추천
                                        </span>

                                        <div className="pt-2">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1">
                                                    <h3 className="text-lg font-bold text-white">
                                                        평촌이생각치과
                                                    </h3>
                                                    <div className="flex flex-wrap gap-2 mt-2">
                                                        <span className="px-2 py-0.5 bg-dental-secondary/30 text-dental-secondary text-xs font-medium rounded-full">
                                                            365일 진료
                                                        </span>
                                                        <span className="px-2 py-0.5 bg-amber-500/30 text-amber-400 text-xs font-medium rounded-full">
                                                            평일 매일 야간진료
                                                        </span>
                                                    </div>
                                                    <p className="text-dental-subtext text-sm mt-2 flex items-center gap-1">
                                                        <MapPin size={14} />
                                                        경기도 안양시 동안구 평촌대로 389
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex gap-2 mt-4">
                                                <button
                                                    onClick={handleConnect}
                                                    className="flex-1 py-2.5 bg-dental-primary text-white rounded-lg font-medium hover:bg-dental-accent transition-colors text-sm"
                                                >
                                                    상담 연결
                                                </button>
                                                <a
                                                    href="tel:031-123-4567"
                                                    className="flex items-center justify-center gap-1 px-4 py-2.5 bg-white/10 text-white rounded-lg font-medium hover:bg-white/20 transition-colors text-sm"
                                                >
                                                    <Phone size={16} />
                                                    전화
                                                </a>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 변동 고지 문구 */}
                                    <p className="text-xs text-dental-subtext/70 text-center bg-white/5 rounded-lg py-2">
                                        ⚠️ 진료시간은 상황에 따라 변동될 수 있어 내원 전 확인이 필요합니다.
                                    </p>

                                    {/* 검색 결과 목록 */}
                                    <div className="space-y-2">
                                        <h4 className="text-sm font-medium text-dental-subtext px-1">
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
                                                        <p className="text-dental-subtext text-xs mt-1 truncate flex items-center gap-1">
                                                            <MapPin size={12} />
                                                            {clinic.addr}
                                                        </p>
                                                        {clinic.closeTime && (
                                                            <p className="text-dental-subtext/60 text-xs mt-1 flex items-center gap-1">
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
                                                            <Phone size={16} className="text-dental-subtext" />
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {clinics.length > 10 && (
                                        <p className="text-center text-dental-subtext text-sm">
                                            외 {clinics.length - 10}개 결과가 더 있습니다
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
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
