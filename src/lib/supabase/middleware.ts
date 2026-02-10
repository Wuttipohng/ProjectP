import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    );
                    supabaseResponse = NextResponse.next({
                        request,
                    });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    const {
        data: { user },
    } = await supabase.auth.getUser();

    const pathname = request.nextUrl.pathname;

    // Protected routes
    const protectedRoutes = ['/tool', '/profile', '/admin'];
    const authRoutes = ['/login', '/register'];

    // ถ้าไม่ได้ login และพยายามเข้า protected route
    if (!user && protectedRoutes.some(route => pathname.startsWith(route))) {
        const url = request.nextUrl.clone();
        url.pathname = '/login';
        return NextResponse.redirect(url);
    }

    // ถ้า login แล้วและพยายามเข้า auth route
    if (user && authRoutes.some(route => pathname.startsWith(route))) {
        const url = request.nextUrl.clone();
        url.pathname = '/tool';
        return NextResponse.redirect(url);
    }

    // Admin route check
    if (user && pathname.startsWith('/admin')) {
        const { data: admin } = await supabase
            .from('admins')
            .select('id')
            .eq('user_id', user.id)
            .single();

        if (!admin) {
            const url = request.nextUrl.clone();
            url.pathname = '/tool';
            return NextResponse.redirect(url);
        }
    }

    return supabaseResponse;
}
