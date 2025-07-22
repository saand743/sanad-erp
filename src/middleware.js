import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('token')?.value;

  // Define public paths that don't require authentication
  const publicPaths = ['/login'];

  // If the user is trying to access a public path, let them through
  if (publicPaths.some(path => pathname.endsWith(path))) {
    return NextResponse.next();
  }

  // If there is no token, redirect to login page
  if (!token) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Verify the token
  try {
    await jwtVerify(token, JWT_SECRET);
    // Token is valid, allow the request to proceed
    return NextResponse.next();
  } catch (error) {
    console.error('JWT Verification Error:', error.message);
    // Token is invalid, redirect to login page
    const loginUrl = new URL('/login', request.url);
    // Clear the invalid cookie
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete('token');
    return response;
  }
}

// See "Matching Paths" below to learn more
export const config = {
  // Match all request paths except for the ones starting with:
  // - api (API routes)
  // - _next/static (static files)
  // - _next/image (image optimization files)
  // - favicon.ico (favicon file)
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};