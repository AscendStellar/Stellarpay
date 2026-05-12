/**
 * middleware.ts
 * Route protection — redirect unauthenticated users away from /dashboard.
 */

import { NextRequest, NextResponse } from 'next/server'
import { verifySession } from '@/lib/auth/session'
import { SESSION_COOKIE } from '@/lib/auth/session'

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Protect all /dashboard routes
  if (pathname.startsWith('/dashboard')) {
    const token = req.cookies.get(SESSION_COOKIE)?.value
    if (!token) {
      return NextResponse.redirect(new URL('/auth/login', req.url))
    }
    const session = await verifySession(token)
    if (!session) {
      return NextResponse.redirect(new URL('/auth/login', req.url))
    }
  }

  // Redirect logged-in users away from auth pages
  if (pathname.startsWith('/auth/')) {
    const token = req.cookies.get(SESSION_COOKIE)?.value
    if (token) {
      const session = await verifySession(token)
      if (session) {
        return NextResponse.redirect(new URL('/dashboard', req.url))
      }
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/auth/:path*'],
}
