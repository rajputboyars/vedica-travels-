import { withAuth } from 'next-auth/middleware'

export const proxy = withAuth({
  pages: {
    signIn: '/admin/login',
  },
  // Pass the secret explicitly — the Edge middleware doesn't always pick up
  // NEXTAUTH_SECRET from the environment on its own, which makes getToken
  // return null and wrongly bounce authenticated users back to /admin/login.
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    authorized: ({ token }) => !!token,
  },
})

export const config = {
  // Protect /admin and everything under it EXCEPT the login page itself.
  matcher: ['/admin', '/admin/((?!login).*)'],
}
