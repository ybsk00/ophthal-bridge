-- 아이디안과 안과 헬스케어 DB 스키마
-- eye_sessions, eye_test_results, eye_events 테이블

-- ============================================
-- 1. eye_sessions: 비로그인→로그인 세션 이관
-- ============================================
CREATE TABLE IF NOT EXISTS eye_sessions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    anon_id text NOT NULL,
    user_id uuid REFERENCES auth.users(id),
    status text DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','CONVERTED','EXPIRED')),
    entry_path text,
    utm jsonb DEFAULT '{}',
    created_at timestamptz DEFAULT now(),
    converted_at timestamptz
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_eye_sessions_user ON eye_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_eye_sessions_anon ON eye_sessions(anon_id);

-- RLS 활성화
ALTER TABLE eye_sessions ENABLE ROW LEVEL SECURITY;

-- RLS 정책: 로그인 유저는 본인 세션만 조회 가능
CREATE POLICY "user_select_own_sessions" ON eye_sessions
    FOR SELECT USING (user_id = auth.uid());

-- ============================================
-- 2. eye_test_results: 테스트 결과 저장
-- ============================================
CREATE TABLE IF NOT EXISTS eye_test_results (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id uuid REFERENCES eye_sessions(id) ON DELETE CASCADE,
    menu_slug text NOT NULL CHECK (menu_slug IN ('condition','dryness','pattern','strain','lifestyle')),
    inputs jsonb DEFAULT '{}',
    score int CHECK (score >= 0 AND score <= 100),
    level text CHECK (level IN ('LOW','MID','HIGH','VERY_HIGH')),
    summary jsonb DEFAULT '{}',
    created_at timestamptz DEFAULT now(),
    UNIQUE(session_id, menu_slug)
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_eye_test_results_session ON eye_test_results(session_id);

-- RLS 활성화
ALTER TABLE eye_test_results ENABLE ROW LEVEL SECURITY;

-- RLS 정책: 세션 소유자만 조회 가능
CREATE POLICY "user_select_own_results" ON eye_test_results
    FOR SELECT USING (
        session_id IN (SELECT id FROM eye_sessions WHERE user_id = auth.uid())
    );

-- ============================================
-- 3. eye_events: 이벤트 로그 (KPI 산출용)
-- ============================================
CREATE TABLE IF NOT EXISTS eye_events (
    id bigserial PRIMARY KEY,
    session_id uuid,
    user_id uuid,
    event_name text NOT NULL,
    props jsonb DEFAULT '{}',
    created_at timestamptz DEFAULT now()
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_eye_events_session ON eye_events(session_id, event_name);
CREATE INDEX IF NOT EXISTS idx_eye_events_name ON eye_events(event_name);
CREATE INDEX IF NOT EXISTS idx_eye_events_created ON eye_events(created_at);

-- RLS 활성화 (통계는 서버 API로만 제공)
ALTER TABLE eye_events ENABLE ROW LEVEL SECURITY;

-- RLS 정책: 일반 사용자 조회 불가 (서버 service-role만 접근)
-- 관리자 정책은 필요시 추가

-- ============================================
-- 4. consult_requests 테이블 (기존 있으면 스킵)
-- ============================================
-- 이미 존재하는 경우를 대비해 IF NOT EXISTS 사용
CREATE TABLE IF NOT EXISTS consult_requests (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id),
    session_id uuid,
    name text,
    phone text,
    preferred_time text,
    memo text,
    created_at timestamptz DEFAULT now(),
    status text DEFAULT 'NEW' CHECK (status IN ('NEW','CONTACTED','DONE'))
);

-- RLS 활성화
ALTER TABLE consult_requests ENABLE ROW LEVEL SECURITY;

-- RLS 정책: 본인만 조회
CREATE POLICY "user_select_own_consults" ON consult_requests
    FOR SELECT USING (user_id = auth.uid());
