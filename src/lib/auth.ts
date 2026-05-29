import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/auth/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const user = await prisma.osUser.findUnique({
          where: { email: credentials.email },
          include: { business: true },
        });
        if (!user) return null;
        const valid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!valid) return null;
        return {
          id: user.id,
          email: user.email,
          name: user.name ?? user.email,
          role: user.role,
          businessId: user.businessId ?? "",
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const u = user as unknown as { role: string; businessId: string };
        token.role = u.role;
        token.businessId = u.businessId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { role: string }).role = token.role as string;
        (session.user as { businessId: string }).businessId = token.businessId as string;
        (session.user as { id: string }).id = token.sub ?? "";
      }
      return session;
    },
  },
};
