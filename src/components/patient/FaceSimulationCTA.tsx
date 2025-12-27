"use client";

import { useState } from "react";
import { Sparkles, Camera, ChevronRight } from "lucide-react";
import FaceSimulationModal from "@/components/face-style/FaceSimulationModal";

export default function FaceSimulationCTA() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <>
            {/* 가상 시각화 CTA 카드 */}
            <button
                onClick={() => setIsModalOpen(true)}
                className="w-full relative p-6 rounded-2xl overflow-hidden cursor-pointer transition-transform hover:scale-[1.02] text-left"
                style={{ background: "linear-gradient(135deg, #7c3aed 0%, #db2777 100%)" }}
            >
                {/* 장식 요소 */}
                <div className="absolute top-4 right-4 opacity-30">
                    <Sparkles className="w-12 h-12 text-white" />
                </div>

                <span className="inline-block px-3 py-1 text-xs font-medium text-pink-100 bg-white/20 rounded-full mb-4">
                    가상 시뮬레이션(참고용)
                </span>
                <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                    <Camera className="w-5 h-5" />
                    내 사진으로 확인하기
                </h3>
                <p className="text-sm text-pink-100 mb-4 leading-relaxed">
                    내 사진을 업로드하면 다양한 스타일을
                    <br />
                    가상으로 시각화해볼 수 있어요.
                </p>

                <div className="flex items-center justify-between p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-colors">
                    <span className="text-sm text-white font-medium">지금 체험하기</span>
                    <ChevronRight className="w-5 h-5 text-white" />
                </div>
            </button>

            {/* 모달 - 모바일 전체 화면 */}
            <FaceSimulationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                isMobile={true}
            />
        </>
    );
}
