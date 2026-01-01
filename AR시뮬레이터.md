# AR 시야 체감 시뮬레이터 — PC 대응 B안(샘플 모드) 구현 계획 (Next.js + React)

## 0) 결론
- **PC에서도 항상 체험 가능하게 하려면 B안(샘플 모드)이 필수**입니다.
- 카메라(웹캠) 가능 환경이면 **Live(웹캠) 모드**, 불가/거부면 **Sample(샘플) 모드**로 자동 전환합니다.
- 로그인 전에는 **체험만 제공**, 로그인 후에만 **리포트 저장(설정값만 저장)** 합니다.

---

## 1) 목표/원칙
### 1.1 목표
- 카메라가 없는 PC/권한 차단 환경에서도 **시야 체감(필터) 경험을 제공**
- 전환은 “리포트 저장(로그인)” 버튼으로 유도
- 촬영 데이터 저장/업로드 없이 **설정값만 저장**

### 1.2 표현 원칙(금지어 준수)
- 금지: 스크리닝, 진단, 처방, 치료, 환자, 확진, 검사 필요(단정), 위험(단정)
- 허용: 참고용, 체감, 컨디션, 기록, 리포트 저장, 관리 포인트, 생활 루틴
- 디스클레이머:
  - “본 기능은 참고용 체감 시뮬레이션이며 의료적 판단을 제공하지 않습니다.”
  - “촬영 데이터는 저장하지 않습니다. 저장되는 값은 설정값입니다.”

---

## 2) 모드 전략 (Live ↔ Sample)
### 2.1 모드 정의
- `mode = "live"`: 웹캠(getUserMedia) 스트림을 canvas로 처리
- `mode = "sample"`: **샘플 이미지(또는 샘플 영상 프레임)** 를 canvas로 처리

### 2.2 모드 선택 로직(자동)
1) 페이지 로딩 시 `tryStartCamera()`
2) 성공 → `mode="live"`
3) 실패(웹캠 없음/권한 거부/보안 정책/HTTPS 문제 등) → `mode="sample"`로 즉시 전환

### 2.3 사용자 전환 버튼(수동)
- Sample 모드 상단에:
  - 버튼: “웹캠으로 체험하기”
  - 설명: “웹캠 권한이 가능하면 실시간 화면으로 체험할 수 있습니다.”

---

## 3) 샘플 리소스 준비(필수)
### 3.1 샘플 이미지(권장)
- 저장 위치: `public/samples/vision/`
- 파일 예시:
  - `street_day.jpg` (낮/야외)
  - `street_night.jpg` (야간/빛 번짐 체감)
  - `text_board.jpg` (글자/대비 체감)
  - `office_screen.jpg` (실내/스크린 체감)

### 3.2 샘플 선택 UI(전환에 도움)
- 버튼 또는 썸네일 4개 제공:
  - “야간 도로”
  - “글자/간판”
  - “실내 화면”
  - “밝은 야외”

> 샘플은 “병원/의료” 연상 이미지는 피하고, **일상 장면** 위주로 준비합니다.

---

## 4) UX 흐름(PC 대응)
### 4.1 로그인 전(테스트 화면)
- 상단: 디스클레이머(Sticky)
- 중앙: canvas(라이브/샘플 동일 UI)
- 하단:
  - 프리셋 4개: 또렷/번짐/눈부심/안개
  - 슬라이더 3개: 흐림/눈부심/대비
- CTA:
  - “이 설정을 리포트에 저장하기(로그인)”

### 4.2 Sample 모드 추가 안내(권장 카피)
- “웹캠이 없거나 권한이 어려운 환경에서는 샘플로 체험할 수 있습니다.”
- “실시간 화면으로 체험하려면 ‘웹캠으로 체험하기’를 눌러 주세요.”

---

