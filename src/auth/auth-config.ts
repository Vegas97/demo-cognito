// const DOMAIN_URL = `https://${process.env.NEXT_PUBLIC_COGNITO_DOMAIN}.auth.${process.env.NEXT_PUBLIC_COGNITO_REGION}.amazoncognito.com`;
const DOMAIN_URL = process.env.NEXT_PUBLIC_COGNITO_DOMAIN;
const REDIRECT_URI = process.env.NEXT_PUBLIC_COGNITO_REDIRECT_URI;
const CLIENT_ID = process.env.NEXT_PUBLIC_COGNITO_APP_CLIENT_ID;

export const authConfig = {
  authority: DOMAIN_URL,
  client_id: CLIENT_ID,
  redirect_uri: REDIRECT_URI,
  post_logout_redirect_uri: REDIRECT_URI,
  response_type: 'code',
  scope: process.env.NEXT_PUBLIC_COGNITO_SCOPE || 'openid email profile',
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
