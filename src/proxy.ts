import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

/** Admin UI only — APIs enforce auth in route handlers; browsing is otherwise anonymous. */
const isAdminUiRoute = createRouteMatcher(['/admin(.*)'])

export default clerkMiddleware(async (auth, req) => {
  if (isAdminUiRoute(req)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
