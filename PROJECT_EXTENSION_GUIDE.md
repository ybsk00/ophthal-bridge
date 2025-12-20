# 헬스케어 프로젝트 확장 가이드

> 한방병원 → 치과/피부과/정형외과 등으로 확장 시 수정 필요 파일 목록

---

## 📁 수정 필요 파일 요약

| 카테고리 | 파일 수 | 주요 내용 |
|---------|--------|---------|
| AI 프롬프트 | 3개 | 전문분야별 상담 로직 |
| 환자 포털 UI | 5개 | 브랜딩, 서비스명, 의사 목록 |
| 의료진 대시보드 | 4개 | 의사 목록, 진료 과목 |
| 헬스케어 챗봇 | 3개 | 문진 프롬프트, entryIntent |
| 공통 컴포넌트 | 3개 | 로고, 병원명 |
| 설정 파일 | 3개 | 환경변수, 메타데이터 |

---

## 🤖 1. AI 프롬프트 (가장 중요!)

### `src/lib/ai/prompts.ts` ⭐⭐⭐

**2024-12-20 업데이트: 헬스케어 프롬프트 전면 개편**

이 파일에는 두 가지 주요 프롬프트 시스템이 있습니다:

#### 1.1 헬스케어 프롬프트 (비로그인, 퍼널1)
```typescript
// 5개 토픽 × 6개 entryIntent = 30개 조합 지원
export type EntryIntent = 
  | "digestion-night" | "digestion-aftermeal" | ...
  | "cognitive-focus" | "cognitive-foggy" | ...
  | "sleep-onset" | "sleep-awake" | ...
  | "vascular-sedentary" | "vascular-diet" | ...
  | "women-cycle" | "women-pms" | ...

// 핵심 함수
getHealthcareSystemPrompt(topic, turnCount, entryIntent?)
getHealthcareFinalAnalysisPrompt(topic, entryIntent?)
getEntryIntentHook(topic, entryIntent)       // 유입 맥락 훅
getHealthcareQuestionPool(topic, entryIntent) // 질문 풀 (토픽별 10개)
prioritizeByIntent(list, intent)              // 질문 우선순위 재정렬
```

**수정 포인트:**
- `EntryIntent` 타입: 광고 소재별 유입 맥락 (1광고 = 1intent 원칙)
- 질문 풀: 토픽별 10개 이상 (pools 객체 내부)
- 의료 표현 완화: 저림/통증 → 시림/불편감 (의료법 준수)

#### 1.2 메디컬 프롬프트 (로그인 후, 퍼널2)
```typescript
getMedicalSystemPrompt(turnCount, track?)
getMedicalQuestionPool(track)
```

#### 1.3 의료 키워드 감지
```typescript
// 이 키워드가 감지되면 즉시 로그인 유도
export const MEDICAL_KEYWORDS = [
  "치료", "약", "처방", "진단", "병원", "수술", ...
];
```

---

### `src/lib/ai/summary.ts`
- 상담 내용 요약 로직
- 진료과별 요약 형식

### `src/app/api/patient/medications/chat/route.ts`
- 복약 도우미 시스템 프롬프트
- 약물 DB (치과/피부과용 약물 추가)

---

## 🩺 2. 헬스케어 챗봇 (퍼널1)

### `src/app/api/healthcare/chat/route.ts` ⭐⭐

**2024-12-20 업데이트: entryIntent 파라미터 지원**

```typescript
// API 요청 파라미터
{
  message: string,
  history: Message[],
  topic: string,           // digestion, cognitive, stress-sleep, vascular, women
  turnCount: number,
  entryIntent?: string     // 광고 소재별 유입 맥락 (NEW!)
}

// API 응답
{
  role: "ai",
  content: string,
  requireLogin?: boolean,
  isSymptomTrigger?: boolean,  // 의료 키워드 감지 시 true
  isHardStop?: boolean         // 5턴 종료 시 true
}
```

**수정 포인트:**
- 의료 키워드 감지 메시지 (line 14-20)
- 5턴 종료 메시지 (line 46-52)

---

### `src/components/healthcare/HealthcareChat.tsx` ⭐⭐

**2024-12-20 업데이트: 로그인 모달 동적 처리**

```typescript
// URL에서 entry_intent 파라미터 자동 추출
const entryIntent = searchParams.get("entry_intent");

// 로그인 모달 트리거 타입
type LoginModalTrigger = "5turn" | "medical" | null;

// 의료 키워드 감지 시 즉시 로그인 모달
if (data.isSymptomTrigger) {
  setLoginModalTrigger("medical");
  openLoginModal();
}
```

**수정 포인트:**
- 모달 제목/내용 (getModalContent 함수)
- 로그인 경로 (`/patient/login`, line 254)
- 서비스 명칭 (line 157-160)

---

## 👤 3. 환자 포털 (Patient)

### `src/app/patient/page.tsx`
- 메인 대시보드 UI
- 병원명, 서비스 설명
- 로고 이미지 경로

### `src/app/patient/chat/page.tsx`
- AI 예진 상담 화면
- 초기 인사말
- 전문 분야별 안내 문구

### `src/app/patient/appointments/new/page.tsx`
- 예약 생성 화면
- **의사 목록 배열** (doctors)
- 진료 과목 표시

### `src/app/patient/medications/page.tsx`
- 복약 가이드 화면
- 약물 DB (medicationDatabase)
- 초기 인사말

### `src/app/patient/layout.tsx`
- 레이아웃/네비게이션
- 병원명

---

## 🏥 4. 의료진 대시보드 (Medical/Admin)

### `src/app/medical/dashboard/page.tsx`
- 관리자 메인 화면
- 통계 차트 제목

