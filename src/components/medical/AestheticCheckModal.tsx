"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { X, ChevronRight, ChevronLeft, AlertTriangle, CheckCircle, ClipboardList, Sparkles, Sun, Zap, Syringe, Droplets, Scissors } from "lucide-react";

type AestheticCheckModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onComplete?: (summary: string) => void;
};

// 미용 시술 카테고리
const AESTHETIC_CATEGORIES = [
    { id: 'pigment', label: '기미·색소·미백', desc: '잡티·주근깨·칙칙한 톤', icon: <Sun className="w-8 h-8 text-orange-400" /> },
    { id: 'lifting', label: '리프팅·탄력·주름', desc: '처진 살·팔자주름·잔주름', icon: <Zap className="w-8 h-8 text-purple-400" /> },
    { id: 'acne', label: '여드름·모공·흉터', desc: '화농성·좁쌀·늘어난 모공', icon: <Sparkles className="w-8 h-8 text-emerald-400" /> },
    { id: 'petit', label: '쁘띠·윤곽', desc: '사각턱·이마/미간·꺼진 볼', icon: <Syringe className="w-8 h-8 text-pink-400" /> },
    { id: 'booster', label: '스킨부스터·수분', desc: '속건조·물광·피부결', icon: <Droplets className="w-8 h-8 text-blue-400" /> },
    { id: 'body', label: '제모·바디', desc: '겨드랑이·팔/다리·라인', icon: <Scissors className="w-8 h-8 text-rose-400" /> }
];

// 부위 옵션
const AREA_OPTIONS = [
    { id: 'forehead', label: '이마' },
    { id: 'eyes', label: '눈가' },
    { id: 'cheek', label: '볼/광대' },
    { id: 'nose', label: '코' },
    { id: 'mouth', label: '입가/턱' },
    { id: 'neck', label: '목' },
    { id: 'all', label: '얼굴 전체' },
    { id: 'body', label: '바디' }
];

// 고민 기간 & 시술 경험
const DURATION_OPTIONS = [
    { id: 'recent', label: '최근 고민 시작' },
    { id: 'under_1y', label: '1년 미만' },
    { id: 'over_1y', label: '1년 이상' },
    { id: 'recurring', label: '오래된 고민' }
];

const EXPERIENCE_OPTIONS = [
    { id: 'none', label: '시술 경험 없음' },
    { id: '1_3_times', label: '1~3회 경험' },
    { id: 'regular', label: '정기적 관리 중' },
    { id: 'many', label: '다양한 시술 경험' }
];

// 원하는 개선 방향
const GOAL_OPTIONS = [
    { id: 'natural', label: '자연스럽게' },
    { id: 'dramatic', label: '확실한 효과' },
    { id: 'less_pain', label: '통증 적게' },
    { id: 'quick_recovery', label: '회복 빠르게' },
    { id: 'cost_effective', label: '가성비 중요' },
    { id: 'premium', label: '프리미엄 관리' }
];

// 피부 타입
const SKIN_TYPE_OPTIONS = [
    { id: 'dry', label: '건성' },
    { id: 'oily', label: '지성' },
    { id: 'combination', label: '복합성' },
    { id: 'sensitive', label: '민감성' }
];

// 시술 전 체크리스트 (Red Flags 대체)
const PRE_CHECK_LIST = [
    { id: 'pregnancy', label: '임신/수유 중' },
    { id: 'keloid', label: '켈로이드 피부' },
    { id: 'roaccutane', label: '로아큐탄 등 복용 중' },
    { id: 'recent_proc', label: '최근 2주 내 시술 받음' },
    { id: 'filler', label: '필러 시술 경험 있음' },
    { id: 'implant', label: '치아 임플란트/교정 중' }
];

