"use client";

import { useState, useRef, useEffect } from "react";
import { User, ArrowUp, Paperclip } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import ReservationModal from "@/components/medical/ReservationModal";
import MedicalInfoPanel from "@/components/medical/MedicalInfoPanel";
import SymptomCheckModal from "@/components/medical/SymptomCheckModal";
import FileUploadModal from "@/components/medical/FileUploadModal";
import MedicationModal from "@/components/medical/MedicationModal";
import SafetyBadge from "@/components/medical/SafetyBadge";
import { useMarketingTracker } from "@/hooks/useMarketingTracker";

type Message = {
    role: "user" | "ai";
    content: string;
};

type ActionType = 'RESERVATION_MODAL' | 'DOCTOR_INTRO_MODAL' | 'EVIDENCE_MODAL' | null;

type ChatInterfaceProps = {
    isEmbedded?: boolean;
    isLoggedIn?: boolean;
    mode?: 'healthcare' | 'medical';
    externalMessage?: string;
    onExternalMessageSent?: () => void;
    // 새로운 액션 콜백
    onAction?: (action: ActionType, data?: any) => void;
    onTabHighlight?: (tabs: ('review' | 'map')[]) => void;
};

export default function ChatInterface(props: ChatInterfaceProps) {
    const searchParams = useSearchParams();
    const topic = searchParams.get("topic") || "recovery";
    const { track } = useMarketingTracker();

    // Track chat start on mount
    useEffect(() => {
        track('f1_chat_start', { metadata: { topic, mode: props.mode || 'healthcare' } });
    }, []);

    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [turnCount, setTurnCount] = useState(0);
    const [askedQuestionCount, setAskedQuestionCount] = useState(0); // 질문 카운터
    const [currentTrack, setCurrentTrack] = useState<string | null>(null); // 트랙 유지
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [loginModalContent, setLoginModalContent] = useState({
        title: "상세한 상담이 필요하신가요?",
        desc: "더 정확한 건강 분석과 맞춤형 조언을 위해<br />로그인이 필요합니다."
    });
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [showReservationModal, setShowReservationModal] = useState(false);

    // Modal states for quick actions
    const [showSymptomCheckModal, setShowSymptomCheckModal] = useState(false);
    const [showMedicationModal, setShowMedicationModal] = useState(false);
    const [showFileUploadModal, setShowFileUploadModal] = useState(false);

    // Modules Definition (Rich UI용)
    const modules = [
        {
            id: "digestion",
            label: "소화 리듬",
            desc: "소화불량, 배변 체크",
            theme: "from-emerald-400/20 to-teal-600/20"
        },
        {
            id: "cognitive",
            label: "인지 건강",
            desc: "기억력, 주의력 테스트",
            theme: "from-purple-400/20 to-violet-600/20"
        },
        {
            id: "stress-sleep",
            label: "스트레스·수면",
            desc: "수면, 피로 패턴 체크",
            theme: "from-blue-400/20 to-slate-600/20"
        },
        {
            id: "vascular",
            label: "혈관·생활습관",
            desc: "운동, 식습관 체크",
            theme: "from-amber-500/20 to-orange-600/20"
        },
        {
            id: "women",
            label: "여성 컨디션",
            desc: "주기, PMS 체크",
            theme: "from-rose-400/20 to-pink-600/20"
        },
    ];

    // 초기 메시지 설정 (자유 텍스트 입력용)
    useEffect(() => {
        if (props.mode === 'medical') {
            // 로그인 후 - 메디컬 채팅
            setMessages([{
                role: "ai",
                content: "안녕하세요, 위담한방병원 AI 상담입니다.\n\n이 채팅은 **진단이나 처방이 아닌 생활 습관·웰니스 점검(참고용)** 입니다.\n\n지금 겪고 계신 불편한 증상을 말씀해 주세요. 언제부터 시작되었는지, 어디가 가장 불편하신지 편하게 이야기해 주세요."
            }]);
        } else {
            // 로그인 전 - 헬스케어 채팅 (모듈별 인사말)
            const currentModule = modules.find(m => m.id === topic);
            const moduleName = currentModule ? currentModule.label : "건강 가이드";

            // 모듈별 맞춤형 초기 질문 설정
            let initialQuestion = "";
            switch (topic) {
                case "digestion":
                    initialQuestion = "식사가 규칙적인지, 과식은 자주 하는지 등 식습관에 대해 편하게 알려주세요.";
                    break;
                case "cognitive":
                    initialQuestion = "최근 깜빡하는 일이 잦거나, 집중하기 어려우신 적이 있는지 편하게 알려주세요.";
                    break;
                case "stress-sleep":
                    initialQuestion = "잠은 푹 주무시는지, 평소 스트레스는 많이 받으시는지 편하게 알려주세요.";
                    break;
                case "vascular":
                    initialQuestion = "평소 운동은 자주 하시는지, 기름진 음식이나 짠 음식은 자주 드시는지 알려주세요.";
                    break;
                case "women":
                    initialQuestion = "월경 주기가 규칙적인지, 그날의 컨디션 변화는 어떠신지 편하게 알려주세요.";
                    break;
                default:
                    initialQuestion = "식사, 수면, 운동 등 평소 생활 습관에 대해 편하게 알려주세요.";
            }

            setMessages([{
                role: "ai",
                content: `안녕하세요! **${moduleName}** 체크를 도와드릴 위담 건강가이드입니다. 🌿\n\n이 대화는 **진단이 아닌 생활 리듬 점검(참고용)** 입니다.\n\n${initialQuestion}`
            }]);
        }
        setTurnCount(0);
    }, [topic, props.mode]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // 외부 메시지 자동 발송 (증상정리 요약 등)
    useEffect(() => {
        if (props.externalMessage && !isLoading) {
            sendExternalMessage(props.externalMessage);
        }
    }, [props.externalMessage]);

    const sendExternalMessage = async (message: string) => {
        // 사용자 메시지로 추가
        setMessages(prev => [...prev, { role: "user", content: message }]);
        setIsLoading(true);

        try {
            const response = await fetch(props.isLoggedIn ? "/api/medical/chat" : "/api/healthcare/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: message,
                    history: messages,
                    turnCount: turnCount,
                    topic: topic,
                }),
            });

            if (!response.ok) throw new Error("Failed to send message");

            const data = await response.json();
            let aiContent = data.content;

            if (aiContent.includes("[RESERVATION_TRIGGER]")) {
                aiContent = aiContent.replace("[RESERVATION_TRIGGER]", "").trim();
                setShowReservationModal(true);
            }

            setMessages(prev => [...prev, { role: "ai", content: aiContent }]);
            props.onExternalMessageSent?.();
        } catch (error) {
            console.error("Error:", error);
            setMessages(prev => [...prev, { role: "ai", content: "죄송합니다. 잠시 문제가 발생했습니다." }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleImageClick = () => {
        if (props.isLoggedIn) return;
        setLoginModalContent({
            title: "이미지 분석 기능",
            desc: "이미지 분석을 통한 건강 상담은<br />로그인 후 이용 가능합니다."
        });
        setShowLoginModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput("");

        const newTurnCount = turnCount + 1;
        setTurnCount(newTurnCount);
        setMessages(prev => [...prev, { role: "user", content: userMessage }]);

        setIsLoading(true);

        try {
            // 로그인 상태에 따라 다른 API 사용
            const apiEndpoint = props.isLoggedIn ? "/api/medical/chat" : "/api/healthcare/chat";

            const response = await fetch(apiEndpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: userMessage,
                    history: messages,
                    turnCount: turnCount,
                    topic: topic,
                    track: currentTrack, // 트랙 유지
                    askedQuestionCount: askedQuestionCount, // 질문 카운터 전달
                }),
            });

            if (!response.ok) throw new Error("Failed to send message");

            const data = await response.json();
            const aiContent = data.content;

            // 상태 업데이트 (새 API 응답 구조)
            if (data.track) setCurrentTrack(data.track);
            if (typeof data.askedQuestionCount === 'number') {
                setAskedQuestionCount(data.askedQuestionCount);
            }

            // 메시지 추가
            setMessages(prev => [...prev, { role: "ai", content: aiContent }]);

            // 액션 처리 (모달 트리거)
            if (data.action) {
                if (data.action === 'RESERVATION_MODAL') {
                    setShowReservationModal(true);
                } else {
                    // DoctorIntroModal, EvidenceModal은 부모 컴포넌트로 전달
                    props.onAction?.(data.action, {
                        doctorsData: data.doctorsData,
                        evidenceData: data.evidenceData
                    });
                }
            }

            // 탭 하이라이트 처리
            if (data.highlightTabs && data.highlightTabs.length > 0) {
                props.onTabHighlight?.(data.highlightTabs);
            }

            // 레드플래그 처리 (이미 API에서 응급 메시지로 대체됨)
            if (data.isRedFlag) {
                // 추가 입력 차단
                setTurnCount(10);
            }

            // 로그인 필요 응답 확인 (헬스케어 모드)
            if (!props.isLoggedIn && data.requireLogin) {
                if (data.isSymptomTrigger || data.isHardStop) {
                    setTimeout(() => {
                        setLoginModalContent({
                            title: data.isSymptomTrigger ? "의료진 상담이 필요합니다 🏥" : "상담이 완료되었습니다 🎉",
                            desc: data.isSymptomTrigger
                                ? "말씀하신 증상은 전문적인 진단이 필요할 수 있습니다.<br />로그인 후 의료진에게 정확한 상담을 받아보세요."
                                : "더 자세한 건강 분석과 맞춤 조언을 위해<br />로그인이 필요합니다."
                        });
                        setShowLoginModal(true);
                        if (data.isSymptomTrigger) {
                            setTurnCount(5);
                        }
                    }, 500);
                } else {
                    setTimeout(() => {
                        setLoginModalContent({
                            title: "더 자세한 상담을 받아보세요! 🌿",
                            desc: "정확한 건강 분석과 맞춤형 조언을 위해<br />로그인이 필요합니다."
                        });
                        setShowLoginModal(true);
                    }, 1000);
                }
            }
        } catch (error) {
            console.error("Error:", error);
            setMessages(prev => [...prev, { role: "ai", content: "죄송합니다. 잠시 문제가 발생했습니다. 다시 시도해주세요." }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={`${props.isEmbedded ? "h-full" : "min-h-screen"} bg-traditional-bg font-sans flex flex-col selection:bg-traditional-accent selection:text-white`}>
            {/* Header - Hidden if embedded */}
            {!props.isEmbedded && (
                <header className="bg-white/80 backdrop-blur-md border-b border-traditional-muted/50 px-6 py-4 flex items-center justify-between sticky top-0 z-50 transition-all duration-300">
                    <Link href="/" className="flex items-center gap-3 group cursor-pointer">
                        <img
                            src="/logo_new.png"
                            alt="위담 건강가이드 챗"
                            className="h-[72px] w-auto object-contain"
                        />
                    </Link>
                    <div className="hidden md:flex items-center gap-6 text-sm font-medium text-traditional-subtext">
                        <Link href="/login" className="px-6 py-2 bg-traditional-primary text-white text-sm font-medium rounded-full hover:bg-traditional-accent hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
                            로그인
                        </Link>
                    </div>
                </header>
            )}

            <main className={`flex-1 w-full mx-auto ${props.isEmbedded ? "flex flex-col overflow-hidden p-0" : "max-w-5xl px-4 pb-20 pt-6"}`}>
                {/* Logged In: Info Panel | Logged Out: Hero Banner */}
                {!props.isEmbedded && (
                    props.isLoggedIn ? (
                        <MedicalInfoPanel
                            onOpenSymptomCheck={() => setShowSymptomCheckModal(true)}
                            onOpenMedicationHelper={() => setShowMedicationModal(true)}
                            onOpenFileUpload={() => setShowFileUploadModal(true)}
                        />
                    ) : (
                        <div className="relative rounded-3xl overflow-hidden mb-8 h-[300px] md:h-[380px] shadow-2xl group">
                            <div className="absolute inset-0 bg-[url('/images/herbal-bg.png')] bg-cover bg-center transition-transform duration-700 group-hover:scale-105 opacity-90 grayscale-[20%] sepia-[10%]"></div>
                            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent"></div>
                            <div className="absolute inset-0 bg-traditional-primary/20 mix-blend-multiply"></div>

                            <div className="relative z-10 h-full flex flex-col justify-center p-8 md:p-12">
                                <div className="inline-block px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white text-xs font-medium mb-4 w-fit">
                                    AI Health Analysis
                                </div>
                                <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 drop-shadow-lg font-serif leading-tight">
                                    AI 헬스케어로<br />알아보는 나의 건강
                                </h2>
                                <p className="text-white/90 text-sm md:text-base font-light mb-4 max-w-lg leading-relaxed">
                                    100년 전통의 한의학 지혜와 최첨단 AI 기술이 만나<br />당신만의 건강 리듬을 찾아드립니다.
                                </p>

                                {/* Module List (Overlay on Hero) */}
                                <div className="flex gap-3 overflow-x-auto pb-4 p-1 no-scrollbar mask-linear-fade">
                                    {modules.map((mod) => (
                                        <Link
                                            key={mod.id}
                                            href={`/healthcare/chat?topic=${mod.id}`}
                                            className={`flex-shrink-0 flex flex-col items-center justify-center px-5 py-3 rounded-xl border backdrop-blur-md transition-all duration-300 ${topic === mod.id
                                                ? "bg-white text-traditional-primary border-white shadow-lg scale-105 font-bold"
                                                : "bg-white/10 text-white border-white/20 hover:bg-white/20 hover:border-white/40"
                                                }`}
                                        >
                                            <span className="text-sm whitespace-nowrap">{mod.label}</span>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )
                )}

                {/* Chat Area */}
                <div className={`bg-white/60 backdrop-blur-xl border border-white/50 rounded-3xl p-6 space-y-8 shadow-xl ${props.isEmbedded ? "flex-1 overflow-y-auto rounded-none border-x-0 border-t-0 bg-transparent shadow-none" : "min-h-[500px]"}`}>
                    {/* Safety Badge (logged in only) */}
                    {props.isLoggedIn && <SafetyBadge />}

                    {/* Turn Counter (로그인 전만 표시) */}
                    {!props.isLoggedIn && (
                        <div className="flex justify-center">
                            <span className="px-4 py-1.5 text-xs text-traditional-subtext bg-traditional-bg rounded-full">
                                대화 {turnCount}/5 {turnCount >= 5 && "· 로그인하면 계속 상담 가능"}
                            </span>
                        </div>
                    )}

                    {messages.map((msg, idx) => (
                        <div
                            key={idx}
                            className={`flex items-start gap-4 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                        >
                            {/* Avatar */}
                            <div
                                className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 shadow-md overflow-hidden border-2 ${msg.role === "ai"
                                    ? "border-traditional-primary bg-traditional-bg"
                                    : "border-traditional-accent bg-traditional-bg"
                                    }`}
                            >
                                {msg.role === "ai" ? (
                                    <img
                                        src="/images/character-doctor.jpg"
                                        alt="Doctor"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-traditional-accent flex items-center justify-center text-white">
                                        <User size={20} />
                                    </div>
                                )}
                            </div>

                            {/* Bubble */}
                            <div className="flex flex-col gap-1 max-w-[80%]">
                                <span className={`text-xs font-medium ${msg.role === "user" ? "text-right text-traditional-subtext" : "text-left text-traditional-primary"}`}>
                                    {msg.role === "ai" ? (props.isLoggedIn ? "위담한방병원" : "위담 건강가이드") : "나"}
                                </span>
                                <div
                                    className={`px-6 py-4 rounded-2xl text-sm leading-relaxed shadow-sm whitespace-pre-line ${msg.role === "ai"
                                        ? "bg-white text-traditional-text border border-traditional-muted rounded-tl-none"
                                        : "bg-traditional-primary text-white rounded-tr-none shadow-md"
                                        }`}
                                >
                                    {msg.content}
                                </div>
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-full border-2 border-traditional-primary bg-traditional-bg flex items-center justify-center shadow-md overflow-hidden flex-shrink-0">
                                <img
                                    src="/images/character-doctor.jpg"
                                    alt="Doctor"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="bg-white px-6 py-4 rounded-2xl rounded-tl-none border border-traditional-muted shadow-sm">
                                <div className="flex gap-1.5">
                                    <span className="w-2 h-2 bg-traditional-primary/40 rounded-full animate-bounce"></span>
                                    <span className="w-2 h-2 bg-traditional-primary/40 rounded-full animate-bounce delay-100"></span>
                                    <span className="w-2 h-2 bg-traditional-primary/40 rounded-full animate-bounce delay-200"></span>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </main>

            {/* Input Area */}
            <div className={`${props.isEmbedded ? "relative bg-white border-t border-gray-100" : "fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-traditional-muted/50"} p-4 z-40`}>
                <div className={`${props.isEmbedded ? "w-full" : "max-w-4xl mx-auto"} relative`}>
                    <form onSubmit={handleSubmit} className="relative bg-white rounded-full shadow-xl border border-traditional-muted/50 flex items-center p-2 pl-6 transition-shadow hover:shadow-2xl">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="증상이나 궁금한 점을 입력해주세요..."
                            className="flex-1 bg-transparent border-none focus:ring-0 text-traditional-text placeholder:text-traditional-subtext/50 text-base"
                            disabled={!props.isLoggedIn && turnCount >= 5}
                        />
                        <button
                            type="button"
                            onClick={handleImageClick}
                            className="p-3 text-traditional-subtext hover:text-traditional-primary transition-colors hover:bg-traditional-bg rounded-full"
                        >
                            <Paperclip size={20} />
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading || !input.trim() || (!props.isLoggedIn && turnCount >= 5)}
                            className="p-3 bg-traditional-primary text-white rounded-full hover:bg-traditional-accent transition-all disabled:opacity-50 disabled:hover:bg-traditional-primary ml-2 shadow-md hover:shadow-lg hover:-translate-y-0.5"
                        >
                            <ArrowUp size={20} />
                        </button>
                    </form>
                    {!props.isLoggedIn && turnCount >= 5 && (
                        <div className="mt-2 text-center">
                            <button
                                onClick={() => setShowLoginModal(true)}
                                className="text-sm text-traditional-primary font-medium hover:underline"
                            >
                                상담을 계속하시려면 로그인이 필요합니다
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Login Modal */}
            {showLoginModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 text-center transform transition-all scale-100 border border-white/20">
                        <div className="w-16 h-16 bg-traditional-bg rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                            <User className="w-8 h-8 text-traditional-primary" />
                        </div>
                        <h3 className="text-xl font-bold text-traditional-text mb-3 font-serif">
                            {loginModalContent.title}
                        </h3>
                        <p
                            className="text-traditional-subtext text-sm mb-8 leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: loginModalContent.desc }}
                        />
                        <div className="flex flex-col gap-3">
                            <Link
                                href="/login"
                                onClick={() => track('f1_chat_login_click')}
                                className="w-full py-3.5 bg-traditional-primary text-white rounded-xl font-bold hover:bg-traditional-accent transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 text-center"
                            >
                                로그인하고 계속하기
                            </Link>
                            <button
                                onClick={() => setShowLoginModal(false)}
                                className="w-full py-3.5 bg-traditional-bg text-traditional-subtext rounded-xl font-medium hover:bg-traditional-muted transition-colors"
                            >
                                나중에 하기
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reservation Modal */}
            <ReservationModal
                isOpen={showReservationModal}
                onClose={() => setShowReservationModal(false)}
                initialTab="book"
            />

            {/* Symptom Check Modal */}
            <SymptomCheckModal
                isOpen={showSymptomCheckModal}
                onClose={() => setShowSymptomCheckModal(false)}
            />

            {/* File Upload Modal */}
            <FileUploadModal
                isOpen={showFileUploadModal}
                onClose={() => setShowFileUploadModal(false)}
            />

            {/* Medication Modal */}
            <MedicationModal
                isOpen={showMedicationModal}
                onClose={() => setShowMedicationModal(false)}
            />
        </div>
    );
}
