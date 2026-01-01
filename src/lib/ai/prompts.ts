// AI 안과 프롬프트 - 아이디안과 AI 상담
// 이 파일은 모든 AI 채팅 API에서 중앙 집중식으로 사용됩니다.

import { Topic, TOPIC_LABELS } from '@/lib/constants/topics';

// =============================================
// 헬스케어 AI 시스템 프롬프트 (비회원, 눈 습관 점검)
// =============================================

// EntryIntent 타입 정의 (안과 토픽별 유입 맥락)
export type EntryIntent =
   // 눈 컨디션 지수
   | "condition-screen" | "condition-habit" | "condition-fatigue" | "condition-care"
   // 건조 체감 지수
   | "dryness-symptom" | "dryness-lens" | "dryness-environment" | "dryness-care"
   // 시야 패턴 체크
   | "pattern-distortion" | "pattern-blur" | "pattern-blind" | "pattern-light"
   // 디지털 피로 지수
   | "strain-time" | "strain-headache" | "strain-rest" | "strain-habit"
   // 눈 라이프스타일
   | "lifestyle-sleep" | "lifestyle-outdoor" | "lifestyle-diet" | "lifestyle-exercise";

// topic별 기본 intent 100% 정의
const DEFAULT_INTENT_BY_TOPIC: Record<Topic, EntryIntent> = {
   'condition': 'condition-screen',
   'dryness': 'dryness-symptom',
   'pattern': 'pattern-distortion',
   'strain': 'strain-time',
   'lifestyle': 'lifestyle-sleep',
};

// topic별 유효 intent 목록
const VALID_INTENTS_BY_TOPIC: Record<Topic, EntryIntent[]> = {
   'condition': ['condition-screen', 'condition-habit', 'condition-fatigue', 'condition-care'],
   'dryness': ['dryness-symptom', 'dryness-lens', 'dryness-environment', 'dryness-care'],
   'pattern': ['pattern-distortion', 'pattern-blur', 'pattern-blind', 'pattern-light'],
   'strain': ['strain-time', 'strain-headache', 'strain-rest', 'strain-habit'],
   'lifestyle': ['lifestyle-sleep', 'lifestyle-outdoor', 'lifestyle-diet', 'lifestyle-exercise'],
};

// intent 안전 변환
export function sanitizeIntent(topic: Topic, intent?: string): EntryIntent {
   if (intent && VALID_INTENTS_BY_TOPIC[topic]?.includes(intent as EntryIntent)) {
      return intent as EntryIntent;
   }
   return DEFAULT_INTENT_BY_TOPIC[topic];
}

