import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { AuthProvider } from "./contexts/AuthContext";
import GlobalStyles from "./components/GlobalStyles/GlobalStyles.tsx";
import "@ant-design/v5-patch-for-react-19";
import "reset-css";
import { BrowserRouter } from "react-router-dom";
import "antd/dist/reset.css";
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <GlobalStyles>
          <App />
        </GlobalStyles>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
