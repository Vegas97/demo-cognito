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
  sid?: string;
  attributes?: Record<string, unknown>;
}

export default {
  pages: {
    signIn: "/auth/login",
    signOut: "/",
  },
  providers: [
    Keycloak({
      clientId: process.env.NEXT_PUBLIC_AUTH_KEYCLOAK_ID,
      clientSecret: process.env.AUTH_KEYCLOAK_SECRET,
      issuer: process.env.NEXT_PUBLIC_AUTH_KEYCLOAK_ISSUER,
      authorization: {
        params: {
          scope: "openid profile email roles",
          client_id: process.env.NEXT_PUBLIC_AUTH_KEYCLOAK_ID,
        },
      },
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
        token.profile = keycloakProfile;
        token.userId = keycloakProfile.sub;
        token.sessionState = keycloakProfile.sid;
        
        // Extract roles and groups
        if (keycloakProfile.realm_access?.roles) {
          token.realmRoles = keycloakProfile.realm_access.roles;
        }
        if (keycloakProfile.groups) {
          token.groups = keycloakProfile.groups;
          // Set the first group as the main role (removing the leading slash)
          if (keycloakProfile.groups.length > 0) {
            token.role = keycloakProfile.groups[0].replace('/', '');
          }
        }
      }
      return token;
    },
    async session({ session, token }) {
      return {
        ...session,
        user: {
          id: token.userId,
          name: token.profile?.name || '',
          email: token.profile?.email || '',
          profileAccess: token.groups?.[0]?.replace('/', '') || '',
          roles: token.realmRoles?.filter(role => role.startsWith('ROLE_')) || [],
          username: token.profile?.preferred_username || '',
          emailVerified: token.profile?.email_verified || false,
          image: session.user?.image,
        },
        provider: token.provider,
        accessToken: token.accessToken,
        idToken: token.idToken,
        refreshToken: token.refreshToken,
        tokenType: token.tokenType,
        expiresAt: token.expiresAt,
        scope: token.scope,
        providerAccountId: token.providerAccountId,
        sessionState: token.sessionState,
        profile: token.profile,
      };
    },
  },
} satisfies NextAuthConfig