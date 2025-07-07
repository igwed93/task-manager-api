import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
    const token = request.cookies.get('token')?.value;

    const isAuthPage = request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/register');

    if (!token && !isAuthPage) {
        // If no token and not on auth page, redirect to login
        return NextResponse.redirect(new URL('/login', request.url));
    }

    if (token && isAuthPage) {
        // If token exists and on auth page, redirect to dashboard
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/dashboard/:path*', '/login', '/register'],
    // Apply middleware to dashboard and auth pages
};