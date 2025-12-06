"use client";

import { useState, useRef, useEffect } from "react";
import { Send, User, Bot, ArrowLeft, Paperclip, ArrowUp, Sun, Moon, Activity, Heart, Baby, Calendar } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import ConditionReport from "@/components/healthcare/ConditionReport";

type Message = {
    role: "user" | "ai";
    content: string;
};

type ChatInterfaceProps = {
    isEmbedded?: boolean;
    isLoggedIn?: boolean;
};

export default function ChatInterface(props: ChatInterfaceProps) {
    const searchParams = useSearchParams();
    const topic = searchParams.get("topic") || "resilience";

    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [turnCount, setTurnCount] = useState(0);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [loginModalContent, setLoginModalContent] = useState({
        title: "상세한 상담이 필요하신가요?",
        desc: "더 정확한 건강 분석과 맞춤형 조언을 위해<br />로그인이 필요합니다."
    });
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Welcome message based on topic
    useEffect(() => {
        let welcomeMsg = "안녕하세요, 100년 한의학 AI 헬스케어입니다. 궁금한 점을 체크해 보세요.";
        setMessages([{ role: "ai", content: welcomeMsg }]);
    }, [topic]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleImageClick = () => {
        if (props.isLoggedIn) return; // Skip if logged in
        setLoginModalContent({
            title: "이미지 분석 기능",
            desc: "이미지 분석을 통한 건강 상담은<br />로그인 후 이용 가능합니다."
        });
        setShowLoginModal(true);
    };

    const [showReservationModal, setShowReservationModal] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput("");

        const newTurnCount = turnCount + 1;
        setTurnCount(newTurnCount);
        setMessages(prev => [...prev, { role: "user", content: userMessage }]);

        // Check for login modal trigger (3, 5, 7, 10 turns) - Only if NOT logged in
        if (!props.isLoggedIn && [3, 5, 7, 10].includes(newTurnCount)) {
            setLoginModalContent({
                title: "상세한 상담이 필요하신가요?",
                desc: "더 정확한 건강 분석과 맞춤형 조언을 위해<br />로그인이 필요합니다."
            });
            setShowLoginModal(true);
        }

        setIsLoading(true);

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: userMessage,
                    history: messages,
                    topic
                }),
            });

            if (!response.ok) throw new Error("Failed to send message");

            const data = await response.json();
            let aiContent = data.content;

            // Check for reservation trigger
            if (aiContent.includes("[RESERVATION_TRIGGER]")) {
                aiContent = aiContent.replace("[RESERVATION_TRIGGER]", "").trim();
                setShowReservationModal(true);
            }

            setMessages(prev => [...prev, { role: "ai", content: aiContent }]);

            // Check for forced login trigger from AI response - Only if NOT logged in
            if (!props.isLoggedIn && data.content.includes("로그인이 필요합니다")) {
                setLoginModalContent({
                    title: "상세한 상담이 필요하신가요?",
                    desc: "더 정확한 건강 분석과 맞춤형 조언을 위해<br />로그인이 필요합니다."
                });
                setShowLoginModal(true);
            }
        } catch (error) {
            console.error("Error:", error);
            setMessages(prev => [...prev, { role: "ai", content: "죄송합니다. 잠시 문제가 발생했습니다. 다시 시도해주세요." }]);
        } finally {
            setIsLoading(false);
        }
    };

    // Report Logic (Simplified for design update, keeping functionality)
    const [showReport, setShowReport] = useState(false);
    const [reportData, setReportData] = useState<any>(null);

    if (showReport && reportData) {
        return <ConditionReport result={reportData} onRetry={() => setShowReport(false)} />;
    }

    const modules = [
        {
            id: "resilience",
            label: "회복력·면역",
            desc: "만성 피로, 잦은 감기",
            theme: "from-amber-500/20 to-orange-600/20"
        },
        {
            id: "women",
            label: "여성 밸런스",
            desc: "생리불순, 갱년기 케어",
            theme: "from-rose-400/20 to-pink-600/20"
        },
        {
            id: "pain",
            label: "통증 패턴",
            desc: "만성 두통, 어깨 통증",
            theme: "from-blue-400/20 to-slate-600/20"
        },
        {
            id: "digestion",
            label: "소화·수면 리듬",
            desc: "소화불량, 수면장애",
            theme: "from-emerald-400/20 to-teal-600/20"
        },
        {
            id: "pregnancy",
            label: "임신 준비",
            desc: "난임, 건강한 임신",
            theme: "from-violet-400/20 to-purple-600/20"
        },
    ];

    return (
        <div className={`${props.isEmbedded ? "h-full" : "min-h-screen"} bg-traditional-bg font-sans flex flex-col`}>
            {/* Header - Hidden if embedded */}
            {!props.isEmbedded && (
                <header className="bg-traditional-bg px-6 py-4 flex items-center justify-between sticky top-0 z-20">
                    <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                        <div className="w-6 h-6 bg-traditional-accent rounded-sm flex items-center justify-center">
                            <span className="text-white text-xs font-bold">L</span>
                        </div>
                        <span className="text-lg font-bold text-traditional-text">100년 한의학 AI 헬스케어</span>
                    </Link>
                    <div className="hidden md:flex items-center gap-6 text-sm font-medium text-traditional-subtext">
                        <Link href="/login" className="px-5 py-2 bg-traditional-accent text-white rounded-full hover:bg-opacity-90 transition-colors shadow-md">
                            로그인
                        </Link>
                    </div>
                </header>
            )}

            <main className={`flex-1 w-full mx-auto ${props.isEmbedded ? "flex flex-col overflow-hidden p-0" : "max-w-4xl px-4 pb-20"}`}>
                {/* Hero Banner - Hidden if embedded */}
                {!props.isEmbedded && (
                    <div className="relative rounded-3xl overflow-hidden mb-6 h-[300px] md:h-[450px] shadow-lg group">
                        <div className="absolute inset-0 bg-[url('/images/herbal-bg.png')] bg-cover bg-center transition-transform duration-700 group-hover:scale-105"></div>
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]"></div>

                        <div className="relative z-10 h-full flex flex-col justify-end p-6">
                            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 drop-shadow-md">
                                AI 헬스케어로 알아보는 나의 건강
                            </h2>
                            <p className="text-white/90 text-sm md:text-base font-medium mb-10">
                                전통의 지혜와 현대 기술의 만남
                            </p>

                            {/* Module List (Overlay on Hero) */}
                            <div className="grid grid-cols-5 gap-2">
                                {modules.map((mod) => (
                                    <Link
                                        key={mod.id}
                                        href={`/healthcare/chat?topic=${mod.id}`}
                                        className={`flex flex-col items-center justify-center p-2.5 rounded-xl border backdrop-blur-md transition-all h-full text-center ${topic === mod.id
                                            ? "bg-white/95 border-white shadow-lg scale-105 z-10"
                                            : "bg-white/10 border-white/20 hover:bg-white/20 hover:border-white/40"
                                            }`}
                                    >
                                        <h3 className={`font-bold text-sm leading-tight mb-1 ${topic === mod.id ? "text-gray-900" : "text-white"}`}>
                                            {mod.label}
                                        </h3>
                                        <p className={`text-xs leading-tight line-clamp-1 ${topic === mod.id ? "text-gray-600" : "text-white/80"}`}>
                                            {mod.desc}
                                        </p>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Chat Area */}
                <div className={`bg-indigo-50/50 border border-indigo-100 rounded-3xl p-6 space-y-6 shadow-inner ${props.isEmbedded ? "flex-1 overflow-y-auto rounded-none border-x-0 border-t-0" : "min-h-[400px]"}`}>
                    {messages.map((msg, idx) => (
                        <div
                            key={idx}
                            className={`flex items-start gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                        >
                            {/* Avatar */}
                            <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${msg.role === "ai"
                                    ? "bg-white text-traditional-accent border border-indigo-100"
                                    : "bg-teal-100 text-teal-600"
                                    }`}
                            >
                                {msg.role === "ai" ? <div className="text-xs font-bold">AI</div> : <User size={20} />}
                            </div>

                            {/* Bubble */}
                            <div
                                className={`max-w-[80%] px-5 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.role === "ai"
                                    ? "bg-white text-traditional-text border border-indigo-100 rounded-tl-none"
                                    : "bg-[#E0F2F1] text-teal-900 rounded-tr-none border border-teal-100"
                                    }`}
                            >
                                {msg.content}
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-full bg-white text-traditional-accent border border-indigo-100 flex items-center justify-center shadow-sm">
                                <div className="text-xs font-bold">AI</div>
                            </div>
                            <div className="bg-white px-5 py-3 rounded-2xl rounded-tl-none border border-indigo-100 shadow-sm">
                                <div className="flex gap-1">
                                    <span className="w-1.5 h-1.5 bg-traditional-subtext/40 rounded-full animate-bounce"></span>
                                    <span className="w-1.5 h-1.5 bg-traditional-subtext/40 rounded-full animate-bounce delay-100"></span>
                                    <span className="w-1.5 h-1.5 bg-traditional-subtext/40 rounded-full animate-bounce delay-200"></span>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </main>

            {/* Input Area */}
            <div className={`${props.isEmbedded ? "relative bg-white border-t border-gray-100" : "fixed bottom-0 left-0 right-0 bg-traditional-bg/80 backdrop-blur-md border-t border-traditional-muted/50"} p-4`}>
                <div className={`${props.isEmbedded ? "w-full" : "max-w-3xl mx-auto"} relative`}>
                    <form onSubmit={handleSubmit} className="relative bg-white rounded-full shadow-lg border border-traditional-muted flex items-center p-2 pl-6">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="어떤 점이 궁금하신가요?"
                            className="flex-1 bg-transparent border-none focus:ring-0 text-traditional-text placeholder:text-traditional-subtext/50"
                        />
                        <button
                            type="button"
                            onClick={handleImageClick}
                            className="p-2 text-traditional-subtext hover:text-traditional-text transition-colors"
                        >
                            <Paperclip size={20} />
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading || !input.trim()}
                            className="p-2 bg-traditional-accent text-white rounded-full hover:bg-opacity-90 transition-colors disabled:opacity-50 ml-2"
                        >
                            <ArrowUp size={20} />
                        </button>
                    </form>
                </div>
            </div>

            {/* Login Modal */}
            {showLoginModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center transform transition-all scale-100">
                        <div className="w-12 h-12 bg-traditional-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <User className="w-6 h-6 text-traditional-accent" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">
                            {loginModalContent.title}
                        </h3>
                        <p
                            className="text-gray-600 text-sm mb-6 leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: loginModalContent.desc }}
                        />
                        <div className="flex flex-col gap-3">
                            <Link
                                href="/login"
                                className="w-full py-3 bg-traditional-accent text-white rounded-xl font-medium hover:bg-opacity-90 transition-colors"
                            >
                                로그인하고 계속하기
                            </Link>
                            <button
                                onClick={() => setShowLoginModal(false)}
                                className="w-full py-3 bg-gray-100 text-gray-600 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                            >
                                나중에 하기
                            </button>
                        </div>
                    </div>
                </div>
            {/* Reservation Modal */}
            {showReservationModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center transform transition-all scale-100">
                        <div className="w-12 h-12 bg-traditional-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Calendar className="w-6 h-6 text-traditional-accent" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">
                            진료 예약 안내
                        </h3>
                        <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                            죽전한의원의 전문적인 진료를 위해<br />
                            예약 페이지로 이동하시겠습니까?
                        </p>
                        <div className="flex flex-col gap-3">
                            <Link
                                href="/medical/care" // Assuming this is the reservation or dashboard page
                                className="w-full py-3 bg-traditional-accent text-white rounded-xl font-medium hover:bg-opacity-90 transition-colors"
                                onClick={() => setShowReservationModal(false)}
                            >
                                예, 예약하겠습니다
                            </Link>
                            <button
                                onClick={() => setShowReservationModal(false)}
                                className="w-full py-3 bg-gray-100 text-gray-600 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                            >
                                아니오, 괜찮습니다
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
