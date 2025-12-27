import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Service role client for signed URL generation
function getAdminClient() {
    return createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
}

// variant_key 라벨 매핑
const VARIANT_LABELS: Record<string, string> = {
    texture_tone: '결·톤 정돈',
    wrinkle_soften: '표정주름 완화',
    volume_expression: '볼륨감 변화',
    glow: '광채/물광',
    // 기존 키 호환
    laser: '결·톤 정돈',
    botox: '표정주름 완화',
    filler: '볼륨감 변화',
    booster: '광채/물광',
    natural: '내추럴',
    makeup: '메이크업',
    bright: '밝은 톤',
};

export async function GET() {
    try {
        const supabase = await createClient();

        // 1. 사용자 인증 확인
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // 2. 세션 목록 조회 (최근 3일, 최신순)
        const threeDaysAgo = new Date();
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

        const { data: sessions, error: sessionError } = await supabase
            .from('face_style_sessions')
            .select(`
                id,
                status,
                created_at,
                face_style_variants (
                    variant_key,
                    status
                )
            `)
            .eq('user_id', user.id)
            .gte('created_at', threeDaysAgo.toISOString())
            .in('status', ['ready', 'generating'])
            .order('created_at', { ascending: false })
            .limit(10);

        if (sessionError) {
            console.error('Sessions fetch error:', sessionError);
            return NextResponse.json(
                { error: 'Failed to fetch sessions' },
                { status: 500 }
            );
        }

        // 3. 썸네일 URL 생성 (선택적)
        const adminClient = getAdminClient();
        const sessionsWithUrls = await Promise.all(
            (sessions || []).map(async (session) => {
                const variant = session.face_style_variants?.[0];
                let thumbnailUrl: string | null = null;

                if (variant?.status === 'done') {
                    const imagePath = `${user.id}/${session.id}/${variant.variant_key}.jpg`;
                    const { data } = await adminClient.storage
                        .from('face-style')
                        .createSignedUrl(imagePath, 300);
                    thumbnailUrl = data?.signedUrl || null;
                }

                return {
                    id: session.id,
                    status: session.status,
                    createdAt: session.created_at,
                    variantKey: variant?.variant_key || null,
                    variantLabel: variant?.variant_key
                        ? VARIANT_LABELS[variant.variant_key] || variant.variant_key
                        : null,
                    thumbnailUrl,
                };
            })
        );

        return NextResponse.json({
            sessions: sessionsWithUrls,
            retentionDays: 3,
        });

    } catch (error) {
        console.error('List sessions error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
