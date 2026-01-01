"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { X, ChevronRight, ChevronLeft, CheckCircle, Eye, Glasses, Droplets, Activity, Sparkles, Heart } from "lucide-react";

type EyeCareCheckModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onComplete?: (summary: string) => void;
};

// 안과 상담 카테고리
const EYE_CARE_CATEGORIES = [
    { id: 'vision', label: '시력교정', desc: '라식/라섹/렌즈삽입술', icon: <Eye className="w-8 h-8 text-cyan-400" /> },
    { id: 'cataract', label: '노안·백내장', desc: '다초점렌즈/백내장수술', icon: <Glasses className="w-8 h-8 text-purple-400" /> },
    { id: 'dryeye', label: '드라이아이', desc: '건조증/눈물층 개선', icon: <Droplets className="w-8 h-8 text-blue-400" /> },
    { id: 'retina', label: '녹내장·망막', desc: '정밀검진/시신경 관리', icon: <Activity className="w-8 h-8 text-emerald-400" /> },
    { id: 'eyelid', label: '눈꺼풀·성형', desc: '안검하수/눈밑지방', icon: <Sparkles className="w-8 h-8 text-pink-400" /> },
    { id: 'lens', label: '콘택트렌즈', desc: 'RGP/드림렌즈/하드렌즈', icon: <Heart className="w-8 h-8 text-rose-400" /> }
];

// 증상/고민 옵션
const SYMPTOM_OPTIONS = [
    { id: 'blur_near', label: '가까운 거리 흐림' },
    { id: 'blur_far', label: '먼 거리 흐림' },
    { id: 'dry', label: '눈 건조/뻑뻑함' },
    { id: 'fatigue', label: '눈 피로/충혈' },
    { id: 'glare', label: '눈부심/빛번짐' },
    { id: 'floater', label: '비문증(날파리)' },
    { id: 'headache', label: '두통/어지러움' },
    { id: 'droopy', label: '눈꺼풀 처짐' }
];

// 고민 기간 & 검사 경험
const DURATION_OPTIONS = [
    { id: 'recent', label: '최근 발생' },
    { id: 'under_1y', label: '1년 미만' },
    { id: 'over_1y', label: '1년 이상' },
    { id: 'chronic', label: '오래된 증상' }
];

const EXAM_EXPERIENCE_OPTIONS = [
    { id: 'none', label: '안과 검진 경험 없음' },
    { id: '1_2y', label: '1~2년 내 검진' },
    { id: 'regular', label: '정기 검진 중' },
    { id: 'recent', label: '최근 검진 받음' }
];

// 원하는 상담 방향
const GOAL_OPTIONS = [
    { id: 'surgery', label: '수술 상담' },
    { id: 'nonsurgery', label: '비수술 치료' },
    { id: 'checkup', label: '정밀 검진' },
    { id: 'second_opinion', label: '세컨드 오피니언' },
    { id: 'cost', label: '비용 상담' },
    { id: 'premium', label: '프리미엄 케어' }
];

// 현재 시력 상태
const VISION_STATUS_OPTIONS = [
    { id: 'normal', label: '정상 시력' },
    { id: 'myopia', label: '근시' },
    { id: 'hyperopia', label: '원시' },
    { id: 'astigmatism', label: '난시' },
    { id: 'presbyopia', label: '노안' }
];

// 상담 전 체크리스트
const PRE_CHECK_LIST = [
    { id: 'diabetes', label: '당뇨병 있음' },
    { id: 'hypertension', label: '고혈압 있음' },
    { id: 'glaucoma_family', label: '녹내장 가족력' },
    { id: 'eye_surgery', label: '과거 눈 수술 경험' },
    { id: 'contact_lens', label: '콘택트렌즈 사용 중' },
    { id: 'medication', label: '안약/점안제 사용 중' }
];