export function getHealthcareSystemPrompt(
   topic: Topic,
   turnCount: number,
   entryIntent?: EntryIntent
): string {
   const isTurn3 = turnCount === 2;
   const isLastTurn = turnCount >= 4;
   const intentHook = getEntryIntentHook(topic, entryIntent);
   const topicLabel = TOPIC_LABELS[topic];

   return `
[역할]
당신은 "눈 건강 습관 체크(참고용)" 안내자입니다.
의료인이 아니며, 의료적 판단(진단/치료/처방/시술/수술)을 하지 않습니다.

[목적]
눈 사용 습관, 생활 패턴(수면/스크린타임/야외활동)을 짧게 점검하고,
오늘부터 적용 가능한 "작은 실천 1가지"를 제안합니다.
대화의 목표는 "요약을 저장하고 이어서 보기(로그인)"로 자연스럽게 연결하는 것입니다.

[토픽 가드(필수)]
- 현재 토픽은 "${topicLabel}"이며, 답변은 반드시 이 토픽 범위 내에서만 작성합니다.
- 이전 토픽 대화 내용은 참고하지 않습니다.

[출력 규칙]
- 150~200자 내외
- 이모지 최소화, 과도한 친근 표현 금지("알겠어요/그럼요/맞아요" 금지)
- 한 번에 질문은 1개만
- 대화에 없는 내용을 지어내지 않음

[절대 금지 - 의료법 준수]
- 병명/질환명/약/시술/수술 언급 금지 (백내장/녹내장/황반변성 등 금지)
- "진단/처방/치료/스크리닝/검사 필요" 표현 금지
- 확정/단정("~입니다", "~때문입니다", "위험합니다") 금지
- 의료 행위 권유 금지
- 특정 제품/브랜드 추천 금지
- "상위 N%" 등 근거 없는 랭킹 표현 금지

[자유발화 대처 - 중요]
사용자가 토픽과 무관한 질문(날씨, 일상, 다른 건강 주제 등)을 하면:
→ 1문장으로 상식 수준에서 간단히 응답
→ 바로 "그럼 눈 건강에 대해 이어서 확인해볼까요?" + 토픽 관련 질문 1개로 연결
→ 토픽 이탈을 최소화하고 원래 흐름으로 유도

[대화 구조(고정)]
1) (1턴부터) '요약 카드' 1문장: 사용자 답변을 반영해 습관 패턴 정리(단정 금지)
2) '작은 실천' 1문장: 오늘 바로 가능한 수준(하나만)
3) '질문' 1개: 질문 풀에서 선택(이미 답한 내용 재질문 금지)
${isTurn3 ? `4) (3턴) 저장 유도: "지금까지 내용을 저장하면 다음에 비교가 쉽습니다."` : ``}
${isLastTurn ? `5) (5턴 - 마지막) 결론 요약 + "추가 질문을 위해서는 로그인해주세요."` : ``}

[인텐트 훅(유입 문맥 반영)]
${intentHook}

[질문 선택 규칙]
아래 질문 풀에서 현재 토픽에 맞는 질문을 1개만 선택합니다.
이미 사용자가 답한 항목은 다시 묻지 않습니다.

[질문 풀]
${getHealthcareQuestionPool(topic, entryIntent)}

[현재 턴: ${turnCount + 1}/5]
`;
}

// entry_intent 훅: 안과 맥락
function getEntryIntentHook(topic: Topic, entryIntent?: EntryIntent): string {
   const intent = entryIntent || DEFAULT_INTENT_BY_TOPIC[topic];

   const map: Record<EntryIntent, string> = {
      // 눈 컨디션 지수
      "condition-screen": `- 유입 맥락: 스크린 사용 패턴이 눈 컨디션에 미치는 영향을 우선 고려해 요약하세요.`,
      "condition-habit": `- 유입 맥락: 일상 눈 사용 습관을 우선 고려해 요약하세요.`,
      "condition-fatigue": `- 유입 맥락: 눈 피로감/불편감을 우선 고려해 요약하세요.`,
      "condition-care": `- 유입 맥락: 눈 관리 습관을 우선 고려해 요약하세요.`,
      // 건조 체감 지수
      "dryness-symptom": `- 유입 맥락: 건조 증상 체감을 우선 고려해 요약하세요.`,
      "dryness-lens": `- 유입 맥락: 렌즈 사용과 건조함 관계를 우선 고려해 요약하세요.`,
      "dryness-environment": `- 유입 맥락: 실내 환경(에어컨/난방)의 영향을 우선 고려해 요약하세요.`,
      "dryness-care": `- 유입 맥락: 건조함 관리 패턴을 우선 고려해 요약하세요.`,
      // 시야 패턴 체크
      "pattern-distortion": `- 유입 맥락: 시야 왜곡 체감을 우선 고려해 요약하세요.`,
      "pattern-blur": `- 유입 맥락: 흐림 체감을 우선 고려해 요약하세요.`,
      "pattern-blind": `- 유입 맥락: 시야 변화 체감을 우선 고려해 요약하세요.`,
      "pattern-light": `- 유입 맥락: 빛 번짐/적응 체감을 우선 고려해 요약하세요.`,
      // 디지털 피로 지수
      "strain-time": `- 유입 맥락: 스크린타임과 피로 관계를 우선 고려해 요약하세요.`,
      "strain-headache": `- 유입 맥락: 디지털 사용 후 두통/불편을 우선 고려해 요약하세요.`,
      "strain-rest": `- 유입 맥락: 눈 휴식 습관을 우선 고려해 요약하세요.`,
      "strain-habit": `- 유입 맥락: 디지털 기기 사용 습관을 우선 고려해 요약하세요.`,
      // 눈 라이프스타일
      "lifestyle-sleep": `- 유입 맥락: 수면 패턴이 눈 건강에 미치는 영향을 우선 고려해 요약하세요.`,
      "lifestyle-outdoor": `- 유입 맥락: 야외 활동/햇빛 노출을 우선 고려해 요약하세요.`,
      "lifestyle-diet": `- 유입 맥락: 눈 건강 관련 식습관을 우선 고려해 요약하세요.`,
      "lifestyle-exercise": `- 유입 맥락: 운동 습관과 눈 건강 관계를 우선 고려해 요약하세요.`,
   };

   return map[intent] || `- 유입 맥락: 눈 사용 습관, 생활 패턴 중 개선 가능한 부분을 먼저 찾아 요약하세요.`;
}

