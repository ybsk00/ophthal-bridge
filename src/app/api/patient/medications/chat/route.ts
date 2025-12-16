import { NextRequest, NextResponse } from "next/server";
import { generateText } from "@/lib/ai/client";

const MEDICATION_GUIDE_PROMPT = `당신은 전문 약사 AI입니다. 환자가 질문한 약물에 대해 정확하고 친절하게 복약 지도를 제공합니다.

응답 형식:
1. 약물명이 확인되면 다음 항목을 알려주세요:
   - 💊 약물명 (성분명)
   - 📌 복용량: 일반적인 권장 용량
   - ⏰ 복용 주기: 몇 시간 간격
   - 🍽️ 복용 시간: 식전/식후/식간
   - ⚠️ 주의사항: 부작용, 금기 사항
   - 🔄 약물 상호작용: 함께 복용 주의 약물

2. 약물명을 모르면 친절히 다시 물어보세요
3. 처방전이나 약봉투 사진을 보내달라고 안내할 수 있습니다
4. 항상 한국어로 응답하세요
5. 마크다운 형식(**볼드**, • 리스트)을 사용하세요
6. 의사 상담이 필요한 경우 반드시 안내하세요

주의: 의료 진단이나 처방을 대신하지 마세요. 일반적인 정보만 제공합니다.`;

export async function POST(req: NextRequest) {
    try {
        const { message, history, hasImage } = await req.json();

        if (!message && !hasImage) {
            return NextResponse.json(
                { error: "메시지가 필요합니다." },
                { status: 400 }
            );
        }

        // Build conversation context
        const conversationHistory = history
            ?.map((msg: any) => `${msg.role === 'user' ? '사용자' : '약사AI'}: ${msg.content}`)
            .join("\n") || "";

        const fullPrompt = `${MEDICATION_GUIDE_PROMPT}

[대화 내역]
${conversationHistory}
사용자: ${message}${hasImage ? ' (사진 첨부됨)' : ''}
약사AI:`;

        // Use healthcare mode for faster response
        const responseText = await generateText(fullPrompt, "healthcare");

        return NextResponse.json({
            role: "assistant",
            content: responseText.trim()
        });

    } catch (error) {
        console.error("Medication Guide API Error:", error);
        return NextResponse.json(
            { error: "서버 오류가 발생했습니다." },
            { status: 500 }
        );
    }
}
