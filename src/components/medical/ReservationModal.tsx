"use client";

import { useState } from "react";
import { Calendar, Clock, X, CheckCircle2, AlertCircle } from "lucide-react";

type ReservationModalProps = {
    isOpen: boolean;
    onClose: () => void;
    initialTab?: "book" | "reschedule" | "cancel";
};

export default function ReservationModal({ isOpen, onClose, initialTab = "book" }: ReservationModalProps) {
    const [activeTab, setActiveTab] = useState<"book" | "reschedule" | "cancel">(initialTab);
    const [step, setStep] = useState(1); // 1: Input, 2: Confirm, 3: Success

    if (!isOpen) return null;

    const handleConfirm = () => {
        setStep(3);
        // In a real app, you would make an API call here
    };

    const resetAndClose = () => {
        setStep(1);
        setActiveTab("book");
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100">
                {/* Header */}
                <div className="bg-traditional-bg p-4 flex justify-between items-center border-b border-traditional-muted/20">
                    <h3 className="font-bold text-lg text-traditional-text flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-traditional-accent" />
                        예약 관리
                    </h3>
                    <button onClick={resetAndClose} className="text-gray-400 hover:text-gray-600">
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    {step === 3 ? (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle2 size={32} />
                            </div>
                            <h4 className="text-xl font-bold text-gray-900 mb-2">처리되었습니다</h4>
                            <p className="text-gray-600 mb-6">
                                {activeTab === "book" && "예약 신청이 완료되었습니다."}
                                {activeTab === "reschedule" && "예약 변경이 완료되었습니다."}
                                {activeTab === "cancel" && "예약이 취소되었습니다."}
                                <br />
                                카카오톡으로 알림을 보내드렸습니다.
                            </p>
                            <button
                                onClick={resetAndClose}
                                className="w-full py-3 bg-traditional-accent text-white rounded-xl font-medium hover:bg-opacity-90 transition-colors"
                            >
                                확인
                            </button>
                        </div>
                    ) : (
                        <>
                            {/* Tabs */}
                            <div className="flex bg-gray-100 p-1 rounded-xl mb-6">
                                <button
                                    onClick={() => setActiveTab("book")}
                                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === "book" ? "bg-white text-traditional-accent shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                                >
                                    예약하기
                                </button>
                                <button
                                    onClick={() => setActiveTab("reschedule")}
                                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === "reschedule" ? "bg-white text-traditional-accent shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                                >
                                    예약변경
                                </button>
                                <button
                                    onClick={() => setActiveTab("cancel")}
                                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === "cancel" ? "bg-white text-red-500 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                                >
                                    예약취소
                                </button>
                            </div>

                            {/* Content based on Tab */}
                            <div className="space-y-4">
                                {activeTab === "book" && (
                                    <div className="space-y-4">
                                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-sm text-blue-800">
                                            <p className="font-bold mb-1">진료 예약</p>
                                            <p>원하시는 날짜와 시간을 선택해주세요.</p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="space-y-1">
                                                <label className="text-xs font-medium text-gray-500">날짜</label>
                                                <input
                                                    type="date"
                                                    className="w-full p-3 border rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-traditional-accent focus:border-transparent outline-none transition-all"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-xs font-medium text-gray-500">시간</label>
                                                <input
                                                    type="time"
                                                    className="w-full p-3 border rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-traditional-accent focus:border-transparent outline-none transition-all"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === "reschedule" && (
                                    <div className="space-y-4">
                                        <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 text-sm text-amber-800">
                                            <p className="font-bold mb-1">예약 변경</p>
                                            <p>변경하실 날짜와 시간을 선택해주세요.</p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="space-y-1">
                                                <label className="text-xs font-medium text-gray-500">날짜</label>
                                                <input
                                                    type="date"
                                                    className="w-full p-3 border rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-traditional-accent focus:border-transparent outline-none transition-all"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-xs font-medium text-gray-500">시간</label>
                                                <input
                                                    type="time"
                                                    className="w-full p-3 border rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-traditional-accent focus:border-transparent outline-none transition-all"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === "cancel" && (
                                    <div className="space-y-4">
                                        <div className="bg-red-50 p-4 rounded-xl border border-red-100 text-sm text-red-800 flex items-start gap-3">
                                            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                            <div>
                                                <p className="font-bold mb-1">정말 취소하시겠습니까?</p>
                                                <p>당일 취소는 노쇼 페널티가 발생할 수 있습니다.</p>
                                            </div>
                                        </div>
                                        <div className="bg-white border rounded-xl p-4">
                                            <p className="text-sm text-gray-600 font-medium mb-2">취소 사유</p>
                                            <select className="w-full p-2 border rounded-lg text-sm">
                                                <option>단순 변심</option>
                                                <option>일정 변경</option>
                                                <option>증상 호전</option>
                                                <option>기타</option>
                                            </select>
                                        </div>
                                    </div>
                                )}

                                <button
                                    onClick={handleConfirm}
                                    className={`w-full py-3 rounded-xl font-medium text-white transition-colors mt-4 ${activeTab === "cancel" ? "bg-red-500 hover:bg-red-600" : "bg-traditional-accent hover:bg-opacity-90"}`}
                                >
                                    {activeTab === "book" && "예약 신청하기"}
                                    {activeTab === "reschedule" && "변경 신청하기"}
                                    {activeTab === "cancel" && "예약 취소하기"}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
