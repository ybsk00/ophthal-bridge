"use client";

import { useState, Suspense } from "react";
import { Calendar, Clock, MoreHorizontal, Send } from "lucide-react";
import ChatInterface from "@/components/chat/ChatInterface";
import PatientHeader from "@/components/medical/PatientHeader";
import ReservationModal from "@/components/medical/ReservationModal";

export default function PatientDashboard() {
    const [isReservationModalOpen, setIsReservationModalOpen] = useState(false);

    // Mock appointment data
    // Mock appointment data (Empty or Generic)
    const appointment = {
        date: "예약 없음",
        time: "",
        type: "예정된 진료가 없습니다.",
        doctor: ""
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <PatientHeader />

            <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">

                {/* Header / Appointment Card */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${appointment.date === "예약 없음" ? "bg-gray-100 text-gray-400" : "bg-teal-50 text-teal-600"}`}>
                            <Calendar size={24} />
                        </div>
                        <div>
                            <h2 className="text-sm text-gray-500 font-medium mb-1">다음 예약 안내</h2>
                            <div className="flex items-baseline gap-2">
                                <span className={`text-xl font-bold ${appointment.date === "예약 없음" ? "text-gray-400" : "text-gray-900"}`}>{appointment.date}</span>
                                {appointment.time && <span className="text-xl font-bold text-gray-900">{appointment.time}</span>}
                            </div>
                            <p className={`${appointment.date === "예약 없음" ? "text-gray-400" : "text-teal-600"} text-sm font-medium mt-1`}>{appointment.type}</p>
                        </div>
                    </div>

                    <div className="flex gap-2 w-full md:w-auto">
                        <button
                            onClick={() => setIsReservationModalOpen(true)}
                            className="flex-1 md:flex-none px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                        >
                            예약관리
                        </button>
                    </div>
                </div>

                <ReservationModal
                    isOpen={isReservationModalOpen}
                    onClose={() => setIsReservationModalOpen(false)}
                />

                {/* Main Chat Interface Area */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden h-[600px] flex flex-col">
                    <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white">
                        <div>
                            <h3 className="font-bold text-gray-900">예진 상담 (Medical Chat)</h3>
                            <p className="text-xs text-blue-600 font-medium">● 전문의 감독 하에 운영</p>
                        </div>
                        <button className="text-gray-400 hover:text-gray-600">
                            <MoreHorizontal size={20} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-hidden">
                        <Suspense fallback={<div className="flex items-center justify-center h-full">Loading...</div>}>
                            <ChatInterface isEmbedded={true} isLoggedIn={true} />
                        </Suspense>
                    </div>
                </div>

            </div>
        </div>
    );
}
