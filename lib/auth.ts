import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  callbacks: {
    async session({ session, token }) {
      // Ajouter l'ID utilisateur à la session
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }

      // Ajouter isAdmin comme avant
      if (session.user) {
        const user = await prisma.user.findUnique({
          where: { id: token.sub },
          select: { isAdmin: true },
        });
        session.user.isAdmin = user?.isAdmin ?? false;
      }

      return session;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.isAdmin = user.isAdmin;
      }
      return token;
    },
    async signIn({ user, account, profile, email, credentials }) {
      if (account?.provider === "google" || account?.provider === "github") {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email },
          include: { accounts: true },
        });

        if (existingUser) {
          // Si l'utilisateur existe déjà mais n'a pas de compte lié avec ce provider
          const existingAccount = existingUser.accounts.find(
            (acc) => acc.provider === account.provider
          );

          if (!existingAccount) {
            // Lier le nouveau compte au compte existant
            await prisma.account.create({
              data: {
                userId: existingUser.id,
                type: account.type,
                provider: account.provider,
                providerAccountId: account.providerAccountId,
                refresh_token: account.refresh_token,
                access_token: account.access_token,
                expires_at: account.expires_at,
                token_type: account.token_type,
                scope: account.scope,
                id_token: account.id_token,
                session_state: account.session_state,
              },
            });
          }
        }
      }
      return true;
    },
  },
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID || "",
      clientSecret: process.env.GITHUB_SECRET || "",
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_ID || "",
      clientSecret: process.env.GOOGLE_SECRET || "",
    }),
  ],
});
