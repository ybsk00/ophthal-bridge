import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';

// Supabase 클라이언트 (서버용 - service role key 사용)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * POST /api/eye/session/start
 * 헬스케어 세션 생성 (비로그인 사용자도 가능)
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json().catch(() => ({}));
        const { anon_id, entry_path, utm } = body;

        // anon_id가 없으면 새로 생성
        const sessionAnonId = anon_id || randomUUID();

        // 세션 생성
        const { data, error } = await supabase
            .from('eye_sessions')
            .insert({
                anon_id: sessionAnonId,
                entry_path: entry_path || null,
                utm: utm || {},
                status: 'ACTIVE',
            })
            .select('id, anon_id, created_at')
            .single();

        if (error) {
            console.error('세션 생성 오류:', error);
            return NextResponse.json(
                { error: '세션 생성에 실패했습니다.' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            session_id: data.id,
            anon_id: data.anon_id,
            created_at: data.created_at,
        });
    } catch (error) {
        console.error('세션 시작 API 오류:', error);
        return NextResponse.json(
            { error: '서버 오류가 발생했습니다.' },
            { status: 500 }
        );
    }
}