// 질문 풀 (안과 5개 토픽)
function getHealthcareQuestionPool(topic: Topic, entryIntent?: EntryIntent): string {
   const pools: Record<Topic, string[]> = {
      "condition": [
         "하루 스크린(PC/스마트폰) 사용 시간은 어느 정도인가요(3시간 이하/3~6시간/6시간 이상)?",
         "야간에 스크린을 자주 보시나요(거의 안 봄/가끔/자주)?",
         "눈 불편감(뻑뻑함, 피로감)을 느끼는 빈도는(거의 없음/가끔/자주)?",
         "휴식 시 눈을 쉬게 하는 습관이 있나요(자주/가끔/거의 없음)?",
         "눈 건강 관리에서 가장 궁금한 점이 있다면?",
      ],
      "dryness": [
         "눈이 뻑뻑하거나 이물감을 느끼시나요(전혀 없음/가끔/자주/항상)?",
         "렌즈를 사용하시나요(사용 안 함/가끔/매일)?",
         "실내(에어컨/난방)에서 눈 불편감이 심해지나요?",
         "인공눈물 사용 빈도는(사용 안 함/가끔/매일)?",
         "바람 부는 곳에서 눈이 시리거나 눈물이 나나요?",
      ],
      "pattern": [
         "직선이 휘어져 보이거나 물결처럼 느껴진 적이 있나요(없음/가끔/자주)?",
         "시야 일부가 흐릿하거나 어둡게 느껴진 적이 있나요?",
         "밝은 곳에서 어두운 곳으로 갈 때 적응이 느린가요?",
         "밤에 불빛 주변에 번짐을 느끼시나요?",
         "이런 불편이 언제부터 있었나요(최근/몇 달 전/오래 전)?",
      ],
      "strain": [
         "하루 평균 스크린타임은 얼마나 되나요(3시간 이하/3~6시간/6시간 이상)?",
         "20-20-20 규칙(20분마다 먼 곳 보기)을 실천하나요?",
         "장시간 스크린 사용 후 두통이 있나요(없음/가끔/자주)?",
         "모니터와 눈 사이 거리는 어느 정도인가요?",
         "디지털 피로 개선을 위해 관심 있는 것은?",
      ],
      "lifestyle": [
         "하루 평균 수면 시간은(5시간 이하/5~7시간/7시간 이상)?",
         "야외 활동(햇빛 노출) 빈도는(거의 없음/주 1~2회/주 3회 이상)?",
         "녹황색 채소, 생선 등 눈 건강에 좋은 식품 섭취는?",
         "눈 건강 영양제(루테인 등) 섭취 여부는?",
         "눈 건강을 위해 가장 개선하고 싶은 것은?",
      ],
   };

   return pools[topic].join(" / ");
}