export default function AestheticCheckModal({ isOpen, onClose, onComplete }: AestheticCheckModalProps) {
    const [step, setStep] = useState(1);
    const [category, setCategory] = useState('');
    const [area, setArea] = useState<string[]>([]);
    const [duration, setDuration] = useState('');
    const [experience, setExperience] = useState('');
    const [goals, setGoals] = useState<string[]>([]);
    const [skinType, setSkinType] = useState('');
    const [preChecks, setPreChecks] = useState<string[]>([]);
    const [memo, setMemo] = useState('');
    const [summary, setSummary] = useState('');

    const totalSteps = 6;

    const handleMultiSelect = (value: string, current: string[], setter: (val: string[]) => void) => {
        setter(current.includes(value)
            ? current.filter(v => v !== value)
            : [...current, value]
        );
    };

    const handlePreCheckChange = (checkId: string) => {
        setPreChecks(prev =>
            prev.includes(checkId)
                ? prev.filter(c => c !== checkId)
                : [...prev, checkId]
        );
    };

    const generateSummary = () => {
        const categoryLabel = AESTHETIC_CATEGORIES.find(c => c.id === category)?.label || category;
        const areaLabels = AREA_OPTIONS.filter(a => area.includes(a.id)).map(a => a.label).join(', ') || '미선택';
        const durationLabel = DURATION_OPTIONS.find(d => d.id === duration)?.label || duration;
        const experienceLabel = EXPERIENCE_OPTIONS.find(e => e.id === experience)?.label || experience;
        const goalLabels = GOAL_OPTIONS.filter(g => goals.includes(g.id)).map(g => g.label).join(', ') || '미선택';
        const skinTypeLabel = SKIN_TYPE_OPTIONS.find(s => s.id === skinType)?.label || skinType;
        const selectedPreChecks = PRE_CHECK_LIST.filter(c => preChecks.includes(c.id)).map(c => c.label);

        let summaryText = `## 미용 시술 상담 기초자료\n\n`;
        summaryText += `**관심 시술**: ${categoryLabel}\n`;
        summaryText += `**고민 부위**: ${areaLabels}\n\n`;
        summaryText += `**고민 기간**: ${durationLabel}\n`;
        summaryText += `**시술 경험**: ${experienceLabel}\n\n`;
        summaryText += `**선호 방향**: ${goalLabels}\n`;
        summaryText += `**피부 타입**: ${skinTypeLabel}\n\n`;

        if (memo) {
            summaryText += `**추가 메모**: ${memo}\n\n`;
        }

        if (selectedPreChecks.length > 0) {
            summaryText += `**⚠️ 시술 전 체크사항**: ${selectedPreChecks.join(', ')}\n\n`;
        }

        summaryText += `---\n\n`;
        summaryText += `> 💡 이 자료는 상담을 위한 기초 정보입니다. 정확한 시술 계획은 의료진과 상담 후 결정됩니다.`;

        return summaryText;
    };

    const handleComplete = () => {
        const generatedSummary = generateSummary();
        setSummary(generatedSummary);
        setStep(7); // Summary step
        onComplete?.(generatedSummary);
    };

    const handleNext = () => {
        if (step === 6) {
            handleComplete();
        } else {
            setStep(step + 1);
        }
    };

    const handleBack = () => {
        if (step > 1) setStep(step - 1);
    };

    const resetAndClose = () => {
        setStep(1);
        setCategory('');
        setArea([]);
        setDuration('');
        setExperience('');
        setGoals([]);
        setSkinType('');
        setPreChecks([]);
        setMemo('');
        setSummary('');
        onClose();
    };

    const canProceed = () => {
        switch (step) {
            case 1: return !!category;
            case 2: return area.length > 0;
            case 3: return !!duration && !!experience;
            case 4: return goals.length > 0;
            case 5: return !!skinType;
            case 6: return true;
            default: return true;
        }
    };

    if (!isOpen) return null;

    const modalContent = (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-[#1e293b] rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col border border-gray-700">
                {/* Header */}
                <div className="bg-gray-800 p-4 flex justify-between items-center border-b border-gray-700">
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-purple-400" />
                            <h3 className="font-bold text-lg text-white">미용 시술 상담 체크</h3>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">나에게 맞는 시술을 찾기 위한 기초 설문입니다.</p>
                    </div>
                    <button onClick={resetAndClose} className="text-gray-400 hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                {/* Progress */}
                {step <= 6 && (
                    <div className="px-4 pt-4">
                        <div className="flex gap-1">
                            {Array.from({ length: totalSteps }).map((_, i) => (
                                <div key={i} className={`h-1 flex-1 rounded-full ${i < step ? 'bg-purple-500' : 'bg-gray-700'}`} />
                            ))}
                        </div>
                        <p className="text-xs text-gray-400 mt-2">단계 {step}/{totalSteps}</p>
                    </div>
                )}

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6">
                    {step === 1 ? (
                        <div className="space-y-4">
                            <h4 className="text-lg font-bold text-white">어떤 시술에 관심이 있으신가요?</h4>
                            <div className="grid grid-cols-2 gap-3">
                                {AESTHETIC_CATEGORIES.map(cat => (
                                    <button
                                        key={cat.id}
                                        onClick={() => setCategory(cat.id)}
                                        className={`p-4 rounded-xl border-2 transition-all text-left flex flex-col items-center text-center gap-2 ${category === cat.id ? 'border-purple-500 bg-purple-500/20' : 'border-gray-700 hover:border-purple-400 bg-gray-800/50'}`}
                                    >
                                        <div className="mb-1">{cat.icon}</div>
                                        <div>
                                            <span className="text-sm font-bold text-white block">{cat.label}</span>
                                            <span className="text-xs text-gray-400">{cat.desc}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : step === 2 ? (
                        <div className="space-y-4">
                            <h4 className="text-lg font-bold text-white">어느 부위가 고민이신가요?</h4>
                            <p className="text-sm text-gray-400">복수 선택 가능</p>
                            <div className="grid grid-cols-2 gap-2">
                                {AREA_OPTIONS.map(opt => (
                                    <button
                                        key={opt.id}
                                        onClick={() => handleMultiSelect(opt.id, area, setArea)}
                                        className={`p-3 rounded-xl border-2 transition-all ${area.includes(opt.id) ? 'border-purple-500 bg-purple-500/20 text-purple-300 font-medium' : 'border-gray-700 hover:border-purple-400 text-gray-300 bg-gray-800/50'}`}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : step === 3 ? (
                        <div className="space-y-6">
                            <div>
                                <h4 className="text-lg font-bold text-white mb-3">고민 기간은 얼마나 되셨나요?</h4>
                                <div className="grid grid-cols-2 gap-2">
                                    {DURATION_OPTIONS.map(opt => (
                                        <button
                                            key={opt.id}
                                            onClick={() => setDuration(opt.id)}
                                            className={`p-3 rounded-xl border-2 transition-all text-sm ${duration === opt.id ? 'border-purple-500 bg-purple-500/20 text-purple-300 font-medium' : 'border-gray-700 hover:border-purple-400 text-gray-300 bg-gray-800/50'}`}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <h4 className="text-lg font-bold text-white mb-3">관련 시술 경험이 있으신가요?</h4>
                                <div className="grid grid-cols-2 gap-2">
                                    {EXPERIENCE_OPTIONS.map(opt => (
                                        <button
                                            key={opt.id}
                                            onClick={() => setExperience(opt.id)}
                                            className={`p-3 rounded-xl border-2 transition-all text-sm ${experience === opt.id ? 'border-purple-500 bg-purple-500/20 text-purple-300 font-medium' : 'border-gray-700 hover:border-purple-400 text-gray-300 bg-gray-800/50'}`}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : step === 4 ? (
                        <div className="space-y-4">
                            <h4 className="text-lg font-bold text-white">어떤 결과를 원하시나요?</h4>
                            <p className="text-sm text-gray-400">중요하게 생각하는 가치를 선택해주세요 (복수 선택)</p>
                            <div className="flex flex-wrap gap-2">
                                {GOAL_OPTIONS.map(opt => (
                                    <button
                                        key={opt.id}
                                        onClick={() => handleMultiSelect(opt.id, goals, setGoals)}
                                        className={`px-4 py-2 rounded-full border-2 transition-all text-sm ${goals.includes(opt.id) ? 'border-purple-500 bg-purple-500/20 text-purple-300 font-medium' : 'border-gray-700 hover:border-purple-400 text-gray-300 bg-gray-800/50'}`}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : step === 5 ? (
                        <div className="space-y-6">
                            <div>
                                <h4 className="text-lg font-bold text-white mb-3">본인의 피부 타입은?</h4>
                                <div className="grid grid-cols-2 gap-2">
                                    {SKIN_TYPE_OPTIONS.map(opt => (
                                        <button
                                            key={opt.id}
                                            onClick={() => setSkinType(opt.id)}
                                            className={`p-3 rounded-xl border-2 transition-all text-sm ${skinType === opt.id ? 'border-purple-500 bg-purple-500/20 text-purple-300 font-medium' : 'border-gray-700 hover:border-purple-400 text-gray-300 bg-gray-800/50'}`}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-gray-300 mb-2">추가 메모 (선택)</h4>
                                <textarea
                                    value={memo}
                                    onChange={(e) => setMemo(e.target.value)}
                                    placeholder="예: 특히 눈가 주름이 신경 쓰여요."
                                    className="w-full p-3 border-2 border-gray-700 bg-gray-800 text-white placeholder-gray-500 rounded-xl focus:border-purple-500 focus:outline-none resize-none h-24 text-sm"
                                />
                            </div>
                        </div>
                    ) : step === 6 ? (
                        <div className="space-y-4">
                            <h4 className="text-lg font-bold text-white">시술 전 체크리스트</h4>
                            <p className="text-sm text-gray-400">해당하는 항목이 있다면 체크해주세요.</p>
                            <div className="space-y-2">
                                {PRE_CHECK_LIST.map(check => (
                                    <button
                                        key={check.id}
                                        onClick={() => handlePreCheckChange(check.id)}
                                        className={`w-full p-4 rounded-xl border-2 text-left transition-all flex items-center gap-3 ${preChecks.includes(check.id) ? 'border-pink-500 bg-pink-500/20' : 'border-gray-700 hover:border-pink-400 bg-gray-800/50'}`}
                                    >
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${preChecks.includes(check.id) ? 'border-pink-500 bg-pink-500' : 'border-gray-500'}`}>
                                            {preChecks.includes(check.id) && <CheckCircle className="w-4 h-4 text-white" />}
                                        </div>
                                        <span className="font-medium text-gray-200">{check.label}</span>
                                    </button>
                                ))}
                            </div>
                            <div className="bg-gray-800/50 p-4 rounded-xl text-xs text-gray-400 mt-4 border border-gray-700">
                                * 위 항목은 시술 가능 여부 판단에 중요한 정보입니다. 정확하게 체크해주세요.
                            </div>
                        </div>
                    ) : step === 7 ? (
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 mb-4">
                                <CheckCircle className="w-6 h-6 text-purple-400" />
                                <h4 className="text-lg font-bold text-white">상담 기초자료 작성 완료</h4>
                            </div>
                            <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700 text-sm text-gray-300 whitespace-pre-wrap">
                                {summary.replace(/##/g, '').replace(/\*\*/g, '').replace(/>/g, '')}
                            </div>
                            <p className="text-xs text-gray-400 text-center">
                                작성하신 내용은 상담 시 의료진에게 전달됩니다.<br />
                                대기실에서 잠시만 기다려주세요.
                            </p>
                            <div className="space-y-2">
                                <button
                                    onClick={() => window.location.href = '/login?returnTo=/medical/patient-dashboard'}
                                    className="w-full py-3 bg-purple-500 text-white rounded-xl font-medium hover:bg-purple-600 transition-colors"
                                >
                                    요약 저장 (로그인)
                                </button>
                                <button
                                    onClick={resetAndClose}
                                    className="w-full py-3 bg-gray-700 text-gray-300 rounded-xl font-medium hover:bg-gray-600 transition-colors"
                                >
                                    닫기
                                </button>
                            </div>
                        </div>
                    ) : null}
                </div>

                {/* Footer */}
                {step <= 6 && (
                    <div className="p-4 border-t border-gray-700">
                        <div className="flex gap-3">
                            {step > 1 && (
                                <button
                                    onClick={handleBack}
                                    className="flex-1 py-3 border border-gray-600 text-gray-300 rounded-xl font-medium hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                                >
                                    <ChevronLeft size={18} /> 이전
                                </button>
                            )}
                            <button
                                onClick={handleNext}
                                disabled={!canProceed()}
                                className="flex-1 py-3 bg-purple-500 text-white rounded-xl font-medium hover:bg-purple-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {step === 6 ? '완료' : '다음'} <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );

    if (typeof document !== 'undefined') {
        return createPortal(modalContent, document.body);
    }
    return modalContent;
}
