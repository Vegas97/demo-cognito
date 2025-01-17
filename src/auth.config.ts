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

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      roles: string[];
      username: string;
      emailVerified: boolean;
      image?: string | null;
    };
    provider: string;
    accessToken?: string;
    refreshToken?: string;
    idToken?: string;
    tokenType?: string;
    expiresAt?: number;
    refreshTokenExpires?: number;
    scope?: string;
    error?: string;
  }
}

export default {
  pages: {
    signIn: "/auth/login",
    signOut: "/",
  },
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
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
        token.refreshToken = account.refresh_token;
        token.idToken = account.id_token;
        token.provider = account.provider;
        token.providerAccountId = account.providerAccountId;
        token.tokenType = account.token_type;

        // Parse the access token to get its expiration
        token.expiresAt = Math.floor(Date.now() / 1000 + (account.expires_in as number));

        // Set refresh token expiration to 30 days from now
        token.refreshTokenExpires = Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60);

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

        // Debug log for token expiration
        console.log('Token expiration debug:', {
          original: account.expires_at,
          converted: token.expiresAt,
          now: Math.floor(Date.now() / 1000),
          diff: token.expiresAt ? token.expiresAt - Math.floor(Date.now() / 1000) : null
        });
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
        refreshToken: token.refreshToken,
        idToken: token.idToken,
        tokenType: token.tokenType,
        expiresAt: token.expiresAt,
        refreshTokenExpires: token.refreshTokenExpires,
        scope: token.scope,
        providerAccountId: token.providerAccountId,
        sessionState: token.sessionState,
        profile: token.profile,
      };
    },
  },
} satisfies NextAuthConfig