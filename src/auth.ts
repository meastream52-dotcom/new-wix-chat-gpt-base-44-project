import NextAuth, { type DefaultSession } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

// ── Type augmentation ────────────────────────────────────────────────────────
// Extend the built-in Session type so `session.user.id` is typed everywhere.
// We use `token.sub` (the standard JWT "subject" claim) to carry the user id —
// Auth.js already populates token.sub = user.id on first sign-in.

declare module "next-auth" {
  interface Session {
    user: { id: string } & DefaultSession["user"];
  }
}

// ── Auth.js configuration ────────────────────────────────────────────────────

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),

  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    Credentials({
      credentials: {
        email:    { label: "Email",    type: "email"    },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        // No user found, or user signed up via OAuth (no password set).
        if (!user?.password) return null;

        const passwordMatch = await bcrypt.compare(
          credentials.password as string,
          user.password,
        );

        return passwordMatch ? user : null;
      },
    }),
  ],

  // JWT strategy is required when using the Credentials provider.
  // Database strategy doesn't work with credentials because Auth.js
  // can't store an unverified credential session safely.
  session: { strategy: "jwt" },

  pages: {
    signIn:  "/login",
    error:   "/login",   // Auth errors redirect here with ?error=...
  },

  callbacks: {
    // token.sub is the standard JWT "subject" — Auth.js automatically sets
    // it to user.id on first sign-in. No manual copy needed.
    jwt({ token }) {
      return token;
    },
    // Lift token.sub → session.user.id so Server Components get a typed id.
    session({ session, token }) {
      if (session.user && token.sub) session.user.id = token.sub;
      return session;
    },
  },
});
