import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { KlvnzPage } from './components/KlvnzPage.tsx'
import { PoemaPage } from './components/PoemaPage.tsx'
import { Page3 } from './components/Page3.tsx'
import { FlorestaPage } from './components/FlorestaPage.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/page3" element={<Page3 />} />
        <Route path="/pagina3" element={<Page3 />} />
        <Route path="/klvnz" element={<KlvnzPage />} />
        <Route path="/poema" element={<PoemaPage />} />
        <Route path="/floresta" element={<FlorestaPage />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
