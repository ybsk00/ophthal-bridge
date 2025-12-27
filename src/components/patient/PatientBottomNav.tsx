"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Calendar, MessageSquare, User, Sparkles } from "lucide-react";
import FaceSimulationModal from "@/components/face-style/FaceSimulationModal";

export default function PatientBottomNav() {
    const pathname = usePathname();
    const [isFaceModalOpen, setIsFaceModalOpen] = useState(false);

    const navItems = [
        { href: "/patient", icon: Home, label: "홈", exact: true },
        { href: "/patient/appointments", icon: Calendar, label: "예약" },
        { href: null, icon: Sparkles, label: "시각화", isModal: true },
        { href: "/patient/chat", icon: MessageSquare, label: "상담", badge: true },
        { href: "/patient/profile", icon: User, label: "마이" },
    ];

    const isActive = (href: string | null, exact?: boolean) => {
        if (!href) return false;
        if (exact) return pathname === href;
        return pathname.startsWith(href);
    };

    return (
        <>
            <nav
                className="fixed bottom-0 left-0 right-0 h-16 flex items-center justify-center z-50"
                style={{ backgroundColor: "#0a0f1a", borderTop: "1px solid #1f2937" }}
            >
                <div className="max-w-md w-full flex items-center justify-around px-4">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const active = item.isModal ? isFaceModalOpen : isActive(item.href, item.exact);

                        if (item.isModal) {
                            return (
                                <button
                                    key={item.label}
                                    onClick={() => setIsFaceModalOpen(true)}
                                    className={`flex flex-col items-center justify-center gap-1 transition-colors ${active ? "text-pink-500" : "text-gray-500 hover:text-gray-300"
                                        }`}
                                >
                                    <Icon size={24} />
                                    <span className="text-[10px]">{item.label}</span>
                                </button>
                            );
                        }

                        return (
                            <Link
                                key={item.href}
                                href={item.href!}
                                className={`flex flex-col items-center justify-center gap-1 transition-colors ${active ? "text-blue-500" : "text-gray-500 hover:text-gray-300"
                                    }`}
                            >
                                <div className="relative">
                                    <Icon size={24} />
                                    {item.badge && (
                                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
                                    )}
                                </div>
                                <span className="text-[10px]">{item.label}</span>
                            </Link>
                        );
                    })}
                </div>
            </nav>

            {/* 가상 시각화 모달 - 모바일 전체 화면 */}
            <FaceSimulationModal
                isOpen={isFaceModalOpen}
                onClose={() => setIsFaceModalOpen(false)}
                isMobile={true}
            />
        </>
    );
}
