import type { NextAuthConfig } from "next-auth";
import Keycloak from "next-auth/providers/keycloak";

interface KeycloakProfile {
  sub?: string;
  email_verified?: boolean;
  name?: string;
  preferred_username?: string;
  given_name?: string;
  family_name?: string;
  email?: string;
  realm_access?: { roles?: string[] };
  resource_access?: { [key: string]: { roles?: string[] } };
  roles?: string[];
  groups?: string[];
  acr?: string;
  azp?: string;
  auth_time?: number;
  session_state?: string;
  attributes?: Record<string, unknown>;
}

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
      // Initial sign in
      if (account && profile) {
        const keycloakProfile = profile as KeycloakProfile;
        token.accessToken = account.access_token;
        token.idToken = account.id_token;
        token.refreshToken = account.refresh_token;
        token.provider = account.provider;
        token.providerAccountId = account.providerAccountId;
        token.tokenType = account.token_type;
        token.expiresAt = account.expires_at;
        token.scope = account.scope;
        token.profile = {
          ...keycloakProfile,
          // Common Keycloak claims
          sub: keycloakProfile.sub,
          email_verified: keycloakProfile.email_verified,
          name: keycloakProfile.name,
          preferred_username: keycloakProfile.preferred_username,
          given_name: keycloakProfile.given_name,
          family_name: keycloakProfile.family_name,
          email: keycloakProfile.email,
          // Additional Keycloak specific claims
          realm_access: keycloakProfile.realm_access,
          resource_access: keycloakProfile.resource_access,
          roles: keycloakProfile.roles,
          groups: keycloakProfile.groups,
          acr: keycloakProfile.acr,
          azp: keycloakProfile.azp,
          auth_time: keycloakProfile.auth_time,
          session_state: keycloakProfile.session_state,
          // Any other custom attributes from Keycloak
          attributes: keycloakProfile.attributes,
        };
      }
      return token;
    },
    async session({ session, token }) {
      return {
        ...session,
        provider: token.provider,
        accessToken: token.accessToken,
        idToken: token.idToken,
        refreshToken: token.refreshToken,
        tokenType: token.tokenType,
        expiresAt: token.expiresAt,
        scope: token.scope,
        providerAccountId: token.providerAccountId,
        profile: token.profile,
      };
    },
  },
} satisfies NextAuthConfig