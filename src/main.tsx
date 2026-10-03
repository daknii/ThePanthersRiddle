import { StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import {
  Page3,
  KlvnzPage,
  PoemaPage,
  FlorestaPage,
  RaizPage,
  SubsoloPage,
} from './routes/lazyPages.ts'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Suspense fallback={null}>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/page3" element={<Page3 />} />
          <Route path="/pagina3" element={<Page3 />} />
          <Route path="/klvnz" element={<KlvnzPage />} />
          <Route path="/poema" element={<PoemaPage />} />
          <Route path="/floresta" element={<FlorestaPage />} />
          <Route path="/raiz" element={<RaizPage />} />
          <Route path="/raizes" element={<RaizPage />} />
          <Route path="/subsolo" element={<SubsoloPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  </StrictMode>,
)
