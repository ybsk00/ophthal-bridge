"use client";

import { useState, useCallback } from "react";
import { Search, Loader2, MapPin, Phone, Clock, ChevronDown, ArrowRight, Eye, RefreshCw } from "lucide-react";
import Link from "next/link";

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

// 서울 한강 남쪽 지역 (추천 대상)
const SOUTH_SEOUL_DISTRICTS = [
    "강남구", "서초구", "송파구", "강동구", "동작구", "관악구", "금천구", "영등포구", "양천구", "구로구", "성동구"
];

// 강남아이디안과 정보
const GANGNAM_EYEDI: Clinic = {
    name: "강남아이디안과",
    addr: "서울특별시 서초구 서초대로77길 3",
    tel: "02-XXX-XXXX",
    openToday: true,
};

// 검색 상태
type SearchState = "idle" | "loading" | "success" | "error" | "empty";

export default function ClinicSearchModule() {
    const [selectedDistrict, setSelectedDistrict] = useState("서초구");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [searchState, setSearchState] = useState<SearchState>("idle");
    const [clinics, setClinics] = useState<Clinic[]>([]);
    const [errorMessage, setErrorMessage] = useState("");

    // 검색 실행
    const handleSearch = useCallback(async () => {
        setSearchState("loading");
        setErrorMessage("");

        try {
            const params = new URLSearchParams({
                q0: "서울",
                q1: selectedDistrict,
                qn: "안과",
            });

            const res = await fetch(`/api/clinics/search?${params.toString()}`);

            if (!res.ok) {
                throw new Error("API 호출 실패");
            }

            const data = await res.json();

            if (data.clinics && data.clinics.length > 0) {
                // 강남아이디안과가 서초구면 맨 앞에 추가 (중복 제거)
                let results = data.clinics.filter((c: Clinic) => c.name !== "강남아이디안과");

                if (selectedDistrict === "서초구") {
                    results = [GANGNAM_EYEDI, ...results];
                }

                setClinics(results.slice(0, 10)); // 최대 10개
                setSearchState("success");
            } else {
                // API 결과가 없어도 서초구면 강남아이디안과 표시
                if (selectedDistrict === "서초구") {
                    setClinics([GANGNAM_EYEDI]);
                    setSearchState("success");
                } else {
                    setClinics([]);
                    setSearchState("empty");
                }
            }
        } catch (error) {
            console.error("검색 오류:", error);
            setErrorMessage("검색 중 오류가 발생했습니다.");
            setSearchState("error");
        }
    }, [selectedDistrict]);

    // 강남아이디안과인지 확인
    const isGangnamEyedi = (name: string) => name === "강남아이디안과";

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
                                        setSearchState("idle");
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
                disabled={searchState === "loading"}
                className="w-full py-3 bg-skin-primary text-white font-semibold rounded-xl hover:bg-skin-accent transition-colors shadow-lg shadow-skin-primary/30 disabled:opacity-50 flex items-center justify-center gap-2"
            >
                {searchState === "loading" ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        검색 중...
                    </>
                ) : (
                    <>
                        <Search className="w-5 h-5" />
                        가까운 안과 찾기
                    </>
                )}
            </button>

            {/* 검색 결과 */}
            {searchState === "success" && clinics.length > 0 && (
                <div className="space-y-4 animate-in fade-in duration-300">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-skin-primary">
                            <Eye className="w-5 h-5" />
                            <span className="font-medium">{selectedDistrict} 안과 목록</span>
                        </div>
                        <span className="text-xs text-skin-subtext">{clinics.length}개 결과</span>
                    </div>

                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                        {clinics.map((clinic, idx) => (
                            <div
                                key={`${clinic.name}-${idx}`}
                                className={`rounded-xl p-4 border transition-all ${isGangnamEyedi(clinic.name)
                                        ? 'bg-gradient-to-br from-skin-primary/10 to-skin-accent/10 border-skin-primary/30'
                                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                                    }`}
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <div>
                                        <h3 className="font-bold text-skin-text">{clinic.name}</h3>
                                        {isGangnamEyedi(clinic.name) && (
                                            <span className="inline-block mt-1 px-2 py-0.5 bg-skin-primary/20 text-skin-primary text-xs rounded-full">
                                                적합 안과
                                            </span>
                                        )}
                                    </div>
                                    {isGangnamEyedi(clinic.name) && (
                                        <div className="w-10 h-10 bg-skin-primary rounded-full flex items-center justify-center flex-shrink-0">
                                            <span className="text-xl">👁️</span>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-1 text-sm text-skin-subtext">
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4 flex-shrink-0" />
                                        <span className="truncate">{clinic.addr}</span>
                                    </div>
                                    {clinic.tel && (
                                        <div className="flex items-center gap-2">
                                            <Phone className="w-4 h-4 flex-shrink-0" />
                                            <a href={`tel:${clinic.tel}`} className="hover:text-skin-primary">
                                                {clinic.tel}
                                            </a>
                                        </div>
                                    )}
                                    {clinic.closeTime && (
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-4 h-4 flex-shrink-0" />
                                            <span>
                                                종료 {clinic.closeTime.substring(0, 2)}:{clinic.closeTime.substring(2, 4)}
                                                {clinic.night && <span className="ml-2 text-xs text-skin-primary">야간진료</span>}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {isGangnamEyedi(clinic.name) && (
                                    <Link
                                        href="/login"
                                        className="flex items-center justify-center gap-2 w-full mt-3 py-2 bg-skin-primary text-white font-medium rounded-lg hover:bg-skin-accent transition-colors text-sm"
                                    >
                                        상담 예약하기
                                        <ArrowRight className="w-4 h-4" />
                                    </Link>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 결과 없음 */}
            {searchState === "empty" && (
                <div className="text-center py-8 text-skin-subtext">
                    <p>해당 지역에 등록된 안과가 없습니다.</p>
                </div>
            )}

            {/* 에러 */}
            {searchState === "error" && (
                <div className="text-center py-8 text-orange-400">
                    <p>{errorMessage}</p>
                    <button
                        onClick={handleSearch}
                        className="mt-3 flex items-center gap-2 mx-auto text-sm text-skin-subtext hover:text-skin-primary"
                    >
                        <RefreshCw className="w-4 h-4" />
                        다시 시도
                    </button>
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