### `src/app/medical/patient-dashboard/page.tsx`
- 환자용 의료진 화면
- 기본 의사명

### `src/components/medical/ReservationModal.tsx`
- 예약 모달
- **의사 목록 배열** (doctors)
- 병원명/서비스명

### `src/components/medical/PatientRegistrationModal.tsx`
- 환자 등록 모달
- 필수 필드 (치과: 치아상태, 피부과: 피부타입 등)

### `src/app/admin/patients/page.tsx` ⭐

**2024-12-20 업데이트: 페이지네이션 및 검색 기능**

```typescript
// 페이지당 항목 수
const ITEMS_PER_PAGE = 10;

// 검색 및 필터
const [searchQuery, setSearchQuery] = useState('');
const [statusFilter, setStatusFilter] = useState<string | null>(null);

// 상태 필터 옵션
{ value: 'lead', label: '리드' },
{ value: 'new', label: '신규' },
{ value: 'returning', label: '재방문' },
{ value: 'vip', label: 'VIP' },
```

**수정 포인트:**
- 환자 상태값 (lifecycleColors, lifecycleLabels 객체)
- 페이지당 항목 수 (ITEMS_PER_PAGE)
- 검색 필드 (이름, 연락처 외 추가 가능)

---

## 🎨 5. 공통 컴포넌트

### `public/logo.png`
- 병원 로고 이미지

### `src/app/page.tsx`
- 랜딩 페이지
- 병원명, 소개 문구
- Hero 섹션 텍스트

### `src/app/layout.tsx`
- 메타데이터 (title, description)
- 파비콘

---

## ⚙️ 6. 설정 파일

### `.env.local`
```env
NEXT_PUBLIC_SITE_NAME=병원명
NEXT_PUBLIC_HOSPITAL_TYPE=dental  # haniwon, dental, derma, ortho
```

### `package.json`
- name, description 필드

### `src/app/layout.tsx` (메타데이터)
```tsx
export const metadata = {
  title: "병원명 - AI 헬스케어",
  description: "병원 소개 문구"
}
```

---

## ✅ 체크리스트

### 필수 변경 (1순위)
- [ ] `prompts.ts` - 토픽명/질문 풀/entryIntent
- [ ] `MEDICAL_KEYWORDS` - 의료 키워드 목록
- [ ] 의사 목록 배열 (2곳: `new/page.tsx`, `ReservationModal.tsx`)
- [ ] `public/logo.png` - 로고 이미지
- [ ] 메타데이터 (title, description)

### 중요 변경 (2순위)
- [ ] `route.ts` - 의료 키워드 감지 메시지
- [ ] `HealthcareChat.tsx` - 로그인 모달 내용
- [ ] `patients/page.tsx` - 환자 상태값 (lifecycleLabels)

### 선택 변경 (3순위)
- [ ] 색상 테마 (tailwind.config.js)
- [ ] 약물 DB (medications/page.tsx)
- [ ] 환자 등록 필드 추가
- [ ] 페이지당 항목 수 (ITEMS_PER_PAGE)

---

## 💡 팁

1. **의사 목록**은 2곳에서 중복 정의됨 → 향후 DB/API로 통합 권장
2. **프롬프트**는 `.env`로 분리하면 관리 용이
3. **약물 DB**는 외부 API 연동 권장 (식약처 API 등)
4. **entryIntent**는 1광고 = 1intent 원칙으로 광고 전환율 최적화
5. **의료 키워드**는 진료과별로 세분화 필요 (치과: 충치/잇몸 등)

---

## 📂 파일 경로 빠른 참조

```
src/
├── lib/ai/
│   ├── prompts.ts          ⭐⭐⭐ AI 프롬프트 (핵심!)
│   ├── summary.ts          요약 로직
│   └── client.ts           (수정 불필요)
├── app/
│   ├── api/healthcare/chat/
│   │   └── route.ts        ⭐⭐ 헬스케어 API
│   ├── patient/
│   │   ├── page.tsx        대시보드
│   │   ├── chat/           예진 상담
│   │   ├── medications/    복약 가이드 ⭐
│   │   └── appointments/   예약 (의사목록) ⭐
│   ├── medical/
│   │   ├── dashboard/      관리자 화면
│   │   └── patient-dashboard/
│   ├── admin/
│   │   └── patients/       ⭐ 환자관리 (페이지네이션)
│   └── healthcare/
│       └── chat/           헬스케어 챗봇
├── components/
│   ├── medical/
│   │   └── ReservationModal.tsx ⭐ (의사목록)
│   └── healthcare/
│       └── HealthcareChat.tsx  ⭐⭐ 채팅 UI
└── public/
    └── logo.png            ⭐ 로고
```

---

## 📝 업데이트 이력

### 2024-12-20
- **헬스케어 프롬프트 전면 개편**
  - 30개 entryIntent 지원 (5 토픽 × 6 intent)
  - 토픽 격리 가드 추가
  - 질문 풀 확장 (토픽별 10개)
  - 대화 구조 고정 (요약카드 → 작은실천 → 질문)
  - 3턴부터 저장 CTA 삽입

- **의료 키워드 로그인 트리거**
  - API에서 `isSymptomTrigger` 플래그 반환
  - 프론트에서 즉시 로그인 모달 표시
  - 동적 모달 내용 (의료질문 vs 5턴완료)

- **환자 관리 페이지 개선**
  - 페이지네이션 (10명/페이지)
  - 이름/연락처 검색 (디바운스 적용)
  - 상태 필터 (리드/신규/재방문/VIP)

---

*이 문서는 프로젝트 복제 후 새 의료 분야로 확장 시 참고용입니다.*

