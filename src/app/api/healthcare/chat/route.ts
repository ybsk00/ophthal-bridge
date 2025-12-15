import { NextRequest, NextResponse } from "next/server";
import { generateText } from "@/lib/ai/client";
import { HEALTHCARE_PROMPTS } from "@/lib/ai/prompts";

export async function POST(req: NextRequest) {
    try {
        const { message, history, serviceType } = await req.json();

        if (!serviceType || !HEALTHCARE_PROMPTS[serviceType as keyof typeof HEALTHCARE_PROMPTS]) {
            return NextResponse.json(
                { error: "Invalid service type" },
                { status: 400 }
            );
        }

        // Medical question detection - redirect to login
        const medicalKeywords = [
            "치료", "약", "처방", "투약", "복용", "한약", "양약", "진단", "질환", "질병",
            "병원", "수술", "시술", "검사", "MRI", "CT", "X-ray", "혈액검사",
            "먹어도 될까", "먹어도 되나", "복용해도", "먹으면 안되", "부작용",
            "어떤 약", "무슨 약", "약 이름", "약물", "성분", "효능", "효과"
        ];

        const hasMedicalQuestion = medicalKeywords.some(keyword =>
            message.toLowerCase().includes(keyword.toLowerCase())
        );

        if (hasMedicalQuestion) {
            return NextResponse.json({
                role: "ai",
                content: `좋은 질문이에요! 🌿

지금 물어보신 내용은 개인의 건강 상태에 따라 답변이 달라질 수 있는 부분이에요.

**더 정확하고 안전한 정보**를 드리려면 몇 가지 추가 정보가 필요해요.

👉 **로그인/회원가입** 후 [AI 한의사 상담]에서 자세한 상담을 받아보시면, 개인 맞춤형 안내를 받으실 수 있습니다.

로그인하시면 다음과 같은 서비스를 이용하실 수 있어요:
● 1:1 맞춤 상담
● 증상 기록 및 추적
● 한의원 예약 연결

지금의 헬스체크를 마저 진행하시겠어요? (네/아니요)`
            });
        }

        const systemPrompt = HEALTHCARE_PROMPTS[serviceType as keyof typeof HEALTHCARE_PROMPTS];

        // Combine system prompt with conversation history
        const fullPrompt = `
${systemPrompt}

[대화 내역]
${history.map((msg: any) => `${msg.role === 'user' ? '사용자' : 'AI'}: ${msg.content}`).join("\n")}
사용자: ${message}
AI:
`;

        // Use "healthcare" mode for faster response (gemini-2.5-flash)
        const responseText = await generateText(fullPrompt, "healthcare");

        return NextResponse.json({
            role: "ai",
            content: responseText.trim()
        });

    } catch (error) {
        console.error("Healthcare Chat API Error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
