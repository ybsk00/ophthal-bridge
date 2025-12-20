"use client";

import { useState, useRef, useEffect } from "react";
import { User, ArrowUp, Paperclip, Leaf, Brain, Moon, Heart, Sparkles } from "lucide-react";
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
            id: "general",
            label: "일반 치과",
            desc: "충치, 치료, 검진 안내",
            icon: Sparkles,
            color: "emerald"
        },
        {
            id: "implant",
            label: "임플란트",
            desc: "식립, 뼈이식 상담",
            icon: Brain,
            color: "purple"
        },
        {
            id: "orthodontics",
            label: "교정",
            desc: "치아교정, 투명교정",
            icon: Moon,
            color: "blue"
        },
        {
            id: "whitening",
            label: "미백",
            desc: "치아미백, 라미네이트",
            icon: Heart,
            color: "orange"
        },
        {
            id: "gum",
            label: "잇몸",
            desc: "잇몸치료, 스케일링",
            icon: Leaf,
            color: "rose"
        },
    ];

    // 초기 메시지 설정 (자유 텍스트 입력용)
    useEffect(() => {
        if (props.mode === 'medical') {
            // 로그인 후 - 메디컬 채팅
            setMessages([{
                role: "ai",
                content: "안녕하세요, 평촌이생각치과 AI 상담입니다.\n\n이 채팅은 **진단이나 처방이 아닌 생활 습관·웰니스 점검(참고용)** 입니다.\n\n지금 겪고 계신 불편한 증상을 말씀해 주세요. 언제부터 시작되었는지, 어디가 가장 불편하신지 편하게 이야기해 주세요."
            }]);
        } else {
            // 로그인 전 - 헬스케어 채팅 (모듈별 인사말)
            const currentModule = modules.find(m => m.id === topic);
            const moduleName = currentModule ? currentModule.label : "치과 상담";

            // 모듈별 맞춤형 초기 질문 설정
            let initialQuestion = "";
            switch (topic) {
                case "general":
                    initialQuestion = "어떤 치과 진료를 원하시나요? (충치, 발치, 검진 등)";
                    break;
                case "implant":
                    initialQuestion = "임플란트 식립에 관심이 있으신가요? 현재 상태를 알려주세요.";
                    break;
                case "orthodontics":
                    initialQuestion = "치아교정에 관심이 있으신가요? 어떤 부분이 불편하신가요?";
                    break;
                case "whitening":
                    initialQuestion = "치아미백에 관심이 있으신가요? 현재 치아 상태를 알려주세요.";
                    break;
                case "gum":
                    initialQuestion = "잇몸이 붓거나 피가 나는 증상이 있으신가요?";
                    break;
                default:
                    initialQuestion = "어떤 치과 상담이 필요하신가요?";
            }

            setMessages([{
                role: "ai",
                content: `안녕하세요! **${moduleName}** 상담을 도와드릴 평촌이생각치과 가이드입니다. 🦷\n\n이 대화는 **진단이 아닌 일반 정보 안내(참고용)** 입니다.\n\n${initialQuestion}`
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
                            title: "현재는 일반 정보 안내 단계입니다",
                            desc: "로그인하면 내용을 저장하고,<br />더 맞춤형으로 정리해 드립니다."
                        });
                        setShowLoginModal(true);
                        if (data.isSymptomTrigger) {
                            setTurnCount(5);
                        }
                    }, 500);
                } else {
                    setTimeout(() => {
                        setLoginModalContent({
                            title: "현재는 일반 정보 안내 단계입니다",
                            desc: "로그인하면 내용을 저장하고,<br />더 맞춤형으로 정리해 드립니다."
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
        <div className={`${props.isEmbedded ? "h-full" : "min-h-screen"} bg-dental-bg font-sans flex flex-col selection:bg-dental-accent selection:text-white`}>
            {/* Header - Hidden if embedded */}
            {!props.isEmbedded && (
                <header className="bg-dental-bg/80 backdrop-blur-md border-b border-white/10 px-6 py-4 flex items-center justify-between sticky top-0 z-50 transition-all duration-300">
                    <Link href="/" className="flex items-center gap-3 group cursor-pointer">
                        <div className="w-12 h-12 rounded-full bg-dental-primary/20 flex items-center justify-center">
                            <span className="text-2xl">🦷</span>
                        </div>
                        <span className="text-xl font-bold text-white">평촌이생각치과</span>
                    </Link>
                    <div className="hidden md:flex items-center gap-6 text-sm font-medium text-dental-subtext">
                        <Link href="/login" className="px-6 py-2 bg-dental-primary text-white text-sm font-medium rounded-full hover:bg-dental-accent hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
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
                        <div className="relative rounded-3xl overflow-hidden mb-8 h-[420px] md:h-[480px] shadow-2xl group">
                            <video
                                autoPlay
                                loop
                                muted
                                playsInline
                                className="absolute inset-0 w-full h-full object-cover opacity-70"
                            >
                                <source src="/3.mp4" type="video/mp4" />
                            </video>
                            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent"></div>
                            <div className="absolute inset-0 bg-dental-primary/20 mix-blend-multiply"></div>

                            <div className="relative z-10 h-full flex flex-col justify-center p-8 md:p-12">
                                <div className="inline-block px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white text-xs font-medium mb-4 w-fit">
                                    AI Dental Analysis
                                </div>
                                <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 drop-shadow-lg font-serif leading-tight">
                                    AI 헬스케어로<br />알아보는 나의 구강 건강
                                </h2>
                                <p className="text-white/90 text-sm md:text-base font-light mb-4 max-w-lg leading-relaxed">
                                    최첨단 AI 기술로 구강 관리 패턴을 점검하고<br />당신만의 건강 요약을 제공합니다.
                                </p>

                                {/* Module List - Glassmorphism Cards */}
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-2">
                                    {modules.map((mod) => {
                                        const IconComponent = mod.icon;
                                        const isActive = topic === mod.id;
                                        const colorClasses: Record<string, { bg: string; ring: string; icon: string }> = {
                                            emerald: { bg: 'bg-emerald-500/20', ring: 'ring-emerald-400', icon: 'text-emerald-400' },
                                            purple: { bg: 'bg-purple-500/20', ring: 'ring-purple-400', icon: 'text-purple-400' },
                                            blue: { bg: 'bg-blue-500/20', ring: 'ring-blue-400', icon: 'text-blue-400' },
                                            orange: { bg: 'bg-orange-500/20', ring: 'ring-orange-400', icon: 'text-orange-400' },
                                            rose: { bg: 'bg-rose-500/20', ring: 'ring-rose-400', icon: 'text-rose-400' }
                                        };
                                        const colors = colorClasses[mod.color] || colorClasses.emerald;

                                        return (
                                            <Link
                                                key={mod.id}
                                                href={`/healthcare/chat?topic=${mod.id}`}
                                                className={`group relative flex flex-col items-center justify-center p-4 md:p-5 rounded-2xl backdrop-blur-xl border transition-all duration-300 hover:scale-105 hover:-translate-y-1 ${isActive
                                                    ? `bg-white/95 border-white shadow-2xl ring-2 ${colors.ring}`
                                                    : 'bg-white/15 border-white/30 hover:bg-white/25 hover:border-white/50 hover:shadow-lg'
                                                    }`}
                                            >
                                                {/* Icon Circle */}
                                                <div className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center mb-2 transition-all duration-300 ${isActive
                                                    ? `${colors.bg} shadow-md`
                                                    : 'bg-white/20 group-hover:bg-white/30'
                                                    }`}>
                                                    <IconComponent className={`w-6 h-6 md:w-7 md:h-7 transition-colors ${isActive ? colors.icon : 'text-white group-hover:text-white'
                                                        }`} />
                                                </div>

                                                {/* Label */}
                                                <span className={`text-sm md:text-base font-bold whitespace-nowrap mb-0.5 ${isActive ? 'text-gray-900' : 'text-white'
                                                    }`}>
                                                    {mod.label}
                                                </span>

                                                {/* Description */}
                                                <span className={`text-[10px] md:text-xs whitespace-nowrap ${isActive ? 'text-gray-500' : 'text-white/70'
                                                    }`}>
                                                    {mod.desc}
                                                </span>

                                                {/* Active indicator */}
                                                {isActive && (
                                                    <div className={`absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-8 h-1 rounded-full ${colors.bg.replace('/20', '')}`} />
                                                )}
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )
                )}

                {/* Chat Area */}
                <div className={`bg-[#1a2332] backdrop-blur-xl border border-white/10 rounded-3xl p-6 space-y-8 shadow-xl ${props.isEmbedded ? "flex-1 overflow-y-auto rounded-none border-x-0 border-t-0 bg-dental-bg shadow-none" : "min-h-[500px]"}`}>
                    {/* Safety Badge (logged in only) */}
                    {props.isLoggedIn && <SafetyBadge />}

                    {/* Turn Counter (로그인 전만 표시) */}
                    {!props.isLoggedIn && (
                        <div className="flex justify-center">
                            <span className="px-4 py-1.5 text-xs text-dental-subtext bg-[#0d1420] rounded-full border border-white/10">
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
                                    ? "border-dental-primary bg-dental-bg"
                                    : "border-dental-accent bg-dental-bg"
                                    }`}
                            >
                                {msg.role === "ai" ? (
                                    <img
                                        src="/doctor-avatar.jpg"
                                        alt="Doctor"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-dental-accent flex items-center justify-center text-white">
                                        <User size={20} />
                                    </div>
                                )}
                            </div>

                            {/* Bubble */}
                            <div className="flex flex-col gap-1 max-w-[80%]">
                                <span className={`text-xs font-medium ${msg.role === "user" ? "text-right text-dental-subtext" : "text-left text-dental-primary"}`}>
                                    {msg.role === "ai" ? (props.isLoggedIn ? "평촌이생각치과" : "치과 건강가이드") : "나"}
                                </span>
                                <div
                                    className={`px-6 py-4 rounded-2xl text-sm leading-relaxed shadow-sm whitespace-pre-line ${msg.role === "ai"
                                        ? "bg-[#1a2332] text-white border border-white/10 rounded-tl-none"
                                        : "bg-dental-primary text-white rounded-tr-none shadow-md"
                                        }`}
                                >
                                    {msg.content}
                                </div>
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-full border-2 border-dental-primary bg-dental-bg flex items-center justify-center shadow-md overflow-hidden flex-shrink-0">
                                <img
                                    src="/doctor-avatar.jpg"
                                    alt="Doctor"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="bg-[#1a2332] px-6 py-4 rounded-2xl rounded-tl-none border border-white/10 shadow-sm">
                                <div className="flex gap-1.5">
                                    <span className="w-2 h-2 bg-dental-primary/50 rounded-full animate-bounce"></span>
                                    <span className="w-2 h-2 bg-dental-primary/50 rounded-full animate-bounce delay-100"></span>
                                    <span className="w-2 h-2 bg-dental-primary/50 rounded-full animate-bounce delay-200"></span>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </main>

            {/* Input Area */}
            <div className={`${props.isEmbedded ? "relative bg-dental-bg border-t border-white/10" : "fixed bottom-0 left-0 right-0 bg-dental-bg/90 backdrop-blur-xl border-t border-white/10"} p-4 z-40`}>
                <div className={`${props.isEmbedded ? "w-full" : "max-w-4xl mx-auto"} relative`}>
                    <form onSubmit={handleSubmit} className="relative bg-[#1a2332] rounded-full shadow-xl border border-white/10 flex items-center p-2 pl-6 transition-shadow hover:shadow-2xl">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="증상이나 궁금한 점을 입력해주세요..."
                            className="flex-1 bg-transparent border-none focus:ring-0 text-white placeholder:text-dental-subtext/50 text-base"
                            disabled={!props.isLoggedIn && turnCount >= 5}
                        />
                        <button
                            type="button"
                            onClick={handleImageClick}
                            className="p-3 text-dental-subtext hover:text-dental-primary transition-colors hover:bg-white/10 rounded-full"
                        >
                            <Paperclip size={20} />
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading || !input.trim() || (!props.isLoggedIn && turnCount >= 5)}
                            className="p-3 bg-dental-primary text-white rounded-full hover:bg-dental-accent transition-all disabled:opacity-50 disabled:hover:bg-dental-primary ml-2 shadow-md hover:shadow-lg hover:-translate-y-0.5"
                        >
                            <ArrowUp size={20} />
                        </button>
                    </form>
                    {!props.isLoggedIn && turnCount >= 5 && (
                        <div className="mt-2 text-center">
                            <button
                                onClick={() => setShowLoginModal(true)}
                                className="text-sm text-dental-primary font-medium hover:underline"
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
