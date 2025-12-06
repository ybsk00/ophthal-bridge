import { NextRequest, NextResponse } from "next/server";
import { generateText } from "@/lib/ai/client";

export async function POST(req: NextRequest) {
    try {
        const { message, history, topic } = await req.json();

        // 1. Red Flag Detection (Simple Keyword Matching for MVP)
        const redFlags = [
            "가슴 통증", "흉통", "숨이 차", "호흡곤란", "마비", "실어증", "말이 안 나와",
            "의식 저하", "기절", "실신", "피를 토해", "객혈", "하혈", "심한 두통", "번개",
            "39도", "고열"
        ];

        const isRedFlag = redFlags.some(flag => message.includes(flag));

        if (isRedFlag) {
            return NextResponse.json({
                role: "ai",
                content: "지금 말씀해 주신 증상은 응급일 수 있어요. 이 챗봇으로 기다리지 마시고 즉시 119 또는 가까운 응급실로 연락·내원해 주세요."
            });
        }

        // 2. System Prompt Construction
        let topicInstruction = "";
        switch (topic) {
            case "women":
                topicInstruction = `
[주제: 여성 밸런스]
- 타겟: 생리통, 갱년기, 수면, 정서 변동이 있는 여성
- 핵심 질문: 주기, 열감, 수면, 기분 변화
- 표현 가이드: "생활 리듬 불균형 유형" 등으로 표현 (질환명 X)`;
                break;
            case "pain":
                topicInstruction = `
[주제: 통증 패턴]
- 타겟: 목, 어깨, 허리, 무릎 통증
- 핵심 질문: 통증 시기, 자세, 활동, 스트레스
- 표현 가이드: "근막 긴장 의심", "순환 저하 패턴" 등으로 표현 (디스크/관절염 진단 X)`;
                break;
            case "digestion":
                topicInstruction = `
[주제: 소화·수면]
- 타겟: 소화불량, 체함, 식욕 변동, 불면
- 핵심 질문: 식사 시간, 수면 패턴, 스트레스
- 표현 가이드: "소화 리듬 불균형", "기·혈 흐름 저하" 등으로 표현 (위염/식도염 진단 X)`;
                break;
            case "pregnancy":
                topicInstruction = `
[주제: 임신 준비]
- 타겟: 임신 준비, 난임 관심 부부
- 핵심 질문: 생활 습관, 리듬, 컨디션
- 표현 가이드: "생활 리듬 교정 안내" (불임 진단 X)`;
                break;
            default: // resilience
                topicInstruction = `
[주제: 회복력·면역]
- 타겟: 만성 피로, 쉬어도 피곤, 감기 잦음

        // 3. Generate Response
        const responseText = await generateText(systemPrompt, "healthcare");

        return NextResponse.json({
            role: "ai",
            content: responseText.trim()
        });

    } catch (error) {
        console.error("Chat API Error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
