"use client";

import Link from "next/link";
import { User } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut as nextAuthSignOut } from "next-auth/react";

export default function PatientHeader() {
    const [userName, setUserName] = useState("환자님");
    const supabase = createClient();
    const router = useRouter();

    // NextAuth 세션 (네이버 로그인용)
    const { data: nextAuthSession } = useSession();

    useEffect(() => {
        const getUser = async () => {
            // 1. 먼저 NextAuth 세션 확인 (네이버 로그인)
            if (nextAuthSession?.user?.name) {
                setUserName(nextAuthSession.user.name);
                return;
            }

            // 2. Supabase Auth 확인 (구글/카카오/이메일 로그인)
            const { data: { user } } = await supabase.auth.getUser();
            if (user?.user_metadata?.full_name) {
                setUserName(user.user_metadata.full_name);
            } else if (user?.email) {
                setUserName(user.email.split("@")[0]);
            }
        };
        getUser();
    }, [supabase, nextAuthSession]);

    const handleLogout = async () => {
        // 1. Supabase 로그아웃
        await supabase.auth.signOut();

        // 2. NextAuth 로그아웃 (네이버)
        if (nextAuthSession) {
            await nextAuthSignOut({ redirect: false });
        }

        router.push("/");
        router.refresh();
    };

    return (
        <header className="bg-white/80 backdrop-blur-md border-b border-traditional-muted/50 px-6 py-4 flex items-center justify-between sticky top-0 z-20 transition-all duration-300">
            <Link href="/medical/dashboard" className="flex items-center gap-3 group">
                <img src="/logo_leaf.png?v=3" alt="Logo" className="h-10 w-auto object-contain" />
                <span className="text-xl font-bold text-traditional-text">평촌이생각치과</span>
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
