import { NextRequest, NextResponse } from "next/server";
import { generateText } from "@/lib/ai/client";
import { getHealthcareSystemPrompt, getHealthcareFinalAnalysisPrompt, MEDICAL_KEYWORDS } from "@/lib/ai/prompts";

export async function POST(req: NextRequest) {
    try {
        const { message, history, turnCount, topic } = await req.json();

        // 1. 의료 키워드/증상 감지 - 즉시 로그인 유도 (AI 답변 생성 없이 즉시 리턴)
        const hasMedicalQuestion = MEDICAL_KEYWORDS.some(keyword =>
            message.toLowerCase().includes(keyword.toLowerCase())
        );

        if (hasMedicalQuestion) {
            return NextResponse.json({
                role: "ai",
                content: "말씀하신 증상이나 내용은 **전문적인 의료 상담**이 필요할 수 있습니다.\n\n현행 의료법상 구체적인 증상, 질환, 치료에 대한 상담은 **로그인 후 의료진의 검토를 거친 AI 상담**을 통해서만 제공 가능합니다.\n\n로그인하시겠습니까?",
                requireLogin: true,
                isSymptomTrigger: true
            });
        }

        // 2. 5턴째 (마지막 턴) - 종합 분석 및 결과 제공
        if (turnCount === 4) {
            const finalAnalysisPrompt = getHealthcareFinalAnalysisPrompt(topic || "default");

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
                content: "상담이 이미 종료되었습니다. 더 자세한 분석을 위해 로그인을 부탁드립니다.",
                requireLogin: true,
                isHardStop: true
            });
        }

        // 3. 시스템 프롬프트 from prompts.ts
        const systemPrompt = getHealthcareSystemPrompt(topic || "default", turnCount);

        const fullPrompt = `
${systemPrompt}

[대화 내역]
${history.map((msg: any) => `${msg.role === 'user' ? '사용자' : 'AI'}: ${msg.content}`).join("\n")}
사용자: ${message}
AI:
`;

        const responseText = await generateText(fullPrompt, "healthcare");

        // 4. 3턴째 - Soft Gate (로그인 유도하지만 계속 가능)
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
