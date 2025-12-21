# 평촌이생각치과 헬스케어 페이지 — 히어로(조회형) + 로그인 연결 + 공공 API 연동 (Antigravity 작업용)

> 전제: 히어로 섹션/사이트는 이미 구축 완료. 아래는 **조회 기능·로그인 연결·API 연동**을 기존 페이지에 **추가/연동**하기 위한 실행용 문서입니다.

---

## 1) 목표
- 헬스케어(퍼널1) 히어로에서 **즉시 조회(오늘/야간/공휴일 진료)** 기능 제공
- 조회 결과 상단에 **평촌이생각치과 추천 카드**를 노출하여 “운영시간 메리트”를 강하게 각인
- `연결하기(상담 연결)` 클릭 시 **로그인 필요 모달** → 로그인 후 상담으로 안전하게 전환

---

## 2) 히어로 CTA/UX (기존 히어로에 추가)
### 2.1 히어로 조회 모듈(최소 입력)
- 기본 지역: `경기도`
- 필수 토글 2개
  - `[오늘 진료]` (기본 ON)
  - `[야간 진료]` (기본 OFF)
- 옵션 토글
  - `[공휴일 진료]` (기본 OFF)
- Primary 버튼(권장 문구)
  - `오늘 진료 치과 바로 확인` / `지금 열려있는 치과 찾기` / `경기도 야간진료 치과 찾기`

### 2.2 결과 섹션(히어로 바로 아래 or 히어로 내부 확장 패널)
- 상단 고정: **평촌이생각치과 추천 카드**(라벨 `추천`)
  - 배지: `365일 진료`, `평일 매일 야간진료` *(병원 고지 기준)*
  - CTA: `상담 연결` / `진료시간 확인`
- 하단: 조건에 맞는 치과 리스트

### 2.3 변동 고지(필수)
- `진료시간은 상황에 따라 변동될 수 있어 내원 전 확인이 필요합니다.`

---

## 3) “연결하기(상담 연결)” + 로그인 필요 모달
### 3.1 권장 흐름
1) 사용자가 `상담 연결`(또는 `연결하기`) 클릭  
2) 로그인 상태 확인  
3) 비로그인: 모달(또는 바텀시트) 표시 → 로그인 페이지로 이동  
4) 로그인 완료 시 상담 페이지로 redirect

### 3.2 모달 카피(전환형)
- Title: `상담을 이어갈까요?`
- Body: `상담 내용 저장과 개인정보 보호를 위해 로그인 후 연결됩니다.`
- Primary: `로그인하고 상담 연결`
- Secondary(이탈 방지): `진료시간만 보기`

### 3.3 정책(권장)
- 조회/리스트 보기: **로그인 없이 가능**
- 상담 연결: **로그인 필요**

---

## 4) 공공 API 연동(요약)
> 원칙: 공공 API 키(ServiceKey)는 프론트에 노출하지 말고 **서버(Route/Edge Function)**에서만 호출합니다.

### 4.1 병·의원 요일 기반 조회(핵심)
- 엔드포인트:
  - `http://apis.data.go.kr/B552657/HsptlAsembySearchService/getHsptlMdcncListInfoInqire`
- 주요 파라미터
  - `Q0`: 시도(예: 경기도)
  - `Q1`: 시군구(예: 안양시 동안구)
  - `QT`: 진료요일(월~일=1~7, 공휴일=8)
  - `QN`: 기관명 키워드(예: 치과)

> 필터 팁: `QN=치과` + 응답의 기관명에 “치과” 포함 여부로 2차 필터링 권장.

### 4.2 명절/연휴(특정 날짜) 조회(옵션)
- 엔드포인트:
  - `http://apis.data.go.kr/B552657/HolidyEmgncClnicInsttInfoInqireService/getHolidyClnicPosblEgytInfoInqire`
- 주요 파라미터
  - `QT`: 날짜(YYYYMMDD)
  - `Q0`, `Q1`: 지역

---

## 5) “야간진료” 판정 규칙(앱 내부 정의)
- 권장 기준: 해당 요일 종료 시간이 **19:00(1900) 이상**이면 `야간진료` 배지
- 주의: 데이터 변동 가능 → 결과 영역에 변동 고지 문구 고정

