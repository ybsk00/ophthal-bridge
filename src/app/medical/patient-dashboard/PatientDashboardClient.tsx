"use client";

import { useState, Suspense, useEffect } from "react";
import { Calendar, Clock, MoreHorizontal, Send, ClipboardList, Pill, Upload, MessageSquare, MapPin, Users, FileText, Sparkles } from "lucide-react";
import Image from "next/image";
import ChatInterface from "@/components/chat/ChatInterface";
import PatientHeader from "@/components/medical/PatientHeader";
import ReservationModal from "@/components/medical/ReservationModal";
import AestheticCheckModal from "@/components/medical/AestheticCheckModal";
import MedicationModal from "@/components/medical/MedicationModal";
import FileUploadModal from "@/components/medical/FileUploadModal";
import MapModal from "@/components/medical/MapModal";
import ReviewModal from "@/components/medical/ReviewModal";
import DoctorIntroModal from "@/components/medical/DoctorIntroModal";
import EvidenceModal from "@/components/medical/EvidenceModal";
import { createClient } from "@/lib/supabase/client";
import OphthalSimulationModal from "@/components/medical/ophthal/OphthalSimulationModal";
import { useSession } from "next-auth/react";
import { DOCTORS, SCI_EVIDENCE } from "@/lib/ai/prompts";

