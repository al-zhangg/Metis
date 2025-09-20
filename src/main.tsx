import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Auth0Provider } from '@auth0/auth0-react';
import App from './App.tsx';
import './index.css';

const domain = import.meta.env.VITE_AUTH0_DOMAIN;
const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID;

// Use placeholder values if not configured (for development)
const auth0Domain = domain || 'dev-placeholder.us.auth0.com';
const auth0ClientId = clientId || 'placeholder_client_id';

if (!domain || !clientId) {
  console.warn('Auth0 not configured. Using placeholder values. Authentication will not work until you set up real Auth0 credentials.');
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Auth0Provider
      domain={auth0Domain}
      clientId={auth0ClientId}
      authorizationParams={{
        redirect_uri: window.location.origin
      }}
      cacheLocation="localstorage"
      useRefreshTokens={true}
    >
      <App />
    </Auth0Provider>
  </StrictMode>
);