---

## 6) 구현 가이드 (Next.js App Router 기준)
### 6.1 환경변수
`.env.local`
- `DATA_GO_KR_SERVICE_KEY=발급키`

### 6.2 내부 API 라우트(서버에서 공공 API 호출)
`/app/api/clinics/search/route.ts`

```ts
import { NextResponse } from "next/server";

const BASE =
  "http://apis.data.go.kr/B552657/HsptlAsembySearchService/getHsptlMdcncListInfoInqire";

function qs(params: Record<string, string>) {
  return new URLSearchParams(params).toString();
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const q0 = searchParams.get("q0") ?? "경기도";
  const q1 = searchParams.get("q1") ?? "";
  const qt = searchParams.get("qt") ?? "1";      // 1~7, 8(공휴일)
  const keyword = searchParams.get("keyword") ?? "치과";

  const key = process.env.DATA_GO_KR_SERVICE_KEY;
  if (!key) {
    return NextResponse.json({ error: "Missing ServiceKey" }, { status: 500 });
  }

  const url = `${BASE}?${qs({
    ServiceKey: key,
    Q0: q0,
    ...(q1 ? { Q1: q1 } : {}),
    QT: qt,
    QN: keyword,
    pageNo: "1",
    numOfRows: "50",
  })}`;

  const res = await fetch(url, { cache: "no-store" });
  const xml = await res.text();

  // MVP: XML 그대로 반환
  return new NextResponse(xml, {
    status: 200,
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
```

### 6.3 프론트(히어로 버튼)에서 호출(개념)
```ts
const params = new URLSearchParams({
  q0: "경기도",
  q1: "안양시 동안구",
  qt: String(todayQt),      // 월=1 ... 일=7, 공휴일 토글이면 8
  keyword: "치과",
});

const res = await fetch(`/api/clinics/search?${params.toString()}`);
const xml = await res.text();
// TODO: XML 파싱 → 리스트 렌더
```

### 6.4 운영 단계 권장(정규화)
- XML 파싱 후 `Clinic[]` 형태로 정규화(JSON) 반환 권장
- 예시 스키마:
```ts
type Clinic = {
  name: string;
  addr: string;
  tel: string;
  lat?: number;
  lng?: number;
  closeTime?: string;   // "1900"
  openToday?: boolean;
  night?: boolean;
  holiday?: boolean;
};
```

---

## 7) 평촌이생각치과 추천 카드 노출 규칙
### 7.1 트리거(권장)
- `[야간 진료]` 토글 ON
- `[공휴일 진료]` 토글 ON
- “오늘 진료” + 경기도 조회

### 7.2 표시 원칙
- 라벨: `추천` *(투명성)*
- 카피: 최상급 표현(1위/유일/최고) 금지
- 변동 고지 문구 고정

---

## 8) 필수 상태 UI
- 로딩: `조회 중입니다…`
- 빈 결과: `선택한 조건에 맞는 결과가 없습니다. 조건을 바꿔 다시 조회해 주세요.`
- 에러: `일시적으로 조회가 어렵습니다. 잠시 후 다시 시도해 주세요.`

---

## 9) 이벤트 로깅(퍼널 최적화)
- `hero_search_click`
- `filter_toggle_today`, `filter_toggle_night`, `filter_toggle_holiday`
- `result_view`
- `featured_clinic_impression`, `featured_clinic_click`
- `connect_click`
- `login_required_modal_open`
- `login_success_redirect_consult`

---

## 10) Antigravity 적용 체크리스트
- [ ] 히어로에 조회 모듈(토글+버튼) 연동
- [ ] `/api/clinics/search` 서버 라우트 구현(키 보호)
- [ ] 결과 리스트 렌더 + 상단 추천 카드 고정
- [ ] ‘상담 연결’ 클릭 시 로그인 모달 + 로그인 리다이렉트 처리
- [ ] 로딩/빈결과/에러 상태 UI 반영
- [ ] 변동 고지 문구 고정 노출
- [ ] 이벤트 로깅 추가

---
