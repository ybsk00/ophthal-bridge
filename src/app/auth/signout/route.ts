import { createClient } from '@/lib/supabase/server';
import { NextResponse, NextRequest } from 'next/server';
import { headers } from 'next/headers';

export async function POST(request: NextRequest) {
    const supabase = await createClient();

    await supabase.auth.signOut();

    // Get the origin from the request headers for proper redirect
    const headersList = await headers();
    const host = headersList.get('host') || '';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const origin = `${protocol}://${host}`;

    return NextResponse.redirect(new URL('/', origin), {
        status: 302,
    });
}
