import { Badge, Card, Group, Select, Stack, Text } from '@mantine/core';
import { useMemo } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageSkeleton } from '@/components/ui/PageSkeleton';
import { HorarioSemanal } from '@/features/horario/HorarioSemanal';
import type { BloqueHorario } from '@/features/horario/types';
import { AvisoError, CargandoBloque } from './EstadoConsulta';
import { COLOR_ESTADO_PERIODO, ETIQUETA_ESTADO_PERIODO } from './types';
import { useHorarioDocente } from './useSeccionesDocente';

export function HorarioDocentePage() {
  const {
    periodos,
    periodoId,
    setPeriodoId,
    periodo,
    cargandoPeriodos,
    errorPeriodos,
    recargarPeriodos,
    bloques,
    cargandoHorario,
    errorHorario,
    recargarHorario,
  } = useHorarioDocente();

  const paraLaGrilla = useMemo<BloqueHorario[]>(
    () =>
      bloques
        .filter((bloque) => bloque.dia >= 0 && bloque.dia <= 5)
        .map((bloque) => ({
          id: bloque.id,
          seccionId: bloque.seccionId,
          codigoAsignatura: bloque.codigoAsignatura ?? 'Sección',
          nombreAsignatura: bloque.nombreAsignatura ?? 'Asignatura',
          seccion: bloque.letra ?? '',
          sala: bloque.sala ?? undefined,
          dia: bloque.dia,
          inicioMin: bloque.inicioMin,
          finMin: bloque.finMin,
          estado: 'docente-ocupado',
        })),
    [bloques],
  );

  return (
    <>
      <PageHeader
        title="Mi horario"
        description="Las clases que dictas en la semana, según las secciones que el coordinador te asignó."
        breadcrumbs={[{ label: 'Inicio', to: '/' }, { label: 'Mi horario' }]}
      />

      {cargandoPeriodos ? (
        <PageSkeleton />
      ) : errorPeriodos ? (
        <AvisoError mensaje={errorPeriodos} onReintentar={recargarPeriodos} />
      ) : periodos.length === 0 ? (
        <Card>
          <EmptyState
            title="Todavía no hay períodos"
            description="Cuando exista un período académico, vas a poder ver tu horario."
          />
        </Card>
      ) : (
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
                  onChange={(valor) => setPeriodoId(valor ?? '')}
                  data={periodos.map((item) => ({ value: item.id, label: `${item.codigo} · ${item.nombre}` }))}
                />
                {periodo && (
                  <Badge size="lg" color={COLOR_ESTADO_PERIODO[periodo.estado] ?? 'slate'}>
                    {ETIQUETA_ESTADO_PERIODO[periodo.estado] ?? periodo.estado}
                  </Badge>
                )}
              </Group>
              {!cargandoHorario && !errorHorario && (
                <Text fz="sm" c="dimmed" role="status" aria-live="polite">
                  {paraLaGrilla.length} {paraLaGrilla.length === 1 ? 'bloque' : 'bloques'} en la semana
                </Text>
              )}
            </Group>

            {cargandoHorario ? (
              <CargandoBloque etiqueta="Cargando tu horario" />
            ) : errorHorario ? (
              <AvisoError mensaje={errorHorario} onReintentar={recargarHorario} />
            ) : paraLaGrilla.length === 0 ? (
              <EmptyState
                title="No tienes clases en este período"
                description="Cuando el coordinador te asigne una sección, verás su horario aquí."
              />
            ) : (
              <HorarioSemanal bloques={paraLaGrilla} />
            )}
          </Stack>
        </Card>
      )}
    </>
  );
}
