import NextAuth from "next-auth/next";
import { authOptions } from "../../../../lib/option";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