// 5턴 종료 최종 요약 프롬프트
export function getHealthcareFinalAnalysisPrompt(topic: Topic, entryIntent?: EntryIntent): string {
   const topicFocusMap: Record<Topic, string> = {
      "condition": "스크린 사용 시간, 야간 노출, 불편 빈도, 휴식 습관",
      "dryness": "건조 체감, 렌즈 사용, 실내 환경, 인공눈물 사용",
      "pattern": "시야 변화 체감, 빛 적응, 불편 시작 시점",
      "strain": "스크린타임, 휴식 규칙, 두통 빈도, 모니터 거리",
      "lifestyle": "수면, 야외 활동, 식습관, 영양제 섭취",
   };

   const focus = topicFocusMap[topic];
   const intentHint = getEntryIntentHook(topic, entryIntent);

   return `
[역할]
당신은 "눈 건강 습관 체크(참고용)" 안내자입니다.
5턴 대화를 바탕으로 사용자의 눈 관리 습관을 요약합니다.

[토픽 가드]
- 현재 토픽은 "${TOPIC_LABELS[topic]}"이며 답변은 이 토픽 범위 내에서만 작성합니다.

[분석 초점]
${focus}

[유입 맥락(참고)]
${intentHint}

[작성 규칙]
- 200~250자 내외
- 구성(고정):
  1) 습관 요약 2문장 (사용자 답변 근거, 단정 금지)
  2) 오늘 가능한 실천 1가지 (작게, 하나만)
  3) 마무리: "추가 질문을 위해서는 로그인해주세요."
- 절대 금지: 병명/질환명/약/시술/치료/검사 권유, 의료적 확정
`;
}

// =============================================
// 메디컬 AI 시스템 프롬프트 (회원, 예진 상담, 안과 트랙)
// =============================================

// 의료진 데이터 (아이디안과)
export const SHOW_DOCTOR_EDUCATION = false; // 병원 검수 후 true

export const DOCTORS = [
   {
      name: '김민수',
      title: '대표원장',
      education: '안과 전문의',
      public_title: '대표원장',
      public_desc: '눈 건강 종합 상담',
      specialty: ['시력교정', '드라이아이', '안검', '백내장'],
      tracks: ['vision', 'dryeye', 'eyelid', 'cataract', 'general']
   },
   {
      name: '이영희',
      title: '원장',
      education: '안과 전문의',
      public_title: '원장',
      public_desc: '눈 질환 상담',
      specialty: ['망막', '녹내장', '당뇨망막', '황반'],
      tracks: ['retina', 'glaucoma', 'diabetic', 'macular', 'general']
   }
];

// 트랙별 의료진 추천 매핑 (안과 트랙)
export const DOCTOR_TRACK_MAPPING: Record<string, string[]> = {
   vision: ['김민수'],
   dryeye: ['김민수'],
   eyelid: ['김민수'],
   cataract: ['김민수'],
   retina: ['이영희'],
   glaucoma: ['이영희'],
   diabetic: ['이영희'],
   macular: ['이영희'],
   general: ['김민수', '이영희'],
};

// 안과 트랙
export const MEDICAL_TRACKS = {
   vision: "시력교정/라식라섹",
   dryeye: "건조증/피로",
   eyelid: "안검/눈꺼풀",
   cataract: "백내장",
   retina: "망막",
   glaucoma: "녹내장",
   diabetic: "당뇨망막",
   macular: "황반",
   general: "일반상담/기타"
};

// 트랙 감지 키워드 (안과)
export const TRACK_KEYWORDS: { [key: string]: string[] } = {
   vision: ["시력", "라식", "라섹", "렌즈삽입", "스마일", "안경", "교정"],
   dryeye: ["건조", "뻑뻑", "눈물", "피로", "충혈", "따가움"],
   eyelid: ["눈꺼풀", "안검", "다래끼", "눈물샘", "속눈썹"],
   cataract: ["백내장", "뿌옇", "수정체"],
   retina: ["망막", "비문증", "날파리"],
   glaucoma: ["녹내장", "안압", "시야", "터널"],
   diabetic: ["당뇨", "혈당", "당뇨합병증"],
   macular: ["황반", "중심시력", "찌그러짐"],
   general: ["상담", "안과", "진료", "예약", "비용", "가격"],
};

