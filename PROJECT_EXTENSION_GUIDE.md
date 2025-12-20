# 헬스케어 프로젝트 확장 가이드

> 한방병원 → 치과/피부과/정형외과 등으로 확장 시 수정 필요 파일 목록
> 
> **2024-12-20 대폭 업데이트**: 환자 포털, 디자인 테마, 색상 시스템 전면 보강

---

## 📁 수정 필요 파일 요약

| 카테고리 | 파일 수 | 주요 내용 |
|---------|--------|---------|
| **AI 프롬프트** | 3개 | 전문분야별 상담 로직, 의료진 데이터 |
| **환자 포털 UI** | 8개 ⬆️ | 로그인, 홈, 채팅, 예약, 브랜딩 |
| **의료진 대시보드** | 5개 | 의사 목록, 진료 과목, 모달 |
| **헬스케어 챗봇** | 3개 | 문진 프롬프트, 모듈 탭 |
| **디자인/테마** | 4개 ⬆️ | 색상, 로고, 배경, 폰트 |
| **공통 컴포넌트** | 6개 ⬆️ | 헤더, 푸터, 모달, 아바타 |
| **설정 파일** | 3개 | 환경변수, 메타데이터 |

---

## 🎨 0. 디자인/테마 시스템 (가장 먼저 수정!) ⭐⭐⭐

### `tailwind.config.js` - 색상 테마

```typescript
// 현재: dental 테마 (네이비)
colors: {
  dental: {
    bg: '#0a1628',        // ← 메인 배경색
    primary: '#4f9a94',   // ← 주요 버튼/강조색
    accent: '#3d7a75',    // ← 호버/액센트
    text: '#1a2e35',      // ← 텍스트
    subtext: '#64748b',   // ← 보조 텍스트
    muted: '#94a3b8',     // ← 비활성화
  },
  // 한방병원: traditional 테마 (베이지)
  traditional: {
    bg: '#f5f2ed',
    primary: '#8B4513',
    accent: '#6B3410',
    ...
  }
}

// 📌 변경 방법: 
// 1) 새 색상 팔레트 정의 (예: derma, ortho)
// 2) 모든 컴포넌트에서 dental-* → 새이름-* 으로 치환
```

### `public/` - 이미지 에셋

| 파일 | 용도 | 교체 필요 |
|-----|------|---------|
| `/logo.svg` | 랜딩 페이지 로고 | ⭐ 필수 |
| `/logo_leaf.png` | 헤더 로고 (제거됨) | - |
| `/doctor-avatar.jpg` | AI 챗봇 의사 아바타 | ⭐ 필수 |
| `/images/herbal-bg.png` | 히어로 배경 이미지 | 선택 |
| `/5.mp4` | 대시보드 배경 영상 | 선택 |

---

## 👤 1. 환자 포털 (/patient) - 신규 추가! ⭐⭐⭐

### `src/app/patient/login/page.tsx` - 로그인 페이지

```typescript
// 📌 변경 포인트:
// 1. 배경색: bg-dental-bg → 새 테마
// 2. 병원명: "평촌이생각치과" → 새 병원명
// 3. 로고: 🦷 이모지 → 새 로고
// 4. 카드 배경: #1a2332 → 새 색상

// 검색 키워드: "평촌이생각치과", "bg-dental-", "dental-primary"
```

### `src/app/patient/home/page.tsx` - 환자 홈

```typescript
// 📌 변경 포인트:
// 1. 병원명 (헤더, 히어로 섹션)
// 2. 푸터 회사명/주소
// 3. 배경색

// 검색 위치: 19행, 41행, 110행
```

### `src/app/patient/chat/page.tsx` - 환자 채팅

```typescript
// 📌 변경 포인트:
// 1. AI 이름: "평촌이생각치과" → 새 병원명
// 2. AI 아바타: /doctor-avatar.jpg → 새 이미지
// 3. 예약 모달 병원 정보
```

