import bcrypt from "bcryptjs";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validations";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Email and password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);

        if (!parsed.success) {
          return null;
        }

        let user = null;
        let role = "admin";
        let organizationId: string | undefined = undefined;

        // First check Veterinarian
        const veterinarian = await prisma.veterinarian.findUnique({
          where: { email: parsed.data.email },
          include: {
            organizationUsers: {
              where: { status: "active" },
              orderBy: { createdAt: "asc" },
              take: 1,
              select: { organizationId: true, role: true },
            },
          },
        });

        if (veterinarian) {
          const passwordMatches = await bcrypt.compare(
            parsed.data.password,
            veterinarian.password,
          );
          if (passwordMatches) {
            user = {
              id: veterinarian.id,
              name: veterinarian.name,
              email: veterinarian.email,
            };
            organizationId = veterinarian.organizationUsers[0]?.organizationId ?? veterinarian.organizationId ?? undefined;
            role = veterinarian.organizationUsers[0]?.role ?? "admin";
          }
        } else {
          // Check Client if not a veterinarian
          const client = await prisma.client.findUnique({
            where: { email: parsed.data.email },
          });

          if (client && client.password) {
            const passwordMatches = await bcrypt.compare(
              parsed.data.password,
              client.password,
            );
            if (passwordMatches) {
              user = {
                id: client.id,
                name: client.name,
                email: client.email,
              };
              organizationId = client.organizationId ?? undefined;
              role = "client";
            }
          }
        }

        if (!user) {
          return null;
        }

        return {
          ...user,
          organizationId,
          role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.organizationId = user.organizationId;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.organizationId = token.organizationId;
        session.user.role = token.role;
      }
      return session;
    },
  },
};
