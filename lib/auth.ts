/* eslint-disable @typescript-eslint/no-unused-vars */
import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "./prisma";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

// Debug: log provider env variables in production
if (process.env.NODE_ENV === "production") {
  console.log("GITHUB_ID", process.env.GITHUB_ID);
  console.log("GITHUB_SECRET", process.env.GITHUB_SECRET);
  console.log("GOOGLE_ID", process.env.GOOGLE_ID);
  console.log("GOOGLE_SECRET", process.env.GOOGLE_SECRET);
  console.log("NEXTAUTH_URL", process.env.NEXTAUTH_URL);
}

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
    signIn: "/login",
    error: "/login/error",
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
      // Création automatique du panier lors de la première connexion sociale
      if (account?.provider === "google" || account?.provider === "github") {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email ?? undefined },
          include: { accounts: true, cart: true },
        });

        if (existingUser) {
          // Vérifier si l'utilisateur a un panier
          if (!existingUser.cart) {
            // Créer un panier vide pour l'utilisateur
            await prisma.cart.create({
              data: {
                userId: existingUser.id,
              },
            });
          }

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
                session_state:
                  typeof account.session_state === "string"
                    ? account.session_state
                    : null,
              },
            });
          }
        } else if (user.id) {
          // Si l'utilisateur vient d'être créé via un provider social
          // Vérifier si un panier existe déjà
          const existingCart = await prisma.cart.findUnique({
            where: { userId: user.id },
          });

          if (!existingCart) {
            // Créer un panier
            await prisma.cart.create({
              data: {
                userId: user.id,
              },
            });
          }
        }
      }
      return true;
    },
    async redirect({ url, baseUrl }) {
      // Toujours rediriger vers le domaine principal (production)
      return baseUrl;
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
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || !user.password) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          isAdmin: user.isAdmin,
        };
      },
    }),
  ],
});
