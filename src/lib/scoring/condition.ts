// 눈 컨디션 지수 점수 계산
// 0~100 점수 + LOW/MID/HIGH/VERY_HIGH 레벨

export interface ConditionResult {
    score: number;
    level: 'LOW' | 'MID' | 'HIGH' | 'VERY_HIGH';
    summary: {
        mainFactors: string[];
        tips: string[];
    };
}

// 선택지 → 점수 가중치 (높을수록 불편도 높음)
const WEIGHTS: Record<string, number[]> = {
    cond_q1: [0, 5, 10, 15],        // 나이대 (50대 이상이면 기본 리스크 증가)
    cond_q2: [0, 10, 20, 30],       // 주간 스크린 사용
    cond_q3: [0, 5, 15, 25],        // 야간 스크린
    cond_q4: [0, 5, 10, 15],        // 근거리 작업
    cond_q5: [0, 10, 20, 30],       // 불편 빈도
    cond_q6: [0, 10, 20],           // 휴식 습관 (역산)
};

export function calculateConditionScore(answers: Record<string, number>): ConditionResult {
    let totalScore = 0;
    const factors: string[] = [];

    // 각 답변의 점수 합산
    Object.entries(answers).forEach(([questionId, answerIndex]) => {
        const weight = WEIGHTS[questionId];
        if (weight && weight[answerIndex] !== undefined) {
            totalScore += weight[answerIndex];
        }
    });

    // 0~100 범위로 정규화
    const maxPossible = 135; // 최대 가능 점수
    const normalizedScore = Math.min(100, Math.round((totalScore / maxPossible) * 100));

    // 역산: 불편도가 높을수록 점수가 낮게 (웰빙 관점)
    const conditionScore = 100 - normalizedScore;

    // 레벨 결정
    let level: ConditionResult['level'];
    if (conditionScore >= 75) {
        level = 'LOW';  // 불편도 낮음 = 양호
    } else if (conditionScore >= 50) {
        level = 'MID';
    } else if (conditionScore >= 25) {
        level = 'HIGH';
    } else {
        level = 'VERY_HIGH';
    }

    // 주요 요인 분석
    if (answers.cond_q2 >= 2) factors.push('장시간 스크린 사용');
    if (answers.cond_q3 >= 2) factors.push('야간 스크린 노출');
    if (answers.cond_q5 >= 2) factors.push('잦은 눈 불편감');
    if (answers.cond_q6 >= 1) factors.push('휴식 습관 부족');

    // 팁 생성
    const tips = [
        '20분마다 20초간 먼 곳(6m 이상) 바라보기',
        '의식적으로 눈 깜빡임 늘리기',
        '실내 습도 40~60% 유지하기',
    ];

    return {
        score: conditionScore,
        level,
        summary: {
            mainFactors: factors.length > 0 ? factors : ['특이 요인 없음'],
            tips,
        },
    };
}
