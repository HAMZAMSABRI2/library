import { createElement } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';

createRoot(document.getElementById('app') as HTMLElement).render(
  createElement(App)
);
