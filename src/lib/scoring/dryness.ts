// 건조 체감 지수 점수 계산
// 4단계: LOW / MID / HIGH / VERY_HIGH

export interface DrynessResult {
    score: number;
    level: 'LOW' | 'MID' | 'HIGH' | 'VERY_HIGH';
    summary: {
        mainFactors: string[];
        tips: string[];
    };
}

// OSDI 변형 가중치 (0: 전혀 없음 ~ 3: 항상)
const WEIGHTS: Record<string, number[]> = {
    dry_q1: [0, 10, 20, 30],  // 뻑뻑함/이물감
    dry_q2: [0, 8, 16, 24],   // 피로감/무거움
    dry_q3: [0, 8, 16, 24],   // 실내 환경
    dry_q4: [0, 5, 15],       // 렌즈 사용
    dry_q5: [0, 8, 16, 24],   // 충혈
    dry_q6: [0, 6, 12, 18],   // 바람/눈물
    dry_q7: [0, 3, 8, 15],    // 인공눈물 사용빈도
};

export function calculateDrynessScore(answers: Record<string, number>): DrynessResult {
    let totalScore = 0;
    const factors: string[] = [];

    Object.entries(answers).forEach(([questionId, answerIndex]) => {
        const weight = WEIGHTS[questionId];
        if (weight && weight[answerIndex] !== undefined) {
            totalScore += weight[answerIndex];
        }
    });

    // 0~100 정규화
    const maxPossible = 150;
    const normalizedScore = Math.min(100, Math.round((totalScore / maxPossible) * 100));

    // 레벨 결정 (점수가 높을수록 건조도가 높음)
    let level: DrynessResult['level'];
    if (normalizedScore <= 25) {
        level = 'LOW';
    } else if (normalizedScore <= 50) {
        level = 'MID';
    } else if (normalizedScore <= 75) {
        level = 'HIGH';
    } else {
        level = 'VERY_HIGH';
    }

    // 요인 분석
    if (answers.dry_q1 >= 2) factors.push('뻑뻑함/이물감');
    if (answers.dry_q3 >= 2) factors.push('실내 환경 영향');
    if (answers.dry_q4 >= 1) factors.push('렌즈 사용');
    if (answers.dry_q5 >= 2) factors.push('충혈 빈도');

    const tips = [
        '하루 8잔 이상 수분 섭취',
        '에어컨/난방 시 가습기 사용',
        '장시간 렌즈 사용 자제',
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
