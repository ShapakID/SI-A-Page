import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { isEmailWhitelisted } from "./lib/auth-guard.ts";

const providers: NextAuthOptions["providers"] = [];

// Provider Google OAuth
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  );
} else {
  // Placeholder GoogleProvider agar NextAuth tetap mengenali provider google jika dipanggil
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "not_configured",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "not_configured",
    })
  );
}

// Dev Mode Login (aktif di development, jika ALLOW_DEV_LOGIN="true", atau jika Google OAuth belum disetel di environment)
if (
  process.env.NODE_ENV !== "production" ||
  process.env.ALLOW_DEV_LOGIN === "true" ||
  (!process.env.GOOGLE_CLIENT_ID && !process.env.GOOGLE_CLIENT_SECRET)
) {
  providers.push(
    CredentialsProvider({
      id: "dev-login",
      name: "Dev Mode Login",
      credentials: {
        email: { label: "Email Admin", type: "email" },
      },
      async authorize(credentials) {
        const rawEmail = credentials?.email;
        if (!rawEmail) return null;

        const email = rawEmail.trim().toLowerCase();
        const whitelist = process.env.ADMIN_EMAILS;

        if (!isEmailWhitelisted(email, whitelist)) {
          return null;
        }

        return {
          id: email,
          email: email,
          name: email.split("@")[0],
        };
      },
    })
  );
}

export const authOptions: NextAuthOptions = {
  providers,
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user }) {
      const email = user?.email;
      const whitelist = process.env.ADMIN_EMAILS;
      // Allow sign-in only if email is on the admin whitelist
      return isEmailWhitelisted(email, whitelist);
    },
    async jwt({ token, user }) {
      if (user?.email) {
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user && token?.email) {
        session.user.email = token.email as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/admin/login",
    error: "/admin/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
