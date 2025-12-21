"use client";

import { X, LogIn, Clock } from "lucide-react";
import { useRouter } from "next/navigation";

interface LoginRequiredModalProps {
    isOpen: boolean;
    onClose: () => void;
    returnUrl?: string;
}

export default function LoginRequiredModal({
    isOpen,
    onClose,
    returnUrl = "/medical/patient-dashboard",
}: LoginRequiredModalProps) {
    const router = useRouter();

    if (!isOpen) return null;

    const handleLogin = () => {
        // 로그인 페이지로 이동하면서 returnUrl 저장
        sessionStorage.setItem("loginReturnUrl", returnUrl);
        router.push("/login");
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-[#1a2332] rounded-2xl p-6 max-w-sm w-full border border-white/10 shadow-2xl animate-fade-in">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-dental-subtext hover:text-white transition-colors"
                >
                    <X size={20} />
                </button>

                {/* Content */}
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-dental-primary/20 rounded-full flex items-center justify-center mx-auto">
                        <LogIn className="w-8 h-8 text-dental-primary" />
                    </div>

                    <h2 className="text-xl font-bold text-white">상담을 이어갈까요?</h2>

                    <p className="text-dental-subtext text-sm leading-relaxed">
                        상담 내용 저장과 개인정보 보호를 위해
                        <br />
                        로그인 후 연결됩니다.
                    </p>

                    {/* Buttons */}
                    <div className="space-y-3 pt-2">
                        <button
                            onClick={handleLogin}
                            className="w-full py-3 bg-dental-primary text-white rounded-xl font-medium hover:bg-dental-accent transition-colors flex items-center justify-center gap-2"
                        >
                            <LogIn size={18} />
                            로그인하고 상담 연결
                        </button>

                        <button
                            onClick={onClose}
                            className="w-full py-3 bg-white/5 text-dental-subtext border border-white/10 rounded-xl font-medium hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
                        >
                            <Clock size={18} />
                            진료시간만 보기
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
