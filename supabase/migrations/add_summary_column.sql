-- eye_sessions 테이블에 summary 컬럼 추가
-- 헬스케어→메디컬 세션 이관 시 상담용 요약 데이터 저장용

-- summary 컬럼 추가 (이미 존재하면 스킵)
ALTER TABLE eye_sessions 
ADD COLUMN IF NOT EXISTS summary jsonb DEFAULT '{}';

-- summary 컬럼에 대한 GIN 인덱스 추가 (JSONB 검색 최적화)
CREATE INDEX IF NOT EXISTS idx_eye_sessions_summary 
ON eye_sessions USING gin(summary);

-- 코멘트 추가
COMMENT ON COLUMN eye_sessions.summary IS '헬스케어 세션의 상담용 요약 데이터 (JSON 형식)';
