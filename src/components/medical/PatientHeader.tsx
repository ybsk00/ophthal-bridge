"use client";

import Link from "next/link";
import { User } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function PatientHeader() {
    const [userName, setUserName] = useState("환자님");
    const supabase = createClient();
    const router = useRouter();

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user?.user_metadata?.full_name) {
                setUserName(user.user_metadata.full_name);
            } else if (user?.email) {
                setUserName(user.email.split("@")[0]);
            }
        };
        getUser();
    }, [supabase]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/");
        router.refresh();
    };

    return (
        <header className="bg-white/80 backdrop-blur-md border-b border-traditional-muted/50 px-6 py-4 flex items-center justify-between sticky top-0 z-20 transition-all duration-300">
            <Link href="/medical/dashboard" className="flex items-center gap-3 group">
                <span className="text-xl font-bold text-traditional-text">위담한방병원</span>
                <img src="/logo_leaf.png?v=2" alt="Logo" className="h-10 w-auto object-contain" />
            </Link>

            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 bg-traditional-primary/10 px-3 py-1.5 rounded-full border border-traditional-primary/20">
                    <span className="text-sm font-bold text-traditional-primary">{userName}님</span>
                </div>
                <button
                    onClick={handleLogout}
                    className="text-sm text-traditional-subtext hover:text-traditional-text transition-colors"
                >
                    로그아웃
                </button>
                <div className="w-9 h-9 rounded-full bg-traditional-accent/20 overflow-hidden border border-traditional-accent/30 flex items-center justify-center">
                    {/* Profile Image Placeholder */}
                    <User className="w-5 h-5 text-traditional-accent" />
                </div>
            </div>
        </header>
    );
}
