
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/prismaClient";
import bcrypt from "bcryptjs";
import { configDotenv } from "dotenv";
import { AuthOptions } from "next-auth";
import { User } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter"


configDotenv();

export const authOptions: AuthOptions = { 
    adapter: PrismaAdapter(prisma),
    providers: [
      CredentialsProvider({
        name: "Credentials",
        credentials: {
          email: { label: "Email", type: "text", placeholder: "your@email.com" },
          password: { label: "Password", type: "password" },
        },
        async authorize(credentials): Promise<User> {
          if (!credentials?.email || !credentials?.password) {
            throw new Error("Email and password are required");
          }
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });
          if (
            !user ||
            !(await bcrypt.compare(credentials.password, user.password))
          ) {
            throw new Error("Invalid credentials");
          }
          return {
            id: user.id,
            username: user.username ?? "",
            email: user.email,
          } as User;
        },
      }),
    ],
    secret: process.env.NEXTAUTH_SECRET, 
    callbacks: {
      async jwt({ token, user }) {
        if (user) {
          token.id = user.id;
          token.email = user.email ?? "";
          token.username = user.username ?? "";
        }
        return token;
      },
      async session({ session, token }) {
        if (!token) {
          throw new Error("No token found");
        }
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.name = token.username;
        return session;
      },
    },
    pages: {
      signIn: "/login",
    },
    session: { strategy: "jwt"},
  };
  