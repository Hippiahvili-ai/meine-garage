import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// iOS/Safari bitten, die lokalen Daten nicht automatisch zu löschen.
if (navigator.storage?.persist) {
  void navigator.storage.persist().catch(() => undefined)
}

// Offline-Fähigkeit nur im fertigen Build – im Entwicklungsmodus würde
// der Cache sonst Änderungen verdecken.
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    void navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`)
  })
}
