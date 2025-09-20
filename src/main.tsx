import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Auth0Provider } from '@auth0/auth0-react';
import App from './App.tsx';
import './index.css';

const domain = import.meta.env.VITE_AUTH0_DOMAIN || '';
const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID || '';

console.log('Auth0 Config:', { domain, clientId: clientId ? 'Set' : 'Missing' });

// Validate Auth0 configuration
const isAuth0Configured = domain && clientId && domain.includes('auth0.com');

if (!isAuth0Configured) {
  console.error('Auth0 Configuration Error:', {
    domain: domain || 'Missing',
    clientId: clientId ? 'Present' : 'Missing',
    configured: isAuth0Configured
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isAuth0Configured ? (
      <Auth0Provider
        domain={domain}
        clientId={clientId}
        authorizationParams={{
          redirect_uri: window.location.origin
        }}
        cacheLocation="localstorage"
        useRefreshTokens={true}
      >
        <App />
      </Auth0Provider>
    ) : (
      <App />
    )}
  </StrictMode>
);