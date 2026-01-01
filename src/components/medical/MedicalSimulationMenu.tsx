'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Eye, Contrast, Moon, Grid3X3, ArrowLeft, X } from 'lucide-react';
import VisionSimulatorMedical from './VisionSimulatorMedical';

// 시뮬레이션 메뉴 타입
export type SimulationMenuType = 'clarity' | 'contrast' | 'nightGlare' | 'pattern';

interface MenuConfig {
    id: SimulationMenuType;
    title: string;
    description: string;
    shortDesc: string;
    icon: typeof Eye;
    iconColor: string;
    defaultPreset: 'clear' | 'blur' | 'glare' | 'mist';
}

const MENU_CONFIGS: MenuConfig[] = [
    {
        id: 'clarity',
        title: '선명도 체감',
        description: '글자/경계가 또렷하게 느껴지는 정도 비교',
        shortDesc: '또렷함 비교',
        icon: Eye,
        iconColor: 'text-cyan-400',
        defaultPreset: 'blur',
    },
    {
        id: 'contrast',
        title: '대비 체감',
        description: '대비 변화로 경계/글자가 덜 또렷해지는 느낌 체감',
        shortDesc: '경계·글자 대비',
        icon: Contrast,
        iconColor: 'text-purple-400',
        defaultPreset: 'mist',
    },
    {
        id: 'nightGlare',
        title: '야간 빛 번짐 체감',
        description: '불빛 번짐(헤일로/눈부심) 느낌을 단계별로 비교',
        shortDesc: '불빛 번짐 느낌',
        icon: Moon,
        iconColor: 'text-yellow-400',
        defaultPreset: 'glare',
    },
    {
        id: 'pattern',
        title: '시야 패턴 체감',
        description: '가림/번짐/왜곡 등 불편 패턴 예시를 선택해 체감',
        shortDesc: '불편 패턴 예시',
        icon: Grid3X3,
        iconColor: 'text-emerald-400',
        defaultPreset: 'mist',
    },
];

export default function MedicalSimulationMenu() {
    const [selectedMenu, setSelectedMenu] = useState<SimulationMenuType | null>(null);

    const handleMenuClick = (menuId: SimulationMenuType) => {
        setSelectedMenu(menuId);
    };

    const handleClose = () => {
        setSelectedMenu(null);
    };

    const selectedConfig = MENU_CONFIGS.find(m => m.id === selectedMenu);

    return (
        <div className="min-h-screen pb-24" style={{ backgroundColor: '#0a0f1a' }}>
            <div className="max-w-lg mx-auto">
                {/* 헤더 */}
                <header className="bg-[#0a0f1a]/80 backdrop-blur-md border-b border-white/10 px-4 py-3 sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                        <Link href="/medical/patient-dashboard" className="p-2 -ml-2 text-gray-400 hover:text-white transition-colors">
                            <ArrowLeft size={24} />
                        </Link>
                        <div>
                            <h1 className="text-lg font-bold text-white">시야 시뮬레이션</h1>
                            <p className="text-xs text-gray-500">가상 체험으로 이해를 돕는 참고용 시뮬레이션</p>
                        </div>
                    </div>
                </header>

                <main className="p-4 space-y-4">
                    {/* 안내 문구 */}
                    <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4 text-sm text-cyan-300">
                        <p className="mb-2">📌 본 시뮬레이션은 이해를 돕기 위한 <b>참고용 예시</b>이며, 실제 상태·결과를 확정하거나 보장하지 않습니다.</p>
                        <p className="text-xs text-cyan-400/70">촬영/이미지는 저장하지 않으며, 저장되는 값은 설정값만입니다.</p>
                    </div>

                    {/* 2x2 메뉴 카드 */}
                    <div className="grid grid-cols-2 gap-3">
                        {MENU_CONFIGS.map((menu) => {
                            const IconComponent = menu.icon;
                            return (
                                <button
                                    key={menu.id}
                                    onClick={() => handleMenuClick(menu.id)}
                                    className="bg-white/5 border border-white/10 rounded-2xl p-4 text-left hover:bg-white/10 hover:border-cyan-500/50 transition-all group"
                                >
                                    <div className={`w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-3 group-hover:bg-cyan-500/20 transition-colors`}>
                                        <IconComponent className={`w-6 h-6 ${menu.iconColor}`} />
                                    </div>
                                    <h3 className="font-bold text-white mb-1">{menu.title}</h3>
                                    <p className="text-xs text-gray-400">{menu.shortDesc}</p>
                                </button>
                            );
                        })}
                    </div>

                    {/* 추가 안내 */}
                    <div className="text-center text-xs text-gray-500 pt-4">
                        <p>PC에서는 샘플 이미지 기반 전/후 비교</p>
                        <p>웹캠 사용 가능 시 실시간 체험 제공</p>
                    </div>
                </main>
            </div>

            {/* 시뮬레이터 모달 */}
            {selectedMenu && selectedConfig && (
                <div className="fixed inset-0 z-50 bg-black/90 flex flex-col">
                    {/* 모달 헤더 */}
                    <div className="flex items-center justify-between p-4 border-b border-white/10">
                        <div>
                            <h2 className="text-lg font-bold text-white">{selectedConfig.title}</h2>
                            <p className="text-xs text-gray-400">{selectedConfig.description}</p>
                        </div>
                        <button
                            onClick={handleClose}
                            className="p-2 text-gray-400 hover:text-white transition-colors"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    {/* 시뮬레이터 본체 */}
                    <div className="flex-1 overflow-y-auto p-4">
                        <VisionSimulatorMedical
                            menuType={selectedMenu}
                            defaultPreset={selectedConfig.defaultPreset}
                            onClose={handleClose}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
