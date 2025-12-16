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
                <div className="w-8 h-8 bg-traditional-primary rounded-lg flex items-center justify-center shadow-sm group-hover:bg-traditional-accent transition-colors duration-300">
                    <span className="text-white text-xs font-bold font-serif">JK</span>
                </div>
                <span className="text-lg font-bold text-traditional-text tracking-tight group-hover:text-traditional-primary transition-colors">한의원 <span className="text-traditional-accent font-light">AI</span></span>
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
