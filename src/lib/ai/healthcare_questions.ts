// 아이니의원 헬스케어 질문 풀
// 질문 ID 포함 (분석/트래킹용)

import { Topic } from '@/lib/constants/topics';

export type QuestionType = 'single' | 'text';

export interface HealthcareQuestion {
    id: string;
    label: string;
    type: QuestionType;
    options?: string[];
}

export const HEALTHCARE_QUESTIONS: Record<Topic, HealthcareQuestion[]> = {
    'glow-booster': [
        { id: 'glow_q1', label: '하루 수분 섭취량은 어느 정도인가요?', type: 'single', options: ['500ml 이하', '500ml~1L', '1L~2L', '2L 이상'] },
        { id: 'glow_q2', label: '평균 수면 시간은 어떻게 되시나요?', type: 'single', options: ['5시간 이하', '5~7시간', '7~8시간', '8시간 이상'] },
        { id: 'glow_q3', label: '각질 케어는 얼마나 자주 하시나요?', type: 'single', options: ['안 함', '월 1~2회', '주 1회', '주 2회 이상'] },
        { id: 'glow_q4', label: '비타민/영양제 섭취하고 계신가요?', type: 'single', options: ['안 먹음', '가끔', '매일 1종', '매일 여러 종'] },
        { id: 'glow_q5', label: '피부 광채를 위해 가장 신경 쓰는 부분은?', type: 'text' },
    ],
    'makeup-killer': [
        { id: 'makeup_q1', label: '메이크업이 보통 몇 시간 정도 지속되나요?', type: 'single', options: ['2시간 이내', '2~4시간', '4~6시간', '6시간 이상'] },
        { id: 'makeup_q2', label: '가장 먼저 무너지는 부위는 어디인가요?', type: 'single', options: ['T존', '볼', '눈가', '입 주변'] },
        { id: 'makeup_q3', label: '피부 유분 정도는 어떤가요?', type: 'single', options: ['매우 건조', '건조', '복합성', '지성'] },
        { id: 'makeup_q4', label: '모공이 신경 쓰이시나요?', type: 'single', options: ['전혀 안 됨', '약간', '많이', '매우 신경 쓰임'] },
        { id: 'makeup_q5', label: '현재 사용 중인 베이스 메이크업 제품 유형은?', type: 'text' },
    ],
    'barrier-reset': [
        { id: 'barrier_q1', label: '하루 세안 횟수는 몇 번인가요?', type: 'single', options: ['1회', '2회', '3회 이상'] },
        { id: 'barrier_q2', label: '최근 피부 자극을 느낀 적이 있으신가요?', type: 'single', options: ['없음', '가끔', '자주', '항상'] },
        { id: 'barrier_q3', label: '보습제 사용 빈도는 어떻게 되시나요?', type: 'single', options: ['안 바름', '아침만', '저녁만', '아침/저녁 모두'] },
        { id: 'barrier_q4', label: '피부가 당기는 느낌이 있으신가요?', type: 'single', options: ['전혀 없음', '가끔', '자주', '항상'] },
        { id: 'barrier_q5', label: '최근 피부에 새로 사용한 제품이 있으신가요?', type: 'text' },
    ],
    'lifting-check': [
        { id: 'lifting_q1', label: '탄력이 가장 신경 쓰이는 부위는?', type: 'single', options: ['이마', '눈가', '볼', '턱선', '목'] },
        { id: 'lifting_q2', label: '리프팅 관련 시술 경험이 있으신가요?', type: 'single', options: ['없음', '1회', '2~3회', '정기적으로'] },
        { id: 'lifting_q3', label: '리프팅 시술에서 가장 중요하게 생각하는 것은?', type: 'single', options: ['자연스러움', '효과 지속', '통증 최소화', '가격'] },
        { id: 'lifting_q4', label: '현재 나이대는 어떻게 되시나요?', type: 'single', options: ['20대', '30대', '40대', '50대 이상'] },
        { id: 'lifting_q5', label: '리프팅에 대한 기대나 궁금한 점이 있으시면 적어주세요.', type: 'text' },
    ],
    'skin-concierge': [
        { id: 'concierge_q1', label: '본인의 피부 타입은 어떻다고 생각하시나요?', type: 'single', options: ['건성', '중성', '지성', '복합성', '민감성'] },
        { id: 'concierge_q2', label: '현재 스킨케어 루틴 단계 수는?', type: 'single', options: ['1~2단계', '3~4단계', '5~6단계', '7단계 이상'] },
        { id: 'concierge_q3', label: '가장 개선하고 싶은 피부 고민은?', type: 'single', options: ['모공/피지', '잡티/색소', '주름/탄력', '건조/당김', '트러블'] },
        { id: 'concierge_q4', label: '스킨케어에 투자하는 월 비용은?', type: 'single', options: ['5만원 이하', '5~10만원', '10~20만원', '20만원 이상'] },
        { id: 'concierge_q5', label: '맞춤 루틴 설계에서 가장 원하시는 것은?', type: 'text' },
    ],
};

// topic별 초기 질문 (첫 턴)
export function getInitialQuestion(topic: Topic): HealthcareQuestion {
    return HEALTHCARE_QUESTIONS[topic][0];
}
