# Next.js Cognito Authentication Demo

This project demonstrates how to implement AWS Cognito authentication in a Next.js application using the OAuth 2.0 Authorization Code flow with PKCE.

## Features

- 🔐 AWS Cognito Authentication
- 🚀 Next.js 14 with App Router
- 💅 Tailwind CSS for styling
- 📱 Responsive design
- 🔒 Secure authentication flow using PKCE
- 🌐 SSO-ready configuration

## Prerequisites

1. An AWS account with Cognito set up
2. Node.js 18+ installed
3. A Cognito User Pool with an app client configured

## Keycloak Server Setup (Docker)

1. Create a Docker volume for persistent data:
```bash
docker volume create keycloak_data
```

2. Start Keycloak using Docker with persistent storage:
```bash
docker run -p 8080:8080 \
  -e KEYCLOAK_ADMIN=admin \
  -e KEYCLOAK_ADMIN_PASSWORD=admin \
  -v keycloak_data:/opt/keycloak/data \
  quay.io/keycloak/keycloak:latest \
  start-dev --import-realm
```

```bash
docker run -p 8080:8080 -e KC_BOOTSTRAP_ADMIN_USERNAME=admin -e KC_BOOTSTRAP_ADMIN_PASSWORD=admin quay.io/keycloak/keycloak:26.1.0 start-dev
```

2. Access Admin Console:
   - Open [http://localhost:8080](http://localhost:8080)
   - Login to the admin console at [http://localhost:8080/admin](http://localhost:8080/admin)
   - Use the following default credentials:
     - Username: `admin`
     - Password: `admin`

Note: The above configuration includes data persistence through Docker volumes. For production environments, make sure to:
- Use secure passwords
- Enable HTTPS
- Configure proper security settings
- Consider using Docker Compose for more complex setups

To completely reset Keycloak (if needed):
```bash
# Stop any running Keycloak container
docker ps | grep keycloak | awk '{print $1}' | xargs docker stop

# Remove the volume and recreate it
docker volume rm keycloak_data
docker volume create keycloak_data
```

## Setup

1. Clone the repository:
```bash
git clone https://github.com/Vegas97/demo-cognito.git
cd demo-cognito
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the root directory with the following structure:
```env
NEXT_PUBLIC_COGNITO_USER_POOL_ID=your-user-pool-id
NEXT_PUBLIC_COGNITO_APP_CLIENT_ID=[APP_CLIENT_ID]
NEXT_PUBLIC_COGNITO_REGION=your-aws-region
NEXT_PUBLIC_COGNITO_DOMAIN=your-cognito-domain-prefix
NEXT_PUBLIC_COGNITO_AUTHORITY=https://cognito-idp.[REGION].amazonaws.com/[USER_POOL_ID]

NEXT_PUBLIC_COGNITO_REDIRECT_URI=http://localhost:3000
```

## AWS Cognito Configuration

1. Create a User Pool in AWS Cognito
2. Configure App Client:
   - Create a new app client
   - Set app client name
   - Under "App client settings":
     - Enable "Cognito User Pool" as identity provider
     - Set callback URL to: `http://localhost:3000`
     - Set sign-out URL to: `http://localhost:3000`
     - Select "Authorization code grant" flow
     - Select these OAuth 2.0 scopes:
       - email
       - openid
       - profile

3. Configure Domain:
   - Go to "Domain name" in App Integration
   - Choose a domain prefix or use your own domain
   - Note: The domain prefix will be your `NEXT_PUBLIC_DOMAIN` value

4. Important Settings:
   - Make sure PKCE (Proof Key for Code Exchange) is enabled
   - No client secret is required
   - Callback URLs must match exactly
   - Sign-out URLs must match exactly

## Running the Application

1. Start the development server:
```bash
npm run dev
```

2. Open [http://localhost:3000](http://localhost:3000) in your browser

## Authentication Flow

1. User clicks "Sign In"
2. Redirected to Cognito hosted UI
3. User authenticates
4. Redirected back to application with authorization code
5. Code exchanged for tokens
6. User session established

## Environment Variables Explained

- `NEXT_PUBLIC_USER_POOL_ID`: Your Cognito User Pool ID (e.g., 'eu-west-1_xxxxxx')
- `NEXT_PUBLIC_APP_CLIENT_ID`: Your App Client ID
- `NEXT_PUBLIC_REGION`: AWS region (e.g., 'eu-west-1')
- `NEXT_PUBLIC_DOMAIN`: Your Cognito domain prefix
- `NEXT_PUBLIC_COGNITO_AUTHORITY`: Full Cognito authority URL
- `NEXT_PUBLIC_COGNITO_REDIRECT_URI`: Your app's callback URL

## Security Considerations

- Never commit `.env.local` to version control
- Always use HTTPS in production
- Keep your app client ID secure but know it's exposed to the client
- Use environment variables for different stages (dev/prod)

## Contributing

Feel free to submit issues and enhancement requests!
