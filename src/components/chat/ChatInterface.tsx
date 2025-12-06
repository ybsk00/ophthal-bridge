"use client";

import { useState, useRef, useEffect } from "react";
import { Send, User, Bot, ArrowLeft } from "lucide-react";
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
        let welcomeMsg = "안녕하세요! 100년 전통 죽전한의원의 노하우가 담긴 AI 헬스케어입니다. 오늘 컨디션은 어떠신가요?";

        switch (topic) {
            case "women":
                welcomeMsg = "안녕하세요! 여성의 건강한 리듬을 찾아드리는 AI 헬스케어입니다. 생리통, 갱년기, 기분 변화 등 고민되는 점을 말씀해주세요.";
                break;
            case "pain":
                welcomeMsg = "안녕하세요! 반복되는 통증의 원인을 함께 찾는 AI 헬스케어입니다. 어디가 언제부터 아프신지 편하게 말씀해주세요.";
                break;
            case "digestion":
                welcomeMsg = "안녕하세요! 속이 편안해야 잠도 잘 옵니다. 소화나 수면과 관련해서 불편하신 점이 있으신가요?";
                break;
            case "pregnancy":
                welcomeMsg = "안녕하세요! 건강한 임신 준비를 돕는 AI 헬스케어입니다. 부부의 건강 상태나 궁금한 점을 말씀해주세요.";
                break;
            default: // resilience
                welcomeMsg = "안녕하세요! 100년 전통 죽전한의원의 노하우가 담긴 AI 헬스케어입니다. 피로감이나 면역력 저하로 고민이신가요?";
        }

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

    // Report Logic
    const [showReport, setShowReport] = useState(false);
    const [reportData, setReportData] = useState<any>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const handleFinish = async () => {
        if (messages.length < 2) {
            alert("최소 2마디 이상 대화를 나누신 후 분석할 수 있습니다.");
            return;
        }

        setIsAnalyzing(true);
        try {
            const response = await fetch("/api/summary", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ history: messages, topic }),
            });

            if (!response.ok) throw new Error("Analysis failed");

            const data = await response.json();
            setReportData(data);
            setShowReport(true);
        } catch (error) {
            console.error("Analysis Error:", error);
            alert("분석 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    if (showReport && reportData) {
        return <ConditionReport result={reportData} onRetry={() => {
            setShowReport(false);
            setMessages([]);
            setReportData(null);
        }} />;
    }

    return (
        <div className="flex flex-col h-screen bg-traditional-bg font-sans max-w-md mx-auto shadow-2xl overflow-hidden border-x border-traditional-muted">
            {/* Header */}
            <header className="flex items-center justify-between px-4 py-3 bg-white/80 backdrop-blur-md border-b border-traditional-muted sticky top-0 z-10">
                <div className="flex items-center">
                    <Link href="/" className="p-2 -ml-2 text-traditional-subtext hover:text-traditional-text transition-colors">
                        <ArrowLeft size={24} />
                    </Link>
                    <div className="ml-2">
                        <h1 className="text-lg font-bold text-traditional-text">AI 헬스케어 상담</h1>
                        <p className="text-xs text-traditional-primary flex items-center">
                            <span className="w-2 h-2 rounded-full bg-green-500 mr-1 animate-pulse"></span>
                            실시간 답변 중
                        </p>
                    </div>
                </div>
                {messages.length >= 2 && (
                    <button
                        onClick={handleFinish}
                        disabled={isAnalyzing}
                        className="text-xs font-bold bg-traditional-secondary text-white px-3 py-1.5 rounded-full hover:bg-traditional-secondary/90 transition-colors disabled:opacity-50"
                    >
                        {isAnalyzing ? "분석중..." : "결과보기"}
                    </button>
                )}
            </header>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-[url('/texture-hanji.png')] bg-repeat">
                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        className={`flex items-start gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""
                            } animate-slide-up`}
                    >
                        {/* Avatar */}
                        <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === "ai"
                                    ? "bg-traditional-primary text-white"
                                    : "bg-traditional-muted text-traditional-subtext"
                                }`}
                        >
                            {msg.role === "ai" ? <Bot size={18} /> : <User size={18} />}
                        </div>

                        {/* Bubble */}
                        <div
                            className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.role === "ai"
                                    ? "bg-white text-traditional-text border border-traditional-muted rounded-tl-none"
                                    : "bg-traditional-primary text-white rounded-tr-none"
                                }`}
                        >
                            {msg.content}
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex items-start gap-3 animate-pulse">
                        <div className="w-8 h-8 rounded-full bg-traditional-primary text-white flex items-center justify-center">
                            <Bot size={18} />
                        </div>
                        <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-none border border-traditional-muted">
                            <div className="flex gap-1">
                                <span className="w-2 h-2 bg-traditional-subtext/30 rounded-full animate-bounce"></span>
                                <span className="w-2 h-2 bg-traditional-subtext/30 rounded-full animate-bounce delay-100"></span>
                                <span className="w-2 h-2 bg-traditional-subtext/30 rounded-full animate-bounce delay-200"></span>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-traditional-muted">
                <form onSubmit={handleSubmit} className="relative flex items-center">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="증상을 입력해주세요..."
                        className="w-full pl-4 pr-12 py-3 bg-traditional-muted/30 border border-traditional-muted rounded-full focus:outline-none focus:border-traditional-primary focus:ring-1 focus:ring-traditional-primary transition-all placeholder:text-traditional-subtext/50 text-traditional-text"
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !input.trim()}
                        className="absolute right-2 p-2 bg-traditional-primary text-white rounded-full hover:bg-traditional-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <Send size={18} />
                    </button>
                </form>
                <p className="text-[10px] text-center text-traditional-subtext/50 mt-2">
                    본 서비스는 의학적 진단을 대체하지 않습니다. 응급 시 119에 연락하세요.
                </p>
            </div>
        </div>
    );
}
