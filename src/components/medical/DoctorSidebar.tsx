"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar, Search, Bell, Settings, LogOut } from "lucide-react";

export default function DoctorSidebar() {
    const pathname = usePathname();

    const menuItems = [
        { icon: Calendar, label: "오늘 환자", href: "/medical/dashboard" },
        { icon: Search, label: "환자 검색", href: "/medical/dashboard/search" },
        { icon: Bell, label: "알림/리마인드", href: "/medical/dashboard/notifications" },
        { icon: Settings, label: "설정", href: "/medical/dashboard/settings" },
    ];

    return (
        <aside className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col fixed left-0 top-0 z-30">
            {/* Header */}
            <div className="p-6 border-b border-gray-100">
                <div className="flex items-center gap-3 mb-1">
                    <div className="w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center text-white font-bold text-xs">
                        J
                    </div>
                    <h1 className="font-bold text-gray-900 text-lg">죽전한의원</h1>
                </div>
                <p className="text-xs text-teal-600 font-medium pl-11">Doctor Dashboard</p>
            </div>

            {/* Menu */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${isActive
                                    ? "bg-teal-50 text-teal-700"
                                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                }`}
                        >
                            <item.icon size={20} className={isActive ? "text-teal-600" : "text-gray-400"} />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-gray-100">
                <button className="flex items-center gap-3 px-4 py-3 w-full text-left text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-xl transition-colors">
                    <LogOut size={20} className="text-gray-400" />
                    로그아웃
                </button>
            </div>
        </aside>
    );
}
