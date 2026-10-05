import { Badge, Select } from '@mantine/core';
import { NAV_ADMIN } from '@/app/navigation';
import { useParametros } from '@/app/parametros/ParametrosContext';
import { PERIODOS_REPORTE } from '@/mocks/reportes';
import { useMemo, useState } from 'react';
import { ShellLayout } from './ShellLayout';

const adminUsuario = {
  nombre: 'Andrea Morales',
  rolLabel: 'Administrador',
  iniciales: 'AM',
};

export function AdminLayout() {
  const { parametros } = useParametros();
  const [periodoTrabajo, setPeriodoTrabajo] = useState(PERIODOS_REPORTE[0]?.value ?? '2026-2');

  const periodoLabel = useMemo(
    () => PERIODOS_REPORTE.find((p) => p.value === periodoTrabajo)?.label ?? periodoTrabajo,
    [periodoTrabajo],
  );

  return (
    <ShellLayout
      navItems={NAV_ADMIN}
      groupedNav
      institucionNombre={parametros.nombreInstitucion}
      usuario={adminUsuario}
      headerBadge={
        <Badge color="sky" size="lg" visibleFrom="xs">
          {periodoLabel.split(' · ')[0]}
        </Badge>
      }
      headerExtra={
        <Select
          aria-label="Período de trabajo"
          data={PERIODOS_REPORTE.map((p) => ({ value: p.value, label: p.label }))}
          value={periodoTrabajo}
          onChange={(v) => v && setPeriodoTrabajo(v)}
          allowDeselect={false}
          w={{ base: 120, sm: 240 }}
          visibleFrom="sm"
        />
      }
      footerLinks={NAV_ADMIN.filter((item) => item.to !== '/admin').map((item) => ({
        label: item.label,
        href: item.to,
      }))}
    />
  );
}
