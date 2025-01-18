import { NextAuthConfig } from "next-auth";
import KeycloakProvider from "next-auth/providers/keycloak";
import { JWT } from "next-auth/jwt";

// Add type declarations for Keycloak profile and token
interface KeycloakProfile {
  realm_access?: {
    roles?: string[];
  };
  groups?: string[];
}

// Extend the built-in session type
declare module "next-auth" {
  interface Session {
    accessToken?: string;
    refreshToken?: string;
    idToken?: string;
    expiresAt?: number;
    refreshTokenExpires?: number;
    sessionExpires?: number;
    roles?: string[];
    groups?: string[];
  }
}

export const authConfig: NextAuthConfig = {
  providers: [
    KeycloakProvider({
      clientId: process.env.NEXT_PUBLIC_AUTH_KEYCLOAK_ID!,
      clientSecret: process.env.AUTH_KEYCLOAK_SECRET!,
      issuer: process.env.NEXT_PUBLIC_AUTH_KEYCLOAK_ISSUER,
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account && profile) {
        // Store tokens
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.idToken = account.id_token;
        token.expiresAt = account.expires_at;
        token.refreshTokenExpires = Math.floor(Date.now() / 1000) + (account.refresh_expires_in as number);
        token.sessionExpires = Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60);

        // Store authorization data
        const keycloakProfile = profile as KeycloakProfile;
        token.roles = keycloakProfile.realm_access?.roles || [];
        token.groups = keycloakProfile.groups || [];
      }
      return token as JWT;
    },

    async session({ session, token }) {
      return {
        ...session,
        accessToken: token.accessToken,
        refreshToken: token.refreshToken,
        idToken: token.idToken,
        expiresAt: token.expiresAt,
        refreshTokenExpires: token.refreshTokenExpires,
        sessionExpires: token.sessionExpires,
        roles: token.roles,
        groups: token.groups,
      };
    },
  },
};