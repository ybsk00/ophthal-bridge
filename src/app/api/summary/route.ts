import { NextRequest, NextResponse } from "next/server";
import { generateSummary } from "@/lib/ai/summary";
import { createClient } from "@/lib/supabase/server";
import { logAction } from "@/lib/audit";

export async function POST(req: NextRequest) {
    try {
        const { history, topic } = await req.json();

        if (!history || !Array.isArray(history) || history.length === 0) {
            return NextResponse.json({ error: "Invalid history" }, { status: 400 });
        }

        const summary = await generateSummary(history, topic);

        // Audit Log
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
            await logAction(user.id, "create", "medical_summary", undefined, {
                topic,
                message_count: history.length
            });
        }

        return NextResponse.json(summary);

    } catch (error) {
        console.error("Summary API Error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
