/* eslint-disable @typescript-eslint/no-unused-vars */
import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "./prisma";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

// Debug: log provider env variables (only in development)
if (process.env.NODE_ENV === "development") {
  console.log("Environment check:", {
    GITHUB_ID: process.env.GITHUB_ID ? "✓" : "✗",
    GITHUB_SECRET: process.env.GITHUB_SECRET ? "✓" : "✗", 
    GOOGLE_ID: process.env.GOOGLE_ID ? "✓" : "✗",
    GOOGLE_SECRET: process.env.GOOGLE_SECRET ? "✓" : "✗",
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    AUTH_SECRET: process.env.AUTH_SECRET ? "✓" : "✗",
    NODE_ENV: process.env.NODE_ENV,
  });
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
  debug: process.env.NODE_ENV === "development",callbacks: {
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        
        // Ajouter isAdmin
        const user = await prisma.user.findUnique({
          where: { id: token.sub },
          select: { isAdmin: true },
        });
        session.user.isAdmin = user?.isAdmin ?? false;
      }
      return session;
    },
    
    async jwt({ token, user }) {
      if (user) {
        token.isAdmin = user.isAdmin;
      }
      return token;
    },
    
    async signIn({ user, account, profile }) {
      // Pour les providers OAuth, on laisse PrismaAdapter gérer la création
      if (account?.provider === "google" || account?.provider === "github") {
        return true; // Laisser PrismaAdapter faire son travail
      }
      
      // Pour credentials, vérifier que l'utilisateur existe
      if (account?.provider === "credentials") {
        return !!user;
      }
      
      return true;
    },
    
    async redirect({ url, baseUrl }) {
      return baseUrl;
    },
  },  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
      authorization: {
        params: {
          scope: "read:user user:email",
        },
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_ID!,
      clientSecret: process.env.GOOGLE_SECRET!,
      authorization: {
        params: {
          scope: "openid email profile",
        },
      },
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
