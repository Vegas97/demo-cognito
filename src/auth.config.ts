import { NextAuthConfig } from "next-auth";
import KeycloakProvider from "next-auth/providers/keycloak";
import { JWT } from "next-auth/jwt";

// Add type declarations for Keycloak profile and token
interface KeycloakProfile {
  email?: string;
  name?: string;
  realm_access?: {
    roles?: string[];
  };
  groups?: string[];
  email_verified?: boolean;
  preferred_username?: string;
  given_name?: string;
  family_name?: string;
  sub?: string;
  sid?: string;
  iat?: number;
  auth_time?: number;
  iss?: string;
  aud?: string;
}

// Extend the built-in session type
declare module "next-auth" {
  interface Session {
    expires: string;
    user: {
      name: string;
      email: string;
      emailVerified: boolean;
      profileAccess: string;
      roles: string[];
      username: string;
      firstName: string;
      lastName: string;
      sub: string;
    };
    tokens: {
      accessToken: string;
      refreshToken: string;
      idToken: string;
      sessionId: string;
    };
    timing: {
      accessTokenExpiresAt: number;
      refreshTokenExpiresAt: number;
      issuedAt: number;
      authTime: number;
    };
    extra: {
      systemProviderRoles: string[];
      extraGroups: string[];
      issuer: string;
      audience: string;
    };
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
        const keycloakProfile = profile as KeycloakProfile;
        
        // Split roles into application roles and system roles
        const allRoles = keycloakProfile.realm_access?.roles || [];
        const appRoles = allRoles.filter(role => role.startsWith('ROLE_'));
        const systemRoles = allRoles.filter(role => !role.startsWith('ROLE_'));

        // Get primary group and remaining groups
        const allGroups = keycloakProfile.groups || [];
        const primaryGroup = allGroups[0]?.replace('/', '') || '';
        const remainingGroups = allGroups.slice(1);

        // Store tokens
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.idToken = account.id_token;
        token.sessionId = keycloakProfile.sid;

        // Store timing information
        token.expiresAt = account.expires_at;
        token.refreshTokenExpires = Math.floor(Date.now() / 1000) + (account.refresh_expires_in as number);
        token.issuedAt = keycloakProfile.iat;
        token.authTime = keycloakProfile.auth_time;

        // Store user information
        token.name = keycloakProfile.name;
        token.email = keycloakProfile.email;
        token.emailVerified = keycloakProfile.email_verified;
        token.profileAccess = primaryGroup;
        token.roles = appRoles;
        token.username = keycloakProfile.preferred_username;
        token.firstName = keycloakProfile.given_name;
        token.lastName = keycloakProfile.family_name;
        token.sub = keycloakProfile.sub;

        // Store extra information
        token.systemProviderRoles = systemRoles;
        token.extraGroups = remainingGroups;
        token.issuer = keycloakProfile.iss;
        token.audience = keycloakProfile.aud;
      }
      return token as JWT;
    },

    async session({ session, token }) {
      return {
        expires: session.expires,
        user: {
          name: token.name,
          email: token.email,
          emailVerified: token.emailVerified,
          profileAccess: token.profileAccess,
          roles: token.roles,
          username: token.username,
          firstName: token.firstName,
          lastName: token.lastName,
          sub: token.sub,
        },
        tokens: {
          accessToken: token.accessToken,
          refreshToken: token.refreshToken,
          idToken: token.idToken,
          sessionId: token.sessionId,
        },
        timing: {
          accessTokenExpiresAt: token.expiresAt,
          refreshTokenExpiresAt: token.refreshTokenExpires,
          issuedAt: token.issuedAt,
          authTime: token.authTime,
        },
        extra: {
          systemProviderRoles: token.systemProviderRoles,
          extraGroups: token.extraGroups,
          issuer: token.issuer,
          audience: token.audience,
        },
      };
    },
  },
};