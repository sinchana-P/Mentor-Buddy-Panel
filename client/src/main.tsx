import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import 'antd/dist/reset.css';
import { ConfigProvider, theme as antdTheme } from 'antd';
import { useState, useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from './store';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';

function ThemeProviderWrapper() {
  // Check localStorage or system preference
  const getInitialTheme = () => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('theme');
      if (stored) return stored;
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
    }
    return 'light';
  };
  const [theme, setTheme] = useState(getInitialTheme());

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <ConfigProvider
      theme={{
        algorithm: theme === 'dark' ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
        token: {
          // Custom tokens for Dribbble-inspired look
          colorPrimary: theme === 'dark' ? '#4f8cff' : '#1a73e8',
          colorBgBase: theme === 'dark' ? '#181c23' : '#f7f8fa',
          colorBgContainer: theme === 'dark' ? '#23272f' : '#fff',
          colorTextBase: theme === 'dark' ? '#e6eaf3' : '#1a1a1a',
          borderRadius: 16,
          boxShadow: theme === 'dark' ? '0 4px 32px 0 rgba(0,0,0,0.45)' : '0 4px 32px 0 rgba(0,0,0,0.08)',
        },
      }}
    >
      <App theme={theme} setTheme={setTheme} />
    </ConfigProvider>
  );
}

createRoot(document.getElementById("root")!).render(
  <Provider store={store}>
    <QueryClientProvider client={queryClient}>
      <ThemeProviderWrapper />
    </QueryClientProvider>
  </Provider>
);
