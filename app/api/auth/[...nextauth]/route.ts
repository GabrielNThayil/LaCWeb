import NextAuth from "next-auth";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getUserByEmail, getUserById } from "@/lib/storage";
import { checkRateLimit } from "@/lib/rate-limit";
import crypto from "crypto";

function verifyPassword(storedHash: string, password: string): boolean {
  const [salt, hash] = storedHash.split(":");
  if (!salt || !hash) return false;
  const verifyHash = crypto.pbkdf2Sync(password, salt, 100000, 64, "sha512").toString("hex");
  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(verifyHash));
}

const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials, req) {
        const ip =
          req?.headers?.get("x-forwarded-for")?.split(",")[0]?.trim() ??
          req?.headers?.get("x-real-ip") ??
          "unknown";

        // Rate limit: 10 login attempts per minute per IP
        const allowed = checkRateLimit(`nextauth:${ip}`, 10, 60_000);
        if (!allowed.allowed) {
          throw new Error("RL");
        }

        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = getUserByEmail(credentials.email.toLowerCase());
        if (!user) return null;

        if (user.passwordHash) {
          if (!verifyPassword(user.passwordHash, credentials.password)) {
            return null;
          }
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
        };
      }
    })
  ],
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  callbacks: {
    jwt({ token, user, account }) {
      if (account && user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
      }
      if (token.id) {
        const fresh = getUserById(token.id as string);
        if (fresh) {
          (token as any).role = fresh.role ?? "user";
        }
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id as string;
        (session.user as any).role = (token as any).role ?? "user";
      }
      return session;
    }
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST }