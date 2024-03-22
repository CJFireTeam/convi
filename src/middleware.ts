import type { NextRequest } from 'next/server'
const excludedPaths = ['/login', '/register'];

export function middleware(request: NextRequest) {
  const currentUser = request.cookies.get('bearer')?.value
  const currentPath = request.nextUrl.pathname;
  console.log(currentPath)
  const nextPath = request.nextUrl.pathname;

  if (currentUser && !request.nextUrl.pathname.startsWith('/')) {
    return Response.redirect(new URL('/', request.url))
  }
  //URLS VALIDAS SIN PROTECCION
  if (!currentUser && !excludedPaths.some(path => nextPath.startsWith(path))) {
    return Response.redirect(new URL('/login', request.url))
  }
}
 
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
}