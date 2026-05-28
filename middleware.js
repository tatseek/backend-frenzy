import { NextResponse } from 'next/server'

// Dev-friendly CORS for Flutter Web (localhost:* -> localhost:3000).
// This does not affect same-origin webapp calls, but allows cross-origin API calls during development.
export function middleware(request) {
  const { pathname } = request.nextUrl
  if (!pathname.startsWith('/api/')) return NextResponse.next()

  const origin = request.headers.get('origin') ?? '*'
  const res = NextResponse.next()

  res.headers.set('Access-Control-Allow-Origin', origin)
  res.headers.set('Vary', 'Origin')
  res.headers.set('Access-Control-Allow-Credentials', 'true')
  res.headers.set(
    'Access-Control-Allow-Methods',
    'GET,POST,PATCH,PUT,DELETE,OPTIONS',
  )
  res.headers.set(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, X-Requested-With',
  )

  // Preflight
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { status: 204, headers: res.headers })
  }

  return res
}

export const config = {
  matcher: ['/api/:path*'],
}

