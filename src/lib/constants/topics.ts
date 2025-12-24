// 아이니의원 헬스케어 토픽 상수 (단일 소스)
// 모든 topic 관련 검증은 이 파일을 참조

export const VALID_TOPICS = [
    'glow-booster',    // D-7 광채 부스터 플랜
    'makeup-killer',   // 메이크업 망치는 원인 TOP3
    'barrier-reset',   // 피부 장벽 리셋 72시간
    'lifting-check',   // 리프팅 후회 포인트 체크
    'skin-concierge',  // 부티크 스킨 컨시어지
] as const;

export type Topic = typeof VALID_TOPICS[number];

export const DEFAULT_TOPIC: Topic = 'glow-booster';

// topic별 라벨
export const TOPIC_LABELS: Record<Topic, string> = {
    'glow-booster': 'D-7 광채 부스터',
    'makeup-killer': '메이크업 원인 TOP3',
    'barrier-reset': '피부장벽 72시간',
    'lifting-check': '리프팅 후회포인트',
    'skin-concierge': '부티크 컨시어지',
};

// topic별 설명
export const TOPIC_DESCRIPTIONS: Record<Topic, string> = {
    'glow-booster': '7일 광채 플랜 점검',
    'makeup-killer': '메이크업 무너짐 원인 분석',
    'barrier-reset': '장벽 회복 72시간 루틴',
    'lifting-check': '리프팅 전 체크리스트',
    'skin-concierge': '1:1 맞춤 루틴 설계',
};

// topic 유효성 검사
export function isValidTopic(topic: string): topic is Topic {
    return VALID_TOPICS.includes(topic as Topic);
}

// topic 안전 변환 (잘못된 값 → 디폴트)
export function sanitizeTopic(topic: string | null | undefined): Topic {
    if (topic && isValidTopic(topic)) {
        return topic;
    }
    return DEFAULT_TOPIC;
}
