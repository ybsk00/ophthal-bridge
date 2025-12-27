"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Calendar, Clock, X, CheckCircle2, AlertCircle, User } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useSession } from "next-auth/react";

type ReservationModalProps = {
    isOpen: boolean;
    onClose: () => void;
    initialTab?: "book" | "reschedule" | "cancel";
};

export default function ReservationModal({ isOpen, onClose, initialTab = "book" }: ReservationModalProps) {
    const { data: nextAuthSession } = useSession();
    const [activeTab, setActiveTab] = useState<"book" | "reschedule" | "cancel">(initialTab);
    const [step, setStep] = useState(1); // 1: Input, 2: Confirm, 3: Success
    const [date, setDate] = useState("");
    const [hour, setHour] = useState("09");
    const [minute, setMinute] = useState("00");
    const [doctor, setDoctor] = useState("");

    // DB에서 의사 목록 가져오기
    const [doctors, setDoctors] = useState<string[]>([]);
    const [isLoadingDoctors, setIsLoadingDoctors] = useState(false);

    const [name, setName] = useState("");


    const [isSubmitting, setIsSubmitting] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);  // Supabase Auth only (UUID)
    const [naverUserId, setNaverUserId] = useState<string | null>(null);  // NextAuth/Naver only (not UUID)
    const [existingReservation, setExistingReservation] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [availableSlots, setAvailableSlots] = useState<string[]>([]);
    const [isLoadingSlots, setIsLoadingSlots] = useState(false);

    const supabase = createClient();

    // 의사 목록 API에서 가져오기
    useEffect(() => {
        const fetchDoctors = async () => {
            setIsLoadingDoctors(true);
            try {
                const response = await fetch('/api/doctors');
                const data = await response.json();
                if (data.doctors) {
                    const doctorNames = data.doctors.map((d: { display_name: string }) => d.display_name);
                    setDoctors(doctorNames);
                }
            } catch (error) {
                console.error('Error fetching doctors:', error);
                // 폴백: 하드코딩된 목록 사용
                setDoctors(['김민승 대표원장', '조병옥 원장']);
            } finally {
                setIsLoadingDoctors(false);
            }
        };
        fetchDoctors();
    }, []);

    useEffect(() => {
        if (isOpen) {
            fetchUserAndReservation();
        }
    }, [isOpen, nextAuthSession]);

    // 예약 가능 시간 조회
    useEffect(() => {
        const fetchAvailableSlots = async () => {
            if (!date || !doctor) return;
            setIsLoadingSlots(true);
            try {
                const doctorParam = doctor ? `&doctor_name=${encodeURIComponent(doctor)}` : '';
                const response = await fetch(`/api/appointments/available-slots?date=${date}${doctorParam}`);
                const data = await response.json();
                if (data.available_slots) {
                    setAvailableSlots(data.available_slots);
                }
            } catch (error) {
                console.error('Error fetching slots:', error);
            } finally {
                setIsLoadingSlots(false);
            }
        };
        fetchAvailableSlots();
    }, [date, doctor]);

    const fetchUserAndReservation = async () => {
        setIsLoading(true);
        try {
            // 1. Get User from Supabase Auth
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                setUserId(user.id);
                // Try to get name from metadata or email
                const userName = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || "";
                setName(userName);

                // 2. Get Latest Reservation (for cancellation/reschedule)
                const { data: reservation } = await supabase
                    .from('patients')
                    .select('*')
                    .eq('user_id', user.id)
                    .eq('status', 'pending') // Only pending reservations
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .maybeSingle();

                if (reservation) {
                    setExistingReservation(reservation);
                    // Pre-fill date/time if rescheduling
                    if (reservation.time) {
                        const [d, t] = reservation.time.split(' ');
                        if (d && t) {
                            setDate(d);
                            const [h, m] = t.split(':');
                            setHour(h);
                            setMinute(m);
                        }
                    }
                } else {
                    setExistingReservation(null);
                }
            } else if (nextAuthSession?.user) {
                // 2. Fallback to NextAuth session (for Naver login)
                const nextAuthUser = nextAuthSession.user;
                setUserId(null);  // Keep userId null - it's for Supabase Auth only (UUID type)
                setNaverUserId(nextAuthUser.id || null);  // Store naver ID separately
                const userName = nextAuthUser.name || nextAuthUser.email?.split('@')[0] || "";
                setName(userName);

                // Get Latest Reservation for NextAuth user from appointments table
                if (nextAuthUser.id) {
                    const { data: appointment } = await supabase
                        .from('appointments')
                        .select('*')
                        .eq('naver_user_id', nextAuthUser.id)
                        .in('status', ['scheduled', 'pending'])
                        .gte('scheduled_at', new Date().toISOString())
                        .order('scheduled_at', { ascending: true })
                        .limit(1)
                        .maybeSingle();

                    if (appointment) {
                        // Convert to reservation format for modal display
                        const scheduledDate = new Date(appointment.scheduled_at);
                        const dateStr = scheduledDate.toISOString().split('T')[0];
                        const timeStr = scheduledDate.toTimeString().slice(0, 5);

                        setExistingReservation({
                            id: appointment.id,
                            time: `${dateStr} ${timeStr}`,
                            name: userName,
                            status: 'pending',
                            complaint: appointment.notes,
                            isAppointment: true  // Flag to handle differently in cancel/update
                        });

                        // Pre-fill date/time if rescheduling
                        setDate(dateStr);
                        const [h, m] = timeStr.split(':');
                        setHour(h);
                        setMinute(m);
                    } else {
                        setExistingReservation(null);
                    }
                }
            }
        } catch (error) {
            console.error("Error fetching user data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleConfirm = async () => {
        setIsSubmitting(true);

        try {
            if (activeTab === 'cancel') {
                // Cancellation Logic
                if (!existingReservation) {
                    alert("취소할 예약이 없습니다.");
                    setIsSubmitting(false);
                    return;
                }

                // Check if it's from appointments table or patients table
                if (existingReservation.isAppointment) {
                    // NextAuth user - cancel from appointments table
                    const { error } = await supabase
                        .from('appointments')
                        .update({ status: 'cancelled' })
                        .eq('id', existingReservation.id);

                    if (error) throw error;
                } else {
                    // Supabase Auth user - cancel from patients table
                    const { error } = await supabase
                        .from('patients')
                        .update({ status: 'cancelled' })
                        .eq('id', existingReservation.id);

                    if (error) throw error;
                }

            } else {
                // Booking / Reschedule Logic
                if (!date || !name) {
                    alert("날짜와 이름을 입력해주세요.");
                    setIsSubmitting(false);
                    return;
                }

                // 의사 선택 필수
                if (!doctor || doctor === '전체') {
                    alert("담당 의료진을 선택해주세요.");
                    setIsSubmitting(false);
                    return;
                }

                // Prevent duplicate booking
                if (activeTab === 'book') {
                    // Check if there is ALREADY a pending reservation
                    // For Supabase Auth users, check patients table
                    // For NextAuth users, check appointments table
                    const isNextAuthUser = !!naverUserId && !userId;

                    if (isNextAuthUser) {
                        const { data: dupCheck } = await supabase
                            .from('appointments')
                            .select('id')
                            .eq('naver_user_id', naverUserId)
                            .in('status', ['scheduled', 'pending'])
                            .gte('scheduled_at', new Date().toISOString())
                            .maybeSingle();

                        if (dupCheck) {
                            alert("이미 예약된 내역이 있습니다. 기존 예약을 변경하거나 취소해주세요.");
                            setIsSubmitting(false);
                            return;
                        }
                    } else if (userId) {
                        const { data: dupCheck } = await supabase
                            .from('patients')
                            .select('id')
                            .eq('user_id', userId)
                            .eq('status', 'pending')
                            .maybeSingle();

                        if (dupCheck) {
                            alert("이미 예약된 내역이 있습니다. 기존 예약을 변경하거나 취소해주세요.");
                            setIsSubmitting(false);
                            return;
                        }
                    }
                }

                const timeString = `${date} ${hour}:${minute}`;
                const isNextAuthUser = !!naverUserId && !userId;

                if (activeTab === 'reschedule' && existingReservation) {
                    // Update existing
                    if (existingReservation.isAppointment) {
                        // NextAuth user - update in appointments table
                        const scheduledAt = new Date(`${date}T${hour}:${minute}:00`).toISOString();
                        const { error } = await supabase
                            .from('appointments')
                            .update({
                                scheduled_at: scheduledAt,
                                notes: doctor === '전체' ? '아이니의원 진료' : `아이니의원 진료 (${doctor})`
                            })
                            .eq('id', existingReservation.id);

                        if (error) throw error;
                    } else {
                        // Supabase Auth user - update in patients table
                        const { error } = await supabase
                            .from('patients')
                            .update({
                                time: timeString,
                                name: name,
                                type: '재진'
                            })
                            .eq('id', existingReservation.id);

                        if (error) throw error;
                    }
                } else {
                    // Create new reservation
                    if (isNextAuthUser) {
                        // NextAuth user - use API to create appointment
                        const scheduledAt = new Date(`${date}T${hour}:${minute}:00`).toISOString();
                        const response = await fetch('/api/patient/appointments', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                scheduled_at: scheduledAt,
                                notes: `아이니의원 진료 (${doctor})`,
                                doctor_name: doctor  // 의사 이름 추가
                            })
                        });

                        if (!response.ok) {
                            const errorData = await response.json();
                            throw new Error(errorData.error || '예약 생성에 실패했습니다.');
                        }
                    } else {
                        // Supabase Auth user - insert directly into patients table
                        const { error } = await supabase
                            .from('patients')
                            .insert([
                                {
                                    user_id: userId,
                                    name: name,
                                    time: timeString,
                                    type: '초진',
                                    status: 'pending',
                                    complaint: doctor === '전체' ? '아이니의원 진료' : `아이니의원 진료 (${doctor})`,
                                    keywords: ['예약']
                                }
                            ]);

                        if (error) throw error;
                    }
                }
            }

            setStep(3); // Success
        } catch (e: any) {
            console.error("Exception details:", {
                message: e?.message,
                details: e?.details,
                hint: e?.hint,
                code: e?.code,
                fullError: e
            });
            alert(`처리 중 오류가 발생했습니다: ${e?.message || "알 수 없는 오류"}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetAndClose = () => {
        setStep(1);
        setActiveTab("book");
        setDate("");
        setHour("09");
        setMinute("00");
        onClose();
    };

    // Generate hours (9-17 for operating hours)
    const hours = Array.from({ length: 9 }, (_, i) => (9 + i).toString().padStart(2, '0'));

    // Generate minutes (00, 30)
    const minutes = ["00", "30"];

    // 현재 선택된 시간이 예약 가능한지 체크
    const isTimeAvailable = (h: string, m: string) => {
        if (availableSlots.length === 0) return true;  // 아직 로딩 전이면 모두 가능
        const timeStr = `${h}:${m}`;
        return availableSlots.includes(timeStr);
    };

    // 현재 선택된 시간 조합이 예약 가능한지
    const currentTimeAvailable = isTimeAvailable(hour, minute);

    if (!isOpen) return null;

    const modalContent = (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-[#1e293b] rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100 border border-gray-700">
                {/* Header */}
                <div className="bg-gray-800 p-4 flex justify-between items-center border-b border-gray-700">
                    <h3 className="font-bold text-lg text-white flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-pink-500" />
                        예약 관리
                    </h3>
                    <button onClick={resetAndClose} className="text-gray-400 hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 bg-[#1e293b]">
                    {step === 3 ? (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle2 size={32} />
                            </div>
                            <h4 className="text-xl font-bold text-white mb-2">처리되었습니다</h4>
                            <p className="text-gray-400 mb-6">
                                {activeTab === "book" && "예약 신청이 완료되었습니다."}
                                {activeTab === "reschedule" && "예약 변경이 완료되었습니다."}
                                {activeTab === "cancel" && "예약이 취소되었습니다."}
                                <br />
                                카카오톡으로 알림을 보내드렸습니다.
                            </p>
                            <button
                                onClick={resetAndClose}
                                className="w-full py-3 bg-pink-500 text-white rounded-xl font-medium hover:bg-pink-600 transition-colors"
                            >
                                확인
                            </button>
                        </div>
                    ) : (
                        <>
                            {/* Tabs */}
                            <div className="flex bg-gray-800 p-1 rounded-xl mb-6">
                                <button
                                    onClick={() => setActiveTab("book")}
                                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === "book" ? "bg-pink-500 text-white shadow-sm" : "text-gray-400 hover:text-white"}`}
                                >
                                    예약하기
                                </button>
                                <button
                                    onClick={() => setActiveTab("reschedule")}
                                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === "reschedule" ? "bg-pink-500 text-white shadow-sm" : "text-gray-400 hover:text-white"}`}
                                >
                                    예약변경
                                </button>
                                <button
                                    onClick={() => setActiveTab("cancel")}
                                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === "cancel" ? "bg-red-500 text-white shadow-sm" : "text-gray-400 hover:text-white"}`}
                                >
                                    예약취소
                                </button>
                            </div>

                            {/* Content based on Tab */}
                            <div className="space-y-4">
                                {isLoading ? (
                                    <div className="text-center py-8 text-gray-400">로딩중...</div>
                                ) : (
                                    <>
                                        {activeTab === "book" && (
                                            <div className="space-y-4">
                                                <div className="bg-blue-500/10 p-4 rounded-xl border border-blue-500/30 text-sm text-blue-300">
                                                    <p className="font-bold mb-1">진료 예약</p>
                                                    <p>원하시는 날짜와 시간을 선택해주세요.</p>
                                                </div>

                                                <div className="space-y-1">
                                                    <label className="text-xs font-medium text-gray-400">예약자 성함</label>
                                                    <div className="relative">
                                                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={16} />
                                                        <input
                                                            type="text"
                                                            value={name}
                                                            onChange={(e) => setName(e.target.value)}
                                                            placeholder="성함을 입력해주세요"
                                                            className="w-full pl-10 p-3 border border-gray-700 rounded-xl bg-gray-800 text-white placeholder-gray-500 focus:bg-gray-700 focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="space-y-1">
                                                    <label className="text-xs font-medium text-gray-400">담당 의료진</label>
                                                    <div className="relative">
                                                        <select
                                                            value={doctor}
                                                            onChange={(e) => setDoctor(e.target.value)}
                                                            className="w-full p-3 border border-gray-700 rounded-xl bg-gray-800 text-white focus:bg-gray-700 focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all appearance-none"
                                                        >
                                                            <option value="">-- 선택해주세요 --</option>
                                                            {doctors.filter(d => d !== '').map(d => (
                                                                <option key={d} value={d}>{d}</option>
                                                            ))}
                                                        </select>
                                                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none" size={16} />
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 gap-3">
                                                    <div className="space-y-1">
                                                        <label className="text-xs font-medium text-gray-400">날짜</label>
                                                        <input
                                                            type="date"
                                                            value={date}
                                                            onChange={(e) => setDate(e.target.value)}
                                                            className="w-full p-3 border border-gray-700 rounded-xl bg-gray-800 text-white focus:bg-gray-700 focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all"
                                                        />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <label className="text-xs font-medium text-gray-400">
                                                            시간 {isLoadingSlots && <span className="text-blue-400">(조회중...)</span>}
                                                            {!currentTimeAvailable && date && doctor && <span className="text-red-400 ml-2">⚠️ 예약됨</span>}
                                                        </label>
                                                        <div className="flex gap-2">
                                                            <div className="relative flex-1">
                                                                <select
                                                                    value={hour}
                                                                    onChange={(e) => setHour(e.target.value)}
                                                                    className="w-full p-3 border border-gray-700 rounded-xl bg-gray-800 text-white focus:bg-gray-700 focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all appearance-none"
                                                                >
                                                                    {hours.map(h => {
                                                                        const hasAvailableMinute = minutes.some(m => isTimeAvailable(h, m));
                                                                        return (
                                                                            <option key={h} value={h} disabled={!hasAvailableMinute && availableSlots.length > 0}>
                                                                                {h}시 {!hasAvailableMinute && availableSlots.length > 0 ? '(마감)' : ''}
                                                                            </option>
                                                                        );
                                                                    })}
                                                                </select>
                                                                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                                                            </div>
                                                            <div className="relative flex-1">
                                                                <select
                                                                    value={minute}
                                                                    onChange={(e) => setMinute(e.target.value)}
                                                                    className="w-full p-3 border border-gray-700 rounded-xl bg-gray-800 text-white focus:bg-gray-700 focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all appearance-none"
                                                                >
                                                                    {minutes.map(m => {
                                                                        const available = isTimeAvailable(hour, m);
                                                                        return (
                                                                            <option key={m} value={m} disabled={!available && availableSlots.length > 0}>
                                                                                {m}분 {!available && availableSlots.length > 0 ? '(예약됨)' : ''}
                                                                            </option>
                                                                        );
                                                                    })}
                                                                </select>
                                                                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {activeTab === "reschedule" && (
                                            <div className="space-y-4">
                                                <div className="bg-amber-500/10 p-4 rounded-xl border border-amber-500/30 text-sm text-amber-300">
                                                    <p className="font-bold mb-1">예약 변경</p>
                                                    <p>변경하실 날짜와 시간을 선택해주세요.</p>
                                                </div>

                                                {!existingReservation ? (
                                                    <div className="text-center py-8 text-gray-400 bg-gray-800/50 rounded-xl border border-dashed border-gray-600">
                                                        변경할 예약 내역이 없습니다.
                                                    </div>
                                                ) : (
                                                    <>
                                                        <div className="space-y-1">
                                                            <label className="text-xs font-medium text-gray-400">예약자 성함</label>
                                                            <input
                                                                type="text"
                                                                value={name}
                                                                onChange={(e) => setName(e.target.value)}
                                                                placeholder="성함을 입력해주세요"
                                                                className="w-full p-3 border border-gray-700 rounded-xl bg-gray-800 text-white placeholder-gray-500 focus:bg-gray-700 focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all"
                                                            />
                                                        </div>
                                                        <div className="grid grid-cols-1 gap-3">
                                                            <div className="space-y-1">
                                                                <label className="text-xs font-medium text-gray-400">날짜</label>
                                                                <input
                                                                    type="date"
                                                                    value={date}
                                                                    onChange={(e) => setDate(e.target.value)}
                                                                    className="w-full p-3 border border-gray-700 rounded-xl bg-gray-800 text-white focus:bg-gray-700 focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all"
                                                                />
                                                            </div>
                                                            <div className="space-y-1">
                                                                <label className="text-xs font-medium text-gray-400">시간</label>
                                                                <div className="flex gap-2">
                                                                    <div className="relative flex-1">
                                                                        <select
                                                                            value={hour}
                                                                            onChange={(e) => setHour(e.target.value)}
                                                                            className="w-full p-3 border border-gray-700 rounded-xl bg-gray-800 text-white focus:bg-gray-700 focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all appearance-none"
                                                                        >
                                                                            {hours.map(h => (
                                                                                <option key={h} value={h}>{h}시</option>
                                                                            ))}
                                                                        </select>
                                                                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none" size={16} />
                                                                    </div>
                                                                    <div className="relative flex-1">
                                                                        <select
                                                                            value={minute}
                                                                            onChange={(e) => setMinute(e.target.value)}
                                                                            className="w-full p-3 border border-gray-700 rounded-xl bg-gray-800 text-white focus:bg-gray-700 focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all appearance-none"
                                                                        >
                                                                            {minutes.map(m => (
                                                                                <option key={m} value={m}>{m}분</option>
                                                                            ))}
                                                                        </select>
                                                                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none" size={16} />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        )}

                                        {activeTab === "cancel" && (
                                            <div className="space-y-4">
                                                <div className="bg-red-500/10 p-4 rounded-xl border border-red-500/30 text-sm text-red-300 flex items-start gap-3">
                                                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                                    <div>
                                                        <p className="font-bold mb-1">정말 취소하시겠습니까?</p>
                                                        <p>당일 취소는 노쇼 페널티가 발생할 수 있습니다.</p>
                                                    </div>
                                                </div>

                                                {!existingReservation ? (
                                                    <div className="text-center py-8 text-gray-400 bg-gray-800/50 rounded-xl border border-dashed border-gray-600">
                                                        취소할 예약 내역이 없습니다.
                                                    </div>
                                                ) : (
                                                    <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 space-y-4">
                                                        <div className="p-3 bg-gray-900/50 rounded-lg">
                                                            <p className="text-xs text-gray-500 mb-1">현재 예약 정보</p>
                                                            <p className="font-bold text-white">{existingReservation.time}</p>
                                                            <p className="text-sm text-gray-400">{existingReservation.name}님</p>
                                                        </div>

                                                        <div>
                                                            <p className="text-sm text-gray-400 font-medium mb-2">취소 사유</p>
                                                            <select className="w-full p-2 border border-gray-700 rounded-lg text-sm bg-gray-800 text-white">
                                                                <option>단순 변심</option>
                                                                <option>일정 변경</option>
                                                                <option>증상 호전</option>
                                                                <option>기타</option>
                                                            </select>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </>
                                )}

                                <button
                                    onClick={handleConfirm}
                                    disabled={isSubmitting || (activeTab !== 'book' && !existingReservation)}
                                    className={`w-full py-3 rounded-xl font-medium text-white transition-colors mt-4 ${activeTab === "cancel" ? "bg-red-500 hover:bg-red-600" : "bg-pink-500 hover:bg-pink-600"} ${isSubmitting || (activeTab !== 'book' && !existingReservation) ? "opacity-50 cursor-not-allowed" : ""}`}
                                >
                                    {isSubmitting ? "처리중..." : (
                                        <>
                                            {activeTab === "book" && "예약 신청하기"}
                                            {activeTab === "reschedule" && "변경 신청하기"}
                                            {activeTab === "cancel" && "예약 취소하기"}
                                        </>
                                    )}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );

    // Render modal to body using portal to avoid parent container clipping
    if (typeof document !== 'undefined') {
        return createPortal(modalContent, document.body);
    }
    return modalContent;
}

function ChevronDown({ className, size }: { className?: string, size?: number }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size || 24}
            height={size || 24}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="m6 9 6 6 6-6" />
        </svg>
    );
}
