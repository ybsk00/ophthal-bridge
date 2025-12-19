"use client";

import { useState, useEffect } from 'react';
import { ChevronLeft, Save, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function ProfileEditPage() {
    const { data: session, update } = useSession();
    const router = useRouter();
    const [name, setName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (session?.user?.name) {
            setName(session.user.name);
        }
    }, [session]);

    const handleSave = async () => {
        if (!name.trim()) {
            setError('이름을 입력해주세요.');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const response = await fetch('/api/patient/profile/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: name.trim() })
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || '저장 중 오류가 발생했습니다.');
            }

            setIsSaved(true);
            setTimeout(() => {
                router.push('/patient/profile');
            }, 1000);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen pb-24" style={{ backgroundColor: '#0a0f1a' }}>
            <div className="max-w-lg mx-auto px-4 pt-6">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <Link
                        href="/patient/profile"
                        className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                    >
                        <ChevronLeft size={24} className="text-white" />
                    </Link>
                    <h1 className="text-2xl font-bold text-white">내 정보 수정</h1>
                </div>

                {/* Form */}
                <div className="space-y-6">
                    {/* Name Field */}
                    <div
                        className="p-4 rounded-2xl"
                        style={{ backgroundColor: '#1a2332', border: '1px solid #1f2937' }}
                    >
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                            이름
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="이름을 입력하세요"
                            className="w-full bg-transparent text-white text-lg font-medium outline-none border-b border-gray-600 pb-2 focus:border-blue-500 transition-colors"
                        />
                    </div>

                    {/* Email (Read-only) */}
                    <div
                        className="p-4 rounded-2xl"
                        style={{ backgroundColor: '#1a2332', border: '1px solid #1f2937' }}
                    >
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                            이메일 (변경 불가)
                        </label>
                        <p className="text-gray-500 text-lg">{session?.user?.email || '-'}</p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30">
                            <p className="text-red-400 text-sm">{error}</p>
                        </div>
                    )}

                    {/* Success Message */}
                    {isSaved && (
                        <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30">
                            <p className="text-green-400 text-sm">저장되었습니다! 프로필로 이동합니다...</p>
                        </div>
                    )}

                    {/* Save Button */}
                    <button
                        onClick={handleSave}
                        disabled={isLoading || isSaved}
                        className="w-full flex items-center justify-center gap-2 p-4 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <Loader2 size={20} className="animate-spin" />
                        ) : (
                            <Save size={20} />
                        )}
                        {isLoading ? '저장 중...' : '저장하기'}
                    </button>
                </div>
            </div>
        </div>
    );
}