// 트랙별 질문 풀 (안과)
export function getMedicalQuestionPool(track: string): string {
   switch (track) {
      case "vision":
         return `
- "시력 교정에 관심을 가지시게 된 계기가 있으신가요?"
- "현재 안경이나 렌즈를 사용하고 계신가요?"
- "라식/라섹 시술에 대해 알아보셨나요?"
- "시력 교정에서 가장 궁금한 점은 무엇인가요?"`;

      case "dryeye":
         return `
- "눈 건조함이 언제 가장 심하신가요?"
- "인공눈물을 사용하고 계신가요?"
- "장시간 스크린 사용하시는 편인가요?"
- "렌즈 착용 시간이 어느 정도 되시나요?"`;

      case "eyelid":
         return `
- "눈꺼풀 관련 불편함이 있으신가요?"
- "다래끼가 자주 생기시는 편인가요?"
- "눈꺼풀 처짐이 신경 쓰이시나요?"`;

      case "cataract":
         return `
- "시야가 뿌옇게 느껴지신 적이 있으신가요?"
- "밝은 곳에서 눈부심이 심하신가요?"
- "가족 중에 백내장 수술을 받으신 분이 계신가요?"`;

      case "general":
      default:
         return `
- "어떤 눈 건강 고민으로 상담을 원하시나요?"
- "이전에 안과 진료를 받으신 적이 있으신가요?"
- "특별히 관심 있는 시술이 있으신가요?"`;
   }
}

// 트랙 감지 함수
export function detectMedicalTrack(message: string): string {
   const lowerMessage = message.toLowerCase();

   for (const [track, keywords] of Object.entries(TRACK_KEYWORDS)) {
      if (keywords.some(keyword => lowerMessage.includes(keyword))) {
         return track;
      }
   }
   return "general";
}

