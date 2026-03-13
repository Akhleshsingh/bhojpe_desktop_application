import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import {ThemeProvider} from './Theme/ThemeContext.tsx';
import "./styles/Theme.css";
import { AuthProvider} from './context/AuthContext.tsx';
import { NetworkProvider } from './context/NetworkContext.tsx';
import "bootstrap/dist/css/bootstrap.min.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <NetworkProvider>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </NetworkProvider>
    </AuthProvider>
  </StrictMode>
);


