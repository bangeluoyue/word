import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { compare } from 'bcrypt-ts';
import { getUser } from 'app/db';
import { authConfig } from 'app/auth.config';

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  ...authConfig,
  callbacks: {
    ...authConfig.callbacks,
    session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
  providers: [
    Credentials({
      async authorize({ email, password }: any) {
        if (typeof email !== 'string' || typeof password !== 'string') {
          return null;
        }

        const user = await getUser(email);
        if (user.length === 0) return null;
        const passwordsMatch = await compare(password, user[0].password);
        if (!passwordsMatch) return null;

        return {
          id: String(user[0].id),
          email: user[0].email,
        };
      },
    }),
  ],
});