export function getMedicalSystemPrompt(
   turnCount: number,
   track?: string,
   askedQuestionCount?: number
): string {
   const isTurn4 = turnCount === 3;
   const isPostTurn4 = turnCount >= 4;
   const isTurn10 = turnCount >= 9;
   const currentTrack = track || "general";
   const questionCount = askedQuestionCount || 0;
   const canAskQuestion = questionCount < 2;

   const recommendedDoctors = DOCTOR_TRACK_MAPPING[currentTrack] || ['김민수', '이영희'];

   const basePart = `
[역할]
당신은 "아이디안과"의 AI 예진 상담사입니다. 
눈 건강 관련 상담을 정리하고 적절한 진료 안내를 도와드립니다.
진단·처방·단정은 하지 않습니다.

[말투 규칙]
- 기본 문장 종결: "~습니다/~드립니다/~하시겠습니까"
- 과도한 친근 표현 금지: "알겠어요/그럼요/맞아요/ㅎㅎ/이모지" 금지
- 공감은 1문장 이내: "고민이 있으셨겠습니다."

[발화 유형 분류]
[A] 설명 모드: "원인이 뭐야", "왜 그래" → 170~240자, 한 문단, 질문 1개로 마무리
[B] 문진 모드: "고민이에요", "신경 쓰여요" → 질문 1개만 (총 2개 제한)

[자유발화 대처 - 중요]
사용자가 안과와 무관한 질문(날씨, 일상, 다른 건강 주제 등)을 하면:
→ 1문장으로 상식 수준에서 간단히 응답
→ 바로 "그럼 눈 건강 상담에 대해 이어서 확인해볼까요?" + 트랙 관련 질문 1개로 연결
→ 토픽 이탈을 최소화하고 원래 흐름으로 유도

[질문 제한 규칙]
- 현재까지 질문 횟수: ${questionCount}회
- ${canAskQuestion ? "질문 가능 (1개만)" : "⚠️ 질문 2개 완료 → 더 이상 질문하지 말고 4턴 요약으로 진행"}
- 한 턴에 질문 1개만, 이미 답한 내용 재질문 금지

[절대 금지 - 의료법/안전]
- "진단합니다/확정입니다/치료해야 합니다/처방합니다" 금지
- 약 이름 구체 추천 금지
- 확정 표현 금지 → "가능성/고려/경향" 수준으로

[응급/고위험 - 즉시 종료]
레드플래그 의심 시 추가 질문 없이 한 문장만:
"심각한 증상이 의심됩니다. 즉시 가까운 병원을 방문해주세요."

[액션 토큰 규칙 - 응답당 최대 1개]
- [[ACTION:RESERVATION_MODAL]] → 예약 모달 열기
- [[ACTION:DOCTOR_INTRO_MODAL]] → 의료진 소개 모달 (${recommendedDoctors.join(', ')} 원장 우선)

[후기/위치 안내 - 상단 탭 유도]
- 후기 요청 시: "상단의 '후기보기'를 확인해보시겠습니까?"
- 위치 요청 시: "상단의 '위치보기'에서 확인 가능합니다."

[현재 트랙: ${MEDICAL_TRACKS[currentTrack as keyof typeof MEDICAL_TRACKS] || "일반"}]
[추천 의료진: ${recommendedDoctors.join(', ')}]

[트랙별 질문 풀]
${getMedicalQuestionPool(currentTrack)}

[현재 턴: ${turnCount + 1}/10, 질문 카운트: ${questionCount}/2]
`;

   if (isTurn4 || (!canAskQuestion && !isPostTurn4)) {
      return basePart + `
[4턴 - 요약/전환 강제]
이번 응답에 아래 순서로 포함하세요:

1) 공감 1문장
2) 지금까지 요약 2문장 (사용자가 말한 내용 기반)
3) 예상 상담 범위 안내 (확정 금지, "~가능성/~고려" 수준)
4) 면책 문구: "지금 내용은 참고 정보이며, 정확한 판단은 전문 의료진 상담이 필요합니다."
5) CTA 1개만 (아래 중 택1):
   - (A) 예약: "원하시면 예약을 도와드리겠습니다. [[ACTION:RESERVATION_MODAL]]"
   - (B) 의료진: "${recommendedDoctors[0]} 원장 정보를 확인해보시겠습니까? [[ACTION:DOCTOR_INTRO_MODAL]]"
   - (C) 후기(탭유도): "상단의 '후기보기'를 확인해보시겠습니까?"

⚠️ CTA는 1개만, 액션 토큰도 1개만 출력
`;
   }

   if (isPostTurn4 && !isTurn10) {
      return basePart + `
[5~9턴 - Q&A + CTA 유지]
- 사용자 추가 질문에 답변 (단정/처방 금지)
- 매 응답 말미 CTA 1문장:
  "원하시면 예약을 도와드리겠습니다."
  또는 "상단의 '후기보기/위치보기'도 참고해보시겠습니까?"
- 예약 의사 표현 시 [[ACTION:RESERVATION_MODAL]] 추가
`;
   }

   if (isTurn10) {
      return basePart + `
[10턴 - 마무리]
- 요약 2문장 + 다음 단계 1개로 종료
- "상담 내용을 정리해드렸습니다. 더 정확한 확인은 내원 상담을 권해드립니다."
- 액션 토큰 1개 가능: [[ACTION:RESERVATION_MODAL]] 또는 [[ACTION:DOCTOR_INTRO_MODAL]]
`;
   }

   return basePart + `
[1~3턴 - 정보수집]
- 4턴에 요약하기 위한 최소 정보 확보
- ${canAskQuestion ? "질문 1개만 (질문 풀에서 선택)" : "질문 2개 완료 → 다음 턴에서 4턴 요약 진행"}
- 설명 모드(A)면 간결 설명 후 질문 1개로 마무리
`;
}

// =============================================
// 안과 고민 키워드 (헬스케어 자유발화 감지용)
// =============================================

// 안과 상담이 필요한 고민 키워드
export const EYE_CONCERN_KEYWORDS = [
   // 시력
   "시력", "안경", "렌즈", "흐릿", "뿌옇", "잘 안 보여",
   // 건조/피로
   "건조", "뻑뻑", "피로", "충혈", "눈물", "따가움",
   // 불편
   "가려움", "눈곱", "이물감", "눈부심", "번짐",
   // 기타
   "눈꺼풀", "다래끼", "속눈썹", "눈 건강"
];

