import { Badge, Box, Button, Card, Group, Select, Stack, Table, Text } from '@mantine/core';
import { IconUsers } from '@tabler/icons-react';
import { useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { CupoIndicator } from '@/features/inscripcion/CupoIndicator';
import { JORNADA_LABEL, MODALIDAD_COLOR, MODALIDAD_LABEL, type SeccionOfertada } from '@/features/oferta/types';
import { ESTADO_PERIODO_COLOR } from '@/features/periodos/estado';
import { textoBloques } from '@/lib/horas';
import { NominaDrawer } from './NominaDrawer';
import { useSeccionesDocente } from './useSeccionesDocente';

export function SeccionesDocentePage() {
  const { periodos, periodoId, setPeriodoId, periodo, propias } = useSeccionesDocente();
  const [seleccionada, setSeleccionada] = useState<SeccionOfertada | null>(null);

  return (
    <>
      <PageHeader
        title="Mis secciones"
        description="Las secciones que dictas en el período y la nómina de estudiantes de cada una."
        breadcrumbs={[{ label: 'Inicio', to: '/' }, { label: 'Mis secciones' }]}
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
              {propias.length} {propias.length === 1 ? 'sección' : 'secciones'}
            </Text>
          </Group>

          {propias.length === 0 ? (
            <EmptyState title="No tienes secciones en este período" description="Cuando el coordinador te asigne una, aparecerá aquí." />
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
                      {propias.map((s) => (
                        <Table.Tr key={s.id}>
                          <Table.Td>
                            <Text fz="sm" fw={500}>
                              {s.nombreAsignatura}
                            </Text>
                            <Text component="span" fz="xs">
                              <span className="sga-code sga-code-indigo">{s.codigoAsignatura}</span>
                              <Text component="span" fz="xs" c="dimmed">
                                {' '}
                                · Sección {s.seccion}
                              </Text>
                            </Text>
                          </Table.Td>
                          <Table.Td>
                            <Text fz="sm">{textoBloques(s.bloques)}</Text>
                            <Text fz="xs" c="dimmed">
                              {s.sala ?? 'Sin sala'} · {s.sede}
                            </Text>
                          </Table.Td>
                          <Table.Td>
                            <Badge color={MODALIDAD_COLOR[s.modalidad]}>{MODALIDAD_LABEL[s.modalidad]}</Badge>
                            <Text fz="xs" c="dimmed" mt={4}>
                              {JORNADA_LABEL[s.jornada]}
                            </Text>
                          </Table.Td>
                          <Table.Td>
                            <CupoIndicator inscritos={s.inscritosOtros} cupo={s.cupo} compact />
                          </Table.Td>
                          <Table.Td>
                            <Button
                              variant="light"
                              size="xs"
                              leftSection={<IconUsers size={16} stroke={1.5} />}
                              onClick={() => setSeleccionada(s)}
                              aria-label={`Ver nómina de ${s.codigoAsignatura} sección ${s.seccion}`}
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
                {propias.map((s) => (
                  <Card key={s.id} withBorder shadow="none" padding="md">
                    <Text fw={600}>{s.nombreAsignatura}</Text>
                    <Text fz="sm">
                      <span className="sga-code sga-code-indigo">{s.codigoAsignatura}</span>{' '}
                      <Text component="span" c="dimmed" fz="sm">
                        · Sección {s.seccion}
                      </Text>
                    </Text>
                    <Text fz="sm" c="dimmed" mt={4}>
                      {textoBloques(s.bloques)}
                    </Text>
                    <CupoIndicator mt="sm" inscritos={s.inscritosOtros} cupo={s.cupo} compact />
                    <Button
                      mt="sm"
                      fullWidth
                      variant="light"
                      leftSection={<IconUsers size={16} stroke={1.5} />}
                      onClick={() => setSeleccionada(s)}
                      aria-label={`Ver nómina de ${s.codigoAsignatura} sección ${s.seccion}`}
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

      <NominaDrawer seccion={seleccionada} onClose={() => setSeleccionada(null)} />
    </>
  );
}
