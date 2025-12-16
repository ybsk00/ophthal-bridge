"use client";

import { createClient } from "@/lib/supabase/client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { checkUserExists } from "@/app/actions/auth";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // 1. Check if user exists
            const exists = await checkUserExists(email);

            if (!exists) {
                alert("가입된 내역이 없습니다. 회원가입을 진행해주세요.");
                setIsSignUp(true);
                setLoading(false);
                return;
            }

            // 2. If exists, attempt login
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                alert("로그인 실패: " + error.message);
                setLoading(false);
            } else {
                // 사용자 역할 확인
                const { data: { user } } = await supabase.auth.getUser();

                // staff_users 테이블에서 역할 확인
                const { data: staffUser } = await supabase
                    .from('staff_users')
                    .select('role')
                    .eq('user_id', user?.id)
                    .single();

                // admin/doctor/staff 역할이면 /admin으로, 아니면 /medical/dashboard로
                if (staffUser?.role === 'admin' || staffUser?.role === 'doctor' || staffUser?.role === 'staff') {
                    router.push("/admin");
                } else {
                    router.push("/medical/dashboard");
                }
            }
        } catch (error) {
            console.error(error);
            alert("오류가 발생했습니다.");
            setLoading(false);
        }
    };

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            alert("비밀번호가 일치하지 않습니다.");
            return;
        }

        setLoading(true);
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: name,
                },
            },
        });

        if (error) {
            alert("회원가입 실패: " + error.message);
        } else {
            alert("회원가입이 완료되었습니다. 로그인해주세요.");
            setIsSignUp(false);
        }
        setLoading(false);
    };

    const handleSocialLogin = async (provider: 'google' | 'kakao' | 'naver') => {
        if (provider === 'naver') {
            await signIn('naver', { callbackUrl: '/medical/dashboard' });
            return;
        }

        const { error } = await supabase.auth.signInWithOAuth({
            provider,
            options: {
                redirectTo: `${location.origin}/auth/callback`,
            },
        });
        if (error) alert(error.message);
    };

    const [isInAppBrowser, setIsInAppBrowser] = useState(false);

    useEffect(() => {
        const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
        const inAppRules = [
            'KAKAOTALK', 'NAVER', 'Instagram', 'FBAN', 'FBAV', 'Line'
        ];
        const isInApp = inAppRules.some(rule => userAgent.includes(rule));
        setIsInAppBrowser(isInApp);
    }, []);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(window.location.href);
        alert("주소가 복사되었습니다. 브라우저 주소창에 붙여넣기 해주세요.");
    };

    if (isInAppBrowser) {
        return (
            <div className="fixed inset-0 z-50 bg-black/80 flex flex-col items-center justify-center p-6 text-white text-center">
                <div className="max-w-xs space-y-6">
                    <div className="text-6xl mb-4">🌏</div>
                    <h2 className="text-2xl font-bold">외부 브라우저에서<br />열어주세요</h2>
                    <p className="text-white/80 leading-relaxed">
                        카카오톡/네이버 등 인앱 브라우저에서는<br />
                        구글 로그인이 제한될 수 있습니다.
                    </p>
                    <div className="bg-white/10 p-4 rounded-xl text-sm text-left space-y-2">
                        <p>1. 우측 하단/상단 <span className="font-bold">메뉴(⋮)</span> 클릭</p>
                        <p>2. <span className="font-bold">다른 브라우저로 열기</span> 선택</p>
                        <p>3. Chrome/Safari/Samsung Internet 선택</p>
                    </div>
                    <button
                        onClick={copyToClipboard}
                        className="w-full py-3 bg-white text-black rounded-xl font-bold hover:bg-gray-100 transition-colors"
                    >
                        주소 복사하기
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-traditional-bg flex flex-col items-center justify-center p-6 font-sans">
            <div className="absolute inset-0 opacity-10 bg-[url('/texture-hanji.png')] pointer-events-none mix-blend-multiply"></div>

            <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg border border-traditional-muted relative z-10 animate-fade-in">
                <Link href="/" className="absolute top-6 left-6 text-traditional-subtext hover:text-traditional-text">
                    <ArrowLeft size={24} />
                </Link>

                <div className="text-center mb-8 mt-4">
                    <h1 className="text-2xl font-bold text-traditional-text mb-2">
                        {isSignUp ? "회원가입" : "로그인"}
                    </h1>
                    <p className="text-traditional-subtext text-sm">
                        {isSignUp
                            ? "서비스 이용을 위해 정보를 입력해주세요."
                            : "더 정확한 진단과 처방을 위해\n의료진과 연결합니다."}
                    </p>
                </div>

                <form onSubmit={isSignUp ? handleSignUp : handleLogin} className="space-y-4" autoComplete="off">
                    {isSignUp && (
                        <div>
                            <label className="block text-sm font-medium text-traditional-text mb-1">성명</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-4 py-2 border border-traditional-muted rounded-lg focus:outline-none focus:border-traditional-primary focus:ring-1 focus:ring-traditional-primary"
                                placeholder="홍길동"
                                required
                            />
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-medium text-traditional-text mb-1">이메일</label>
                        <input
                            type="email"
                            name="medical-email"
                            autoComplete="new-email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2 border border-traditional-muted rounded-lg focus:outline-none focus:border-traditional-primary focus:ring-1 focus:ring-traditional-primary"
                            placeholder="example@email.com"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-traditional-text mb-1">비밀번호</label>
                        <input
                            type="password"
                            name="medical-password"
                            autoComplete="new-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2 border border-traditional-muted rounded-lg focus:outline-none focus:border-traditional-primary focus:ring-1 focus:ring-traditional-primary"
                            placeholder="••••••••"
                            required
                        />
                    </div>
                    {isSignUp && (
                        <div>
                            <label className="block text-sm font-medium text-traditional-text mb-1">비밀번호 확인</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full px-4 py-2 border border-traditional-muted rounded-lg focus:outline-none focus:border-traditional-primary focus:ring-1 focus:ring-traditional-primary"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    )}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-traditional-primary text-white rounded-lg font-medium hover:bg-traditional-primary/90 transition-colors disabled:opacity-50"
                    >
                        {loading
                            ? (isSignUp ? "가입 중..." : "로그인 중...")
                            : (isSignUp ? "회원가입" : "이메일로 로그인")}
                    </button>
                </form>

                {!isSignUp && (
                    <div className="mt-4 text-center">
                        <button
                            onClick={() => setIsSignUp(true)}
                            className="text-sm text-traditional-subtext hover:text-traditional-primary underline"
                        >
                            계정이 없으신가요? 회원가입
                        </button>
                    </div>
                )}

                {isSignUp && (
                    <div className="mt-4 text-center">
                        <button
                            onClick={() => setIsSignUp(false)}
                            className="text-sm text-traditional-subtext hover:text-traditional-primary underline"
                        >
                            이미 계정이 있으신가요? 로그인
                        </button>
                    </div>
                )}

                <div className="mt-6">
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-traditional-muted"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-traditional-subtext">또는 소셜 로그인</span>
                        </div>
                    </div>

                    <div className="mt-6 flex flex-col gap-3">
                        <button
                            onClick={() => handleSocialLogin('kakao')}
                            className="flex items-center justify-center w-full px-4 py-3 border border-traditional-muted rounded-lg hover:bg-yellow-50 transition-colors bg-[#FEE500] text-[#000000] font-medium"
                        >
                            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 3C5.925 3 1 6.925 1 11.775C1 14.825 3.025 17.5 6.075 19.025C5.55 20.85 4.3 22.95 4.25 23.025C4.1 23.275 4.375 23.55 4.625 23.375C6.725 21.975 9.075 20.275 9.9 19.725C10.575 19.825 11.275 19.875 12 19.875C18.075 19.875 23 15.95 23 11.1C23 6.25 18.075 3 12 3Z" />
                            </svg>
                            카카오로 시작하기
                        </button>
                        <button
                            onClick={() => handleSocialLogin('naver')}
                            className="flex items-center justify-center w-full px-4 py-3 border border-traditional-muted rounded-lg hover:bg-green-50 transition-colors bg-[#03C75A] text-white font-medium"
                        >
                            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M16.2733 12.845L7.376 0H0V24H7.72695V11.1549L16.624 24H24V0H16.2733V12.845Z" />
                            </svg>
                            네이버로 시작하기
                        </button>
                        <button
                            onClick={() => handleSocialLogin('google')}
                            className="flex items-center justify-center w-full px-4 py-3 border border-traditional-muted rounded-lg hover:bg-gray-50 transition-colors bg-white text-gray-700 font-medium"
                        >
                            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12.24 10.285V14.4H16.8172C16.6995 15.528 15.8325 17.415 12.24 17.415C9.0765 17.415 6.504 14.79 6.504 11.625C6.504 8.46 9.0765 5.835 12.24 5.835C14.037 5.835 15.2355 6.6045 15.9225 7.2645L18.9315 4.365C17.0055 2.565 14.8215 1.5 12.24 1.5C6.651 1.5 2.115 6.036 2.115 11.625C2.115 17.214 6.651 21.75 12.24 21.75C18.0855 21.75 21.945 17.6355 21.945 11.88C21.945 11.196 21.8865 10.701 21.7785 10.285H12.24Z" />
                            </svg>
                            Google로 시작하기
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
