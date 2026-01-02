import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Supabase 클라이언트 (서버용 - service role key 사용)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * POST /api/eye/session/convert
 * 로그인 후 세션 이관 (anon_id → user_id 연결)
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { session_id, user_id } = body;

        // 필수 필드 검증
        if (!session_id || !user_id) {
            return NextResponse.json(
                { error: 'session_id와 user_id는 필수입니다.' },
                { status: 400 }
            );
        }

        // 세션 상태 업데이트: user_id 연결 및 converted_at 기록
        const { data, error } = await supabase
            .from('eye_sessions')
            .update({
                user_id,
                status: 'CONVERTED',
                converted_at: new Date().toISOString(),
            })
            .eq('id', session_id)
            .select('id, user_id, status, converted_at, summary')
            .single();

        if (error) {
            console.error('세션 이관 오류:', error);

            if (error.code === 'PGRST116') {
                return NextResponse.json(
                    { error: '세션을 찾을 수 없습니다.' },
                    { status: 404 }
                );
            }

            return NextResponse.json(
                { error: '세션 이관에 실패했습니다.' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            session: {
                id: data.id,
                user_id: data.user_id,
                status: data.status,
                converted_at: data.converted_at,
                summary: data.summary,
            },
        });
    } catch (error) {
        console.error('세션 이관 API 오류:', error);
        return NextResponse.json(
            { error: '서버 오류가 발생했습니다.' },
            { status: 500 }
        );
    }
}

/**
 * GET /api/eye/session/convert?session_id=xxx
 * 세션 요약 데이터 조회
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const sessionId = searchParams.get('session_id');

        if (!sessionId) {
            return NextResponse.json(
                { error: 'session_id는 필수입니다.' },
                { status: 400 }
            );
        }

        const { data, error } = await supabase
            .from('eye_sessions')
            .select('id, user_id, status, summary, created_at, converted_at')
            .eq('id', sessionId)
            .single();

        if (error) {
            console.error('세션 조회 오류:', error);

            if (error.code === 'PGRST116') {
                return NextResponse.json(
                    { error: '세션을 찾을 수 없습니다.' },
                    { status: 404 }
                );
            }

            return NextResponse.json(
                { error: '세션 조회에 실패했습니다.' },
                { status: 500 }
            );
        }

        return NextResponse.json({ session: data });
    } catch (error) {
        console.error('세션 조회 API 오류:', error);
        return NextResponse.json(
            { error: '서버 오류가 발생했습니다.' },
            { status: 500 }
        );
    }
}