### `src/app/patient/appointments/[id]/AppointmentDetailClient.tsx` - 예약 상세

```typescript
// 📌 변경 포인트: 
// - 위치 필드 병원명 (142행)
```

---

## 🏥 2. 의료 대시보드 (/medical)

### `src/app/medical/patient-dashboard/PatientDashboardClient.tsx` ⭐⭐

```typescript
// 📌 변경 포인트:
// 1. 배경: bg-dental-bg → 새 테마
// 2. 예약 카드: #1a2332, dental-primary
// 3. 채팅 영역: 동일
// 4. 퀵액션 버튼 6개 (예약/증상/복약/업로드/후기/위치)
// 5. 영상 배경: /5.mp4

// 검색 키워드: "dental-bg", "#1a2332", "dental-primary"
```

### `src/components/medical/PatientHeader.tsx` ⭐⭐

```typescript
// 📌 변경 포인트:
// 1. 헤더 배경: bg-dental-bg/80
// 2. 로고: 🦷 이모지 + 병원명
// 3. 사용자 뱃지: dental-primary
// 4. 로그아웃 버튼: dental-subtext

// 현재 코드 (50행):
<header className="bg-dental-bg/80 backdrop-blur-md border-b border-white/10 ...">
    <div className="w-10 h-10 rounded-full bg-dental-primary/20 ...">
        <span className="text-xl">🦷</span>
    </div>
    <span className="text-xl font-bold text-white">평촌이생각치과</span>
</header>
```

### `src/components/medical/MedicalChatInterface.tsx` ⭐⭐

```typescript
// 📌 변경 포인트:
// 1. 헤더: dental-bg, 병원명
// 2. AI 아바타: /doctor-avatar.jpg
// 3. 메시지 버블: #1a2332 (AI), dental-primary (사용자)
// 4. 입력창: #0d1420
// 5. 예약 모달: dental-primary 버튼

// AI 인사말 (28행):
content: "안녕하세요, 평촌이생각치과 AI 상담입니다.\n\n..."
```

### `src/components/medical/ReservationModal.tsx`

```typescript
// 📌 변경 포인트:
// 1. 병원명 (250행, 278행, 298행)
// 2. 의사 목록 (DOCTORS 배열 참조)
```

### `src/components/medical/MapModal.tsx`

```typescript
// 📌 변경 포인트:
// 1. HOSPITAL_NAME 상수 (12행)
// 2. 지도 좌표
// 3. 주소 정보
```

---

## � 3. 채팅 인터페이스 (전체 앱 공유)

### `src/components/chat/ChatInterface.tsx` ⭐⭐⭐

```typescript
// 📌 변경 포인트:

// === 1. 모듈 탭 (치과용 → 새 분야) ===
const modules = [
    { id: "general", label: "일반 치과", desc: "충치, 치료, 검진 안내", icon: Sparkles },
    { id: "implant", label: "임플란트", desc: "식립, 뼈이식 상담", icon: Brain },
    { id: "orthodontics", label: "교정", desc: "치아교정, 투명교정", icon: Moon },
    { id: "whitening", label: "미백", desc: "치아미백, 라미네이트", icon: Heart },
    { id: "gum", label: "잇몸", desc: "잇몸치료, 스케일링", icon: Leaf },
];

// 예시) 피부과용:
// { id: "acne", label: "여드름", desc: "여드름, 흉터 치료" },
// { id: "aging", label: "안티에이징", desc: "주름, 탄력 관리" },
// ...

// === 2. AI 인사말 ===
// 107행: "평촌이생각치과 AI 상담입니다"
// 138행: "평촌이생각치과 가이드입니다"

// === 3. 헤더 (비로그인 모드) ===
// 310행: 🦷 + "평촌이생각치과"

// === 4. 아바타 ===
// 437행, 462행: /doctor-avatar.jpg

// === 5. 색상 테마 ===
// - bg-dental-bg, bg-[#1a2332], dental-primary, dental-subtext
// - 모두 새 테마로 치환 필요
```

