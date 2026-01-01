"use client";

import Link from "next/link";
import { User } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
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

    const pathname = usePathname();

    const handleLogout = async () => {
        // 1. Supabase 로그아웃
        await supabase.auth.signOut();

        // 2. NextAuth 로그아웃 (네이버)
        if (nextAuthSession) {
            await nextAuthSignOut({ redirect: false });
        }

        // 현재 경로가 메디컬 대시보드인 경우 메인으로, 그 외(환자 포털 등)는 환자 홈으로 이동
        if (pathname?.includes('/medical/patient-dashboard')) {
            router.push("/");
        } else {
            router.push("/patient/home");
        }
        router.refresh();
    };

    return (
        <header className="bg-dental-bg/80 backdrop-blur-md border-b border-white/10 px-6 py-4 flex items-center justify-between sticky top-0 z-20 transition-all duration-300">
            <Link href="/medical/dashboard" className="flex items-center gap-3 group">
                <div className="w-10 h-10 rounded-full bg-dental-primary/20 flex items-center justify-center">
                    <span className="text-xl">✨</span>
                </div>
                <span className="text-xl font-bold text-white">강남아이디안과</span>
            </Link>

            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 bg-dental-primary/20 px-3 py-1.5 rounded-full border border-dental-primary/30">
                    <span className="text-sm font-bold text-dental-primary">{userName}님</span>
                </div>
                <button
                    onClick={handleLogout}
                    className="text-sm text-dental-subtext hover:text-white transition-colors"
                >
                    로그아웃
                </button>
                <div className="w-9 h-9 rounded-full bg-dental-accent/20 overflow-hidden border border-dental-accent/30 flex items-center justify-center">
                    {/* Profile Image Placeholder */}
                    <User className="w-5 h-5 text-dental-accent" />
                </div>
            </div>
        </header>
    );
}


