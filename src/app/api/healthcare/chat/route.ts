import { NextRequest, NextResponse } from "next/server";
import { generateText } from "@/lib/ai/client";
import { getHealthcareSystemPrompt, getHealthcareFinalAnalysisPrompt, MEDICAL_KEYWORDS, EntryIntent, detectSkinConcern, getSkinConcernResponsePrompt } from "@/lib/ai/prompts";

export async function POST(req: NextRequest) {
    try {
        const { message, history, turnCount, topic, entryIntent } = await req.json();

        // 1. 의료 키워드/증상 감지 - 즉시 로그인 유도 (AI 답변 생성 없이 즉시 리턴)
        const hasMedicalQuestion = MEDICAL_KEYWORDS.some(keyword =>
            message.toLowerCase().includes(keyword.toLowerCase())
        );

        if (hasMedicalQuestion) {
            return NextResponse.json({
                role: "ai",
                content: "말씀하신 내용은 **의료 상담 영역**이라 이 단계에서는 답변드리기 어렵습니다.\n\n지금까지 정리한 내용을 저장하고, 로그인 후 더 정확한 확인을 진행하시는 게 안전합니다.\n\n로그인하시겠습니까?",
                requireLogin: true,
                isSymptomTrigger: true
            });
        }

        // 2. 피부과 고민 자유발화 감지 - 공감 응답 + 로그인 유도
        const skinConcern = detectSkinConcern(message, topic);

        if (skinConcern.hasConcern) {
            // AI에게 특별 지시를 주어 공감 + 로그인 유도 응답 생성
            const concernPrompt = getSkinConcernResponsePrompt(skinConcern.concernType, skinConcern.isProcedure);

            const fullPrompt = `
${concernPrompt}

사용자: ${message}
AI:
`;
            const responseText = await generateText(fullPrompt, "healthcare");

            return NextResponse.json({
                role: "ai",
                content: responseText.trim(),
                requireLogin: true,
                isSkinConcernRedirect: true,
                concernType: skinConcern.concernType
            });
        }

        // 3. 5턴째 (마지막 턴) - 종합 분석 및 결과 제공
        if (turnCount === 4) {
            const finalAnalysisPrompt = getHealthcareFinalAnalysisPrompt(
                topic || "default",
                entryIntent as EntryIntent
            );

            const fullPrompt = `
${finalAnalysisPrompt}

[대화 내역]
${history.map((msg: any) => `${msg.role === 'user' ? '사용자' : 'AI'}: ${msg.content}`).join("\n")}
사용자: ${message}
AI(분석 결과):
`;
            const analysisResult = await generateText(fullPrompt, "healthcare");

            return NextResponse.json({
                role: "ai",
                content: analysisResult.trim(),
                requireLogin: true,
                isHardStop: true
            });
        }

        // 5턴 초과 방어
        if (turnCount >= 5) {
            return NextResponse.json({
                role: "ai",
                content: "상담이 이미 종료되었습니다. 지금까지 정리한 내용을 저장하려면 로그인해 주세요.",
                requireLogin: true,
                isHardStop: true
            });
        }

        // 4. 시스템 프롬프트 from prompts.ts (entryIntent 전달)
        const systemPrompt = getHealthcareSystemPrompt(
            topic || "default",
            turnCount,
            entryIntent as EntryIntent
        );

        const fullPrompt = `
${systemPrompt}

[대화 내역]
${history.map((msg: any) => `${msg.role === 'user' ? '사용자' : 'AI'}: ${msg.content}`).join("\n")}
사용자: ${message}
AI:
`;

        const responseText = await generateText(fullPrompt, "healthcare");

        // 5. 3턴째 - Soft Gate (로그인 유도하지만 계속 가능)
        const isTurn3 = turnCount === 2;

        return NextResponse.json({
            role: "ai",
            content: responseText.trim(),
            turnCount: turnCount + 1,
            requireLogin: isTurn3
        });

    } catch (error) {
        console.error("Healthcare Chat API Error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

