import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
    const cookieStore = cookies();
    (await cookieStore).set('token', '', {
        httpOnly: true,
        expires: new Date(0), // Set the cookie to expire immediately
        path: '/',
    });

    return NextResponse.redirect(new URL('/login', process.env.NEXT_PUBLIC_BASE_URL));
}