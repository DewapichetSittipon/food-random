import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import App from './App.tsx';
import { ensureSeeded, syncCatalog } from './sync.ts';
import './index.css';

registerSW({ immediate: true });

// first run ใช้ seed ที่ฝังมา แล้ว sync snapshot เบื้องหลัง — UI อ่านจาก IndexedDB เสมอ
void ensureSeeded().then(() => syncCatalog());
window.addEventListener('online', () => void syncCatalog());

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
