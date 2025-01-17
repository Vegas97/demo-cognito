import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    provider?: string;
    accessToken?: string;
    idToken?: string;
    refreshToken?: string;
    tokenType?: string;
    expiresAt?: number;
    scope?: string;
    providerAccountId?: string;
    userId?: string;
    role?: string;
    profile?: {
      sub?: string;
      email_verified?: boolean;
      name?: string;
      preferred_username?: string;
      given_name?: string;
      family_name?: string;
      email?: string;
      // Keycloak specific claims
      realm_access?: {
        roles?: string[];
      };
      resource_access?: {
        [key: string]: {
          roles?: string[];
        };
      };
      roles?: string[];
      groups?: string[];
      acr?: string;
      azp?: string;
      auth_time?: number;
      session_state?: string;
      attributes?: Record<string, unknown>;
      [key: string]: unknown;
    };
    user: {
      id?: string;
      role?: string;
    } & DefaultSession["user"];
  }

  interface User {
    role?: string;
  }
}