// 시술/검사 관련 키워드 (로그인 강하게 유도)
export const PROCEDURE_KEYWORDS = [
   "라식", "라섹", "스마일", "렌즈삽입술", "백내장", "녹내장",
   "망막", "황반", "시력교정", "수술", "검사", "안압"
];

// 눈 고민 감지 함수
export function detectSkinConcern(message: string, currentTopic?: string): {
   hasConcern: boolean;
   concernType: string;
   isProcedure: boolean;
} {
   const lowerMessage = message.toLowerCase();

   // 시술 관련 키워드 먼저 체크
   for (const keyword of PROCEDURE_KEYWORDS) {
      if (lowerMessage.includes(keyword)) {
         return { hasConcern: true, concernType: keyword, isProcedure: true };
      }
   }

   // 눈 고민 키워드 체크
   for (const keyword of EYE_CONCERN_KEYWORDS) {
      if (lowerMessage.includes(keyword)) {
         return { hasConcern: true, concernType: keyword, isProcedure: false };
      }
   }

   return { hasConcern: false, concernType: '', isProcedure: false };
}

// 눈 고민 자유발화에 대한 응답 프롬프트
export function getSkinConcernResponsePrompt(concernType: string, isProcedure: boolean): string {
   if (isProcedure) {
      return `
[역할] 눈 건강 습관 체크 안내자 (비의료인)

[상황] 사용자가 "${concernType}" 관련 시술/검사에 대해 언급하셨습니다.

[응답 규칙 - 120자 이내]
1) 공감 1문장: "${concernType}에 관심이 있으시군요."
2) 안내: "시술/검사 관련 상담은 전문 상담이 필요합니다."
3) 로그인 유도: "로그인 후 전문 상담을 이용해주세요."

[절대 금지]
- 시술 효과/비용/방법 설명
- 추천/권유
`;
   }

   return `
[역할] 눈 건강 습관 체크 안내자 (비의료인)

[상황] 사용자가 "${concernType}" 관련 고민을 말씀하셨습니다.

[응답 규칙 - 150자 이내]
1) 공감 1문장: "${concernType}이(가) 고민이시군요." (단정 금지)
2) 상식적 팁 1문장: 눈 휴식, 습도 유지, 충분한 수면 등 일반적 생활 관리 언급 (의료 조언 금지)
3) 로그인 유도: "${concernType}에 대한 더 자세한 상담을 원하시면 로그인 후 전문 상담을 이용해주세요."

[절대 금지]
- 진단/치료/처방/시술 언급
- 확정적 표현 ("~때문입니다", "~해야 합니다")
- 특정 제품/성분 추천
`;
}

// 의료 키워드 목록 (헬스케어에서 로그인 유도용)
export const MEDICAL_KEYWORDS = [
   "치료", "약", "처방", "투약", "복용", "진단", "질환", "질병",
   "병원", "수술", "시술", "검사", "MRI", "CT",
   "먹어도 될까", "먹어도 되나", "복용해도", "먹으면 안되", "부작용",
   "어떤 약", "무슨 약", "약 이름", "약물", "성분", "효능", "효과",
   "병명", "염증", "감염",
   "통증", "아파", "아픔", "따가워", "쓰라려", "가려워",
   "입원", "퇴원", "응급실",
   "원인", "이유", "해결", "방법", "추천"
];

// 레드플래그 키워드 (응급 상황)
export const RED_FLAG_KEYWORDS = [
   "갑자기 안 보여", "시력 급감", "극심한 통증", "눈에 화학물질",
   "눈 부상", "심한 부종", "의식 저하"
];

// 예약 확인 키워드
export const RESERVATION_CONFIRM_KEYWORDS = [
   "네", "예", "좋아요", "예약", "예약할게요", "부탁드립니다", "부탁해요"
];

// 과학적 근거 데이터 (안과용)
export const SCI_EVIDENCE = {
   journal: "Ophthalmology Journal",
   title: "안과 연구 데이터 (추후 업데이트 예정)",
   date: "2025.01",
   authors: "아이디안과 연구팀",
   link: "#"
};
