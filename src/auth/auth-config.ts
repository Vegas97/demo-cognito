const DOMAIN_URL = `https://${process.env.NEXT_PUBLIC_DOMAIN}.auth.${process.env.NEXT_PUBLIC_REGION}.amazoncognito.com`;
const REDIRECT_URI = 'http://localhost:3000';

export const authConfig = {
  authority: DOMAIN_URL,
  client_id: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID,
  redirect_uri: REDIRECT_URI,
  post_logout_redirect_uri: REDIRECT_URI,
  response_type: 'code',
  scope: 'openid profile email',
  loadUserInfo: true,
  
  // Additional OIDC settings
  metadata: {
    issuer: DOMAIN_URL,
    authorization_endpoint: `${DOMAIN_URL}/oauth2/authorize`,
    token_endpoint: `${DOMAIN_URL}/oauth2/token`,
    end_session_endpoint: `${DOMAIN_URL}/logout`,
    userinfo_endpoint: `${DOMAIN_URL}/oauth2/userInfo`
  }
};
