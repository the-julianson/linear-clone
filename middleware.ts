// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Middleware logic
  if (request.nextUrl.pathname.startsWith('/api')) {
    const authHeader = request.headers.get('Authorization')
    const cookieHeader = request.cookies.get('auth_token')

    if (!authHeader && !cookieHeader) {
      return NextResponse.json(
        { success: false, messsage: 'Authorization header or auth_token cookie is required' },
        { status: 401 }
      )
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/api/:path*'],
}
