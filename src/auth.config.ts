import { NextAuthConfig } from "next-auth";
import KeycloakProvider from "next-auth/providers/keycloak";
import CognitoProvider from "next-auth/providers/cognito";
import { Session } from "next-auth";
import { JWT as NextAuthJWT } from "next-auth/jwt";

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
    error?: "RefreshTokenError";
  }
}

// Add JWT type extension
interface JWT extends NextAuthJWT {
  error?: "RefreshTokenError";
  accessToken: string;
  refreshToken: string;
  idToken: string;
  sessionId: string;
  expiresAt: number;
  refreshTokenExpires: number;
  issuedAt: number;
  authTime: number;
  name: string;
  email: string;
  emailVerified: boolean;
  profileAccess: string;
  roles: string[];
  username: string;
  firstName: string;
  lastName: string;
  sub: string;
  systemProviderRoles: string[];
  extraGroups: string[];
  issuer: string;
  audience: string;
  originalSessionExpiry?: number;
}

export const authConfig: NextAuthConfig = {
  providers: [
    KeycloakProvider({
      clientId: process.env.NEXT_PUBLIC_AUTH_KEYCLOAK_ID!,
      clientSecret: process.env.AUTH_KEYCLOAK_SECRET!,
      issuer: process.env.NEXT_PUBLIC_AUTH_KEYCLOAK_ISSUER,
    }),
    CognitoProvider({
      clientId: process.env.NEXT_PUBLIC_AUTH_COGNITO_ID!,
      clientSecret: process.env.AUTH_COGNITO_SECRET!,
      issuer: process.env.NEXT_PUBLIC_AUTH_COGNITO_ISSUER,
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  callbacks: {
    async jwt({ token, account, profile, trigger }) {
      // Handle session update event (e.g., when useSession().update() is called)
      if (trigger === "update") {
        console.log("JWT callback triggered by update event");
        return token as JWT;
      }

      // Initial sign in
      if (trigger === "signIn" && account && profile) {
        console.log("JWT callback triggered by sign-in event");
        
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
        if (!account.access_token) throw new Error("No access token available");
        if (!account.refresh_token) throw new Error("No refresh token available");
        if (!account.id_token) throw new Error("No ID token available");
        if (!keycloakProfile.sid) throw new Error("No session ID available");
        if (!account.expires_at) throw new Error("No expiry time available");
        if (!keycloakProfile.iat) throw new Error("No issued at time available");
        if (!keycloakProfile.auth_time) throw new Error("No auth time available");
        if (!keycloakProfile.name) throw new Error("No name available");
        if (!keycloakProfile.email) throw new Error("No email available");
        if (keycloakProfile.email_verified === undefined) throw new Error("No email verification status available");
        if (!keycloakProfile.preferred_username) throw new Error("No username available");
        if (!keycloakProfile.given_name) throw new Error("No first name available");
        if (!keycloakProfile.family_name) throw new Error("No last name available");
        if (!keycloakProfile.sub) throw new Error("No subject available");
        if (!keycloakProfile.iss) throw new Error("No issuer available");
        if (!keycloakProfile.aud) throw new Error("No audience available");

        const newToken: JWT = {
          ...token as JWT,
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          idToken: account.id_token,
          sessionId: keycloakProfile.sid,
          expiresAt: account.expires_at,
          refreshTokenExpires: Math.floor(Date.now() / 1000) + (account.refresh_expires_in as number),
          issuedAt: keycloakProfile.iat,
          authTime: keycloakProfile.auth_time,
          name: keycloakProfile.name,
          email: keycloakProfile.email,
          emailVerified: keycloakProfile.email_verified,
          profileAccess: primaryGroup,
          roles: appRoles,
          username: keycloakProfile.preferred_username,
          firstName: keycloakProfile.given_name,
          lastName: keycloakProfile.family_name,
          sub: keycloakProfile.sub,
          systemProviderRoles: systemRoles,
          extraGroups: remainingGroups,
          issuer: keycloakProfile.iss,
          audience: keycloakProfile.aud,
        };

        // Store original session expiry
        if (!newToken.originalSessionExpiry) {
          newToken.originalSessionExpiry = Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60; // 30 days from first login
          console.log("Setting initial session expiry to:", new Date(newToken.originalSessionExpiry * 1000).toISOString());
        }

        return newToken;
      }

      // Token refresh logic - only run if not a trigger event
      if (!trigger) {
        const typedToken = token as JWT;
        // Return previous token if the access token has not expired yet
        if (Date.now() < typedToken.expiresAt * 1000) {
          return typedToken;
        }

        console.log("Refreshing expired access token");
        try {
          if (!typedToken.refreshToken) throw new Error("No refresh token available");

          const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_KEYCLOAK_ISSUER}/protocol/openid-connect/token`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
              grant_type: 'refresh_token',
              client_id: process.env.NEXT_PUBLIC_AUTH_KEYCLOAK_ID!,
              client_secret: process.env.AUTH_KEYCLOAK_SECRET!,
              refresh_token: typedToken.refreshToken,
            }).toString(),
          });

          const tokens = await response.json();

          if (!response.ok) throw tokens;

          return {
            ...typedToken,
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token ?? typedToken.refreshToken,
            idToken: tokens.id_token ?? typedToken.idToken,
            expiresAt: Math.floor(Date.now() / 1000 + tokens.expires_in),
            refreshTokenExpires: Math.floor(Date.now() / 1000 + (tokens.refresh_expires_in ?? 0)),
          };
        } catch (error) {
          console.error("Error refreshing access token", error);
          return { ...typedToken, error: "RefreshTokenError" };
        }
      }

      return token as JWT;
    },

    async session({ session, token }) {
      const typedToken = token as JWT;
      const newSession = session as Session;
      // Use the original session expiry time if available
      if (typedToken.originalSessionExpiry) {
        newSession.expires = new Date(typedToken.originalSessionExpiry * 1000).toISOString();
      }

      return {
        ...newSession,
        user: {
          name: typedToken.name,
          email: typedToken.email,
          emailVerified: typedToken.emailVerified,
          profileAccess: typedToken.profileAccess,
          roles: typedToken.roles,
          username: typedToken.username,
          firstName: typedToken.firstName,
          lastName: typedToken.lastName,
          sub: typedToken.sub,
        },
        tokens: {
          accessToken: typedToken.accessToken,
          refreshToken: typedToken.refreshToken,
          idToken: typedToken.idToken,
          sessionId: typedToken.sessionId,
        },
        timing: {
          accessTokenExpiresAt: typedToken.expiresAt,
          refreshTokenExpiresAt: typedToken.refreshTokenExpires,
          issuedAt: typedToken.issuedAt,
          authTime: typedToken.authTime,
        },
        extra: {
          systemProviderRoles: typedToken.systemProviderRoles,
          extraGroups: typedToken.extraGroups,
          issuer: typedToken.issuer,
          audience: typedToken.audience,
        },
        error: typedToken.error,
      };
    },
  },
};