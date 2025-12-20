import { NextRequest, NextResponse } from "next/server";
import { generateText } from "@/lib/ai/client";
import { createClient } from "@/lib/supabase/server";
import { logAction } from "@/lib/audit";
import { getMedicalSystemPrompt, RED_FLAG_KEYWORDS, detectMedicalTrack, DOCTORS, SCI_EVIDENCE } from "@/lib/ai/prompts";

// 액션 토큰 타입
type ActionType = 'RESERVATION_MODAL' | 'DOCTOR_INTRO_MODAL' | 'EVIDENCE_MODAL' | null;

// 토큰 파싱 함수
function parseActionToken(text: string): { cleanText: string; action: ActionType } {
    const tokenRegex = /\[\[ACTION:(RESERVATION_MODAL|DOCTOR_INTRO_MODAL|EVIDENCE_MODAL)\]\]/g;
    let action: ActionType = null;

    const match = tokenRegex.exec(text);
    if (match) {
        action = match[1] as ActionType;
    }

    const cleanText = text.replace(tokenRegex, '').trim();
    return { cleanText, action };
}

// 탭 하이라이트 감지 함수
function detectTabHighlight(text: string): ('review' | 'map')[] {
    const highlights: ('review' | 'map')[] = [];

    if (text.includes("후기보기") || text.includes("후기 보기")) {
        highlights.push('review');
    }
    if (text.includes("위치보기") || text.includes("위치 보기")) {
        highlights.push('map');
    }

    return highlights;
}

// 질문 카운트 함수 (AI 응답에서 질문 감지)
function countQuestionInResponse(text: string): boolean {
    // 질문 패턴: ~습니까?, ~하시겠습니까?, ~일까요?, ~인가요?
    const questionPatterns = [
        /[가-힣]+습니까\?/,
        /[가-힣]+시겠습니까\?/,
        /[가-힣]+일까요\?/,
        /[가-힣]+인가요\?/,
        /[가-힣]+어요\?/,
        /[가-힣]+나요\?/,
        /[가-힣]+요\?/
    ];

    return questionPatterns.some(pattern => pattern.test(text));
}

// 환자포털 AI 상담 - 메디컬 AI 프롬프트 사용
export async function POST(req: NextRequest) {
    try {
        const {
            message,
            history,
            turnCount = 0,
            track: existingTrack,
            askedQuestionCount = 0
        } = await req.json();

        // 1. Red Flag Detection
        const isRedFlag = RED_FLAG_KEYWORDS.some(flag => message.includes(flag));

        if (isRedFlag) {
            return NextResponse.json({
                role: "ai",
                content: "응급 상황이 의심됩니다. 즉시 119 또는 응급실을 방문해주세요.",
                action: null,
                highlightTabs: [],
                track: existingTrack,
                isRedFlag: true
            });
        }

        // 2. Track Detection (첫 턴에서 감지, 이후 유지)
        const track = existingTrack || detectMedicalTrack(message);

        // 3. System Prompt with track and question count
        const systemPrompt = getMedicalSystemPrompt(turnCount, track, askedQuestionCount);

        const fullPrompt = `
${systemPrompt}

[대화 내역]
${history.map((msg: any) => `${msg.role === 'user' ? '환자' : '위담한방병원'}: ${msg.content}`).join("\n")}
환자: ${message}
위담한방병원:
`;

        // 4. Generate Response
        let responseText = await generateText(fullPrompt, "medical");

        // 5. Parse action tokens
        const { cleanText, action } = parseActionToken(responseText);

        // 6. Detect tab highlights
        const highlightTabs = detectTabHighlight(cleanText);

        // 7. Count if response contains a question
        const hasQuestion = countQuestionInResponse(cleanText);
        const newQuestionCount = hasQuestion ? askedQuestionCount + 1 : askedQuestionCount;

        // 8. Audit Log
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
            await logAction(user.id, "create", "patient_chat", undefined, {
                message_length: message.length,
                turn_count: turnCount,
                track: track,
                action: action,
                question_count: newQuestionCount,
                is_red_flag: false
            });
        }

        // 9. Response with structured data
        return NextResponse.json({
            role: "ai",
            content: cleanText,
            action: action,
            highlightTabs: highlightTabs,
            track: track,
            askedQuestionCount: newQuestionCount,
            turnCount: turnCount + 1,
            // 의료진/논문 데이터 (모달용)
            doctorsData: action === 'DOCTOR_INTRO_MODAL' ? DOCTORS : undefined,
            evidenceData: action === 'EVIDENCE_MODAL' ? SCI_EVIDENCE : undefined
        });

    } catch (error) {
        console.error("Patient Chat API Error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

