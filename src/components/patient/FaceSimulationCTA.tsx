"use client";

import { useState } from "react";
import { Eye, Camera, ChevronRight, X } from "lucide-react";
import VisionSimulatorMedical from "@/components/medical/VisionSimulatorMedical";

type SimulationMenuType = 'clarity' | 'contrast' | 'nightGlare' | 'pattern';

const MENU_CONFIGS = [
    { id: 'clarity' as SimulationMenuType, title: '선명도 체감', shortDesc: '또렷함 비교', defaultPreset: 'blur' as const },
    { id: 'contrast' as SimulationMenuType, title: '대비 체감', shortDesc: '경계·글자 대비', defaultPreset: 'mist' as const },
    { id: 'nightGlare' as SimulationMenuType, title: '야간 빛 번짐', shortDesc: '눈부심 느낌', defaultPreset: 'glare' as const },
    { id: 'pattern' as SimulationMenuType, title: '시야 패턴', shortDesc: '불편 패턴', defaultPreset: 'mist' as const },
];

export default function FaceSimulationCTA() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedMenu, setSelectedMenu] = useState<SimulationMenuType>('clarity');

    const selectedConfig = MENU_CONFIGS.find(m => m.id === selectedMenu);

    return (
        <>
            {/* 시야 시뮬레이션 CTA 카드 */}
            <button
                onClick={() => setIsModalOpen(true)}
                className="w-full relative p-6 rounded-2xl overflow-hidden cursor-pointer transition-transform hover:scale-[1.02] text-left"
                style={{ background: "linear-gradient(135deg, #0891b2 0%, #0284c7 100%)" }}
            >
                {/* 장식 요소 */}
                <div className="absolute top-4 right-4 opacity-30">
                    <Eye className="w-12 h-12 text-white" />
                </div>

                <span className="inline-block px-3 py-1 text-xs font-medium text-cyan-100 bg-white/20 rounded-full mb-4">
                    시야 시뮬레이션(참고용)
                </span>
                <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                    <Camera className="w-5 h-5" />
                    시야 체감 확인하기
                </h3>
                <p className="text-sm text-cyan-100 mb-4 leading-relaxed">
                    선명도, 대비, 빛번짐 등 다양한 시야 변화를
                    <br />
                    가상으로 체험해볼 수 있어요.
                </p>

                <div className="flex items-center justify-between p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-colors">
                    <span className="text-sm text-white font-medium">지금 체험하기</span>
                    <ChevronRight className="w-5 h-5 text-white" />
                </div>
            </button>

            {/* 시야 시뮬레이션 모달 */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/90 flex flex-col">
                    {/* 모달 헤더 */}
                    <div className="flex items-center justify-between p-4 border-b border-white/10">
                        <div>
                            <h2 className="text-lg font-bold text-white">시야 시뮬레이션</h2>
                            <p className="text-xs text-gray-400">참고용 체감 시뮬레이션</p>
                        </div>
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="p-2 text-gray-400 hover:text-white transition-colors"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    {/* 메뉴 선택 */}
                    <div className="flex gap-2 p-4 overflow-x-auto border-b border-white/10">
                        {MENU_CONFIGS.map((menu) => (
                            <button
                                key={menu.id}
                                onClick={() => setSelectedMenu(menu.id)}
                                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedMenu === menu.id
                                        ? 'bg-cyan-500 text-white'
                                        : 'bg-white/10 text-gray-400 hover:bg-white/20'
                                    }`}
                            >
                                {menu.title}
                            </button>
                        ))}
                    </div>

                    {/* 시뮬레이터 본체 */}
                    <div className="flex-1 overflow-y-auto p-4">
                        {selectedConfig && (
                            <VisionSimulatorMedical
                                menuType={selectedMenu}
                                defaultPreset={selectedConfig.defaultPreset}
                                onClose={() => setIsModalOpen(false)}
                            />
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
