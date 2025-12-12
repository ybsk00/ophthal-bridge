import { NextRequest, NextResponse } from "next/server";
import { generateText } from "@/lib/ai/client";
import { createClient } from "@/lib/supabase/server";
import { logAction } from "@/lib/audit";

export async function POST(req: NextRequest) {
    try {
        const { message, history } = await req.json();

        // 1. Red Flag Detection (Strict)
        const redFlags = [
            "가슴 통증", "흉통", "숨이 차", "호흡곤란", "마비", "실어증", "말이 안 나와",
            "의식 저하", "기절", "실신", "피를 토해", "객혈", "하혈", "심한 두통", "번개",
            "39도", "고열", "경련", "발작"
        ];

        const isRedFlag = redFlags.some(flag => message.includes(flag));

        if (isRedFlag) {
            return NextResponse.json({
                role: "ai",
                content: "🚨 [응급 알림] \n지금 말씀하신 증상은 응급 상황일 가능성이 높습니다. \n\n본 서비스는 의학적 진단을 대체할 수 없으므로, 즉시 119에 연락하거나 가까운 응급실을 방문해 주세요."
            });
        }

        // 2. System Prompt for Medical Pre-diagnosis
        const systemPrompt = `
[역할]
당신은 "한의원 메디컬 AI"입니다.
로그인한 환자를 대상으로 진료 전 '심화 예진'을 수행합니다.
환자의 증상을 듣고, 가능성 있는 원인(가설)을 좁혀나가기 위해 필요한 질문을 던지세요.

[목표]
- 환자의 주호소(Chief Complaint)를 명확히 파악.
- 발병 시기, 원인, 악화/완화 요인, 동반 증상 등을 수집.
- 최종적으로 의사가 진료할 때 도움이 될 수 있는 요약 정보를 생성하기 위함.

[대화 규칙]
- 말투: "환자님", "~하셨나요?", "~입니다" 등 정중하고 전문적인 어조 (해요체 사용하되 가볍지 않게).
- 길이: 한 번에 1~2개의 질문만 던질 것. (질문 폭격 금지)
- 금지: "당신은 OO병입니다" 확진 금지. 약 처방 금지. "병원에 안 가도 됩니다" 금지.
- 흐름:
  1. 증상 구체화 (언제부터, 얼마나 아픈지, 부위 등)
  2. 동반 증상 확인 (소화는 잘 되는지, 잠은 잘 자는지 등 한의학적 관점 포함)
  3. 3~5턴 정도 진행 후에는 "원장님께 전달해 드릴 예진표를 정리하겠습니다." 라고 마무리 멘트.

[대화 내역]
${history.map((msg: any) => `${msg.role === 'user' ? '사용자' : 'AI'}: ${msg.content}`).join("\n")}
사용자: ${message}
AI:
`;

        // 3. Generate Response
        const responseText = await generateText(systemPrompt, "medical");

        // 4. Audit Log
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
            await logAction(user.id, "create", "medical_chat", undefined, {
                message_length: message.length,
                is_red_flag: false
            });
        }

        return NextResponse.json({
            role: "ai",
            content: responseText.trim()
        });

    } catch (error) {
        console.error("Medical Chat API Error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
