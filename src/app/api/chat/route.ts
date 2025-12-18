import { NextRequest, NextResponse } from "next/server";
import { generateText } from "@/lib/ai/client";
import { createClient } from "@/lib/supabase/server";
import { logAction } from "@/lib/audit";
import { getMedicalSystemPrompt, RED_FLAG_KEYWORDS, RESERVATION_CONFIRM_KEYWORDS, detectMedicalTrack } from "@/lib/ai/prompts";

// 환자포털 AI 상담 - 메디컬 AI와 동일한 프롬프트 사용
export async function POST(req: NextRequest) {
    try {
        const { message, history, turnCount = 0, track: existingTrack } = await req.json();

        // 1. Red Flag Detection
        const isRedFlag = RED_FLAG_KEYWORDS.some(flag => message.includes(flag));

        if (isRedFlag) {
            return NextResponse.json({
                role: "ai",
                content: "🚨 [응급 알림] \n지금 말씀하신 증상은 응급 상황일 가능성이 높습니다. \n\n본 서비스는 의학적 진단을 대체할 수 없으므로, 즉시 119에 연락하거나 가까운 응급실을 방문해 주세요."
            });
        }

        // 2. Track Detection (첫 턴에서 감지, 이후 유지)
        const track = existingTrack || detectMedicalTrack(message);

        // 3. System Prompt with track
        const systemPrompt = getMedicalSystemPrompt(turnCount, track);

        const fullPrompt = `
${systemPrompt}

[대화 내역]
${history.map((msg: any) => `${msg.role === 'user' ? '환자' : '위담한방병원'}: ${msg.content}`).join("\n")}
환자: ${message}
위담한방병원:
`;

        // 4. Generate Response
        let responseText = await generateText(fullPrompt, "medical");

        // 5. Check if user confirmed reservation
        const isReservationConfirm = RESERVATION_CONFIRM_KEYWORDS.some(word => message.includes(word));

        const lastAiMessage = history.filter((m: any) => m.role === 'ai').slice(-1)[0]?.content || '';
        const askedForReservation = lastAiMessage.includes("예약을 도와드릴까요") ||
            lastAiMessage.includes("방문해 보시는 건 어떠세요") ||
            lastAiMessage.includes("한의원에 한번 방문");

        const isPostFinalTurn = turnCount > 4;

        if (isReservationConfirm && askedForReservation) {
            responseText = "네, 예약을 도와드리겠습니다. 지금 바로 예약 창을 열어드릴게요. [RESERVATION_TRIGGER]";
        } else if (isPostFinalTurn) {
            responseText += " [RESERVATION_TRIGGER]";
        }

        // 6. Audit Log
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
            await logAction(user.id, "create", "patient_chat", undefined, {
                message_length: message.length,
                turn_count: turnCount,
                track: track,
                is_red_flag: false
            });
        }

        return NextResponse.json({
            role: "ai",
            content: responseText.trim(),
            track: track
        });

    } catch (error) {
        console.error("Patient Chat API Error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
