// 디지털 피로 지수 점수 계산
// 1~5 레벨 + 0~100 점수

export interface StrainResult {
    score: number;
    level: 'LOW' | 'MID' | 'HIGH' | 'VERY_HIGH';
    strainLevel: 1 | 2 | 3 | 4 | 5;  // 1~5 레벨
    summary: {
        mainFactors: string[];
        tips: string[];
    };
}

const WEIGHTS: Record<string, number[]> = {
    str_q1: [0, 10, 20, 30],    // 스크린타임
    str_q2: [0, 5, 15, 20],     // 20-20-20 실천 (역산)
    str_q3: [0, 8, 16, 24],     // 야간 사용
    str_q4: [0, 10, 20, 30],    // 두통
    str_q5: [0, 10, 20, 30],    // 뻑뻑함
    str_q6: [0, 5, 15, 10],     // 모니터 거리
};

export function calculateStrainScore(answers: Record<string, number>): StrainResult {
    let totalScore = 0;
    const factors: string[] = [];

    Object.entries(answers).forEach(([questionId, answerIndex]) => {
        const weight = WEIGHTS[questionId];
        if (weight && weight[answerIndex] !== undefined) {
            totalScore += weight[answerIndex];
        }
    });

    const maxPossible = 149;
    const normalizedScore = Math.min(100, Math.round((totalScore / maxPossible) * 100));

    // 레벨 결정
    let level: StrainResult['level'];
    let strainLevel: StrainResult['strainLevel'];

    if (normalizedScore <= 20) {
        level = 'LOW';
        strainLevel = 1;
    } else if (normalizedScore <= 40) {
        level = 'LOW';
        strainLevel = 2;
    } else if (normalizedScore <= 60) {
        level = 'MID';
        strainLevel = 3;
    } else if (normalizedScore <= 80) {
        level = 'HIGH';
        strainLevel = 4;
    } else {
        level = 'VERY_HIGH';
        strainLevel = 5;
    }

    if (answers.str_q1 >= 2) factors.push('장시간 스크린 사용');
    if (answers.str_q2 >= 2) factors.push('휴식 규칙 미실천');
    if (answers.str_q3 >= 2) factors.push('야간 디지털 노출');
    if (answers.str_q4 >= 2) factors.push('스크린 관련 두통');

    const tips = [
        '20-20-20 규칙 실천하기',
        '블루라이트 필터 앱 사용',
        '모니터 밝기를 주변 조명과 맞추기',
    ];

    return {
        score: normalizedScore,
        level,
        strainLevel,
        summary: {
            mainFactors: factors.length > 0 ? factors : ['특이 요인 없음'],
            tips,
        },
    };
}
