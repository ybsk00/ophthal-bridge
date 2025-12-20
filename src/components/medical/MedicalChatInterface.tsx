"use client";

import { useState, useRef, useEffect } from "react";
import { Send, User, Bot, ArrowLeft, FileText, Plus, Calendar } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Message = {
    role: "user" | "ai";
    content: string;
    imageUrl?: string;
};

export default function MedicalChatInterface() {
    const router = useRouter();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [turnCount, setTurnCount] = useState(0);
    const [showAppointmentModal, setShowAppointmentModal] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        // Initial Medical Greeting - 평촌이생각치과 AI 상담
        setMessages([{
            role: "ai",
            content: "안녕하세요, 평촌이생각치과 AI 상담입니다.\n\n이 채팅은 **진단이나 처방이 아닌 생활 습관·웰니스 점검(참고용)** 입니다. 정확한 상태 판단과 치료 여부는 **의료진 상담을 통해 확인**이 필요합니다.\n\n지금 겪고 계신 불편한 증상을 말씀해 주세요. 언제부터 시작되었는지, 어디가 가장 불편하신지 편하게 이야기해 주세요."
        }]);
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput("");
        setMessages(prev => [...prev, { role: "user", content: userMessage }]);
        setIsLoading(true);

        try {
            const currentTurn = turnCount + 1;

            const response = await fetch("/api/medical/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: userMessage,
                    history: messages,
                    turnCount: currentTurn,
                }),
            });

            if (!response.ok) throw new Error("Failed to send message");

            const data = await response.json();
            setMessages(prev => [...prev, { role: "ai", content: data.content }]);
            setTurnCount(currentTurn);

            // Show appointment modal at turn 5 and every turn after
            if (currentTurn >= 5) {
                setTimeout(() => setShowAppointmentModal(true), 1500);
            }
        } catch (error) {
            console.error("Error:", error);
            setMessages(prev => [...prev, { role: "ai", content: "죄송합니다. 시스템 오류가 발생했습니다. 잠시 후 다시 시도해주세요." }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64String = reader.result as string;
            setMessages(prev => [...prev, {
                role: "user",
                content: "이미지를 전송했습니다.",
                imageUrl: base64String
            }]);
            setIsLoading(true);

            try {
                const response = await fetch("/api/medical/analyze-image", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        image: base64String.split(",")[1],
                        mimeType: file.type,
                        history: messages,
                        turnCount: turnCount,
                    }),
                });

                if (!response.ok) throw new Error("Analysis failed");

                const data = await response.json();
                setMessages(prev => [...prev, { role: "ai", content: data.content }]);
            } catch (error) {
                console.error("Error:", error);
                setMessages(prev => [...prev, { role: "ai", content: "이미지 분석 중 오류가 발생했습니다." }]);
            } finally {
                setIsLoading(false);
            }
        };
        reader.readAsDataURL(file);
    };

    const handleBookAppointment = () => {
        router.push('/medical/appointments');
    };

    return (
        <div className="flex flex-col h-screen bg-slate-50 font-sans max-w-md mx-auto shadow-2xl overflow-hidden border-x border-slate-200">
            {/* Medical Header */}
            <header className="flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
                <div className="flex items-center">
                    <Link href="/medical/dashboard" className="p-2 -ml-2 text-slate-500 hover:text-slate-800 transition-colors">
                        <ArrowLeft size={24} />
                    </Link>
                    <div className="ml-2">
                        <h1 className="text-lg font-bold text-slate-800">평촌이생각치과 AI 상담</h1>
                        <p className="text-xs text-blue-600 flex items-center font-medium">
                            <span className="w-2 h-2 rounded-full bg-blue-600 mr-1"></span>
                            참고용 건강 점검 · 진단 대체 불가
                        </p>
                    </div>
                </div>
                <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
                    <FileText size={20} />
                </button>
            </header>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-slate-50">
                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        className={`flex items-start gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""
                            } animate-slide-up`}
                    >
                        {/* Avatar */}
                        <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${msg.role === "ai"
                                ? "bg-emerald-700 text-white"
                                : "bg-slate-200 text-slate-500"
                                }`}
                        >
                            {msg.role === "ai" ? <Bot size={18} /> : <User size={18} />}
                        </div>

                        {/* Bubble */}
                        <div
                            className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.role === "ai"
                                ? "bg-white text-slate-800 border border-slate-200 rounded-tl-none"
                                : "bg-emerald-700 text-white rounded-tr-none"
                                }`}
                        >
                            {/* 평촌이생각치과 AI Label */}
                            {msg.role === "ai" && (
                                <div className="text-xs text-emerald-700 font-semibold mb-1">평촌이생각치과</div>
                            )}
                            {msg.imageUrl && (
                                <img src={msg.imageUrl} alt="Uploaded" className="max-w-full rounded-lg mb-2 border border-white/20" />
                            )}
                            <div className="whitespace-pre-wrap">{msg.content}</div>
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex items-start gap-3 animate-pulse">
                        <div className="w-8 h-8 rounded-full bg-emerald-700 text-white flex items-center justify-center">
                            <Bot size={18} />
                        </div>
                        <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-none border border-slate-200 shadow-sm">
                            <div className="flex gap-1">
                                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
                                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-100"></span>
                                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200"></span>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-slate-200">
                <form onSubmit={handleSubmit} className="relative flex items-center gap-2">
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageUpload}
                    />
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="p-3 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-full transition-colors"
                        title="이미지 업로드"
                    >
                        <Plus size={20} />
                    </button>
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="증상을 상세히 입력하세요..."
                        className="w-full pl-4 pr-12 py-3 bg-slate-100 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-slate-400 text-slate-800"
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !input.trim()}
                        className="absolute right-2 p-2 bg-emerald-700 text-white rounded-lg hover:bg-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                    >
                        <Send size={18} />
                    </button>
                </form>
            </div>

            {/* Appointment Modal */}
            {showAppointmentModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                                <Calendar className="w-6 h-6 text-emerald-700" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-slate-800">
                                    {turnCount === 5 ? "상담 결과가 정리되었습니다" : "내원 진료를 권합니다"}
                                </h3>
                                <p className="text-sm text-slate-500">
                                    정확한 진단을 위해 방문하세요
                                </p>
                            </div>
                        </div>

                        <p className="text-sm text-slate-600 mb-6">
                            {turnCount === 5
                                ? "지금까지 수집된 정보를 바탕으로 가능성 있는 원인을 분석했습니다. 정확한 진단과 치료를 위해 병원 방문을 권장드립니다."
                                : "증상을 더 자세히 살펴보려면 직접 진료가 필요해 보입니다. 병원에서 맥진과 함께 정확한 진단을 받아보세요."
                            }
                        </p>

                        <div className="space-y-3">
                            <button
                                onClick={handleBookAppointment}
                                className="w-full py-3 bg-emerald-700 text-white rounded-xl font-semibold hover:bg-emerald-800 transition-colors"
                            >
                                예약하러 가기
                            </button>
                            <button
                                onClick={() => setShowAppointmentModal(false)}
                                className="w-full py-3 text-slate-500 hover:text-slate-700 transition-colors"
                            >
                                계속 상담하기
                            </button>
                        </div>

                        <p className="text-xs text-slate-400 mt-4 text-center">
                            ※ AI 상담은 참고용이며 의료 진단을 대체하지 않습니다.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
