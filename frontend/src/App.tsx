import { Navigate, Route, Routes } from 'react-router-dom';
import { ParametrosProvider } from '@/app/parametros/ParametrosContext';
import { SgaProvider } from '@/app/SgaContext';
import { AdminLayout } from '@/app/layout/AdminLayout';
import { StudentLayout } from '@/app/layout/StudentLayout';
import { AdminHomePage } from '@/features/admin/AdminHomePage';
import { ParametrosPage } from '@/features/admin/ParametrosPage';
import { HorarioPage } from '@/features/horario/HorarioPage';
import { InscripcionPage } from '@/features/inscripcion/InscripcionPage';
import { OfertaPage } from '@/features/oferta/OfertaPage';
import { ReportesPage } from '@/features/reportes/ReportesPage';

export function App() {
  return (
    <ParametrosProvider>
      <SgaProvider>
        <Routes>
          <Route element={<StudentLayout />}>
            <Route path="/" element={<Navigate to="/oferta" replace />} />
            <Route path="/oferta" element={<OfertaPage />} />
            <Route path="/inscripcion" element={<InscripcionPage />} />
            <Route path="/horario" element={<HorarioPage />} />
          </Route>

          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<AdminHomePage />} />
            <Route path="/admin/parametros" element={<ParametrosPage />} />
            <Route path="/reportes" element={<ReportesPage />} />
          </Route>
        </Routes>
      </SgaProvider>
    </ParametrosProvider>
  );
}
