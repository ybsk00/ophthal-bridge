// 아이디안과 헬스케어 질문 풀
// 질문 ID 포함 (분석/트래킹용)
// 주의: 진단/처방/스크리닝 표현 금지, 참고용 자가 체크로만 안내

import { Topic } from '@/lib/constants/topics';

export type QuestionType = 'single' | 'text';

export interface HealthcareQuestion {
    id: string;
    label: string;
    type: QuestionType;
    options?: string[];
}

export const HEALTHCARE_QUESTIONS: Record<Topic, HealthcareQuestion[]> = {
    // M1. 눈 컨디션 지수 (Eye Condition Score)
    'condition': [
        { id: 'cond_q1', label: '나이대를 선택해주세요.', type: 'single', options: ['20대', '30대', '40대', '50대 이상'] },
        { id: 'cond_q2', label: '주간 스크린(PC/스마트폰) 사용 시간은?', type: 'single', options: ['2시간 이하', '3~5시간', '6~8시간', '8시간 이상'] },
        { id: 'cond_q3', label: '야간에 스크린을 자주 보시나요?', type: 'single', options: ['거의 안 봄', '가끔', '자주', '매일 늦게까지'] },
        { id: 'cond_q4', label: '근거리 작업(독서, 문서작업) 빈도는?', type: 'single', options: ['거의 없음', '하루 1~2시간', '하루 3~4시간', '하루 5시간 이상'] },
        { id: 'cond_q5', label: '눈 불편감(뻑뻑함, 피로감)을 느끼는 빈도는?', type: 'single', options: ['거의 없음', '가끔', '자주', '매일'] },
        { id: 'cond_q6', label: '평소 휴식 시 눈을 쉬게 하는 습관이 있나요?', type: 'single', options: ['자주 실천', '가끔', '거의 안 함'] },
        { id: 'cond_q7', label: '눈 건강 관리에서 가장 궁금한 점이 있다면?', type: 'text' },
    ],

    // M2. 건조 체감 지수 (Dryness Index) - OSDI 변형
    'dryness': [
        { id: 'dry_q1', label: '눈이 뻑뻑하거나 모래 들어간 느낌이 있나요?', type: 'single', options: ['전혀 없음', '가끔', '자주', '항상'] },
        { id: 'dry_q2', label: '눈의 피로감이나 무거움을 느끼시나요?', type: 'single', options: ['전혀 없음', '가끔', '자주', '항상'] },
        { id: 'dry_q3', label: '실내(난방/에어컨)에서 눈 불편감이 심해지나요?', type: 'single', options: ['전혀 없음', '가끔', '자주', '항상'] },
        { id: 'dry_q4', label: '렌즈를 사용하시나요?', type: 'single', options: ['사용 안 함', '가끔', '매일'] },
        { id: 'dry_q5', label: '장시간 스크린 사용 후 눈이 충혈되나요?', type: 'single', options: ['전혀 없음', '가끔', '자주', '항상'] },
        { id: 'dry_q6', label: '바람이 부는 곳에서 눈이 시리거나 눈물이 나나요?', type: 'single', options: ['전혀 없음', '가끔', '자주', '항상'] },
        { id: 'dry_q7', label: '인공눈물 사용 빈도는?', type: 'single', options: ['사용 안 함', '가끔', '매일 1~2회', '매일 3회 이상'] },
    ],

    // M3. 시야 패턴 체크 (Amsler-style Experience) - 질환명 언급 금지
    'pattern': [
        { id: 'pat_q1', label: '직선이 휘어져 보이거나 물결처럼 느껴진 적이 있나요?', type: 'single', options: ['없음', '가끔', '자주'] },
        { id: 'pat_q2', label: '시야 중심부가 흐릿하거나 왜곡되어 보인 적이 있나요?', type: 'single', options: ['없음', '가끔', '자주'] },
        { id: 'pat_q3', label: '시야 일부가 어둡게 보이거나 빠진 느낌이 있나요?', type: 'single', options: ['없음', '가끔', '자주'] },
        { id: 'pat_q4', label: '어두운 곳에서 밝은 곳으로 나올 때 적응이 느린가요?', type: 'single', options: ['빠름', '보통', '느림', '매우 느림'] },
        { id: 'pat_q5', label: '밤에 불빛 주변에 번짐이나 빛 퍼짐을 느끼나요?', type: 'single', options: ['없음', '가끔', '자주'] },
        { id: 'pat_q6', label: '이런 불편이 언제부터 있었나요?', type: 'single', options: ['최근', '1~3개월', '6개월 이상', '잘 모르겠음'] },
        { id: 'pat_q7', label: '불편 지속 시 전문가 상담을 원하시나요?', type: 'single', options: ['네', '아니오', '생각 중'] },
    ],

    // M4. 디지털 피로 지수 (Digital Eye Strain)
    'strain': [
        { id: 'str_q1', label: '하루 평균 스크린타임은 얼마나 되나요?', type: 'single', options: ['3시간 이하', '3~6시간', '6~9시간', '9시간 이상'] },
        { id: 'str_q2', label: '20-20-20 규칙(20분마다 20초간 먼 곳 보기)을 실천하나요?', type: 'single', options: ['자주 실천', '가끔', '거의 안 함', '처음 들어봄'] },
        { id: 'str_q3', label: '야간에 스마트폰/태블릿 사용 빈도는?', type: 'single', options: ['거의 없음', '가끔', '자주', '매일'] },
        { id: 'str_q4', label: '장시간 스크린 사용 후 두통이 있나요?', type: 'single', options: ['없음', '가끔', '자주', '매일'] },
        { id: 'str_q5', label: '눈이 뻑뻑하거나 건조한 느낌 빈도는?', type: 'single', options: ['없음', '가끔', '자주', '매일'] },
        { id: 'str_q6', label: '모니터와 눈 사이 거리는 어느 정도인가요?', type: 'single', options: ['50cm 이상', '30~50cm', '30cm 미만', '모르겠음'] },
        { id: 'str_q7', label: '디지털 피로 개선을 위해 가장 관심 있는 것은?', type: 'text' },
    ],

    // M5. 눈 라이프스타일 타입 (Eye-Q Lifestyle)
    'lifestyle': [
        { id: 'life_q1', label: '하루 평균 수면 시간은?', type: 'single', options: ['5시간 이하', '5~6시간', '6~7시간', '7시간 이상'] },
        { id: 'life_q2', label: '야외 활동(햇빛 노출) 빈도는?', type: 'single', options: ['거의 없음', '주 1~2회', '주 3~4회', '매일'] },
        { id: 'life_q3', label: '녹황색 채소, 생선 등 눈 건강에 좋은 식품 섭취는?', type: 'single', options: ['거의 안 먹음', '가끔', '자주', '매일'] },
        { id: 'life_q4', label: '운동/걷기 빈도는?', type: 'single', options: ['거의 없음', '주 1~2회', '주 3~4회', '매일'] },
        { id: 'life_q5', label: '실내에서 주로 보내는 시간은?', type: 'single', options: ['3시간 이하', '3~6시간', '6~9시간', '9시간 이상'] },
        { id: 'life_q6', label: '눈 건강 영양제(루테인 등) 섭취 여부는?', type: 'single', options: ['안 먹음', '가끔', '매일'] },
        { id: 'life_q7', label: '눈 건강을 위해 가장 개선하고 싶은 것은?', type: 'text' },
    ],
};

// topic별 초기 질문 (첫 턴)
export function getInitialQuestion(topic: Topic): HealthcareQuestion {
    return HEALTHCARE_QUESTIONS[topic][0];
}
