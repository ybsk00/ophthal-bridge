import { User, ChevronRight, Bell, Shield, HelpCircle, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function ProfilePage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    let profile = { full_name: '환자', phone: '' }

    if (user) {
        const { data } = await supabase
            .from('patient_profiles')
            .select('full_name, phone')
            .eq('user_id', user.id)
            .single()

        if (data) {
            profile = data
        }
    }

    return (
        <div className="min-h-screen pb-24" style={{ backgroundColor: '#0a0f1a' }}>
            <div className="max-w-lg mx-auto px-4 pt-6">
                <h1 className="text-2xl font-bold text-white mb-6">마이페이지</h1>

                {/* Profile Card */}
                <div
                    className="p-6 rounded-2xl flex items-center gap-4 mb-6"
                    style={{ backgroundColor: '#1a2332', border: '1px solid #1f2937' }}
                >
                    <div
                        className="w-16 h-16 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: '#374151' }}
                    >
                        <span className="text-2xl font-bold text-blue-400">
                            {(profile.full_name || '환').charAt(0)}
                        </span>
                    </div>
                    <div className="flex-1">
                        <h2 className="font-bold text-lg text-white">{profile.full_name || '환자'}님</h2>
                        <p className="text-sm text-gray-400">{profile.phone || user?.email || ''}</p>
                    </div>
                    <Link
                        href="/patient/profile/edit"
                        className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                    >
                        <ChevronRight size={20} className="text-gray-400" />
                    </Link>
                </div>

                {/* Menu Items */}
                <div className="space-y-2">
                    <Link
                        href="/patient/profile/edit"
                        className="flex items-center justify-between p-4 rounded-xl hover:bg-white/5 transition-colors"
                        style={{ backgroundColor: '#1a2332', border: '1px solid #1f2937' }}
                    >
                        <div className="flex items-center gap-3">
                            <User size={20} className="text-gray-400" />
                            <span className="text-white">내 정보 수정</span>
                        </div>
                        <ChevronRight size={18} className="text-gray-500" />
                    </Link>

                    <Link
                        href="/patient/profile/notifications"
                        className="flex items-center justify-between p-4 rounded-xl hover:bg-white/5 transition-colors"
                        style={{ backgroundColor: '#1a2332', border: '1px solid #1f2937' }}
                    >
                        <div className="flex items-center gap-3">
                            <Bell size={20} className="text-gray-400" />
                            <span className="text-white">알림 설정</span>
                        </div>
                        <ChevronRight size={18} className="text-gray-500" />
                    </Link>

                    <Link
                        href="/patient/profile/privacy"
                        className="flex items-center justify-between p-4 rounded-xl hover:bg-white/5 transition-colors"
                        style={{ backgroundColor: '#1a2332', border: '1px solid #1f2937' }}
                    >
                        <div className="flex items-center gap-3">
                            <Shield size={20} className="text-gray-400" />
                            <span className="text-white">개인정보 처리방침</span>
                        </div>
                        <ChevronRight size={18} className="text-gray-500" />
                    </Link>

                    <Link
                        href="/patient/profile/help"
                        className="flex items-center justify-between p-4 rounded-xl hover:bg-white/5 transition-colors"
                        style={{ backgroundColor: '#1a2332', border: '1px solid #1f2937' }}
                    >
                        <div className="flex items-center gap-3">
                            <HelpCircle size={20} className="text-gray-400" />
                            <span className="text-white">고객센터</span>
                        </div>
                        <ChevronRight size={18} className="text-gray-500" />
                    </Link>
                </div>

                {/* Logout */}
                <form action="/auth/signout" method="post" className="mt-6">
                    <button
                        type="submit"
                        className="w-full flex items-center justify-center gap-2 p-4 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors"
                        style={{ backgroundColor: '#1a2332', border: '1px solid #1f2937' }}
                    >
                        <LogOut size={20} />
                        로그아웃
                    </button>
                </form>
            </div>
        </div>
    )
}
