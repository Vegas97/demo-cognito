import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    provider?: string;
    accessToken?: string;
    idToken?: string;
    providerAccountId?: string;
    profile?: {
      sub?: string;
      email_verified?: boolean;
      name?: string;
      preferred_username?: string;
      given_name?: string;
      family_name?: string;
      email?: string;
      [key: string]: unknown;
    };
    user: {
      id?: string;
    } & DefaultSession["user"];
  }
}
