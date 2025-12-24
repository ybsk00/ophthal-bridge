"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, Search, Sun, Moon, Calendar, Loader2, MapPin, Phone, Building2, Activity, AlertCircle, Heart } from "lucide-react";

// 클리닉 타입
interface Clinic {
    name: string;
    addr: string;
    tel: string;
    closeTime?: string;
    openToday?: boolean;
    night?: boolean;
    holiday?: boolean;
}

// 응급실 타입
interface ERStatus {
    name: string;
    addr: string;
    tel: string;
    hvec: number;
    hvoc: number;
    hvicc: number;
    hvctayn: string;
    hvmriayn: string;
}

// 리원피부과 정보
const RECOMMENDED_CLINIC = {
    name: "리원피부과의원",
    addr: "서울 강남구 도산대로 327 SGF 청담타워 2층 3층",
    tel: "02-543-0210",
    closeTime: "21:00",
    openToday: true,
    night: true,
    holiday: true,
};

// 지역 데이터
const REGION_DATA: Record<string, string[]> = {
    "서울특별시": ["강남구", "강동구", "강북구", "강서구", "관악구", "광진구", "구로구", "금천구", "노원구", "도봉구", "동대문구", "동작구", "마포구", "서대문구", "서초구", "성동구", "성북구", "송파구", "양천구", "영등포구", "용산구", "은평구", "종로구", "중구", "중랑구"],
    "경기도": ["수원시", "성남시", "안양시", "부천시", "광명시", "평택시", "안산시", "고양시", "과천시", "구리시", "오산시", "시흥시", "군포시", "의정부시", "하남시", "용인시", "파주시", "이천시", "안성시", "김포시", "화성시", "광주시", "양주시", "포천시", "여주시"],
    "인천광역시": ["중구", "동구", "미추홀구", "연수구", "남동구", "부평구", "계양구", "서구", "강화군", "옹진군"],
    "부산광역시": ["중구", "서구", "동구", "영도구", "부산진구", "동래구", "남구", "북구", "해운대구", "사하구", "금정구", "강서구", "연제구", "수영구", "사상구", "기장군"],
    "대구광역시": ["중구", "동구", "서구", "남구", "북구", "수성구", "달서구", "달성군"],
    "광주광역시": ["동구", "서구", "남구", "북구", "광산구"],
    "대전광역시": ["동구", "중구", "서구", "유성구", "대덕구"],
};

