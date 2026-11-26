import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from '@/components/Layout'
import Factures from '@/pages/Factures'
import FactureDetail from '@/pages/FactureDetail'
import Destinataires from '@/pages/Destinataires'
import Parametres from '@/pages/Parametres'
import Indicateurs from '@/pages/Indicateurs'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/factures" element={<Factures />} />
          <Route path="/factures/:id" element={<FactureDetail />} />
          <Route path="/indicateurs" element={<Indicateurs />} />
          <Route path="/destinataires" element={<Destinataires />} />
          <Route path="/parametres" element={<Parametres />} />
        </Route>
        <Route path="*" element={<Navigate to="/factures" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