---

## 🤖 4. AI 프롬프트

### `src/lib/ai/prompts.ts` ⭐⭐⭐

```typescript
// === 1. 의료진 데이터 ===
export const DOCTORS = [
  {
    name: '홍길동',
    title: '대표원장',
    education: 'OO대학교 치의학 박사',
    specialty: ['임플란트', '턱관절', '치아교정'],
    tracks: ['implant', 'orthodontics']
  },
  // ... 추가 의료진
];

// === 2. 트랙 매핑 ===
export const DOCTOR_TRACK_MAPPING: Record<string, string[]> = {
  general: ['홍길동', '김치과'],
  implant: ['홍길동'],
  orthodontics: ['박교정'],
  // ...
};

// === 3. SCI 논문 (선택) ===
export const SCI_EVIDENCE = {
  journal: 'Journal of Dental Research',
  title: '논문 제목...',
  authors: '저자명',
  link: 'https://...'
};

// === 4. 시스템 프롬프트 ===
// getMedicalSystemPrompt() 내:
// - 병원명: "평촌이생각치과" → 새 병원명
// - 전문 분야 설명
// - 진료 키워드
```

---

## 🎯 5. 메타데이터 & 설정

### `src/app/layout.tsx`

```typescript
// 📌 변경 포인트 (20-35행):
export const metadata: Metadata = {
  title: '평촌이생각치과 | AI 건강 상담',
  description: '평촌이생각치과 AI 헬스케어 상담 서비스',
  openGraph: {
    title: '평촌이생각치과',
    description: '...',
  },
  twitter: { ... }
};
```

### `.env.local`

```bash
# Supabase (변경 필요)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx

# NextAuth (도메인 변경)
NEXTAUTH_URL=https://새도메인.vercel.app
NEXTAUTH_SECRET=xxx

# Naver Login (새 앱 등록)
NAVER_CLIENT_ID=xxx
NAVER_CLIENT_SECRET=xxx
```

---

## � 6. 색상 치환 가이드 (전체 검색/치환)

### 다크 테마 색상 코드

| 용도 | 현재 값 | 치환 대상 |
|-----|--------|----------|
| 메인 배경 | `bg-dental-bg` | 전체 |
| 카드 배경 | `#1a2332` | 전체 |
| 어두운 배경 | `#0d1420` | 입력창 |
| 주요 색상 | `dental-primary` | 버튼, 링크 |
| 호버 색상 | `dental-accent` | 버튼 호버 |
| 보조 텍스트 | `dental-subtext` | 전체 |

### 검색/치환 패턴

```bash
# VS Code에서 Ctrl+Shift+H

# 병원명
"평촌이생각치과" → "새병원명"

# 색상 테마
"dental-bg" → "newtheme-bg"
"dental-primary" → "newtheme-primary"
"dental-accent" → "newtheme-accent"
"dental-subtext" → "newtheme-subtext"

# 아바타
"/doctor-avatar.jpg" → "/new-doctor.jpg"

# 이모지 로고
"🦷" → "🏥" 또는 새 로고
```

---

## ✅ 체크리스트 (우선순위순)

### 🔴 1순위: 필수 (빌드 필요)

- [ ] `tailwind.config.js` - 새 색상 테마 정의
- [ ] `public/doctor-avatar.jpg` - 의사 아바타 이미지
- [ ] `public/logo.svg` - 로고 이미지
- [ ] `prompts.ts` - DOCTORS 배열, DOCTOR_TRACK_MAPPING
- [ ] `layout.tsx` - 메타데이터 (title, description)
- [ ] `.env.local` - 환경변수

### 🟠 2순위: 중요 (UI 동작)