export default function PatientDashboardClient() {
    const { data: nextAuthSession } = useSession();
    const [isReservationModalOpen, setIsReservationModalOpen] = useState(false);
    const [showAestheticModal, setShowAestheticModal] = useState(false);
    const [showMedicationModal, setShowMedicationModal] = useState(false);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [showMapModal, setShowMapModal] = useState(false);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [showDoctorIntroModal, setShowDoctorIntroModal] = useState(false);
    const [showEvidenceModal, setShowEvidenceModal] = useState(false);
    const [showFaceSimulationModal, setShowFaceSimulationModal] = useState(false);
    const [highlightedTabs, setHighlightedTabs] = useState<('review' | 'map')[]>([]);
    const [symptomSummary, setSymptomSummary] = useState<string | undefined>(undefined);  // 증상정리 요약
    const [appointment, setAppointment] = useState({
        date: "예약 없음",
        time: "",
        type: "예정된 진료가 없습니다.",
        doctor: ""
    });

    const supabase = createClient();

    useEffect(() => {
        fetchLatestAppointment();
    }, [isReservationModalOpen, nextAuthSession]); // Refresh when modal closes or session changes

    const fetchLatestAppointment = async () => {
        try {
            // 1. Check Supabase Auth user
            const { data: { user } } = await supabase.auth.getUser();

            let data = null;

            if (user) {
                // Supabase Auth user: query by user_id from patients table
                const { data: patientData } = await supabase
                    .from('patients')
                    .select('*')
                    .eq('user_id', user.id)
                    .eq('status', 'pending')
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .maybeSingle();
                data = patientData;
            } else if (nextAuthSession?.user?.id) {
                // NextAuth user (Naver login): query by naver_user_id from appointments table
                // Then get related patient info
                const { data: appointmentData } = await supabase
                    .from('appointments')
                    .select('*')
                    .eq('naver_user_id', nextAuthSession.user.id)
                    .in('status', ['scheduled', 'pending', 'confirmed'])  // 취소된 예약 제외
                    .gte('scheduled_at', new Date().toISOString())
                    .order('scheduled_at', { ascending: true })
                    .limit(1)
                    .maybeSingle();

                if (appointmentData) {
                    // Convert appointments format to patients format for display
                    const scheduledDate = new Date(appointmentData.scheduled_at);
                    data = {
                        time: `${scheduledDate.toISOString().split('T')[0]} ${scheduledDate.toTimeString().slice(0, 5)}`,
                        status: appointmentData.status === 'scheduled' ? 'pending' : appointmentData.status,
                        complaint: appointmentData.notes || '세인트의원 진료'
                    };
                }
            }

            if (data) {
                // Parse the time string "YYYY-MM-DD HH:MM"
                const timeStr = data.time;
                let displayDate = "예약 없음";
                let displayTime = "";
                let shouldHide = false;

                if (timeStr) {
                    const [d, t] = timeStr.split(' ');
                    displayDate = d;
                    displayTime = t;

                    // Check if 24 hours have passed since the appointment
                    try {
                        const appointmentDate = new Date(timeStr.replace(' ', 'T'));
                        const now = new Date();
                        const diffInHours = (now.getTime() - appointmentDate.getTime()) / (1000 * 60 * 60);

                        // If more than 24 hours passed since appointment time, and it's cancelled or completed
                        if (diffInHours > 24 && (data.status === 'cancelled' || data.status === 'completed')) {
                            shouldHide = true;
                        }
                    } catch (e) {
                        console.error("Date parsing error", e);
                    }
                }

                if (shouldHide) {
                    setAppointment({
                        date: "예약 없음",
                        time: "",
                        type: "예정된 진료가 없습니다.",
                        doctor: ""
                    });
                } else if (data.status === 'cancelled') {
                    setAppointment({
                        date: displayDate,
                        time: displayTime,
                        type: "예약이 취소되었습니다.",
                        doctor: ""
                    });
                } else if (data.status === 'completed') {
                    setAppointment({
                        date: "예약 없음",
                        time: "",
                        type: "예정된 진료가 없습니다.",
                        doctor: ""
                    });
                } else {
                    setAppointment({
                        date: displayDate,
                        time: displayTime,
                        type: data.complaint || "일반 진료",
                        doctor: "김민승 대표원장"
                    });
                }
            } else {
                setAppointment({
                    date: "예약 없음",
                    time: "",
                    type: "예정된 진료가 없습니다.",
                    doctor: ""
                });
            }
        } catch (error) {
            console.error("Error fetching appointment:", error);
        }
    };

    return (
        <div className="min-h-screen bg-skin-bg font-sans selection:bg-skin-accent selection:text-white">
            <PatientHeader />

            <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">

                {/* Header / Appointment Card */}
                <div className="bg-[#1a2332] backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 transition-all hover:shadow-xl">
                    <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-sm ${appointment.date === "예약 없음" ? "bg-dental-subtext/20 text-dental-subtext" : "bg-dental-primary/20 text-dental-primary"}`}>
                            <Calendar size={24} />
                        </div>
                        <div>
                            <h2 className="text-sm text-dental-subtext font-medium mb-1">다음 예약 안내</h2>
                            <div className="flex items-baseline gap-2">
                                <span className={`text-xl font-bold ${appointment.date === "예약 없음" ? "text-dental-subtext/60" : "text-white"}`}>{appointment.date}</span>
                                {appointment.time && <span className="text-xl font-bold text-white">{appointment.time}</span>}
                            </div>
                            <p className={`${appointment.date === "예약 없음" ? "text-dental-subtext/60" : appointment.type === "예약이 취소되었습니다." ? "text-red-400" : "text-dental-primary"} text-sm font-medium mt-1`}>{appointment.type}</p>
                        </div>
                    </div>

                    <div className="flex gap-2 w-full md:w-auto">
                        <button
                            onClick={() => setIsReservationModalOpen(true)}
                            className="flex-1 md:flex-none px-6 py-2.5 bg-dental-primary text-white rounded-xl text-sm font-medium hover:bg-dental-accent transition-all shadow-sm"
                        >
                            예약관리
                        </button>
                    </div>
                </div>

                <ReservationModal
                    isOpen={isReservationModalOpen}
                    onClose={() => {
                        setIsReservationModalOpen(false);
                        fetchLatestAppointment(); // Refresh on close
                    }}
                />

                {/* Aesthetic Check Modal */}
                <AestheticCheckModal
                    isOpen={showAestheticModal}
                    onClose={() => setShowAestheticModal(false)}
                    onComplete={(summary) => {
                        setSymptomSummary(summary);
                        setShowAestheticModal(false);
                    }}
                />

                {/* Medication Modal */}
                <MedicationModal
                    isOpen={showMedicationModal}
                    onClose={() => setShowMedicationModal(false)}
                    onComplete={(result) => {
                        setSymptomSummary(result);
                        setShowMedicationModal(false);
                    }}
                />

                {/* File Upload Modal (검사결과지 분석) */}
                <FileUploadModal
                    isOpen={showUploadModal}
                    onClose={() => setShowUploadModal(false)}
                    onComplete={(result) => {
                        setSymptomSummary(result);
                        setShowUploadModal(false);
                    }}
                />

                {/* Map Modal (위치 보기) */}
                <MapModal
                    isOpen={showMapModal}
                    onClose={() => setShowMapModal(false)}
                />

                {/* Review Modal (후기 보기) */}
                <ReviewModal
                    isOpen={showReviewModal}
                    onClose={() => setShowReviewModal(false)}
                />

                {/* Video Section with Glassmorphism Quick Actions */}
                <div className="w-full rounded-2xl overflow-hidden shadow-lg border border-white/50 relative">
                    {/* BLINDS SHADOW Image Banner */}
                    <div className="relative w-full h-96 md:h-[500px]">
                        <Image
                            src="/BLINDS SHADOW.png"
                            alt="세인트의원 프리미엄 시술"
                            fill
                            className="object-cover object-[center_25%]"
                            priority
                        />
                    </div>

                    {/* Light Gradient Overlay - More transparent */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

                    {/* Quick Actions Card - 6 buttons */}
                    <div className="absolute bottom-4 left-4 right-4">
                        <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-3 shadow-lg">
                            <div className="grid grid-cols-7 gap-2">
                                <button
                                    onClick={() => setIsReservationModalOpen(true)}
                                    className="flex flex-col items-center gap-1.5 p-2 bg-white/5 hover:bg-white/20 rounded-xl transition-all duration-300 group"
                                >
                                    <div className="w-10 h-10 md:w-11 md:h-11 rounded-full bg-blue-500/80 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                                        <Calendar className="w-4 h-4 md:w-5 md:h-5 text-white" />
                                    </div>
                                    <span className="text-[10px] md:text-xs font-medium text-white/90 whitespace-nowrap">예약하기</span>
                                </button>
                                <button
                                    onClick={() => setShowAestheticModal(true)}
                                    className="flex flex-col items-center gap-1.5 p-2 bg-white/5 hover:bg-white/20 rounded-xl transition-all duration-300 group"
                                >
                                    <div className="w-10 h-10 md:w-11 md:h-11 rounded-full bg-emerald-500/80 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                                        <ClipboardList className="w-4 h-4 md:w-5 md:h-5 text-white" />
                                    </div>
                                    <span className="text-[10px] md:text-xs font-medium text-white/90 whitespace-nowrap">시술상담</span>
                                </button>
                                <button
                                    onClick={() => setShowMedicationModal(true)}
                                    className="flex flex-col items-center gap-1.5 p-2 bg-white/5 hover:bg-white/20 rounded-xl transition-all duration-300 group"
                                >
                                    <div className="w-10 h-10 md:w-11 md:h-11 rounded-full bg-purple-500/80 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                                        <Pill className="w-4 h-4 md:w-5 md:h-5 text-white" />
                                    </div>
                                    <span className="text-[10px] md:text-xs font-medium text-white/90 whitespace-nowrap">복약도우미</span>
                                </button>
                                <button
                                    onClick={() => setShowUploadModal(true)}
                                    className="flex flex-col items-center gap-1.5 p-2 bg-white/5 hover:bg-white/20 rounded-xl transition-all duration-300 group"
                                >
                                    <div className="w-10 h-10 md:w-11 md:h-11 rounded-full bg-orange-500/80 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                                        <Upload className="w-4 h-4 md:w-5 md:h-5 text-white" />
                                    </div>
                                    <span className="text-[10px] md:text-xs font-medium text-white/90 whitespace-nowrap">검사결과지</span>
                                </button>
                                <button
                                    onClick={() => setShowFaceSimulationModal(true)}
                                    className="flex flex-col items-center gap-1.5 p-2 bg-white/5 hover:bg-white/20 rounded-xl transition-all duration-300 group"
                                >
                                    <div className="w-10 h-10 md:w-11 md:h-11 rounded-full bg-pink-500/80 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                                        <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-white" />
                                    </div>
                                    <span className="text-[10px] md:text-xs font-medium text-white/90 whitespace-nowrap">시뮬레이션</span>
                                </button>
                                <button
                                    onClick={() => setShowReviewModal(true)}
                                    className={`flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all duration-300 group ${highlightedTabs.includes('review')
                                        ? 'bg-amber-500/30 ring-2 ring-amber-400 ring-offset-2 ring-offset-transparent animate-pulse'
                                        : 'bg-white/5 hover:bg-white/20'
                                        }`}
                                >
                                    <div className="w-10 h-10 md:w-11 md:h-11 rounded-full bg-amber-500/80 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                                        <MessageSquare className="w-4 h-4 md:w-5 md:h-5 text-white" />
                                    </div>
                                    <span className="text-[10px] md:text-xs font-medium text-white/90 whitespace-nowrap">후기보기</span>
                                </button>
                                <button
                                    onClick={() => setShowMapModal(true)}
                                    className={`flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all duration-300 group ${highlightedTabs.includes('map')
                                        ? 'bg-rose-500/30 ring-2 ring-rose-400 ring-offset-2 ring-offset-transparent animate-pulse'
                                        : 'bg-white/5 hover:bg-white/20'
                                        }`}
                                >
                                    <div className="w-10 h-10 md:w-11 md:h-11 rounded-full bg-rose-500/80 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                                        <MapPin className="w-4 h-4 md:w-5 md:h-5 text-white" />
                                    </div>
                                    <span className="text-[10px] md:text-xs font-medium text-white/90 whitespace-nowrap">위치보기</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Chat Interface Area */}
                <div className="bg-[#1a2332] backdrop-blur-xl rounded-3xl shadow-xl border border-white/10 overflow-hidden h-[650px] flex flex-col">
                    <div className="p-5 border-b border-white/10 flex justify-between items-center bg-[#1a2332]">
                        <div>
                            <h3 className="font-bold text-white text-lg">예진 상담 (Medical Chat)</h3>
                            <p className="text-xs text-dental-primary font-medium flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 bg-dental-primary rounded-full animate-pulse"></span>
                                전문의 감독 하에 운영
                            </p>
                        </div>
                        <button className="text-dental-subtext hover:text-white p-2 hover:bg-white/10 rounded-full transition-colors">
                            <MoreHorizontal size={20} />
                        </button>
                    </div>

                    {/* 안전 가드 배지 */}
                    <div className="px-5 py-2 bg-amber-900/30 border-b border-amber-700/30">
                        <p className="text-xs text-amber-300 text-center">
                            ⚠️ 본 서비스는 진단/처방이 아닌 생활 정리 도움입니다. 응급 시 119/응급실 이용
                        </p>
                    </div>

                    <div className="flex-1 overflow-hidden bg-dental-bg">
                        <Suspense fallback={<div className="flex items-center justify-center h-full text-dental-subtext">Loading...</div>}>
                            <ChatInterface
                                isEmbedded={true}
                                isLoggedIn={true}
                                mode="medical"
                                externalMessage={symptomSummary}
                                onExternalMessageSent={() => setSymptomSummary(undefined)}
                                onAction={(action, data) => {
                                    if (action === 'DOCTOR_INTRO_MODAL') {
                                        setShowDoctorIntroModal(true);
                                    } else if (action === 'EVIDENCE_MODAL') {
                                        setShowEvidenceModal(true);
                                    }
                                }}
                                onTabHighlight={(tabs) => {
                                    setHighlightedTabs(tabs);
                                    // 3초 후 하이라이트 해제
                                    setTimeout(() => setHighlightedTabs([]), 3000);
                                }}
                            />
                        </Suspense>
                    </div>
                </div>

            </div>

            {/* Doctor Intro Modal */}
            <DoctorIntroModal
                isOpen={showDoctorIntroModal}
                onClose={() => setShowDoctorIntroModal(false)}
                doctors={DOCTORS}
                onReservation={() => setIsReservationModalOpen(true)}
                onReviewTabClick={() => setShowReviewModal(true)}
                onMapTabClick={() => setShowMapModal(true)}
            />

            {/* Evidence Modal */}
            <EvidenceModal
                isOpen={showEvidenceModal}
                onClose={() => setShowEvidenceModal(false)}
                evidence={SCI_EVIDENCE}
            />

            {/* Ophthal Simulation Modal */}
            <OphthalSimulationModal
                isOpen={showFaceSimulationModal}
                onClose={() => setShowFaceSimulationModal(false)}
            />
        </div>
    );
}


