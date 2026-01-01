import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // /healthcare/* → /eye-care 리다이렉트 (피부과 → 안과 전환)
    if (pathname.startsWith('/healthcare')) {
        const url = request.nextUrl.clone();
        // 모든 /healthcare/* 트래픽을 /eye-care 랜딩으로 리다이렉트
        url.pathname = '/eye-care';
        // 쿼리 파라미터는 topic=condition으로 기본 설정
        if (!url.searchParams.has('topic')) {
            url.searchParams.set('topic', 'condition');
        }
        return NextResponse.redirect(url, { status: 301 });
    }

    return await updateSession(request);
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * Feel free to modify this pattern to include more paths.
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
