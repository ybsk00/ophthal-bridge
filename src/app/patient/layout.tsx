import Link from 'next/link'
import { Home, Calendar, MessageSquare, User } from 'lucide-react'

export default function PatientLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex flex-col min-h-screen" style={{ backgroundColor: '#0a0f1a' }}>
            <main className="flex-1 pb-20">
                {children}
            </main>

            {/* Bottom Navigation */}
            <nav
                className="fixed bottom-0 left-0 right-0 h-16 flex items-center justify-center z-50"
                style={{ backgroundColor: '#0a0f1a', borderTop: '1px solid #1f2937' }}
            >
                <div className="max-w-md w-full flex items-center justify-around px-4">
                    <Link href="/patient" className="flex flex-col items-center justify-center gap-1 text-blue-500">
                        <Home size={24} />
                        <span className="text-[10px]">홈</span>
                    </Link>
                    <Link href="/patient/appointments" className="flex flex-col items-center justify-center gap-1 text-gray-500 hover:text-gray-300 transition-colors">
                        <Calendar size={24} />
                        <span className="text-[10px]">예약</span>
                    </Link>
                    <Link href="/patient/chat" className="relative flex flex-col items-center justify-center gap-1 text-gray-500 hover:text-gray-300 transition-colors">
                        <div className="relative">
                            <MessageSquare size={24} />
                            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                        </div>
                        <span className="text-[10px]">상담</span>
                    </Link>
                    <Link href="/patient/profile" className="flex flex-col items-center justify-center gap-1 text-gray-500 hover:text-gray-300 transition-colors">
                        <User size={24} />
                        <span className="text-[10px]">마이</span>
                    </Link>
                </div>
            </nav>
        </div>
    )
}
