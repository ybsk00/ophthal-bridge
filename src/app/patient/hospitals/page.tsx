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

// 평촌이생각치과 정보
const RECOMMENDED_CLINIC = {
    name: "평촌이생각치과",
    addr: "경기 안양시 동안구 시민대로 312",
    tel: "031-123-4567",
    closeTime: "21:00",
    openToday: true,
    night: true,
    holiday: true,
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

    // 응급실 상태
    const [erList, setErList] = useState<ERStatus[]>([]);
    const [erLoading, setErLoading] = useState(false);
    const [erError, setErError] = useState<string | null>(null);
    const [selectedRegion, setSelectedRegion] = useState("경기도");

    const regions = ["서울특별시", "경기도", "인천광역시", "부산광역시", "대구광역시", "광주광역시", "대전광역시", "울산광역시", "세종특별자치시", "강원도", "충청북도", "충청남도", "전라북도", "전라남도", "경상북도", "경상남도", "제주특별자치도"];

    // 클리닉 검색
    const searchClinics = useCallback(async () => {
        setClinicLoading(true);
        setClinicError(null);

        try {
            const params = new URLSearchParams({
                q0: "경기도",
                qn: "치과",
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
    }, [holidayOpen, nightOpen]);

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
                    {/* 평촌이생각치과 추천 카드 (항상 상단) */}
                    <div className="bg-gradient-to-r from-dental-primary/20 to-dental-accent/20 rounded-2xl p-4 border border-dental-primary/30">
                        <div className="flex items-center gap-2 mb-2">
                            <Heart className="w-5 h-5 text-dental-primary" fill="currentColor" />
                            <span className="text-sm font-bold text-dental-primary">추천 치과</span>
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
                            <span className="px-2 py-1 bg-dental-primary/20 text-dental-primary text-xs rounded-full">야간 진료</span>
                            <span className="px-2 py-1 bg-dental-primary/20 text-dental-primary text-xs rounded-full">공휴일 진료</span>
                        </div>
                        <div className="mt-3 flex gap-2">
                            <a
                                href={`tel:${RECOMMENDED_CLINIC.tel}`}
                                className="flex-1 py-2 bg-dental-primary text-white text-center text-sm font-medium rounded-lg hover:bg-dental-accent transition-colors"
                            >
                                전화하기
                            </a>
                            <Link
                                href="/patient/chat"
                                className="flex-1 py-2 bg-white/10 text-white text-center text-sm font-medium rounded-lg hover:bg-white/20 transition-colors"
                            >
                                상담하기
                            </Link>
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
                            {/* 필터 토글 */}
                            <div className="flex flex-wrap gap-2">
                                <Toggle isActive={todayOpen} onToggle={() => setTodayOpen(!todayOpen)} icon={Sun} label="오늘 진료" />
                                <Toggle isActive={nightOpen} onToggle={() => setNightOpen(!nightOpen)} icon={Moon} label="야간 진료" />
                                <Toggle isActive={holidayOpen} onToggle={() => setHolidayOpen(!holidayOpen)} icon={Calendar} label="공휴일 진료" />
                            </div>

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
                                                    야간 진료
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
                            {/* 지역 선택 */}
                            <select
                                value={selectedRegion}
                                onChange={(e) => setSelectedRegion(e.target.value)}
                                className="w-full bg-[#1a2332] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-dental-primary focus:outline-none"
                            >
                                {regions.map((region) => (
                                    <option key={region} value={region}>
                                        {region}
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
        </div>
    );
}
