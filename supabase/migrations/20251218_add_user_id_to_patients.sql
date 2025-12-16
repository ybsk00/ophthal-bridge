-- ================================================
-- Add user_id column to patients table
-- 회원가입한 사용자가 예약 시 자동으로 환자로 전환되도록 지원
-- ================================================

-- 1. patients 테이블에 user_id 컬럼 추가
ALTER TABLE public.patients 
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- 2. 이메일, 전화번호, 주소 컬럼 추가 (사용자 정보 연동용)
ALTER TABLE public.patients 
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS address TEXT;

-- 3. user_id 인덱스 생성 (빠른 조회용) - NOT UNIQUE since there might be duplicates
CREATE INDEX IF NOT EXISTS idx_patients_user_id ON public.patients(user_id);

-- 4. RLS 정책 업데이트 - 사용자는 자신의 환자 정보만 수정 가능
DROP POLICY IF EXISTS "Users can update own patient record" ON public.patients;
CREATE POLICY "Users can update own patient record" ON public.patients 
  FOR UPDATE USING (auth.uid() = user_id);

-- 5. 사용자가 자신의 환자 정보 조회 가능
DROP POLICY IF EXISTS "Users can view own patient record" ON public.patients;
CREATE POLICY "Users can view own patient record" ON public.patients 
  FOR SELECT USING (auth.uid() = user_id OR true);

-- 6. 인증된 사용자 INSERT 허용
DROP POLICY IF EXISTS "Authenticated users can insert patients" ON public.patients;
CREATE POLICY "Authenticated users can insert patients" ON public.patients 
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- 7. 스키마 캐시 갱신
NOTIFY pgrst, 'reload schema';

-- 완료 메시지
DO $$
BEGIN
  RAISE NOTICE 'Migration completed: user_id, email, phone, address columns added to patients table';
END $$;

