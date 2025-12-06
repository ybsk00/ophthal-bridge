"use client";

import PatientHeader from "@/components/medical/PatientHeader";
import { Activity, Calendar, MessageSquare, CheckCircle, Circle, Clock, ChevronRight, Send } from "lucide-react";

export default function PatientDashboard() {
    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <PatientHeader />

            <main className="max-w-7xl mx-auto px-6 py-8 space-y-6">
                {/* Top Row: Condition & Appointment */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Condition Card */}
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">오늘의 컨디션</h2>
                        <div className="flex items-end gap-2 mb-2">
                            <span className="text-sm font-medium text-green-600">리듬 지표</span>
                        </div>
                        <div className="flex items-baseline gap-2 mb-6">
                            <span className="text-6xl font-bold text-gray-900">42</span>
                            <span className="text-2xl text-gray-400">/100</span>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-6">
                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">회복력 저하</span>
                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">수면 리듬 불안정</span>
                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">스트레스 과부하</span>
                        </div>

                        {/* Graphic Placeholder */}
                        <div className="absolute top-8 right-8 w-32 h-32 bg-orange-400/80 rounded-lg flex items-center justify-center text-white">
                            <Activity size={48} />
                        </div>
                    </div>

                    {/* Appointment Card */}
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">다음 예약 안내</h2>
                        <div className="space-y-1 mb-6">
                            <p className="text-2xl font-bold text-gray-900">12.08 (금) 오후 2:30</p>
                            <p className="text-green-600 font-medium">정기 침구치료</p>
                        </div>
                        <button className="px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-bold hover:bg-green-200 transition-colors">
                            예약 변경
                        </button>

                        {/* Image Placeholder */}
                        <div className="absolute top-8 right-8 w-32 h-32 bg-amber-800/80 rounded-2xl overflow-hidden">
                            <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1629909613654-28e377c37b09?q=80&w=2068&auto=format&fit=crop')] bg-cover bg-center opacity-80 mix-blend-overlay"></div>
                        </div>
                    </div>
                </div>

                {/* Middle Row: Chat & History */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Chat Snippet */}
                    <div className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">오늘의 대화 · AI 헬스케어 챗</h2>
                                <p className="text-sm text-green-600">AI 헬스케어 상담 · 메디컬 모드</p>
                            </div>
                        </div>

                        <div className="flex-1 space-y-4 mb-4">
                            {/* AI Bubble */}
                            <div className="flex gap-3">
                                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 flex-shrink-0">
                                    <Activity size={16} />
                                </div>
                                <div className="bg-gray-100 p-4 rounded-2xl rounded-tl-none text-sm text-gray-700 max-w-[80%]">
                                    지난번 처방을 드린 후 소화는 조금 나아지셨다고 하셨는데, 요즘은 식후 더부룩함과 속쓰림은 어떤가요?
                                </div>
                            </div>
                            {/* User Bubble */}
                            <div className="flex gap-3 flex-row-reverse">
                                <div className="w-8 h-8 bg-orange-200 rounded-full flex items-center justify-center text-orange-600 flex-shrink-0">
                                    <span className="text-xs font-bold">나</span>
                                </div>
                                <div className="bg-green-500 p-4 rounded-2xl rounded-tr-none text-sm text-white max-w-[80%]">
                                    더부룩함은 줄었는데 매운 걸 먹으면 아직 쓰려요.
                                </div>
                            </div>
                            {/* AI Bubble */}
                            <div className="flex gap-3">
                                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 flex-shrink-0">
                                    <Activity size={16} />
                                </div>
                                <div className="bg-gray-100 p-4 rounded-2xl rounded-tl-none text-sm text-gray-700 max-w-[80%]">
                                    회복 중인 시기라 자극적인 음식에 예민할 수 있어요. 오늘 점심은 부드러운 식단을 추천드리고, 통증이 계속되면 꼭 진료 때 말씀해 주세요.
                                </div>
                            </div>
                        </div>

                        <div className="relative">
                            <input
                                type="text"
                                placeholder="현재 상태나 궁금한 점을 적어주세요..."
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-4 pr-12 text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
                            />
                            <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-600">
                                <Send size={18} />
                            </button>
                        </div>
                        <p className="text-[10px] text-gray-400 mt-2">AI는 진단·치료를 대신하지 않으며, 진료 전 상태 정리와 생활 안내를 돕기 위한 도구입니다.</p>
                    </div>

                    {/* History Timeline */}
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                        <h2 className="text-lg font-bold text-gray-900 mb-6">최근 히스토리 타임라인</h2>
                        <div className="space-y-6 relative pl-2">
                            {/* Vertical Line */}
                            <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-gray-100"></div>

                            {[
                                { date: "12.01 (금)", title: "초진 및 한약 처방 (15일분)", active: true },
                                { date: "11.28 (화)", title: "AI 헬스케어 자가진단 - 소화/수면", active: false },
                                { date: "11.20 (월)", title: "웹사이트 회원가입", active: false },
                            ].map((item, idx) => (
                                <div key={idx} className="relative flex gap-4 items-start">
                                    <div className={`w-6 h-6 rounded-full border-4 flex-shrink-0 z-10 bg-white ${item.active ? 'border-green-500' : 'border-gray-200'}`}>
                                        {item.active && <div className="w-2 h-2 bg-green-500 rounded-full m-1"></div>}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-900">{item.date}</p>
                                        <p className={`text-sm ${item.active ? 'text-green-600' : 'text-gray-500'}`}>{item.title}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Bottom Row: Missions */}
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-gray-900">오늘의 생활 미션</h2>
                        <span className="text-green-600 font-bold text-sm">1/3 달성</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
                            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white">
                                <CheckCircle size={16} />
                            </div>
                            <span className="font-bold text-gray-900 text-sm">따뜻한 물 한 잔 마시기</span>
                        </div>
                        <div className="flex items-center gap-3 p-4 bg-gray-50 border border-gray-100 rounded-xl">
                            <div className="w-6 h-6 border-2 border-gray-300 rounded-full"></div>
                            <span className="font-medium text-gray-600 text-sm">저녁 8시 이후 금식</span>
                        </div>
                        <div className="flex items-center gap-3 p-4 bg-gray-50 border border-gray-100 rounded-xl">
                            <div className="w-6 h-6 border-2 border-gray-300 rounded-full"></div>
                            <span className="font-medium text-gray-600 text-sm">20분 가볍게 걷기</span>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
