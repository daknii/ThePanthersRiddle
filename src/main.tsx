import { StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { AudioGate } from './components/AudioGate.tsx'
import { RouteMoodSync } from './audio/RouteMoodSync.tsx'
import {
  Page3,
  KlvnzPage,
  PoemaPage,
  FlorestaPage,
  RaizPage,
  SubsoloPage,
  XxxxPage,
  IrisPage,
  SilencioPage,
  TrevasPage,
  EternoPage,
} from './routes/lazyPages.ts'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AudioGate>
      <RouteMoodSync />
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
          <Route path="/XXXX" element={<XxxxPage />} />
          <Route path="/xxxx" element={<XxxxPage />} />
          <Route path="/iris" element={<IrisPage />} />
          <Route path="/IRIS" element={<IrisPage />} />
          <Route path="/silencio" element={<SilencioPage />} />
          <Route path="/SILENCIO" element={<SilencioPage />} />
          <Route path="/trevas" element={<TrevasPage />} />
          <Route path="/TREVAS" element={<TrevasPage />} />
          <Route path="/eterno" element={<Navigate to="/trevas" replace />} />
          <Route path="/ETERNO" element={<Navigate to="/trevas" replace />} />
          <Route path="/climax" element={<EternoPage />} />
          <Route path="/CLIMAX" element={<EternoPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
      </AudioGate>
    </BrowserRouter>
  </StrictMode>,
)
