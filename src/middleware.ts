import { type NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
    // localStorage-based auth is client-side only
    // Route protection is handled by components
    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
