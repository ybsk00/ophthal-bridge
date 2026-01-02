// 헬스케어 관련 타입 정의

/**
 * 시뮬레이터 설정 상태
 */
export interface SimulatorSettings {
    preset: string;         // 적용된 프리셋 (clear, blur, glare, mist)
    blur: number;           // 흐림 강도 (0~1)
    glare: number;          // 눈부심 강도 (0~1)
    contrast: number;       // 대비 (-0.3~0.3)
    beforeAfterLabel: string;  // "교정 전(기본)/교정 후(설정)"
}

/**
 * 컨텍스트 정보 (사용자가 선택한 상황)
 */
export interface HealthcareContext {
    primary_situation: string;       // 주요 상황 (예: "야간 도로")
    secondary_situation?: string;    // 보조 상황 (예: "글자/간판")
    user_goal?: string;              // 사용자 목표 (예: "체감 비교")
}

/**
 * 상담용 요약 데이터 (헬스케어→메디컬 이관 시 사용)
 */
export interface HealthcareSummary {
    context: HealthcareContext;
    simulator: SimulatorSettings;
    chat_tags: string[];             // 채팅에서 추출한 태그 (예: ["야간에 불편함 언급", "글자 선명도 관심"])
    handoff_note: string;            // 이관 시 참고 노트 (예: "야간 불빛과 글자 선명도에서 체감 비교를 진행했습니다.")
}

/**
 * 세션 생성 요청
 */
export interface CreateSessionRequest {
    anon_id?: string;
    entry_path?: string;
    utm?: Record<string, string>;
}

/**
 * 세션 생성 응답
 */
export interface CreateSessionResponse {
    session_id: string;
    anon_id: string;
    created_at: string;
}

/**
 * 이벤트 기록 요청
 */
export interface RecordEventRequest {
    session_id: string;
    event_name: string;
    props?: Record<string, unknown>;
}

/**
 * 결과 저장 요청
 */
export interface UpsertResultRequest {
    session_id: string;
    summary: HealthcareSummary;
}

/**
 * 결과 저장 응답
 */
export interface UpsertResultResponse {
    success: boolean;
    result_id?: string;
}
