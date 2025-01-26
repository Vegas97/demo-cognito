/**
 * Authentication Configuration for NextAuth
 * This file configures authentication using Keycloak and Cognito as identity providers.
 * It handles token management, session handling, and user profile data.
 */

import { NextAuthConfig } from "next-auth";
import KeycloakProvider from "next-auth/providers/keycloak";
import CognitoProvider from "next-auth/providers/cognito";
import { Session } from "next-auth";
import { JWT } from "next-auth/jwt";

/**
 * Keycloak User Profile Interface
 * Defines the structure of user profile data received from Keycloak
 * Contains user information, roles, and authentication details
 */
interface KeycloakProfile {
  email?: string;                 // User's email address
  name?: string;                  // Full name
  realm_access?: {               // Access control information
    roles?: string[];            // User's roles in the Keycloak realm
  };
  groups?: string[];             // Groups the user belongs to
  email_verified?: boolean;      // Email verification status
  preferred_username?: string;   // Username in Keycloak
  given_name?: string;          // First name
  family_name?: string;         // Last name
  sub?: string;                 // Subject identifier (unique user ID)
  sid?: string;                 // Session ID
  iat?: number;                 // Token issued at timestamp
  auth_time?: number;           // Authentication time
  iss?: string;                 // Token issuer (Keycloak server URL)
  aud?: string;                 // Intended audience for the token
}

/**
 * NextAuth Session Extension
 * Extends the default NextAuth Session type to include custom fields
 * for user data, tokens, timing information, and additional metadata
 */
declare module "next-auth" {
  interface Session {
    expires: string;            // Session expiration timestamp
    user: {
      id: string;              // User's unique identifier
      name: string;            // Full name
      email: string;           // Email address
      emailVerified: boolean;  // Email verification status
      profileAccess: string;   // Primary group access level
      roles: string[];         // User's application roles
      username: string;        // Username
      firstName: string;       // First name
      lastName: string;        // Last name
      sub: string;            // Subject identifier
    };
    name: string;
    email: string;
    emailVerified: boolean;
    profileAccess: string;
    roles: string[];
    username: string;
    firstName: string;
    lastName: string;
    sub: string;
    tokens: {                  // Authentication tokens
      accessToken: string;     // JWT access token
      refreshToken: string;    // Token for refreshing access
      idToken: string;         // OpenID Connect ID token
      sessionId: string;       // Current session identifier
    };
    timing: {                  // Timing information
      accessTokenExpiresAt: number;    // Access token expiration
      refreshTokenExpiresAt: number;   // Refresh token expiration
      issuedAt: number;               // Token issuance time
      authTime: number;               // Authentication time
    };
    extra: {                   // Additional metadata
      systemProviderRoles: string[];  // System-level roles
      extraGroups: string[];          // Additional group memberships
      issuer: string;                 // Token issuer
      audience: string;               // Token audience
    };
    error?: "RefreshTokenError";      // Error indicator
  }
}

/**
 * JWT Token Extension
 * Extends the default NextAuth JWT type to include custom fields
 * for token management and user information
 */
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
    provider?: string;
  }
}

/**
 * NextAuth Configuration
 * Main configuration object for NextAuth authentication
 */
export const authConfig: NextAuthConfig = {
  /**
   * Authentication Providers
   * List of providers used for authentication (Keycloak and Cognito)
   */
  providers: [
    // Keycloak provider configuration
    KeycloakProvider({
      clientId: process.env.NEXT_PUBLIC_AUTH_KEYCLOAK_ID!,
      clientSecret: process.env.AUTH_KEYCLOAK_SECRET!,
      issuer: process.env.NEXT_PUBLIC_AUTH_KEYCLOAK_ISSUER,
    }),
    // Cognito provider configuration
    CognitoProvider({
      clientId: process.env.NEXT_PUBLIC_AUTH_COGNITO_ID!,
      clientSecret: process.env.AUTH_COGNITO_SECRET!,
      issuer: process.env.NEXT_PUBLIC_AUTH_COGNITO_ISSUER,
    })
  ],
  /**
   * Session Configuration
   * Settings for session management (JWT-based, 30-day expiration)
   */
  session: {
    strategy: "jwt",                    // Use JWT for session handling
    maxAge: 30 * 24 * 60 * 60,         // Session expires after 30 days
    updateAge: 24 * 60 * 60,           // Update session every 24 hours
  },
  /**
   * Callback Functions
   * Custom functions for handling authentication events (JWT, session, sign out)
   */
  callbacks: {
    /**
     * JWT Callback
     * Handles JWT token creation, refresh, and validation
     */
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
          provider: account.provider,
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

      /**
       * Token Refresh Logic
       * This section handles automatic refresh of expired access tokens
       * It only runs when there's no specific trigger event (like signIn or update)
       */
      if (!trigger) {
        const typedToken = token as JWT;
        
        /**
         * Check if the current access token is still valid
         * expiresAt is stored in seconds, so we multiply by 1000 to compare with Date.now() (milliseconds)
         * If token is still valid, return it without refreshing
         */
        if (Date.now() < typedToken.expiresAt * 1000) {
          return typedToken;
        }

        console.log("Refreshing expired access token");
        try {
          // Verify refresh token exists before attempting refresh
          if (!typedToken.refreshToken) throw new Error("No refresh token available");

          /**
           * Call Keycloak's token endpoint to get new tokens
           * Uses the refresh_token grant type as specified in OAuth2.0
           * Sends:
           * - grant_type: Type of OAuth2.0 flow (refresh_token)
           * - client_id: Application identifier
           * - client_secret: Application secret
           * - refresh_token: Token used to obtain new access tokens
           */
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

          // If response is not OK (not 2xx), throw the error response
          if (!response.ok) throw tokens;

          /**
           * Update the token with new values
           * - Keep existing token data (...typedToken)
           * - Update access token with new one
           * - Update refresh token if provided, otherwise keep existing
           * - Update ID token if provided, otherwise keep existing
           * - Calculate new expiration times based on expires_in value
           */
          return {
            ...typedToken,
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token ?? typedToken.refreshToken,
            idToken: tokens.id_token ?? typedToken.idToken,
            expiresAt: Math.floor(Date.now() / 1000 + tokens.expires_in),
            refreshTokenExpires: Math.floor(Date.now() / 1000 + (tokens.refresh_expires_in ?? 0)),
          };
        } catch (error) {
          // If refresh fails, mark token with error and return
          // This allows the application to handle the error appropriately
          console.error("Error refreshing access token", error);
          return { ...typedToken, error: "RefreshTokenError" };
        }
      }

      return token as JWT;
    },

    /**
     * Session Callback
     * Handles session creation and updates
     */
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
  /**
   * Event Handlers
   * Custom functions for handling authentication events (sign out)
   */
  events: {
    /**
     * Sign Out Event Handler
     * Handles sign out events (e.g., when the user logs out)
     */
    async signOut(message) {
      const token = 'token' in message ? message.token : null;
      // Handle Keycloak-specific logout
      if (token?.provider === "keycloak") {
        const issuerUrl = process.env.NEXT_PUBLIC_AUTH_KEYCLOAK_ISSUER;
        // Construct and call Keycloak's logout endpoint with ID token
        if (issuerUrl && token.idToken) {
          const logOutUrl = new URL(`${issuerUrl}/protocol/openid-connect/logout`);
          // Add ID token hint to ensure proper session termination
          logOutUrl.searchParams.set("id_token_hint", token.idToken);
          // Call Keycloak's logout endpoint
          await fetch(logOutUrl.toString());
        }
      }
      // Note: Cognito logout is handled by NextAuth's default behavior
    },
  },
};