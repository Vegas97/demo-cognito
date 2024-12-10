'use client';

import { useAuth as useOidcAuth } from 'react-oidc-context';

// const DOMAIN_URL = `https://${process.env.NEXT_PUBLIC_COGNITO_DOMAIN}.auth.${process.env.NEXT_PUBLIC_COGNITO_REGION}.amazoncognito.com`;
const DOMAIN_URL = process.env.NEXT_PUBLIC_COGNITO_DOMAIN;
const CLIENT_ID = process.env.NEXT_PUBLIC_COGNITO_APP_CLIENT_ID;
const REDIRECT_URI = 'http://localhost:3000';

export function useAuth() {
  const auth = useOidcAuth();

  const signOut = async () => {
    try {
      // Simpler logout configuration
      const logoutUrl = `${DOMAIN_URL}/logout?client_id=${CLIENT_ID}&logout_uri=${encodeURIComponent(REDIRECT_URI)}`;
      await auth.removeUser();
      window.location.href = logoutUrl;
    } catch (error) {
      console.error('Error during sign out:', error);
    }
  };

  return {
    ...auth,
    signOut,
    isAuthenticated: auth.isAuthenticated,
    user: auth.user,
    error: auth.error,
    isLoading: auth.isLoading,
    signIn: () => auth.signinRedirect()
  };
}
