import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { isEmailWhitelisted } from "./lib/auth-guard.ts";

export const DEFAULT_ADMIN_EMAILS = "shapakid@gmail.com,zalfafya@gmail.com,awaasalwa07@gmail.com";
export const FALLBACK_NEXTAUTH_SECRET = "1e4d3737f53f4a5138db1eb774a6859693a6a05f6a1b6232d8c54b5cf50a6e33";

const authorizeAdmin = async (credentials: Record<string, string> | undefined) => {
  const rawEmail = credentials?.email;
  if (!rawEmail) return null;

  const email = rawEmail.trim().toLowerCase();
  const whitelist = process.env.ADMIN_EMAILS || DEFAULT_ADMIN_EMAILS;

  if (!isEmailWhitelisted(email, whitelist)) {
    return null;
  }

  return {
    id: email,
    email: email,
    name: email.split("@")[0],
  };
};

const providers: NextAuthOptions["providers"] = [
  CredentialsProvider({
    id: "admin-email",
    name: "Email Admin",
    credentials: {
      email: { label: "Email Admin", type: "email" },
    },
    authorize: authorizeAdmin,
  }),
  CredentialsProvider({
    id: "dev-login",
    name: "Dev Mode Login",
    credentials: {
      email: { label: "Email Admin", type: "email" },
    },
    authorize: authorizeAdmin,
  }),
];

// Provider Google OAuth
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  );
} else {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "not_configured",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "not_configured",
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
      const whitelist = process.env.ADMIN_EMAILS || DEFAULT_ADMIN_EMAILS;
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
  secret: process.env.NEXTAUTH_SECRET || FALLBACK_NEXTAUTH_SECRET,
};
