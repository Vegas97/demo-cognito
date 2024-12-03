'use client';

import { useAuth as useOidcAuth } from 'react-oidc-context';

const DOMAIN_URL = `https://${process.env.NEXT_PUBLIC_DOMAIN}.auth.${process.env.NEXT_PUBLIC_REGION}.amazoncognito.com`;

export function useAuth() {
  const auth = useOidcAuth();

  const signOut = async () => {
    try {
      // Simpler logout configuration
      const logoutUrl = `${DOMAIN_URL}/logout?client_id=${process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID}&logout_uri=${encodeURIComponent('http://localhost:3000')}`;
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
