import React from 'react';
import ReactDOM from 'react-dom/client';
import { OptionsPage } from '@/pages/OptionsPage';
import { PopupPage } from '@/pages/PopupPage';
import '@/index.css';
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}
const root = ReactDOM.createRoot(rootElement);
const renderApp = () => {
  const path = window.location.pathname;
  if (path.includes('options.html')) {
    return <OptionsPage />;
  }
  if (path.includes('popup.html')) {
    return <PopupPage />;
  }
  // Fallback for dev server
  return <OptionsPage />;
};
root.render(
  <React.StrictMode>
    {renderApp()}
  </React.StrictMode>
);