import { Pill } from 'lucide-react'

export default function MedicationsPage() {
    return (
        <div className="min-h-screen pb-24" style={{ backgroundColor: '#0a0f1a' }}>
            <div className="max-w-lg mx-auto px-4 pt-6">
                <h1 className="text-2xl font-bold text-white mb-6">복약 관리</h1>

                <div className="flex flex-col items-center justify-center py-20">
                    <div
                        className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                        style={{ backgroundColor: '#1f2937' }}
                    >
                        <Pill className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-400 text-center">
                        처방받은 약이 없습니다.<br />
                        진료 후 처방전이 등록되면 여기에서 확인하실 수 있습니다.
                    </p>
                </div>
            </div>
        </div>
    )
}
