import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || "");

export async function POST(req: NextRequest) {
    try {
        const { image, mimeType } = await req.json();

        if (!image) {
            return NextResponse.json({ error: "No image provided" }, { status: 400 });
        }

        // Use Gemini 1.5 Flash for multimodal analysis
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
[역할]
당신은 "복약 안내 도우미 AI"입니다.
사용자가 업로드한 약봉지, 처방전, 약 포장지 이미지를 분석하여 복용 방법을 안내해주세요.

[분석 가이드]
1. **약품 정보 추출**: 이미지에서 약품명, 용량, 복용 횟수 등을 추출하세요.
2. **복용 방법 안내**: 일반적인 복용 방법(식전/식후, 횟수, 주의사항)을 안내하세요.
3. **주의사항**: 약물 상호작용, 부작용 주의사항 등을 간략히 안내하세요.

[중요 안전 수칙]
- 이 분석은 "참고용"입니다. 정확한 복용법은 처방 의사/약사에게 확인하세요.
- "진단", "처방 변경", "약 추가/중단" 등의 의료 행위를 지시하지 마세요.
- 응급 증상 발생 시 즉시 의료기관 방문을 권유하세요.

[답변 형식]
**약품 정보**
(이미지에서 확인된 약품명과 기본 정보)

**복용 방법**
- 복용 시간: (예: 식후 30분)
- 복용 횟수: (예: 1일 3회)
- 복용량: (예: 1회 1정)

**주의사항**
- (해당 약품의 일반적인 주의사항 2~3개)

**💡 참고**
이 분석은 참고용이며, 정확한 복용법은 처방 의사 또는 약사에게 확인하세요.

---
이미지를 분석해주세요.
`;

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: image,
                    mimeType: mimeType || "image/jpeg",
                },
            },
        ]);

        const response = await result.response;
        const text = response.text();

        return NextResponse.json({
            role: "ai",
            content: text.trim()
        });

    } catch (error) {
        console.error("Medication Analysis API Error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
