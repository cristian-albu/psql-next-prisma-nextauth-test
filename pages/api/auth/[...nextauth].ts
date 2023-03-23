import NextAuth from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "@/lib/prisma";
import EmailProvider from "next-auth/providers/email";
import { createTransport } from "nodemailer";
import type { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: parseInt(process.env.EMAIL_SERVER_PORT as string),
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM,
      sendVerificationRequest: async ({
        identifier: email,
        url,
        provider: { server, from },
      }) => {
        const { host } = new URL(url);
        // Place your whitelisted emails below
        if (!process.env.ALLOWED_EMAIL_DOMAINS?.split(",").includes(email))
          return;
        const transport = createTransport(server);
        const result = await transport.sendMail({
          to: email,
          from: from,
          subject: `My Project - Sign in to ${host}`,
          text: `Sign in to ${host}\n\n${url}\n\n`,
        });
        const failed = result.rejected.concat(result.pending).filter(Boolean);
        if (failed.length) {
          throw new Error(`Email(s) (${failed.join(", ")}) could not be sent`);
        }
      },
    }),
  ],
};

export default NextAuth(authOptions);
