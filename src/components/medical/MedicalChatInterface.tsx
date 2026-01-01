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

// 액션 토큰 파싱 함수 - 모든 시스템 토큰 제거
function parseActionToken(content: string): { cleanContent: string; action: string | null } {
    // [[ACTION:SOMETHING]] 패턴 감지
    const actionRegex = /\[\[ACTION:([A-Z_]+)\]\]/g;
    const match = actionRegex.exec(content);
    const action = match ? match[1] : null;

    // 모든 시스템 토큰 제거: [[...]], [SOMETHING_TRIGGER], [SOMETHING_MODAL] 등
    let cleanContent = content
        .replace(/\[\[ACTION:[A-Z_]+\]\]/g, '')  // [[ACTION:...]]
        .replace(/\[[A-Z_]+_TRIGGER\]/g, '')     // [SOMETHING_TRIGGER]
        .replace(/\[[A-Z_]+_MODAL\]/g, '')       // [SOMETHING_MODAL]
        .replace(/\[\[?[A-Z_:]+\]?\]/g, '')      // 기타 대괄호 토큰
        .replace(/\s{2,}/g, ' ')                 // 중복 공백 정리
        .trim();

    return { cleanContent, action };
}


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
        // Initial Medical Greeting - 세인트의원 AI 상담 + 운영정보
        setMessages([{
            role: "ai",
            content: "안녕하세요, 강남아이디안과 AI 상담입니다.\n\n**📍 강남아이디안과**는 눈 건강과 시력교정을 전문으로 하는 안과입니다.\n\n이 채팅은 **진단이나 처방이 아닌 생활 습관·웰니스 점검(참고용)** 입니다.\n\n어떤 눈 건강 고민이 있으신가요? 궁금하신 점을 편하게 질문해주세요."
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

            // 액션 토큰 처리
            const { cleanContent, action } = parseActionToken(data.content);
            setMessages(prev => [...prev, { role: "ai", content: cleanContent }]);
            setTurnCount(currentTurn);

            // 액션에 따른 모달 트리거
            if (action === 'RESERVATION_MODAL') {
                setTimeout(() => setShowAppointmentModal(true), 500);
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
        <div className="flex flex-col h-screen bg-dental-bg font-sans max-w-md mx-auto shadow-2xl overflow-hidden border-x border-white/10">
            {/* Medical Header */}
            <header className="flex items-center justify-between px-4 py-3 bg-dental-bg/80 backdrop-blur-md border-b border-white/10 sticky top-0 z-10">
                <div className="flex items-center">
                    <Link href="/medical/dashboard" className="p-2 -ml-2 text-dental-subtext hover:text-white transition-colors">
                        <ArrowLeft size={24} />
                    </Link>
                    <div className="ml-2">
                        <h1 className="text-lg font-bold text-white">강남아이디안과 AI 상담</h1>
                        <p className="text-xs text-dental-primary flex items-center font-medium">
                            <span className="w-2 h-2 rounded-full bg-dental-primary mr-1"></span>
                            참고용 건강 점검 · 진단 대체 불가
                        </p>
                    </div>
                </div>
                <button className="p-2 text-dental-subtext hover:bg-white/10 rounded-full transition-colors">
                    <FileText size={20} />
                </button>
            </header>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-dental-bg">
                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        className={`flex items-start gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""
                            } animate-slide-up`}
                    >
                        {/* Avatar */}
                        <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden border-2 ${msg.role === "ai"
                                ? "border-dental-primary bg-dental-bg"
                                : "border-dental-accent bg-dental-accent"
                                }`}
                        >
                            {msg.role === "ai" ? (
                                <img src="/doctor-avatar.jpg" alt="Doctor" className="w-full h-full object-cover" />
                            ) : (
                                <User size={18} className="text-white" />
                            )}
                        </div>

                        {/* Bubble */}
                        <div className="flex flex-col gap-1 max-w-[85%]">
                            {/* AI Label */}
                            {msg.role === "ai" && (
                                <div className="text-xs text-dental-primary font-semibold">강남아이디안과</div>
                            )}
                            <div
                                className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${msg.role === "ai"
                                    ? "bg-[#1a2332] text-white border border-white/10 rounded-tl-none"
                                    : "bg-dental-primary text-white rounded-tr-none"
                                    }`}
                            >
                                {msg.imageUrl && (
                                    <img src={msg.imageUrl} alt="Uploaded" className="max-w-full rounded-lg mb-2 border border-white/20" />
                                )}
                                <div className="whitespace-pre-wrap">{msg.content}</div>
                            </div>
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex items-start gap-3 animate-pulse">
                        <div className="w-10 h-10 rounded-full border-2 border-dental-primary bg-dental-bg overflow-hidden flex items-center justify-center flex-shrink-0">
                            <img src="/doctor-avatar.jpg" alt="Doctor" className="w-full h-full object-cover" />
                        </div>
                        <div className="bg-[#1a2332] px-4 py-3 rounded-2xl rounded-tl-none border border-white/10">
                            <div className="flex gap-1">
                                <span className="w-2 h-2 bg-dental-primary/50 rounded-full animate-bounce"></span>
                                <span className="w-2 h-2 bg-dental-primary/50 rounded-full animate-bounce delay-100"></span>
                                <span className="w-2 h-2 bg-dental-primary/50 rounded-full animate-bounce delay-200"></span>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-dental-bg/80 backdrop-blur-md border-t border-white/10">
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
                        className="p-3 text-dental-subtext hover:text-dental-primary hover:bg-white/10 rounded-full transition-colors"
                        title="이미지 업로드"
                    >
                        <Plus size={20} />
                    </button>
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="증상을 상세히 입력하세요..."
                        className="w-full pl-4 pr-12 py-3 bg-[#0d1420] border border-white/10 rounded-xl text-white placeholder:text-dental-subtext/50 focus:outline-none focus:border-dental-primary focus:ring-1 focus:ring-dental-primary transition-all"
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !input.trim()}
                        className="absolute right-2 p-2 bg-dental-primary text-white rounded-lg hover:bg-dental-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <Send size={18} />
                    </button>
                </form>
            </div>

            {/* Appointment Modal */}
            {showAppointmentModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-[#1a2332] rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-white/10">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-dental-primary/20 rounded-full flex items-center justify-center">
                                <Calendar className="w-6 h-6 text-dental-primary" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-white">
                                    {turnCount === 5 ? "상담 결과가 정리되었습니다" : "내원 진료를 권합니다"}
                                </h3>
                                <p className="text-sm text-dental-subtext">
                                    정확한 진단을 위해 방문하세요
                                </p>
                            </div>
                        </div>

                        <p className="text-sm text-dental-subtext mb-6">
                            {turnCount === 5
                                ? "지금까지 수집된 정보를 바탕으로 가능성 있는 원인을 분석했습니다. 정확한 진단과 치료를 위해 병원 방문을 권장드립니다."
                                : "증상을 더 자세히 살펴보려면 직접 진료가 필요해 보입니다. 병원에서 정확한 진단을 받아보세요."
                            }
                        </p>

                        <div className="space-y-3">
                            <button
                                onClick={handleBookAppointment}
                                className="w-full py-3 bg-dental-primary text-white rounded-xl font-semibold hover:bg-dental-accent transition-colors"
                            >
                                예약하러 가기
                            </button>
                            <button
                                onClick={() => setShowAppointmentModal(false)}
                                className="w-full py-3 text-dental-subtext hover:text-white transition-colors"
                            >
                                계속 상담하기
                            </button>
                        </div>

                        <p className="text-xs text-dental-subtext mt-4 text-center">
                            ※ AI 상담은 참고용이며 의료 진단을 대체하지 않습니다.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}

