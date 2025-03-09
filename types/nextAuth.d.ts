import "next-auth";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    username: string;
    email: string;
    access_token: string;
  }

  interface Session extends DefaultSession {
    user: User & DefaultSession["user"];
    expires_in: string;
    error: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    username: string;
    id: string;
    email: string;
  }
}
