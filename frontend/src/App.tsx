import { Navigate, Route, Routes } from 'react-router-dom';
import { SgaProvider } from '@/app/SgaContext';
import { AppLayout } from '@/app/layout/AppLayout';
import { HorarioPage } from '@/features/horario/HorarioPage';
import { InscripcionPage } from '@/features/inscripcion/InscripcionPage';
import { OfertaPage } from '@/features/oferta/OfertaPage';

export function App() {
  return (
    <SgaProvider>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Navigate to="/oferta" replace />} />
          <Route path="/oferta" element={<OfertaPage />} />
          <Route path="/inscripcion" element={<InscripcionPage />} />
          <Route path="/horario" element={<HorarioPage />} />
        </Route>
      </Routes>
    </SgaProvider>
  );
}