export default function AestheticCheckModal({ isOpen, onClose, onComplete }: EyeCareCheckModalProps) {
    const [step, setStep] = useState(1);
    const [category, setCategory] = useState('');
    const [symptoms, setSymptoms] = useState<string[]>([]);
    const [duration, setDuration] = useState('');
    const [examExperience, setExamExperience] = useState('');
    const [goals, setGoals] = useState<string[]>([]);
    const [visionStatus, setVisionStatus] = useState('');
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
        const categoryLabel = EYE_CARE_CATEGORIES.find(c => c.id === category)?.label || category;
        const symptomLabels = SYMPTOM_OPTIONS.filter(s => symptoms.includes(s.id)).map(s => s.label).join(', ') || '미선택';
        const durationLabel = DURATION_OPTIONS.find(d => d.id === duration)?.label || duration;
        const examLabel = EXAM_EXPERIENCE_OPTIONS.find(e => e.id === examExperience)?.label || examExperience;
        const goalLabels = GOAL_OPTIONS.filter(g => goals.includes(g.id)).map(g => g.label).join(', ') || '미선택';
        const visionLabel = VISION_STATUS_OPTIONS.find(v => v.id === visionStatus)?.label || visionStatus;
        const selectedPreChecks = PRE_CHECK_LIST.filter(c => preChecks.includes(c.id)).map(c => c.label);

        let summaryText = `## 안과 상담 기초자료\n\n`;
        summaryText += `**관심 분야**: ${categoryLabel}\n`;
        summaryText += `**주요 증상**: ${symptomLabels}\n\n`;
        summaryText += `**증상 기간**: ${durationLabel}\n`;
        summaryText += `**검진 경험**: ${examLabel}\n\n`;
        summaryText += `**상담 목적**: ${goalLabels}\n`;
        summaryText += `**현재 시력**: ${visionLabel}\n\n`;

        if (memo) {
            summaryText += `**추가 메모**: ${memo}\n\n`;
        }

        if (selectedPreChecks.length > 0) {
            summaryText += `**⚠️ 참고사항**: ${selectedPreChecks.join(', ')}\n\n`;
        }

        summaryText += `---\n\n`;
        summaryText += `> 💡 이 자료는 상담을 위한 기초 정보입니다. 정확한 진료 계획은 전문의와 상담 후 결정됩니다.`;

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
        setSymptoms([]);
        setDuration('');
        setExamExperience('');
        setGoals([]);
        setVisionStatus('');
        setPreChecks([]);
        setMemo('');
        setSummary('');
        onClose();
    };

    const canProceed = () => {
        switch (step) {
            case 1: return !!category;
            case 2: return symptoms.length > 0;
            case 3: return !!duration && !!examExperience;
            case 4: return goals.length > 0;
            case 5: return !!visionStatus;
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
                            <Eye className="w-5 h-5 text-cyan-400" />
                            <h3 className="font-bold text-lg text-white">안과 상담 체크</h3>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">나에게 맞는 진료를 찾기 위한 기초 설문입니다.</p>
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
                                <div key={i} className={`h-1 flex-1 rounded-full ${i < step ? 'bg-cyan-500' : 'bg-gray-700'}`} />
                            ))}
                        </div>
                        <p className="text-xs text-gray-400 mt-2">단계 {step}/{totalSteps}</p>
                    </div>
                )}

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6">
                    {step === 1 ? (
                        <div className="space-y-4">
                            <h4 className="text-lg font-bold text-white">어떤 상담이 필요하신가요?</h4>
                            <div className="grid grid-cols-2 gap-3">
                                {EYE_CARE_CATEGORIES.map(cat => (
                                    <button
                                        key={cat.id}
                                        onClick={() => setCategory(cat.id)}
                                        className={`p-4 rounded-xl border-2 transition-all text-left flex flex-col items-center text-center gap-2 ${category === cat.id ? 'border-cyan-500 bg-cyan-500/20' : 'border-gray-700 hover:border-cyan-400 bg-gray-800/50'}`}
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
                            <h4 className="text-lg font-bold text-white">어떤 증상이 있으신가요?</h4>
                            <p className="text-sm text-gray-400">복수 선택 가능</p>
                            <div className="grid grid-cols-2 gap-2">
                                {SYMPTOM_OPTIONS.map(opt => (
                                    <button
                                        key={opt.id}
                                        onClick={() => handleMultiSelect(opt.id, symptoms, setSymptoms)}
                                        className={`p-3 rounded-xl border-2 transition-all ${symptoms.includes(opt.id) ? 'border-cyan-500 bg-cyan-500/20 text-cyan-300 font-medium' : 'border-gray-700 hover:border-cyan-400 text-gray-300 bg-gray-800/50'}`}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : step === 3 ? (
                        <div className="space-y-6">
                            <div>
                                <h4 className="text-lg font-bold text-white mb-3">증상은 얼마나 되셨나요?</h4>
                                <div className="grid grid-cols-2 gap-2">
                                    {DURATION_OPTIONS.map(opt => (
                                        <button
                                            key={opt.id}
                                            onClick={() => setDuration(opt.id)}
                                            className={`p-3 rounded-xl border-2 transition-all text-sm ${duration === opt.id ? 'border-cyan-500 bg-cyan-500/20 text-cyan-300 font-medium' : 'border-gray-700 hover:border-cyan-400 text-gray-300 bg-gray-800/50'}`}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <h4 className="text-lg font-bold text-white mb-3">안과 검진 경험이 있으신가요?</h4>
                                <div className="grid grid-cols-2 gap-2">
                                    {EXAM_EXPERIENCE_OPTIONS.map(opt => (
                                        <button
                                            key={opt.id}
                                            onClick={() => setExamExperience(opt.id)}
                                            className={`p-3 rounded-xl border-2 transition-all text-sm ${examExperience === opt.id ? 'border-cyan-500 bg-cyan-500/20 text-cyan-300 font-medium' : 'border-gray-700 hover:border-cyan-400 text-gray-300 bg-gray-800/50'}`}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : step === 4 ? (
                        <div className="space-y-4">
                            <h4 className="text-lg font-bold text-white">상담 목적을 선택해주세요</h4>
                            <p className="text-sm text-gray-400">복수 선택 가능</p>
                            <div className="flex flex-wrap gap-2">
                                {GOAL_OPTIONS.map(opt => (
                                    <button
                                        key={opt.id}
                                        onClick={() => handleMultiSelect(opt.id, goals, setGoals)}
                                        className={`px-4 py-2 rounded-full border-2 transition-all text-sm ${goals.includes(opt.id) ? 'border-cyan-500 bg-cyan-500/20 text-cyan-300 font-medium' : 'border-gray-700 hover:border-cyan-400 text-gray-300 bg-gray-800/50'}`}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : step === 5 ? (
                        <div className="space-y-6">
                            <div>
                                <h4 className="text-lg font-bold text-white mb-3">현재 시력 상태는?</h4>
                                <div className="grid grid-cols-2 gap-2">
                                    {VISION_STATUS_OPTIONS.map(opt => (
                                        <button
                                            key={opt.id}
                                            onClick={() => setVisionStatus(opt.id)}
                                            className={`p-3 rounded-xl border-2 transition-all text-sm ${visionStatus === opt.id ? 'border-cyan-500 bg-cyan-500/20 text-cyan-300 font-medium' : 'border-gray-700 hover:border-cyan-400 text-gray-300 bg-gray-800/50'}`}
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
                                    placeholder="예: 야간 운전 시 눈부심이 심해요."
                                    className="w-full p-3 border-2 border-gray-700 bg-gray-800 text-white placeholder-gray-500 rounded-xl focus:border-cyan-500 focus:outline-none resize-none h-24 text-sm"
                                />
                            </div>
                        </div>
                    ) : step === 6 ? (
                        <div className="space-y-4">
                            <h4 className="text-lg font-bold text-white">상담 전 체크리스트</h4>
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
                                * 위 항목은 진료 계획에 중요한 정보입니다. 정확하게 체크해주세요.
                            </div>
                        </div>
                    ) : step === 7 ? (
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 mb-4">
                                <CheckCircle className="w-6 h-6 text-cyan-400" />
                                <h4 className="text-lg font-bold text-white">상담 기초자료 작성 완료</h4>
                            </div>
                            <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700 text-sm text-gray-300 whitespace-pre-wrap">
                                {summary.replace(/##/g, '').replace(/\*\*/g, '').replace(/>/g, '')}
                            </div>
                            <p className="text-xs text-gray-400 text-center">
                                작성하신 내용은 상담 시 전문의에게 전달됩니다.<br />
                                대기실에서 잠시만 기다려주세요.
                            </p>
                            <div className="space-y-2">
                                <button
                                    onClick={() => window.location.href = '/login?returnTo=/medical/patient-dashboard'}
                                    className="w-full py-3 bg-cyan-500 text-white rounded-xl font-medium hover:bg-cyan-600 transition-colors"
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
                                className="flex-1 py-3 bg-cyan-500 text-white rounded-xl font-medium hover:bg-cyan-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
