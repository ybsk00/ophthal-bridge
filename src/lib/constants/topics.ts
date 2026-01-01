// 아이디안과 헬스케어 토픽 상수 (단일 소스)
// 모든 topic 관련 검증은 이 파일을 참조

export const VALID_TOPICS = [
    'condition',    // 눈 컨디션 지수
    'dryness',      // 건조 체감 지수
    'pattern',      // 시야 패턴 체크
    'strain',       // 디지털 피로 지수
    'lifestyle',    // 눈 라이프스타일 타입
] as const;

export type Topic = typeof VALID_TOPICS[number];

export const DEFAULT_TOPIC: Topic = 'condition';

// topic별 라벨
export const TOPIC_LABELS: Record<Topic, string> = {
    'condition': '눈 컨디션 지수',
    'dryness': '건조 체감 지수',
    'pattern': '시야 패턴 체크',
    'strain': '디지털 피로 지수',
    'lifestyle': '눈 라이프스타일',
};

// topic별 설명
export const TOPIC_DESCRIPTIONS: Record<Topic, string> = {
    'condition': '생활 습관 기반 눈 컨디션 점검',
    'dryness': '건조함 체감 정도 자가 체크',
    'pattern': '시야 패턴 체험 (참고용)',
    'strain': '디지털 기기 사용 피로도 점검',
    'lifestyle': '눈 건강 라이프스타일 타입 분석',
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
