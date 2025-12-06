"use client";

import { useState, useRef, useEffect } from "react";
import { Send, User, Bot, ArrowLeft, Paperclip, ArrowUp, Sun, Moon, Activity, Heart, Baby } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import ConditionReport from "@/components/healthcare/ConditionReport";

type Message = {
    role: "user" | "ai";
    content: string;
};

export default function ChatInterface() {
    const searchParams = useSearchParams();
    const topic = searchParams.get("topic") || "resilience";

    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Welcome message based on topic
    useEffect(() => {
        let welcomeMsg = "안녕하세요, 죽전한의원 AI 헬스케어입니다. 궁금한 점을 체크해 보세요.";
        setMessages([{ role: "ai", content: welcomeMsg }]);
    }, [topic]);

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
            setMessages(prev => [...prev, { role: "ai", content: data.content }]);
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
        { id: "resilience", label: "회복력·면역", icon: Sun, desc: "만성 피로와 잦은 감기" },
        { id: "women", label: "여성 밸런스", icon: Moon, desc: "생리 주기부터 갱년기까지" },
        { id: "pain", label: "통증 패턴", icon: Activity, desc: "반복되는 두통, 어깨 결림" },
        { id: "digestion", label: "소화·수면 리듬", icon: Heart, desc: "더부룩한 속과 깊은 잠" },
        { id: "pregnancy", label: "임신 준비", icon: Baby, desc: "예비 부모를 위한 필수 체크" },
    ];

    return (
        <div className="min-h-screen bg-traditional-bg font-sans flex flex-col">
            {/* Header */}
            <header className="bg-traditional-bg px-6 py-4 flex items-center justify-between sticky top-0 z-20">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-traditional-accent rounded-sm flex items-center justify-center">
                        <span className="text-white text-xs font-bold">L</span>
                    </div>
                    <span className="text-lg font-bold text-traditional-text">100년 한의학 AI 헬스케어</span>
                </div>
                <div className="hidden md:flex items-center gap-6 text-sm font-medium text-traditional-subtext">
                    <Link href="#" className="hover:text-traditional-primary">AI 헬스케어</Link>
                    <Link href="#" className="hover:text-traditional-primary">이용후기</Link>
                    <Link href="#" className="hover:text-traditional-primary">문의하기</Link>
                    <Link href="#" className="px-4 py-2 bg-traditional-accent text-white rounded-full hover:bg-opacity-90 transition-colors">
                        상담예약
                    </Link>
                </div>
            </header>

            <main className="flex-1 max-w-3xl mx-auto w-full px-4 pb-20">
                {/* Hero Banner */}
                <div className="relative rounded-3xl overflow-hidden mb-8 h-48 md:h-64">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1544367563-12123d8965cd?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center"></div>
                    <div className="absolute inset-0 bg-black/30"></div>
                    <div className="relative z-10 h-full flex flex-col justify-end p-8">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
                            AI 헬스케어로 알아보는 나의 건강
                        </h2>
                    </div>
                </div>

                {/* Module List */}
                <div className="flex gap-4 overflow-x-auto pb-6 no-scrollbar mb-4">
                    {modules.map((mod) => (
                        <Link
                            key={mod.id}
                            href={`/healthcare/chat?topic=${mod.id}`}
                            className={`flex-shrink-0 w-64 p-5 rounded-xl border transition-all ${topic === mod.id
                                    ? "bg-white border-traditional-accent shadow-md ring-1 ring-traditional-accent"
                                    : "bg-white border-traditional-muted hover:border-traditional-subtext/50"
                                }`}
                        >
                            <div className="flex items-start justify-between mb-2">
                                <h3 className="font-bold text-traditional-text">{mod.label}</h3>
                                <mod.icon size={16} className="text-traditional-subtext" />
                            </div>
                            <p className="text-xs text-traditional-subtext">{mod.desc}</p>
                        </Link>
                    ))}
                </div>

                {/* Chat Area */}
                <div className="bg-traditional-bg/50 rounded-3xl p-4 min-h-[400px] space-y-6">
                    {messages.map((msg, idx) => (
                        <div
                            key={idx}
                            className={`flex items-start gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                        >
                            {/* Avatar */}
                            <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${msg.role === "ai"
                                    ? "bg-traditional-accent text-white"
                                    : "bg-white border border-traditional-muted"
                                    }`}
                            >
                                {msg.role === "ai" ? <div className="text-xs font-bold">AI</div> : <User size={20} className="text-traditional-subtext" />}
                            </div>

                            {/* Bubble */}
                            <div
                                className={`max-w-[80%] px-5 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.role === "ai"
                                    ? "bg-white text-traditional-text border border-traditional-muted rounded-tl-none"
                                    : "bg-traditional-accent text-white rounded-tr-none"
                                    }`}
                            >
                                {msg.content}
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-full bg-traditional-accent text-white flex items-center justify-center">
                                <div className="text-xs font-bold">AI</div>
                            </div>
                            <div className="bg-white px-5 py-3 rounded-2xl rounded-tl-none border border-traditional-muted shadow-sm">
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
            <div className="fixed bottom-0 left-0 right-0 bg-traditional-bg/80 backdrop-blur-md border-t border-traditional-muted/50 p-4">
                <div className="max-w-3xl mx-auto relative">
                    <form onSubmit={handleSubmit} className="relative bg-white rounded-full shadow-lg border border-traditional-muted flex items-center p-2 pl-6">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="어떤 점이 궁금하신가요?"
                            className="flex-1 bg-transparent border-none focus:ring-0 text-traditional-text placeholder:text-traditional-subtext/50"
                        />
                        <button type="button" className="p-2 text-traditional-subtext hover:text-traditional-text transition-colors">
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
        </div>
    );
}
