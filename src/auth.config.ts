import type { NextAuthConfig } from "next-auth";
import Keycloak from "next-auth/providers/keycloak";

export default {
  providers: [
    Keycloak({
      clientId: process.env.NEXT_PUBLIC_AUTH_KEYCLOAK_ID,
      clientSecret: process.env.AUTH_KEYCLOAK_SECRET,
      issuer: process.env.NEXT_PUBLIC_AUTH_KEYCLOAK_ISSUER,
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      // Persist the OAuth access_token and id_token to the token right after signin
      if (account) {
        token.accessToken = account.access_token;
        token.idToken = account.id_token;
        token.provider = account.provider;
        token.providerAccountId = account.providerAccountId;
      }
      if (profile) {
        token.profile = profile;
      }
      return token;
    },
    async session({ session, token }) {
      // Send properties to the client
      return {
        ...session,
        provider: token.provider,
        accessToken: token.accessToken,
        idToken: token.idToken,
        providerAccountId: token.providerAccountId,
        profile: token.profile,
      };
    },
  },
} satisfies NextAuthConfig