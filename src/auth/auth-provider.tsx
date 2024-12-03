'use client';

import { AuthProvider as OidcProvider } from 'react-oidc-context';
import { authConfig } from './auth-config';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <OidcProvider {...authConfig} onSigninCallback={() => {
      window.history.replaceState({}, document.title, window.location.pathname);
    }}>
      {children}
    </OidcProvider>
  );
}