- [ ] `PatientHeader.tsx` - 헤더 로고, 병원명
- [ ] `MedicalChatInterface.tsx` - AI 인사말, 아바타
- [ ] `ChatInterface.tsx` - 모듈 탭 (5개), 인사말
- [ ] `ReservationModal.tsx` - 예약 모달 병원명
- [ ] `MapModal.tsx` - 지도 좌표, 주소

### 🟡 3순위: 디자인 (선택)

- [ ] 전체 색상 치환 (검색/치환)
- [ ] `PatientDashboardClient.tsx` - 영상, 퀵액션
- [ ] `/patient/login/page.tsx` - 로그인 디자인
- [ ] `/patient/home/page.tsx` - 홈 디자인
- [ ] `DoctorIntroModal.tsx` - 의사 사진

---

## 📂 파일 경로 빠른 참조

```
src/
├── lib/ai/
│   ├── prompts.ts          ⭐⭐⭐ AI 프롬프트 + 의료진
│   └── client.ts           (수정 불필요)
├── app/
│   ├── layout.tsx          ⭐⭐ 메타데이터
│   ├── page.tsx            ⭐ 랜딩 페이지
│   ├── patient/            ⭐⭐⭐ 환자 포털 (신규!)
│   │   ├── login/page.tsx  로그인
│   │   ├── home/page.tsx   홈
│   │   ├── chat/page.tsx   채팅
│   │   └── appointments/   예약
│   ├── medical/
│   │   └── patient-dashboard/
│   │       └── PatientDashboardClient.tsx  ⭐⭐
│   └── healthcare/
│       └── chat/page.tsx   헬스케어 챗
├── components/
│   ├── chat/
│   │   └── ChatInterface.tsx  ⭐⭐⭐
│   ├── medical/
│   │   ├── PatientHeader.tsx      ⭐⭐
│   │   ├── MedicalChatInterface.tsx ⭐⭐
│   │   ├── ReservationModal.tsx   ⭐
│   │   ├── MapModal.tsx           ⭐
│   │   ├── DoctorIntroModal.tsx   ⭐
│   │   └── EvidenceModal.tsx
│   └── common/
│       ├── Footer.tsx      ⭐
│       └── PrivacyPolicyModal.tsx
└── public/
    ├── logo.svg            ⭐ 로고
    ├── doctor-avatar.jpg   ⭐ 의사 아바타
    └── 5.mp4              대시보드 영상

tailwind.config.js          ⭐⭐⭐ 색상 테마
.env.local                  ⭐⭐ 환경변수
```

---

## 📝 업데이트 이력

### 2024-12-20 (최신) ⭐ 대폭 보강

**신규 추가:**
- 환자 포털 (/patient) 전체 섹션
  - login, home, chat, appointments
- 디자인/테마 시스템 섹션
  - tailwind.config.js 색상 정의
  - 이미지 에셋 목록
- 색상 치환 가이드
  - 검색/치환 패턴
  - 다크 테마 색상 코드표
- 체크리스트 우선순위 재정리 (1순위/2순위/3순위)

**보강:**
- PatientHeader.tsx 상세 코드 예시
- MedicalChatInterface.tsx 변경 포인트
- ChatInterface.tsx 모듈 탭 예시 (치과/피부과)
- 메타데이터 변경 가이드

### 2024-12-19
- 의료진 데이터 시스템 추가
- 4턴 강제 요약 로직
- 액션 토큰 시스템
- 탭 하이라이트

---

## 💡 팁: 빠른 확장 순서

1. **색상 테마 정의** (`tailwind.config.js`)
2. **이미지 에셋 교체** (`/public`)
3. **환경변수 설정** (`.env.local`)
4. **전체 검색/치환** (병원명, 색상 클래스)
5. **의료진 데이터** (`prompts.ts`)
6. **모듈 탭 수정** (`ChatInterface.tsx`)
7. **빌드 & 테스트**

---

*이 문서는 프로젝트 복제 후 새 의료 분야로 확장 시 참고용입니다.*
