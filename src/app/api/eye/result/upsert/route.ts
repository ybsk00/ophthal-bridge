import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { HealthcareSummary } from '@/types/healthcare';

// Supabase 클라이언트 (서버용 - service role key 사용)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * POST /api/eye/result/upsert
 * 상담용 요약 데이터 저장/업데이트
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { session_id, summary } = body as { session_id: string; summary: HealthcareSummary };

        // 필수 필드 검증
        if (!session_id) {
            return NextResponse.json(
                { error: 'session_id는 필수입니다.' },
                { status: 400 }
            );
        }

        if (!summary) {
            return NextResponse.json(
                { error: 'summary는 필수입니다.' },
                { status: 400 }
            );
        }

        // 세션 존재 확인 및 summary 업데이트
        const { data, error } = await supabase
            .from('eye_sessions')
            .update({ summary })
            .eq('id', session_id)
            .select('id')
            .single();

        if (error) {
            console.error('요약 저장 오류:', error);

            // 세션이 없는 경우
            if (error.code === 'PGRST116') {
                return NextResponse.json(
                    { error: '세션을 찾을 수 없습니다.' },
                    { status: 404 }
                );
            }

            return NextResponse.json(
                { error: '요약 저장에 실패했습니다.' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            result_id: data.id,
        });
    } catch (error) {
        console.error('결과 저장 API 오류:', error);
        return NextResponse.json(
            { error: '서버 오류가 발생했습니다.' },
            { status: 500 }
        );
    }
}
