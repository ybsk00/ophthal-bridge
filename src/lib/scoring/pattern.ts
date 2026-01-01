// 시야 패턴 체크 점수 계산
// 참고용 체감 패턴 점수 (질환명 언급 금지)

export interface PatternResult {
    score: number;
    level: 'LOW' | 'MID' | 'HIGH' | 'VERY_HIGH';
    summary: {
        mainFactors: string[];
        tips: string[];
    };
}

const WEIGHTS: Record<string, number[]> = {
    pat_q1: [0, 15, 30],      // 직선 왜곡
    pat_q2: [0, 20, 40],      // 중심부 흐림
    pat_q3: [0, 20, 40],      // 시야 빠짐
    pat_q4: [0, 5, 10, 15],   // 암순응
    pat_q5: [0, 10, 20],      // 빛 번짐
    pat_q6: [5, 10, 15, 0],   // 불편 시작 시점
};

export function calculatePatternScore(answers: Record<string, number>): PatternResult {
    let totalScore = 0;
    const factors: string[] = [];

    Object.entries(answers).forEach(([questionId, answerIndex]) => {
        const weight = WEIGHTS[questionId];
        if (weight && weight[answerIndex] !== undefined) {
            totalScore += weight[answerIndex];
        }
    });

    // 0~100 정규화
    const maxPossible = 160;
    const normalizedScore = Math.min(100, Math.round((totalScore / maxPossible) * 100));

    let level: PatternResult['level'];
    if (normalizedScore <= 20) {
        level = 'LOW';
    } else if (normalizedScore <= 45) {
        level = 'MID';
    } else if (normalizedScore <= 70) {
        level = 'HIGH';
    } else {
        level = 'VERY_HIGH';
    }

    // 요인 (질환명 언급 없이)
    if (answers.pat_q1 >= 1) factors.push('직선 왜곡 체감');
    if (answers.pat_q2 >= 1) factors.push('중심부 흐림 체감');
    if (answers.pat_q3 >= 1) factors.push('시야 변화 체감');
    if (answers.pat_q5 >= 1) factors.push('빛 번짐 체감');

    const tips = [
        '정기적인 안과 방문 권장',
        '본 결과는 참고용 자가 체크입니다',
        '불편 지속 시 전문가 상담이 도움될 수 있습니다',
    ];

    return {
        score: normalizedScore,
        level,
        summary: {
            mainFactors: factors.length > 0 ? factors : ['특이 요인 없음'],
            tips,
        },
    };
}
