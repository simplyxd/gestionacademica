import { Badge, Card, Group, Select, Stack, Text } from '@mantine/core';
import { useMemo } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { HorarioSemanal } from '@/features/horario/HorarioSemanal';
import { bloquesDeSeccion } from '@/features/inscripcion/useInscripciones';
import { ESTADO_PERIODO_COLOR } from '@/features/periodos/estado';
import { useSeccionesDocente } from './useSeccionesDocente';

export function HorarioDocentePage() {
  const { periodos, periodoId, setPeriodoId, periodo, propias } = useSeccionesDocente();
  const bloques = useMemo(() => propias.flatMap((s) => bloquesDeSeccion(s, 'inscrita')), [propias]);

  return (
    <>
      <PageHeader
        title="Mi horario"
        description="Las clases que dictas en la semana, según las secciones que el coordinador te asignó."
        breadcrumbs={[{ label: 'Inicio', to: '/' }, { label: 'Mi horario' }]}
      />

      <Card>
        <Stack gap="md">
          <Group justify="space-between" align="flex-end" wrap="wrap" gap="sm">
            <Group gap="sm" align="flex-end" wrap="wrap">
              <Select
                label="Período académico"
                searchable={false}
                allowDeselect={false}
                w={{ base: '100%', sm: 260 }}
                value={periodoId}
                onChange={(v) => setPeriodoId(v ?? '')}
                data={periodos.map((p) => ({ value: p.id, label: `${p.codigo} · ${p.nombre}` }))}
              />
              {periodo && <Badge size="lg" color={ESTADO_PERIODO_COLOR[periodo.estado]}>{periodo.estado}</Badge>}
            </Group>
            <Text fz="sm" c="dimmed" role="status" aria-live="polite">
              {bloques.length} {bloques.length === 1 ? 'bloque' : 'bloques'} en la semana
            </Text>
          </Group>

          {bloques.length === 0 ? (
            <EmptyState title="No tienes clases en este período" description="Cuando el coordinador te asigne una sección, verás su horario aquí." />
          ) : (
            <HorarioSemanal bloques={bloques} />
          )}
        </Stack>
      </Card>
    </>
  );
}
