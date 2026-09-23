import { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/mine',
  },
  providers: [
    // added later in auth.ts since it requires bcrypt which is only compatible with Node.js
    // while this file is also used in non-Node.js environments
  ],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = Boolean(auth?.user);
      const isProtectedRoute =
        nextUrl.pathname.startsWith('/learn/') ||
        nextUrl.pathname.startsWith('/word/');

      if (isProtectedRoute && !isLoggedIn) {
        const destination = new URL('/mine', nextUrl);
        destination.searchParams.set('auth', 'login');
        destination.searchParams.set(
          'returnTo',
          `${nextUrl.pathname}${nextUrl.search}`,
        );
        return Response.redirect(destination);
      }

      return true;
    },
  },
} satisfies NextAuthConfig;
