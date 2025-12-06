"use client";

import { useState } from "react";
import { Search, Calendar, Filter, Plus, Users, Activity } from "lucide-react";

export default function DoctorDashboard() {
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("all"); // all, waiting, completed, emergency

    // Mock Data (Expanded)
    const patients = [
        { id: 1, name: "김철수", age: 45, condition: "만성 피로", status: "대기중", lastVisit: "2024-01-15", score: 45 },
        { id: 2, name: "이영희", age: 32, condition: "소화 불량", status: "진료중", lastVisit: "2024-02-01", score: 62 },
        { id: 3, name: "박지성", age: 28, condition: "허리 통증", status: "완료", lastVisit: "2024-02-10", score: 30 },
        { id: 4, name: "최동원", age: 55, condition: "불면증", status: "응급", lastVisit: "2024-02-12", score: 15 },
        { id: 5, name: "홍길동", age: 40, condition: "두통", status: "대기중", lastVisit: "2024-02-13", score: 70 },
    ];

    const filteredPatients = patients.filter(patient => {
        const matchesSearch = patient.name.includes(searchTerm) || patient.condition.includes(searchTerm);
        const matchesFilter = filterStatus === "all" || patient.status === filterStatus;
        if (filterStatus === "emergency") return patient.score < 30; // Example logic for emergency filter
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">진료 대시보드</h1>
                <div className="text-sm text-gray-500">
                    {new Date().toLocaleDateString()} 기준
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <div className="text-sm text-gray-500">대기 환자</div>
                    <div className="text-2xl font-bold text-blue-600">{patients.filter(p => p.status === "대기중").length}명</div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <div className="text-sm text-gray-500">오늘 진료</div>
                    <div className="text-2xl font-bold text-gray-900">{patients.length}명</div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <div className="text-sm text-gray-500">응급/주의</div>
                    <div className="text-2xl font-bold text-red-600">{patients.filter(p => p.score < 40).length}명</div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <div className="text-sm text-gray-500">평균 리듬 점수</div>
                    <div className="text-2xl font-bold text-green-600">58점</div>
                </div>
            </div>

            {/* Search & Filter */}
            <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="환자 이름 또는 증상 검색..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    {["all", "대기중", "진료중", "완료"].map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filterStatus === status
                                    ? "bg-blue-600 text-white"
                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                }`}
                        >
                            {status === "all" ? "전체" : status}
                        </button>
                    ))}
                </div>
            </div>

            {/* Patient Table */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">환자명</th>
                            <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">나이</th>
                            <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">주요 증상</th>
                            <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">리듬 점수</th>
                            <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">상태</th>
                            <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">최근 방문</th>
                            <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">관리</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {filteredPatients.map((patient) => (
                            <tr key={patient.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 font-medium text-gray-900">{patient.name}</td>
                                <td className="px-6 py-4 text-gray-500">{patient.age}세</td>
                                <td className="px-6 py-4 text-gray-900">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                        {patient.condition}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full ${patient.score < 50 ? 'bg-red-500' : 'bg-green-500'}`}
                                                style={{ width: `${patient.score}%` }}
                                            />
                                        </div>
                                        <span className={`text-sm font-bold ${patient.score < 50 ? 'text-red-600' : 'text-green-600'}`}>
                                            {patient.score}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${patient.status === '대기중' ? 'bg-yellow-100 text-yellow-800' :
                                            patient.status === '진료중' ? 'bg-green-100 text-green-800' :
                                                patient.status === '응급' ? 'bg-red-100 text-red-800' :
                                                    'bg-gray-100 text-gray-800'
                                        }`}>
                                        {patient.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-gray-500">{patient.lastVisit}</td>
                                <td className="px-6 py-4">
                                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                                        상세보기
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {filteredPatients.length === 0 && (
                            <tr>
                                <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                    검색 결과가 없습니다.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
