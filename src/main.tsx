import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { AuthProvider } from './contexts/AuthContext';
import GlobalStyles from './components/GlobalStyles/GlobalStyles.tsx';
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <GlobalStyles>
        <App />
      </GlobalStyles>
    </AuthProvider>
  </StrictMode>,
);
