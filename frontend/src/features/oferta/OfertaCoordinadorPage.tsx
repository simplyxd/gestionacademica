import { ActionIcon, Alert, Badge, Box, Button, Card, Group, Select, Stack, Table, Tabs, Text, TextInput, Tooltip } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconEdit, IconInfoCircle, IconPlus, IconSearch } from '@tabler/icons-react';
import { useMemo, useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { PaginacionBar } from '@/components/ui/PaginacionBar';
import { CupoIndicator } from '@/features/inscripcion/CupoIndicator';
import { ESTADO_PERIODO_COLOR } from '@/features/periodos/estado';
import { usePeriodos } from '@/features/periodos/PeriodosContext';
import { textoBloques } from '@/lib/horas';
import { usePaginacion } from '@/lib/usePaginacion';
import { useOfertaStore } from './OfertaContext';
import { OfertaSemanal } from './OfertaSemanal';
import { SeccionFormDrawer } from './SeccionFormDrawer';
import { JORNADA_LABEL, MODALIDAD_COLOR, MODALIDAD_LABEL, type SeccionOfertada } from './types';

const norm = (s: string) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();

function BotonEditar({ seccion, deshabilitado, onClick }: { seccion: SeccionOfertada; deshabilitado: boolean; onClick: () => void }) {
  const etiqueta = `Editar ${seccion.codigoAsignatura} sección ${seccion.seccion}`;
  return (
    <Tooltip label={deshabilitado ? 'El período está cerrado: ya no se programa' : 'Editar sección'}>
      <ActionIcon aria-label={etiqueta} disabled={deshabilitado} onClick={onClick}>
        <IconEdit size={18} stroke={1.5} />
      </ActionIcon>
    </Tooltip>
  );
}

export function OfertaCoordinadorPage() {
  const { secciones } = useOfertaStore();
  const { periodos, periodoActual } = usePeriodos();
  const [periodoId, setPeriodoId] = useState(periodoActual?.id ?? periodos[0]?.id ?? '');
  const [busqueda, setBusqueda] = useState('');
  const [abierto, drawer] = useDisclosure(false);
  const [editando, setEditando] = useState<SeccionOfertada | null>(null);

  const periodo = periodos.find((p) => p.id === periodoId);
  const cerrado = periodo?.estado === 'cerrado';

  const delPeriodo = useMemo(() => secciones.filter((s) => s.periodoId === periodoId), [secciones, periodoId]);
  const filtradas = useMemo(() => {
    const q = norm(busqueda.trim());
    return [...delPeriodo]
      .sort((a, b) => a.codigoAsignatura.localeCompare(b.codigoAsignatura) || a.seccion.localeCompare(b.seccion))
      .filter((s) => !q || [s.codigoAsignatura, s.nombreAsignatura, s.docente, s.sede].some((c) => norm(c).includes(q)));
  }, [delPeriodo, busqueda]);
  const pag = usePaginacion(filtradas, 8);

  const nueva = () => {
    setEditando(null);
    drawer.open();
  };
  const editar = (s: SeccionOfertada) => {
    setEditando(s);
    drawer.open();
  };

  return (
    <>
      <PageHeader
        title="Oferta de secciones"
        description="Organiza secciones, docentes, espacios y bloques horarios por período. Lo que programes aquí es lo que ve el estudiante en su oferta."
        breadcrumbs={[{ label: 'Inicio', to: '/' }, { label: 'Oferta de secciones' }]}
        actions={
          <Button leftSection={<IconPlus size={18} stroke={1.5} />} onClick={nueva} disabled={!periodo || cerrado}>
            Nueva sección
          </Button>
        }
      />

      <Stack gap="md">
        <Card>
          <Group justify="space-between" align="flex-end" wrap="wrap" gap="sm">
            <Group gap="sm" align="flex-end" wrap="wrap">
              <Select
                label="Período académico"
                searchable={false}
                allowDeselect={false}
                w={{ base: '100%', sm: 240 }}
                value={periodoId}
                onChange={(v) => {
                  setPeriodoId(v ?? '');
                  setBusqueda('');
                }}
                data={periodos.map((p) => ({ value: p.id, label: `${p.codigo} · ${p.nombre}` }))}
              />
              {periodo && <Badge size="lg" color={ESTADO_PERIODO_COLOR[periodo.estado]}>{periodo.estado}</Badge>}
            </Group>
            <TextInput
              placeholder="Buscar por asignatura, docente o sede"
              aria-label="Buscar secciones"
              leftSection={<IconSearch size={16} stroke={1.5} />}
              w={{ base: '100%', sm: 320 }}
              value={busqueda}
              onChange={(e) => setBusqueda(e.currentTarget.value)}
            />
          </Group>
          {cerrado && (
            <Alert mt="md" color="slate" variant="light" icon={<IconInfoCircle size={18} stroke={1.5} />} title="Período cerrado">
              Puedes consultar la oferta, pero ya no se programan ni se editan secciones.
            </Alert>
          )}
        </Card>

        <Tabs defaultValue="secciones" keepMounted={false}>
          <Tabs.List aria-label="Vistas de la oferta">
            <Tabs.Tab value="secciones">Secciones ({delPeriodo.length})</Tabs.Tab>
            <Tabs.Tab value="semana">Vista semanal</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="secciones" pt="md">
            <Card>
              <Stack gap="md">
                {filtradas.length === 0 ? (
                  <EmptyState
                    title={delPeriodo.length === 0 ? 'Este período aún no tiene secciones' : 'Sin resultados para la búsqueda'}
                    description={
                      delPeriodo.length === 0
                        ? cerrado
                          ? 'Es un período cerrado: no se programan secciones nuevas.'
                          : 'Crea la primera sección para empezar a armar la oferta.'
                        : 'Prueba con otro término o borra la búsqueda.'
                    }
                    action={
                      delPeriodo.length === 0 && !cerrado ? (
                        <Button variant="light" onClick={nueva}>
                          Nueva sección
                        </Button>
                      ) : undefined
                    }
                  />
                ) : (
                  <>
                    <Text fz="sm" c="dimmed" role="status" aria-live="polite">
                      {filtradas.length} {filtradas.length === 1 ? 'sección' : 'secciones'}
                    </Text>

                    {/* Escritorio y tableta: tabla de 6 columnas */}
                    <Box visibleFrom="sm">
                      <Table.ScrollContainer minWidth={820}>
                        <Table>
                          <Table.Thead>
                            <Table.Tr>
                              <Table.Th>Sección</Table.Th>
                              <Table.Th>Docente</Table.Th>
                              <Table.Th>Sede · jornada</Table.Th>
                              <Table.Th>Modalidad</Table.Th>
                              <Table.Th w={200}>Cupo</Table.Th>
                              <Table.Th w={72} aria-label="Acciones" />
                            </Table.Tr>
                          </Table.Thead>
                          <Table.Tbody>
                            {pag.visibles.map((s) => (
                              <Table.Tr key={s.id}>
                                <Table.Td>
                                  <Stack gap={2}>
                                    <Text fz="sm" fw={500}>
                                      {s.nombreAsignatura}
                                    </Text>
                                    <Text component="span" fz="xs">
                                      <span className="sga-code sga-code-indigo">{s.codigoAsignatura}</span>
                                      <Text component="span" fz="xs" c="dimmed">
                                        {' '}
                                        · Sección {s.seccion} · {textoBloques(s.bloques)}
                                      </Text>
                                    </Text>
                                  </Stack>
                                </Table.Td>
                                <Table.Td>
                                  <Text fz="sm">{s.docente}</Text>
                                  <Text fz="xs" c="dimmed">
                                    {s.sala ?? 'Sin sala'}
                                  </Text>
                                </Table.Td>
                                <Table.Td>
                                  <Text fz="sm">{s.sede}</Text>
                                  <Text fz="xs" c="dimmed">
                                    {JORNADA_LABEL[s.jornada]}
                                  </Text>
                                </Table.Td>
                                <Table.Td>
                                  <Badge color={MODALIDAD_COLOR[s.modalidad]}>{MODALIDAD_LABEL[s.modalidad]}</Badge>
                                </Table.Td>
                                <Table.Td>
                                  <CupoIndicator inscritos={s.inscritosOtros} cupo={s.cupo} compact />
                                </Table.Td>
                                <Table.Td>
                                  <BotonEditar seccion={s} deshabilitado={cerrado} onClick={() => editar(s)} />
                                </Table.Td>
                              </Table.Tr>
                            ))}
                          </Table.Tbody>
                        </Table>
                      </Table.ScrollContainer>
                    </Box>

                    {/* Móvil: una card por sección */}
                    <Stack gap="sm" hiddenFrom="sm">
                      {pag.visibles.map((s) => (
                        <Card key={s.id} withBorder shadow="none" padding="md">
                          <Group justify="space-between" align="flex-start" wrap="nowrap">
                            <Stack gap={2}>
                              <Text fw={600}>{s.nombreAsignatura}</Text>
                              <Text fz="sm">
                                <span className="sga-code sga-code-indigo">{s.codigoAsignatura}</span>{' '}
                                <Text component="span" c="dimmed" fz="sm">
                                  · Sección {s.seccion}
                                </Text>
                              </Text>
                            </Stack>
                            <BotonEditar seccion={s} deshabilitado={cerrado} onClick={() => editar(s)} />
                          </Group>
                          <Text fz="sm" mt="xs">
                            {s.docente} · {s.sede} · {JORNADA_LABEL[s.jornada]}
                          </Text>
                          <Text fz="sm" c="dimmed">
                            {textoBloques(s.bloques)}
                          </Text>
                          <Badge mt="xs" color={MODALIDAD_COLOR[s.modalidad]}>
                            {MODALIDAD_LABEL[s.modalidad]}
                          </Badge>
                          <CupoIndicator mt="sm" inscritos={s.inscritosOtros} cupo={s.cupo} compact />
                        </Card>
                      ))}
                    </Stack>

                    <PaginacionBar
                      pagina={pag.pagina}
                      total={pag.total}
                      desde={pag.desde}
                      hasta={pag.hasta}
                      cantidad={filtradas.length}
                      onChange={pag.setPagina}
                    />
                  </>
                )}
              </Stack>
            </Card>
          </Tabs.Panel>

          <Tabs.Panel value="semana" pt="md">
            <Stack gap="sm">
              <Text fz="sm" c="dimmed">
                Bloques de todas las secciones del período seleccionado.
              </Text>
              <OfertaSemanal secciones={delPeriodo} />
            </Stack>
          </Tabs.Panel>
        </Tabs>
      </Stack>

      <SeccionFormDrawer opened={abierto} onClose={drawer.close} seccion={editando} periodoInicial={periodoId} />
    </>
  );
}
