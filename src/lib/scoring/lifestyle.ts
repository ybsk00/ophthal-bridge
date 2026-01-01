// 눈 라이프스타일 타입 점수 계산
// 캐릭터 매핑 + 생활 팁

export type LifestyleType =
    | 'night-owl'      // 야간 부엉이형
    | 'indoor-dry'     // 실내 건조형
    | 'screen-heavy'   // 스크린 과다형
    | 'balanced'       // 균형 잡힌형
    | 'outdoor-active' // 야외 활동형
    ;

export interface LifestyleResult {
    score: number;
    level: 'LOW' | 'MID' | 'HIGH' | 'VERY_HIGH';
    type: LifestyleType;
    typeName: string;
    summary: {
        characteristics: string[];
        tips: string[];
    };
}

const TYPE_NAMES: Record<LifestyleType, string> = {
    'night-owl': '🦉 야간 부엉이형',
    'indoor-dry': '🏠 실내 건조형',
    'screen-heavy': '📱 스크린 과다형',
    'balanced': '⚖️ 균형 잡힌형',
    'outdoor-active': '🌳 야외 활동형',
};

export function calculateLifestyleScore(answers: Record<string, number>): LifestyleResult {
    // 각 요소별 점수 계산
    const sleepScore = answers.life_q1 ?? 0;     // 수면 (높을수록 좋음)
    const outdoorScore = answers.life_q2 ?? 0;   // 야외 (높을수록 좋음)
    const dietScore = answers.life_q3 ?? 0;      // 식습관 (높을수록 좋음)
    const exerciseScore = answers.life_q4 ?? 0;  // 운동 (높을수록 좋음)
    const indoorScore = answers.life_q5 ?? 0;    // 실내 (높을수록 안 좋음)
    const supplementScore = answers.life_q6 ?? 0; // 영양제 (높을수록 좋음)

    // 종합 웰빙 점수 (0~100)
    const positives = sleepScore + outdoorScore + dietScore + exerciseScore + supplementScore;
    const negatives = indoorScore;
    const rawScore = (positives * 6) - (negatives * 5);
    const normalizedScore = Math.max(0, Math.min(100, Math.round(rawScore + 40)));

    // 타입 결정
    let type: LifestyleType;

    if (sleepScore <= 1 || (sleepScore <= 2 && indoorScore >= 2)) {
        type = 'night-owl';
    } else if (indoorScore >= 3 && outdoorScore <= 1) {
        type = 'indoor-dry';
    } else if (indoorScore >= 2 && exerciseScore <= 1) {
        type = 'screen-heavy';
    } else if (outdoorScore >= 2 && exerciseScore >= 2) {
        type = 'outdoor-active';
    } else {
        type = 'balanced';
    }

    // 레벨 결정
    let level: LifestyleResult['level'];
    if (normalizedScore >= 70) {
        level = 'LOW';  // 리스크 낮음
    } else if (normalizedScore >= 50) {
        level = 'MID';
    } else if (normalizedScore >= 30) {
        level = 'HIGH';
    } else {
        level = 'VERY_HIGH';
    }

    // 타입별 특성 & 팁
    const characteristics: Record<LifestyleType, string[]> = {
        'night-owl': ['야간 스크린 노출 많음', '수면 시간 부족 경향'],
        'indoor-dry': ['실내 생활 비중 높음', '야외 활동 부족'],
        'screen-heavy': ['디지털 기기 사용 과다', '눈 휴식 부족'],
        'balanced': ['생활 습관 균형', '눈 건강 관리 양호'],
        'outdoor-active': ['야외 활동 충분', '자연광 노출 양호'],
    };

    const tipsByType: Record<LifestyleType, string[]> = {
        'night-owl': ['취침 1시간 전 스크린 OFF', '수면 리듬 개선'],
        'indoor-dry': ['주 2회 이상 야외 활동', '실내 습도 유지'],
        'screen-heavy': ['20-20-20 규칙 실천', '눈 스트레칭'],
        'balanced': ['현재 습관 유지', '정기 검진 권장'],
        'outdoor-active': ['자외선 차단 안경 착용', '현재 습관 유지'],
    };

    return {
        score: normalizedScore,
        level,
        type,
        typeName: TYPE_NAMES[type],
        summary: {
            characteristics: characteristics[type],
            tips: tipsByType[type],
        },
    };
}
