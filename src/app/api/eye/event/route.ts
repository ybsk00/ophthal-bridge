import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Supabase 클라이언트 (서버용 - service role key 사용)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * POST /api/eye/event
 * 헬스케어 이벤트 기록 (KPI 분석용)
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { session_id, event_name, props } = body;

        // 필수 필드 검증
        if (!event_name) {
            return NextResponse.json(
                { error: 'event_name은 필수입니다.' },
                { status: 400 }
            );
        }

        // 이벤트 기록
        const { error } = await supabase
            .from('eye_events')
            .insert({
                session_id: session_id || null,
                event_name,
                props: props || {},
            });

        if (error) {
            console.error('이벤트 기록 오류:', error);
            return NextResponse.json(
                { error: '이벤트 기록에 실패했습니다.' },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('이벤트 API 오류:', error);
        return NextResponse.json(
            { error: '서버 오류가 발생했습니다.' },
            { status: 500 }
        );
    }
}
