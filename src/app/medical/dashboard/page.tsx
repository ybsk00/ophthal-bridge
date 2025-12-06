"use client";

import { useState } from "react";
import { Search, ChevronDown, X } from "lucide-react";
import TreatmentPlanEditor from "@/components/medical/TreatmentPlanEditor";

export default function DoctorDashboard() {
    const [searchTerm, setSearchTerm] = useState("");
    const [activeFilter, setActiveFilter] = useState("초진");

    // Mock Data matching the design
    const patients = [
        {
            id: 1,
            time: "10:00",
            name: "김OO",
            type: "초진",
            complaint: "6개월째 아침 피로, 감기 잦음",
            keywords: ["회복력 저하", "수면 리듬 불안정"],
            score: 42,
            status: "완료"
        },
        {
            id: 2,
            time: "10:30",
            name: "이△△",
            type: "재진",
            complaint: "최근 소화불량 및 복부 팽만감",
            keywords: ["소화·수면"],
            score: 78,
            status: "완료"
        },
        {
            id: 3,
            time: "11:00",
            name: "박□□",
            type: "초진",
            complaint: "만성적인 허리 통증과 뻣뻣함",
            keywords: ["통증"],
            score: 55,
            status: "완료"
        },
        {
            id: 4,
            time: "11:30",
            name: "최○△",
            type: "온라인",
            complaint: "임신 준비를 위한 상담",
            keywords: ["임신 준비"],
            score: 82,
            status: "완료"
        },
        {
            id: 5,
            time: "14:00",
            name: "정□○",
            type: "재진",
            complaint: "생리통 및 주기 불규칙",
            keywords: ["여성밸런스"],
            score: 38,
            status: "완료"
        },
    ];

    const filters = ["초진", "재진", "온라인", "회복력", "여성밸런스", "통증", "소화·수면"];

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">오늘의 환자 목록</h1>

            {/* Top Filters */}
            <div className="flex flex-wrap gap-2 items-center">
                <button className="px-4 py-1.5 rounded-full border border-teal-600 text-teal-600 text-sm font-medium hover:bg-teal-50">
                    오늘
                </button>
                <button className="px-4 py-1.5 rounded-full border border-gray-300 text-gray-600 text-sm font-medium hover:bg-gray-50">
                    이번 주
                </button>
                <button className="px-4 py-1.5 rounded-full border border-gray-300 text-gray-600 text-sm font-medium hover:bg-gray-50 flex items-center gap-1">
                    기간 선택 <ChevronDown size={14} />
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
                            <th className="px-6 py-4 text-sm font-bold text-teal-700">이름·유형</th>
                            <th className="px-6 py-4 text-sm font-bold text-teal-700">주호소</th>
                            <th className="px-6 py-4 text-sm font-bold text-teal-700">패턴 키워드</th>
                            <th className="px-6 py-4 text-sm font-bold text-teal-700">리듬 점수</th>
                            <th className="px-6 py-4 text-sm font-bold text-teal-700">예진</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {patients.map((patient) => (
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
                                <td className="px-6 py-4 text-gray-700">{patient.complaint}</td>
                                <td className="px-6 py-4 text-gray-600 text-sm">
                                    {patient.keywords.join(", ")}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <span className={`text-lg font-bold ${patient.score < 50 ? 'text-red-500' : 'text-teal-600'}`}>
                                            {patient.score}
                                        </span>
                                        <div className={`px-2 py-1 rounded text-xs font-medium ${patient.score < 50 ? 'bg-red-100 text-red-700' : 'bg-teal-100 text-teal-700'
                                            }`}>
                                            {patient.score < 50 ? '낮음' : patient.score >= 80 ? '양호' : '보통'}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-teal-600 font-bold text-sm">
                                        {patient.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Treatment Plan Editor (Hidden by default or moved, keeping it here for functionality but maybe collapsed) */}
            <div className="mt-8 pt-8 border-t border-gray-200">
                <h2 className="text-lg font-bold text-gray-900 mb-4">치료 계획 관리 (Demo)</h2>
                <TreatmentPlanEditor />
            </div>
        </div>
    );
}
