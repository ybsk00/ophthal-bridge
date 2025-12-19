import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { name } = await req.json();

        if (!name || typeof name !== 'string' || name.trim().length === 0) {
            return NextResponse.json({ error: "이름을 입력해주세요." }, { status: 400 });
        }

        const supabase = await createClient();
        const userId = session.user.id;

        // Update patients table
        const { data, error } = await supabase
            .from('patients')
            .update({ name: name.trim() })
            .eq('naver_user_id', userId)
            .select()
            .single();

        if (error) {
            // If no patient exists, create one
            if (error.code === 'PGRST116') {
                const { data: newPatient, error: insertError } = await supabase
                    .from('patients')
                    .insert({
                        naver_user_id: userId,
                        name: name.trim(),
                        email: session.user.email
                    })
                    .select()
                    .single();

                if (insertError) {
                    console.error('Insert error:', insertError);
                    return NextResponse.json({ error: "저장 중 오류가 발생했습니다." }, { status: 500 });
                }

                return NextResponse.json({ success: true, patient: newPatient });
            }

            console.error('Update error:', error);
            return NextResponse.json({ error: "저장 중 오류가 발생했습니다." }, { status: 500 });
        }

        return NextResponse.json({ success: true, patient: data });

    } catch (error) {
        console.error("Profile update error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