export default function HospitalSearchPage() {
    const [activeTab, setActiveTab] = useState<"clinic" | "er">("clinic");

    // 클리닉 검색 상태
    const [clinics, setClinics] = useState<Clinic[]>([]);
    const [clinicLoading, setClinicLoading] = useState(false);
    const [clinicError, setClinicError] = useState<string | null>(null);
    const [todayOpen, setTodayOpen] = useState(true);
    const [nightOpen, setNightOpen] = useState(false);
    const [holidayOpen, setHolidayOpen] = useState(false);

    // 로그인 모달 상태
    const [showLoginModal, setShowLoginModal] = useState(false);

    // 응급실 상태
    const [erList, setErList] = useState<ERStatus[]>([]);
    const [erLoading, setErLoading] = useState(false);
    const [erError, setErError] = useState<string | null>(null);
    const [selectedRegion, setSelectedRegion] = useState("경기도");

    // 지역 선택 상태 (피부과 검색용)
    const [selectedSido, setSelectedSido] = useState("서울특별시");
    const [selectedSigungu, setSelectedSigungu] = useState("강남구");

    const regions = ["서울특별시", "경기도", "인천광역시", "부산광역시", "대구광역시", "광주광역시", "대전광역시", "울산광역시", "세종특별자치시", "강원도", "충청북도", "충청남도", "전라북도", "전라남도", "경상북도", "경상남도", "제주특별자치도"];

    // 클리닉 검색
    const searchClinics = useCallback(async () => {
        setClinicLoading(true);
        setClinicError(null);

        try {
            const params = new URLSearchParams({
                q0: selectedSido,
                q1: selectedSigungu,
                qn: "피부과",
            });

            // 공휴일 진료 필터
            if (holidayOpen) {
                params.append("qt", "8");
            }

            const res = await fetch(`/api/clinics/search?${params.toString()}`);
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "검색 중 오류가 발생했습니다.");
            }

            let results = data.clinics || [];

            // 야간 진료 필터
            if (nightOpen) {
                results = results.filter((c: Clinic) => c.night);
            }

            setClinics(results);
        } catch (error) {
            console.error("Clinic search error:", error);
            setClinicError(error instanceof Error ? error.message : "검색 중 오류가 발생했습니다.");
        } finally {
            setClinicLoading(false);
        }
    }, [holidayOpen, nightOpen, selectedSido, selectedSigungu]);

    // 응급실 조회
    const fetchERStatus = useCallback(async () => {
        setErLoading(true);
        setErError(null);

        try {
            const res = await fetch(`/api/er-status?stage1=${encodeURIComponent(selectedRegion)}`);
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "응급실 정보 조회 중 오류가 발생했습니다.");
            }

            setErList(data.hospitals || []);
        } catch (error) {
            console.error("ER status error:", error);
            setErError(error instanceof Error ? error.message : "조회 중 오류가 발생했습니다.");
        } finally {
            setErLoading(false);
        }
    }, [selectedRegion]);

    // 초기 로드 및 탭 변경 시
    useEffect(() => {
        if (activeTab === "clinic") {
            searchClinics();
        } else {
            fetchERStatus();
        }
    }, [activeTab, searchClinics, fetchERStatus]);

    // 토글 변경 시 클리닉 재검색
    useEffect(() => {
        if (activeTab === "clinic") {
            searchClinics();
        }
    }, [todayOpen, nightOpen, holidayOpen]);

    // 지역 변경 시 응급실 재조회
    useEffect(() => {
        if (activeTab === "er") {
            fetchERStatus();
        }
    }, [selectedRegion]);

    const Toggle = ({ isActive, onToggle, icon: Icon, label }: { isActive: boolean; onToggle: () => void; icon: any; label: string }) => (
        <button
            onClick={onToggle}
            className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${isActive
                ? "bg-dental-primary text-white border-dental-primary"
                : "bg-white/10 text-dental-subtext border-white/20 hover:bg-white/20"
                }`}
        >
            <Icon size={16} />
            {label}
        </button>
    );

    return (
        <div className="min-h-screen pb-24" style={{ backgroundColor: '#0a0f1a' }}>
            <div className="max-w-lg mx-auto">
                {/* 헤더 */}
                <header className="bg-[#0a0f1a]/80 backdrop-blur-md border-b border-white/10 px-4 py-3 sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                        <Link href="/patient" className="p-2 -ml-2 text-gray-400 hover:text-white transition-colors">
                            <ArrowLeft size={24} />
                        </Link>
                        <div>
                            <h1 className="text-lg font-bold text-white">병원 조회</h1>
                            <p className="text-xs text-gray-500">휴일/야간 병원 · 응급실 혼잡도</p>
                        </div>
                    </div>
                </header>

                <main className="p-4 space-y-4">
                    {/* 리원피부과 추천 카드 (항상 상단) */}
                    <div className="bg-gradient-to-r from-dental-primary/20 to-dental-accent/20 rounded-2xl p-4 border border-dental-primary/30">
                        <div className="flex items-center gap-2 mb-2">
                            <Heart className="w-5 h-5 text-dental-primary" fill="currentColor" />
                            <span className="text-sm font-bold text-dental-primary">조건 일치</span>
                        </div>
                        <h3 className="text-lg font-bold text-white mb-1">{RECOMMENDED_CLINIC.name}</h3>
                        <p className="text-sm text-dental-subtext flex items-center gap-1 mb-1">
                            <MapPin size={14} />
                            {RECOMMENDED_CLINIC.addr}
                        </p>
                        <p className="text-sm text-dental-subtext flex items-center gap-1 mb-3">
                            <Phone size={14} />
                            {RECOMMENDED_CLINIC.tel}
                        </p>
                        <div className="flex gap-2">
                            <span className="px-2 py-1 bg-dental-primary/20 text-dental-primary text-xs rounded-full">야간 운영</span>
                            <span className="px-2 py-1 bg-dental-primary/20 text-dental-primary text-xs rounded-full">공휴일 운영</span>
                        </div>
                        <p className="text-xs text-dental-subtext/70 mt-2 text-center">
                            선택한 조건과 위치 기준으로 정렬됩니다.
                        </p>
                        <div className="mt-3 flex gap-2">
                            <button
                                onClick={() => setShowLoginModal(true)}
                                className="flex-1 py-2 bg-dental-primary text-white text-center text-sm font-medium rounded-lg hover:bg-dental-accent transition-colors"
                            >
                                운영정보 보기
                            </button>
                            <a
                                href={`tel:${RECOMMENDED_CLINIC.tel}`}
                                className="flex items-center justify-center gap-1 px-4 py-2 bg-white/10 text-white text-center text-sm font-medium rounded-lg hover:bg-white/20 transition-colors"
                            >
                                <Phone size={16} />
                                전화
                            </a>
                        </div>
                    </div>

                    {/* 탭 */}
                    <div className="flex gap-2 p-1 bg-white/5 rounded-xl">
                        <button
                            onClick={() => setActiveTab("clinic")}
                            className={`flex-1 py-2.5 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${activeTab === "clinic"
                                ? "bg-dental-primary text-white"
                                : "text-dental-subtext hover:bg-white/10"
                                }`}
                        >
                            <Building2 size={18} />
                            휴일/야간 병원
                        </button>
                        <button
                            onClick={() => setActiveTab("er")}
                            className={`flex-1 py-2.5 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${activeTab === "er"
                                ? "bg-dental-primary text-white"
                                : "text-dental-subtext hover:bg-white/10"
                                }`}
                        >
                            <Activity size={18} />
                            응급실 혼잡도
                        </button>
                    </div>

                    {/* 클리닉 탭 내용 */}
                    {activeTab === "clinic" && (
                        <div className="space-y-4">
                            {/* 지역 선택 */}
                            <div className="flex gap-2">
                                <select
                                    value={selectedSido}
                                    onChange={(e) => {
                                        const newSido = e.target.value;
                                        setSelectedSido(newSido);
                                        const sigunguList = REGION_DATA[newSido];
                                        if (sigunguList && sigunguList.length > 0) {
                                            setSelectedSigungu(sigunguList[0]);
                                        }
                                    }}
                                    className="flex-1 px-3 py-2 bg-[#1a2332] border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:border-dental-primary"
                                >
                                    {Object.keys(REGION_DATA).map((sido) => (
                                        <option key={sido} value={sido}>{sido}</option>
                                    ))}
                                </select>
                                <select
                                    value={selectedSigungu}
                                    onChange={(e) => setSelectedSigungu(e.target.value)}
                                    className="flex-1 px-3 py-2 bg-[#1a2332] border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:border-dental-primary"
                                >
                                    {(REGION_DATA[selectedSido] || []).map((sigungu) => (
                                        <option key={sigungu} value={sigungu}>{sigungu}</option>
                                    ))}
                                </select>
                            </div>

                            {/* 필터 토글 */}
                            <div className="flex flex-wrap gap-2">
                                <Toggle isActive={todayOpen} onToggle={() => setTodayOpen(!todayOpen)} icon={Sun} label="오늘 운영" />
                                <Toggle isActive={nightOpen} onToggle={() => setNightOpen(!nightOpen)} icon={Moon} label="야간 운영" />
                                <Toggle isActive={holidayOpen} onToggle={() => setHolidayOpen(!holidayOpen)} icon={Calendar} label="공휴일 운영" />
                            </div>

                            {/* 고지 문구 */}
                            <p className="text-xs text-dental-subtext/70 text-center bg-white/5 rounded-lg py-2">
                                ⚠️ 운영정보는 변동될 수 있어요. 방문 전 확인이 필요합니다.
                            </p>

                            {/* 결과 */}
                            {clinicLoading ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="w-8 h-8 animate-spin text-dental-primary" />
                                </div>
                            ) : clinicError ? (
                                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-center">
                                    <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
                                    <p className="text-red-400 text-sm">{clinicError}</p>
                                </div>
                            ) : clinics.length === 0 ? (
                                <div className="text-center py-12 text-dental-subtext">
                                    <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                    <p>검색 결과가 없습니다.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {clinics.slice(0, 20).map((clinic, idx) => (
                                        <div key={idx} className="bg-[#1a2332] rounded-xl p-4 border border-white/10">
                                            <h3 className="font-bold text-white mb-1">{clinic.name}</h3>
                                            <p className="text-sm text-dental-subtext flex items-center gap-1 mb-1">
                                                <MapPin size={14} />
                                                {clinic.addr}
                                            </p>
                                            {clinic.tel && (
                                                <a href={`tel:${clinic.tel}`} className="text-sm text-dental-primary flex items-center gap-1">
                                                    <Phone size={14} />
                                                    {clinic.tel}
                                                </a>
                                            )}
                                            {clinic.night && (
                                                <span className="inline-block mt-2 px-2 py-1 bg-dental-primary/20 text-dental-primary text-xs rounded-full">
                                                    야간 운영
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                    {clinics.length > 20 && (
                                        <p className="text-center text-dental-subtext text-sm">
                                            외 {clinics.length - 20}개 결과가 더 있습니다.
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* 응급실 탭 내용 */}
                    {activeTab === "er" && (
                        <div className="space-y-4">
                            {/* 지역 선택 (피부과 검색과 동일) */}
                            <select
                                value={selectedSido}
                                onChange={(e) => {
                                    const newSido = e.target.value;
                                    setSelectedSido(newSido);
                                    setSelectedRegion(newSido);
                                    const sigunguList = REGION_DATA[newSido];
                                    if (sigunguList && sigunguList.length > 0) {
                                        setSelectedSigungu(sigunguList[0]);
                                    }
                                }}
                                className="w-full bg-[#1a2332] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-dental-primary focus:outline-none"
                            >
                                {Object.keys(REGION_DATA).map((sido) => (
                                    <option key={sido} value={sido}>
                                        {sido}
                                    </option>
                                ))}
                            </select>

                            {/* 결과 */}
                            {erLoading ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="w-8 h-8 animate-spin text-dental-primary" />
                                </div>
                            ) : erError ? (
                                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-center">
                                    <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
                                    <p className="text-red-400 text-sm">{erError}</p>
                                </div>
                            ) : erList.length === 0 ? (
                                <div className="text-center py-12 text-dental-subtext">
                                    <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                    <p>응급실 정보가 없습니다.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {erList.slice(0, 30).map((er, idx) => (
                                        <div key={idx} className="bg-[#1a2332] rounded-xl p-4 border border-white/10">
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="font-bold text-white">{er.name}</h3>
                                                <div className={`px-2 py-1 rounded-full text-xs font-bold ${er.hvec > 5
                                                    ? "bg-green-500/20 text-green-400"
                                                    : er.hvec > 0
                                                        ? "bg-yellow-500/20 text-yellow-400"
                                                        : "bg-red-500/20 text-red-400"
                                                    }`}>
                                                    {er.hvec > 0 ? `병상 ${er.hvec}개` : "만실"}
                                                </div>
                                            </div>
                                            <p className="text-sm text-dental-subtext flex items-center gap-1 mb-1">
                                                <MapPin size={14} />
                                                {er.addr}
                                            </p>
                                            <a href={`tel:${er.tel}`} className="text-sm text-dental-primary flex items-center gap-1 mb-2">
                                                <Phone size={14} />
                                                {er.tel}
                                            </a>
                                            <div className="flex gap-2 text-xs">
                                                {er.hvctayn === "Y" && (
                                                    <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full">CT</span>
                                                )}
                                                {er.hvmriayn === "Y" && (
                                                    <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded-full">MRI</span>
                                                )}
                                                {er.hvicc > 0 && (
                                                    <span className="px-2 py-1 bg-orange-500/20 text-orange-400 rounded-full">중환자실 {er.hvicc}</span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </main>
            </div>

            {/* 로그인 필요 모달 */}
            {showLoginModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-[#1a2332] rounded-2xl p-6 max-w-sm w-full border border-white/10 shadow-2xl">
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 rounded-full bg-dental-primary/20 flex items-center justify-center mx-auto mb-4">
                                <Building2 className="w-8 h-8 text-dental-primary" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">운영정보 보기</h3>
                            <p className="text-dental-subtext text-sm">
                                운영정보를 보기 위해서는<br />로그인이 필요합니다.
                            </p>
                        </div>
                        <div className="space-y-3">
                            <button
                                onClick={() => window.location.href = '/login?returnTo=/medical/patient-dashboard'}
                                className="w-full py-3 bg-dental-primary text-white font-medium rounded-xl hover:bg-dental-accent transition-colors"
                            >
                                로그인하기
                            </button>
                            <button
                                onClick={() => setShowLoginModal(false)}
                                className="w-full py-3 bg-white/10 text-dental-subtext font-medium rounded-xl hover:bg-white/20 transition-colors"
                            >
                                닫기
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
