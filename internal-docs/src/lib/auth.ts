import type { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";

const allowedHd = process.env.ALLOWED_HD?.toLowerCase().trim();

export const authOptions: AuthOptions = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      authorization: {
        params: allowedHd ? { hd: allowedHd, prompt: "select_account" } : { prompt: "select_account" },
      },
    }),
  ],
  callbacks: {
    async signIn({ profile, account }) {
      if (account?.provider !== "google") return false;
      const email = profile?.email?.toLowerCase();
      if (!email) return false;
      // Google `hd` 클레임과 이메일 도메인 양쪽 모두 검증 (이중 방어)
      const profileHd = (profile as { hd?: string } | null)?.hd?.toLowerCase();
      const emailDomain = email.split("@")[1];
      if (allowedHd && (profileHd !== allowedHd || emailDomain !== allowedHd)) {
        return false;
      }
      // 사용자 upsert
      await prisma.user.upsert({
        where: { email },
        update: { name: profile?.name ?? undefined, image: (profile as { picture?: string } | null)?.picture },
        create: {
          email,
          name: profile?.name ?? null,
          image: (profile as { picture?: string } | null)?.picture ?? null,
        },
      });
      return true;
    },
    async jwt({ token, user, profile }) {
      const email = (user?.email ?? token.email ?? (profile as { email?: string } | null)?.email)?.toLowerCase();
      if (email && !token.userId) {
        const u = await prisma.user.findUnique({ where: { email }, select: { id: true } });
        if (u) token.userId = u.id;
        token.email = email;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string }).id = (token.userId as string | undefined) ?? "";
        session.user.email = (token.email as string) ?? session.user.email;
      }
      return session;
    },
  },
};
