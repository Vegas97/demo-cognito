import type { NextAuthConfig } from "next-auth";
import type { JWT } from "next-auth/jwt";
import type { Session } from "next-auth";
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
      profileAccess: string;
      roles: string[];
      username: string;
      emailVerified: boolean;
      image?: string | null;
    };
    provider: string;
    providerAccountId?: string;
    accessToken?: string;
    refreshToken?: string;
    idToken?: string;
    tokenType?: string;
    expiresAt?: number;
    refreshTokenExpires?: number;
    scope?: string;
    profile?: {
      realm_access?: {
        roles?: string[];
      };
    };
    sessionState?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId?: string;
    provider?: string;
    providerAccountId?: string;
    accessToken?: string;
    refreshToken?: string;
    idToken?: string;
    tokenType?: string;
    expiresAt?: number;
    refreshTokenExpires?: number;
    scope?: string;
    roles?: string[];
    groups?: string[];
    realmRoles?: string[];
    profile?: KeycloakProfile;
    sessionState?: string;
  }
}

const config = {
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
      if (account && profile) {
        const keycloakProfile = profile as KeycloakProfile;
        
        // Set tokens
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.idToken = account.id_token;
        token.provider = account.provider;
        token.providerAccountId = account.providerAccountId;
        token.tokenType = account.token_type;
        token.scope = account.scope;
        
        // Set token expirations
        const now = Math.floor(Date.now() / 1000);
        token.expiresAt = now + (account.expires_in as number);
        token.refreshTokenExpires = now + (30 * 24 * 60 * 60); // 30 days
        
        // Set user profile
        token.profile = keycloakProfile;
        token.userId = keycloakProfile.sub;
        token.sessionState = keycloakProfile.session_state;
        
        // Extract roles and groups
        token.roles = keycloakProfile.realm_access?.roles || [];
        token.realmRoles = keycloakProfile.realm_access?.roles || [];
        token.groups = keycloakProfile.groups || [];
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      const updatedSession: Session = {
        ...session,
        user: {
          id: token.userId || '',
          name: token.profile?.name || '',
          email: token.profile?.email || '',
          profileAccess: token.groups?.[0]?.replace('/', '') || '',
          roles: token.realmRoles?.filter(role => role.startsWith('ROLE_')) || [],
          username: token.profile?.preferred_username || '',
          emailVerified: token.profile?.email_verified || false,
          image: session.user?.image,
        },
        provider: token.provider || '',
        providerAccountId: token.providerAccountId,
        accessToken: token.accessToken,
        refreshToken: token.refreshToken,
        idToken: token.idToken,
        tokenType: token.tokenType,
        expiresAt: token.expiresAt,
        refreshTokenExpires: token.refreshTokenExpires,
        scope: token.scope || '',
        profile: {
          realm_access: {
            roles: token.realmRoles || []
          }
        },
        sessionState: token.sessionState || ''
      };

      return updatedSession;
    },
  },
} satisfies NextAuthConfig;

export default config;