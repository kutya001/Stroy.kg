import { updateSession } from '@/lib/supabase/middleware'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Все маршруты кроме:
     * - _next/static, _next/image (ассеты Next.js)
     * - favicon.ico, sitemap.xml, robots.txt
     * - Публичные файлы (svg, png, jpg и т.д.)
     */
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
