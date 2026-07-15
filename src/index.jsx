import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import "./index.css";
import App from "./App";
import ErrorBoundary from "./components/ErrorBoundary";
import Error from "./pages/Error";
import ThemeProvider from "./context/themeContext";
import NotificationProvider from "./context/notificationContext";
import UserProvider from "./context/userContext";
import { queryClient } from "./lib/queryClient";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <ErrorBoundary fallback={<Error />}>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <UserProvider>
          <NotificationProvider>
            <App />
          </NotificationProvider>
        </UserProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);