## 5) 구현 상세(핵심)
### 5.1 공통 렌더링 파이프라인
- Live 모드: video 프레임 → canvas draw → ctx.filter → 글레어 합성
- Sample 모드: 이미지 draw → ctx.filter → 글레어 합성
- 즉, **렌더 함수는 동일**하고, 입력 소스만 `video|img`로 달라집니다.

### 5.2 상태 정의(TypeScript)
```ts
type VisionMode = "live" | "sample";

type VisionState = {
  mode: VisionMode;
  preset: "clear" | "blur" | "glare" | "mist";
  blur: number;      // 0~1
  glare: number;     // 0~1
  contrast: number;  // -0.3~0.3
  scale: number;     // 0.6~0.9
  sampleSrc?: string;
};
6) 컴포넌트 구조(권장)
VisionSimulator.tsx (단일 컴포넌트로도 가능)

tryStartCamera()

setMode("sample") fallback

selectSample(src) 샘플 변경

renderLoop(source) 공통 렌더

파일:

src/components/eye-care/VisionSimulator.tsx

src/app/eye-care/test/pattern/page.tsx

7) Sample 모드 구현 포인트 (실무 체크리스트)
7.1 이미지 로딩
<img> 엘리먼트를 숨겨두고 onload 이후 draw

또는 new Image() 로 로딩 후 canvas에 draw

7.2 루프 전략
Live: rAF 루프 필수(실시간)

Sample: rAF 없이 슬라이더 변경 시에만 다시 draw(성능 최적)

단, 구현 단순화를 위해 Sample도 rAF로 돌려도 되지만 불필요한 리소스 사용

7.3 예외 처리
카메라 실패 사유를 사용자에게 친절하게 노출:

“웹캠이 없거나 권한이 차단되어 샘플 모드로 전환합니다.”

8) API/DB 연동(저장값만)
8.1 로그인 전 저장 금지
LocalStorage(또는 메모리)에만 pending_result 저장

DB 저장은 Gate(로그인 성공) 이후에만 수행

8.2 저장 payload 예시
json
코드 복사
{
  "menu": "pattern",
  "mode": "sample",
  "sampleSrc": "/samples/vision/street_night.jpg",
  "preset": "glare",
  "blur": 0.25,
  "glare": 0.45,
  "contrast": 0.00,
  "scale": 0.75
}
9) 이벤트(PC 대응 포함)
test_start props:

{ menu_slug: "pattern", initial_mode: "live|sample" }

mode_switch props:

{ from: "live", to: "sample", reason: "permission_denied|no_device|policy|https" }

sample_select props:

{ src: "/samples/vision/street_night.jpg" }

나중에 KPI로 “PC에서 sample 모드 이용률”을 추적할 수 있습니다.

10) QA 체크리스트(PC 필수)
10.1 PC 웹캠 있는 환경
Live 모드 자동 시작

필터/슬라이더 반응 속도 확인

탭 이동 후 카메라 해제/재진입 정상 동작

10.2 PC 웹캠 없는 환경
Sample 모드 자동 전환

샘플 변경 가능

슬라이더 변경 시 draw 정상

“웹캠으로 체험하기” 눌렀을 때 안내/에러 처리 정상

10.3 권한 거부 환경
거부 즉시 Sample 모드 전환 + 안내 문구 표시

브라우저 설정에서 권한 허용 후 재시도 가능

11) 권장 일정(빠른 MVP)
샘플 이미지 준비(4장) + UI(썸네일) 추가

VisionSimulator에 mode 및 fallback 로직 구현

Sample 모드 draw 구현(슬라이더 변경 시 redraw)

Gate/Result 저장 흐름 연결(설정값만 저장)

이벤트 추가 및 QA

makefile
코드 복사

원하시면, 위 MD 기준으로 **VisionSimulator를 “Live+Sample” 완성 코드**로 한 번에 작성해 드리겠습니다(샘플 선택 UI, 모드 스위치, Sample은 슬라이더 변경 시 redraw 최적화 포함).
::contentReference[oaicite:0]{index=0}