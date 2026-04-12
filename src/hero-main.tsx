import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import SConnectHero from './components/3d/SConnectHero'

// Minimal global styles
const style = document.createElement('style')
style.textContent = `
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body, #root { width: 100%; height: 100%; overflow: hidden; background: transparent; }
`
document.head.appendChild(style)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SConnectHero />
  </StrictMode>
)
