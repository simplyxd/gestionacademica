import { Badge, Box, Button, Card, Group, Select, Stack, Table, Text } from '@mantine/core';
import { IconUsers } from '@tabler/icons-react';
import { useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageSkeleton } from '@/components/ui/PageSkeleton';
import { CupoIndicator } from '@/features/inscripcion/CupoIndicator';
import { textoBloques } from '@/lib/horas';
import { AvisoError, CargandoBloque } from './EstadoConsulta';
import { NominaDrawer } from './NominaDrawer';
import type { SeccionDocente } from './types';
import { COLOR_ESTADO_PERIODO, ETIQUETA_ESTADO_PERIODO, JORNADA_LABEL, MODALIDAD_COLOR, MODALIDAD_LABEL } from './types';
import { useSeccionesDocente } from './useSeccionesDocente';

function titulo(seccion: SeccionDocente): string {
  return seccion.nombreAsignatura ?? 'Asignatura sin nombre';
}

function codigo(seccion: SeccionDocente): string {
  return seccion.codigoAsignatura ?? seccion.asignaturaId.slice(-6);
}

function letra(seccion: SeccionDocente): string {
  return seccion.letra ?? '—';
}

function Inscritos({ seccion }: { seccion: SeccionDocente }) {
  if (seccion.cupoMaximo == null) {
    const n = seccion.inscritosActivos;
    return (
      <Text fz="sm" c="dimmed">
        {n} {n === 1 ? 'inscrito' : 'inscritos'}
      </Text>
    );
  }
  return <CupoIndicator inscritos={seccion.inscritosActivos} cupo={seccion.cupoMaximo} compact />;
}

export function SeccionesDocentePage() {
  const {
    periodos,
    periodoId,
    setPeriodoId,
    periodo,
    cargandoPeriodos,
    errorPeriodos,
    recargarPeriodos,
    secciones,
    cargandoSecciones,
    errorSecciones,
    recargarSecciones,
  } = useSeccionesDocente();
  const [seleccionId, setSeleccionId] = useState<string | null>(null);
  const seleccionada = secciones.find((seccion) => seccion.id === seleccionId) ?? null;

  return (
    <>
      <PageHeader
        title="Mis secciones"
        description="Las secciones que dictas en el período y la nómina de estudiantes de cada una."
        breadcrumbs={[{ label: 'Inicio', to: '/' }, { label: 'Mis secciones' }]}
      />

      {cargandoPeriodos ? (
        <PageSkeleton />
      ) : errorPeriodos ? (
        <AvisoError mensaje={errorPeriodos} onReintentar={recargarPeriodos} />
      ) : periodos.length === 0 ? (
        <Card>
          <EmptyState
            title="Todavía no hay períodos"
            description="Cuando exista un período académico, vas a poder ver tus secciones."
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
              {!cargandoSecciones && !errorSecciones && (
                <Text fz="sm" c="dimmed" role="status" aria-live="polite">
                  {secciones.length} {secciones.length === 1 ? 'sección' : 'secciones'}
                </Text>
              )}
            </Group>

            {cargandoSecciones ? (
              <CargandoBloque etiqueta="Cargando tus secciones" />
            ) : errorSecciones ? (
              <AvisoError mensaje={errorSecciones} onReintentar={recargarSecciones} />
            ) : secciones.length === 0 ? (
              <EmptyState
                title="No tienes secciones en este período"
                description="Cuando el coordinador te asigne una, aparecerá aquí."
              />
            ) : (
              <>
                <Box visibleFrom="sm">
                  <Table.ScrollContainer minWidth={760}>
                    <Table>
                      <Table.Thead>
                        <Table.Tr>
                          <Table.Th>Asignatura</Table.Th>
                          <Table.Th>Horario</Table.Th>
                          <Table.Th>Modalidad · jornada</Table.Th>
                          <Table.Th w={200}>Inscritos</Table.Th>
                          <Table.Th w={150} aria-label="Acciones" />
                        </Table.Tr>
                      </Table.Thead>
                      <Table.Tbody>
                        {secciones.map((seccion) => (
                          <Table.Tr key={seccion.id}>
                            <Table.Td>
                              <Text fz="sm" fw={500}>
                                {titulo(seccion)}
                              </Text>
                              <Text component="span" fz="xs">
                                <span className="sga-code sga-code-indigo">{codigo(seccion)}</span>
                                <Text component="span" fz="xs" c="dimmed">
                                  {' '}
                                  · Sección {letra(seccion)}
                                </Text>
                              </Text>
                            </Table.Td>
                            <Table.Td>
                              <Text fz="sm">{textoBloques(seccion.bloques)}</Text>
                              <Text fz="xs" c="dimmed">
                                {seccion.sala ?? 'Sin sala'} · {seccion.sede ?? 'Sede sin nombre'}
                              </Text>
                            </Table.Td>
                            <Table.Td>
                              {seccion.modalidad && MODALIDAD_LABEL[seccion.modalidad] ? (
                                <Badge color={MODALIDAD_COLOR[seccion.modalidad]}>{MODALIDAD_LABEL[seccion.modalidad]}</Badge>
                              ) : (
                                <Text fz="sm" c="dimmed">
                                  Sin modalidad
                                </Text>
                              )}
                              <Text fz="xs" c="dimmed" mt={4}>
                                {seccion.jornada ? (JORNADA_LABEL[seccion.jornada] ?? seccion.jornada) : 'Sin jornada'}
                              </Text>
                            </Table.Td>
                            <Table.Td>
                              <Inscritos seccion={seccion} />
                            </Table.Td>
                            <Table.Td>
                              <Button
                                variant="light"
                                size="xs"
                                leftSection={<IconUsers size={16} stroke={1.5} />}
                                onClick={() => setSeleccionId(seccion.id)}
                                aria-label={`Ver nómina de ${codigo(seccion)} sección ${letra(seccion)}`}
                              >
                                Ver nómina
                              </Button>
                            </Table.Td>
                          </Table.Tr>
                        ))}
                      </Table.Tbody>
                    </Table>
                  </Table.ScrollContainer>
                </Box>

                <Stack gap="sm" hiddenFrom="sm">
                  {secciones.map((seccion) => (
                    <Card key={seccion.id} withBorder shadow="none" padding="md">
                      <Text fw={600}>{titulo(seccion)}</Text>
                      <Text fz="sm">
                        <span className="sga-code sga-code-indigo">{codigo(seccion)}</span>{' '}
                        <Text component="span" c="dimmed" fz="sm">
                          · Sección {letra(seccion)}
                        </Text>
                      </Text>
                      <Text fz="sm" c="dimmed" mt={4}>
                        {textoBloques(seccion.bloques)}
                      </Text>
                      <Box mt="sm">
                        <Inscritos seccion={seccion} />
                      </Box>
                      <Button
                        mt="sm"
                        fullWidth
                        variant="light"
                        leftSection={<IconUsers size={16} stroke={1.5} />}
                        onClick={() => setSeleccionId(seccion.id)}
                        aria-label={`Ver nómina de ${codigo(seccion)} sección ${letra(seccion)}`}
                      >
                        Ver nómina
                      </Button>
                    </Card>
                  ))}
                </Stack>
              </>
            )}
          </Stack>
        </Card>
      )}

      <NominaDrawer seccion={seleccionada} onClose={() => setSeleccionId(null)} />
    </>
  );
}
