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
} satisfies NextAuthConfig