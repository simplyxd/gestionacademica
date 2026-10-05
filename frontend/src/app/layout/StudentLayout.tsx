import { Badge, Select } from '@mantine/core';
import { IconFlask } from '@tabler/icons-react';
import { NAV_ESTUDIANTE } from '@/app/navigation';
import { useSga } from '@/app/SgaContext';
import { useParametros } from '@/app/parametros/ParametrosContext';
import { ESCENARIOS } from '@/features/inscripcion/reglas';
import { estudiante, PERIODO_ACTUAL } from '@/mocks/sga';
import { ShellLayout } from './ShellLayout';

const ESTADO_POR_ESCENARIO = {
  normal: { label: 'inscripción abierta', color: 'teal' },
  'sin-matricula': { label: 'inscripción abierta', color: 'teal' },
  'ventana-futura': { label: 'planificación', color: 'sky' },
  'ventana-cerrada': { label: 'cerrado', color: 'slate' },
} as const;

export function StudentLayout() {
  const { escenario, setEscenario } = useSga();
  const { parametros } = useParametros();
  const estado = ESTADO_POR_ESCENARIO[escenario];

  return (
    <ShellLayout
      navItems={NAV_ESTUDIANTE}
      groupedNav={false}
      institucionNombre={parametros.nombreInstitucion}
      usuario={{
        nombre: estudiante.nombre,
        rolLabel: 'Estudiante',
        iniciales: 'JS',
      }}
      headerBadge={
        <Badge color={estado.color} size="lg" visibleFrom="xs">
          {PERIODO_ACTUAL} · {estado.label}
        </Badge>
      }
      headerExtra={
        <Select
          aria-label="Escenario de prueba"
          leftSection={<IconFlask size={16} stroke={1.5} />}
          data={ESCENARIOS}
          value={escenario}
          onChange={(v) => v && setEscenario(v as typeof escenario)}
          allowDeselect={false}
          w={{ base: 44, sm: 260 }}
          visibleFrom="sm"
        />
      }
      footerLinks={NAV_ESTUDIANTE.map((item) => ({ label: item.label, href: item.to }))}
    />
  );
}
