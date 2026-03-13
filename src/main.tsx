import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ThemeProvider } from './Theme/ThemeContext.tsx';
import "./styles/Theme.css";
import { AuthProvider } from './context/AuthContext.tsx';
import { NetworkProvider } from './context/NetworkContext.tsx';
import "bootstrap/dist/css/bootstrap.min.css";
import { Provider as ReduxProvider } from 'react-redux';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { store } from './store/index.ts';
import { queryClient } from './utils/queryClient.ts';

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ReduxProvider store={store}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <NetworkProvider>
            <ThemeProvider>
              <App />
            </ThemeProvider>
          </NetworkProvider>
        </AuthProvider>
        {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
      </QueryClientProvider>
    </ReduxProvider>
  </StrictMode>
);
