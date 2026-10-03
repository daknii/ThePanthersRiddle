import { lazy } from 'react';

export const Page3 = lazy(() => import('../components/Page3.tsx').then(m => ({ default: m.Page3 })));
export const KlvnzPage = lazy(() => import('../components/KlvnzPage.tsx').then(m => ({ default: m.KlvnzPage })));
export const PoemaPage = lazy(() => import('../components/PoemaPage.tsx').then(m => ({ default: m.PoemaPage })));
export const FlorestaPage = lazy(() => import('../components/FlorestaPage.tsx').then(m => ({ default: m.FlorestaPage })));
export const RaizPage = lazy(() => import('../components/RaizPage.tsx').then(m => ({ default: m.RaizPage })));
export const SubsoloPage = lazy(() => import('../components/SubsoloPage.tsx').then(m => ({ default: m.SubsoloPage })));
export const XxxxPage = lazy(() => import('../components/XxxxPage.tsx').then(m => ({ default: m.XxxxPage })));
export const IrisPage = lazy(() => import('../components/IrisPage.tsx').then(m => ({ default: m.IrisPage })));
export const SilencioPage = lazy(() => import('../components/SilencioPage.tsx').then(m => ({ default: m.SilencioPage })));
