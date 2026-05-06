import { NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

const PUBLIC_PATHS = ['/login', '/signup', '/api/auth/callback']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const { supabaseResponse, user } = await updateSession(request)

  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p))

  // Authenticated user hitting auth pages → redirect to dashboard
  if (user && isPublic) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Unauthenticated user hitting a protected route → redirect to login
  if (!user && !isPublic && !pathname.startsWith('/api')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
