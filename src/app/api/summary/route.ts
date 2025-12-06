import { NextRequest, NextResponse } from "next/server";
import { generateSummary } from "@/lib/ai/summary";

export async function POST(req: NextRequest) {
    try {
        const { history, topic } = await req.json();

        if (!history || !Array.isArray(history) || history.length === 0) {
            return NextResponse.json({ error: "Invalid history" }, { status: 400 });
        }

        const summary = await generateSummary(history, topic);

        return NextResponse.json(summary);

    } catch (error) {
        console.error("Summary API Error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
