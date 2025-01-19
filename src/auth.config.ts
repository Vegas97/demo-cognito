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
    error?: "RefreshTokenError";
  }
}

// Add JWT type extension
declare module "next-auth/jwt" {
  interface JWT {
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
}

export const authConfig: NextAuthConfig = {
  providers: [
    KeycloakProvider({
      clientId: process.env.NEXT_PUBLIC_AUTH_KEYCLOAK_ID!,
      clientSecret: process.env.AUTH_KEYCLOAK_SECRET!,
      issuer: process.env.NEXT_PUBLIC_AUTH_KEYCLOAK_ISSUER,
    }),
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
        // You can add custom logic here for session updates
        return { ...token };
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

        // Store original session expiry only on initial sign-in
        if (!token.originalSessionExpiry) {
          token.originalSessionExpiry = Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60; // 30 days from first login
          console.log("Setting initial session expiry to:", new Date(token.originalSessionExpiry * 1000).toISOString());
        }

        return token as JWT;
      }

      // Token refresh logic - only run if not a trigger event
      if (!trigger) {
        // Return previous token if the access token has not expired yet
        if (Date.now() < token.expiresAt * 1000) {
          return token;
        }

        console.log("Refreshing expired access token");
        try {
          if (!token.refreshToken) throw new Error("No refresh token available");

          const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_KEYCLOAK_ISSUER}/protocol/openid-connect/token`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
              grant_type: 'refresh_token',
              client_id: process.env.NEXT_PUBLIC_AUTH_KEYCLOAK_ID!,
              client_secret: process.env.AUTH_KEYCLOAK_SECRET!,
              refresh_token: token.refreshToken,
            }),
          });

          const tokens = await response.json();

          if (!response.ok) throw tokens;

          return {
            ...token,
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token ?? token.refreshToken, // Keep old refresh token if not provided
            idToken: tokens.id_token ?? token.idToken,
            expiresAt: Math.floor(Date.now() / 1000 + tokens.expires_in),
            refreshTokenExpires: Math.floor(Date.now() / 1000 + (tokens.refresh_expires_in ?? 0)),
          };
        } catch (error) {
          console.error("Error refreshing access token", error);
          return { ...token, error: "RefreshTokenError" };
        }
      }
    },

    async session({ session, token }) {
      // Use the original session expiry time if available
      if (token.originalSessionExpiry) {
        session.expires = new Date(token.originalSessionExpiry * 1000).toISOString();
      }

      return {
        ...session,
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
        error: token.error,
      };
    },
  },
};