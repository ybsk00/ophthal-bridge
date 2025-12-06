
"use client";

import { useState, useEffect } from "react";
import { Search, ChevronDown, X, MessageSquare, CheckCircle2, Clock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function DoctorDashboard() {
    const [searchTerm, setSearchTerm] = useState("");
    const [activeFilter, setActiveFilter] = useState("전체");
    const supabase = createClient();

    // Define Patient type
    type Patient = {
        id: number;
        time: string;
        name: string;
        type: string;
        complaint: string;
        keywords: string[];
        status: "completed" | "pending";
    };

    const [patients, setPatients] = useState<Patient[]>([]);
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
    const [showChatModal, setShowChatModal] = useState(false);
    const [showReservationModal, setShowReservationModal] = useState(false);

    const filters = ["전체", "대기", "완료"];

    useEffect(() => {
        fetchPatients();
    }, []);

    const fetchPatients = async () => {
        const { data, error } = await supabase
            .from('patients')
            .select('*')
            .order('time', { ascending: true });

        if (error) {
            console.error('Error fetching patients:', error);
        } else {
            setPatients(data || []);
        }
    };

    const handleStatusClick = async (patient: Patient) => {
        if (patient.status === "completed") {
            setSelectedPatient(patient);
            setShowReservationModal(true);
        } else {
            // Toggle status logic (optional, or just for demo)
            // For now, let's just mark as completed if pending
            const newStatus = "completed";
            const { error } = await supabase
                .from('patients')
                .update({ status: newStatus })
                .eq('id', patient.id);

            if (!error) {
                fetchPatients(); // Refresh data
            }
        }
    };

    const handleComplaintClick = (patient: Patient) => {
        setSelectedPatient(patient);
        setShowChatModal(true);
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">예약 관리</h1>

            {/* Top Filters */}
            <div className="flex flex-wrap gap-2 items-center">
                <button className="px-4 py-1.5 rounded-full border border-teal-600 text-teal-600 text-sm font-medium hover:bg-teal-50">
                    오늘
                </button>
                <div className="w-px h-6 bg-gray-300 mx-2"></div>
                {filters.map((filter) => (
                    <button
                        key={filter}
                        onClick={() => setActiveFilter(filter === activeFilter ? "" : filter)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-1 ${activeFilter === filter
                            ? "bg-teal-100 text-teal-700 border border-teal-200"
                            : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                            }`}
                    >
                        {filter}
                        {activeFilter === filter && <X size={12} />}
                    </button>
                ))}
            </div>

            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-teal-500" size={20} />
                <input
                    type="text"
                    placeholder="이름/키워드 검색"
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent shadow-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Patient Table */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-teal-50/50 border-b border-teal-100">
                        <tr>
                            <th className="px-6 py-4 text-sm font-bold text-teal-700">시간</th>
                            <th className="px-6 py-4 text-sm font-bold text-teal-700">이름</th>
                            <th className="px-6 py-4 text-sm font-bold text-teal-700">주호소 (클릭하여 채팅보기)</th>
                            <th className="px-6 py-4 text-sm font-bold text-teal-700">패턴 키워드</th>
                            <th className="px-6 py-4 text-sm font-bold text-teal-700">상태</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {patients.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                    예약된 환자가 없습니다.
                                </td>
                            </tr>
                        ) : (
                            patients.map((patient) => (
                                <tr key={patient.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 text-gray-600 font-medium">{patient.time}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1">
                                            <span className="font-bold text-gray-900">{patient.name}</span>
                                            <span className="text-gray-400">·</span>
                                            <span className={`text-sm font-medium ${patient.type === '초진' ? 'text-green-600' :
                                                patient.type === '온라인' ? 'text-blue-600' : 'text-gray-600'
                                                }`}>
                                                {patient.type}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => handleComplaintClick(patient)}
                                            className="text-gray-700 hover:text-teal-600 hover:underline text-left flex items-center gap-2 group"
                                        >
                                            <MessageSquare size={16} className="text-gray-400 group-hover:text-teal-500" />
                                            {patient.complaint}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600 text-sm">
                                        {patient.keywords.join(", ")}
                                    </td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => handleStatusClick(patient)}
                                            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold transition-all ${patient.status === 'completed'
                                                ? 'bg-teal-100 text-teal-700 hover:bg-teal-200 cursor-pointer'
                                                : 'bg-gray-100 text-gray-500 cursor-default'
                                                }`}
                                        >
                                            {patient.status === 'completed' ? (
                                                <>
                                                    <CheckCircle2 size={16} />
                                                    완료
                                                </>
                                            ) : (
                                                <>
                                                    <Clock size={16} />
                                                    대기
                                                </>
                                            )}
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Chat History Modal */}
            {showChatModal && selectedPatient && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-teal-50/50">
                            <div className="flex items-center gap-2">
                                <MessageSquare className="text-teal-600" size={20} />
                                <h3 className="text-lg font-bold text-gray-900">채팅 내역 - {selectedPatient.name}</h3>
                            </div>
                            <button
                                onClick={() => setShowChatModal(false)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto bg-gray-50">
                            {/* Mock Chat Content */}
                            <div className="flex gap-3">
                                <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
                                    <span className="text-xs font-bold text-teal-700">AI</span>
                                </div>
                                <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm border border-gray-100 text-gray-700 text-sm">
                                    안녕하세요, {selectedPatient.name}님. 어디가 불편하신가요?
                                </div>
                            </div>
                            <div className="flex gap-3 flex-row-reverse">
                                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                                    <span className="text-xs font-bold text-gray-600">나</span>
                                </div>
                                <div className="bg-teal-600 p-3 rounded-2xl rounded-tr-none shadow-sm text-white text-sm">
                                    {selectedPatient.complaint}
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
                                    <span className="text-xs font-bold text-teal-700">AI</span>
                                </div>
                                <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm border border-gray-100 text-gray-700 text-sm">
                                    언제부터 그러셨나요? 다른 증상은 없으신가요?
                                </div>
                            </div>
                        </div>
                        <div className="p-4 border-t border-gray-100 bg-white flex justify-end">
                            <button
                                onClick={() => setShowChatModal(false)}
                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                            >
                                닫기
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reservation Confirmation Modal */}
            {showReservationModal && selectedPatient && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900">예약 확인</h3>
                            <button
                                onClick={() => setShowReservationModal(false)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-8 text-center space-y-6">
                            <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle2 className="text-teal-600" size={32} />
                            </div>

                            <div className="space-y-2">
                                <h4 className="text-xl font-bold text-gray-900">{selectedPatient.name}님 예약 정보</h4>
                                <p className="text-gray-500">아래 일정으로 예약이 확정되어 있습니다.</p>
                            </div>

                            <div className="bg-gray-50 rounded-xl p-4 space-y-3 text-left">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500 text-sm">날짜</span>
                                    <span className="font-bold text-gray-900">2025년 12월 08일 (금)</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500 text-sm">시간</span>
                                    <span className="font-bold text-teal-600 text-lg">{selectedPatient.time}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500 text-sm">진료 유형</span>
                                    <span className="font-medium text-gray-900">{selectedPatient.type}</span>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 border-t border-gray-100 bg-white">
                            <button
                                onClick={() => setShowReservationModal(false)}
                                className="w-full py-3 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition-colors shadow-lg shadow-teal-200"
                            >
                                확인했습니다
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
