import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Card,
  Chip,
  Group,
  Stack,
  Switch,
  Table,
  Text,
  TextInput,
  Tooltip,
} from '@mantine/core';
import { IconChevronRight, IconLock, IconSearch } from '@tabler/icons-react';
import clsx from 'clsx';
import { EmptyState } from '@/components/ui/EmptyState';
import { CupoIndicator } from '@/features/inscripcion/CupoIndicator';
import { textoBloques } from '@/lib/horas';
import { asignaturaPorCodigo, estudiante } from '@/mocks/sga';
import classes from './OfertaSecciones.module.css';
import {
  JORNADA_LABEL,
  MODALIDAD_COLOR,
  MODALIDAD_LABEL,
  type Jornada,
  type Modalidad,
} from './types';
import { DIAS_FILTRO, type FilaOferta, type useOferta } from './useOferta';

const MODALIDADES: Modalidad[] = ['presencial', 'semipresencial', 'online'];
const JORNADAS: Jornada[] = ['diurna', 'vespertina'];

/** Por debajo del Drawer (200): estos globos viven en la página, no en el panel. */
const Z_GLOBO = 100;

interface OfertaSeccionesProps {
  oferta: ReturnType<typeof useOferta>;
  onVerSeccion: (fila: FilaOferta) => void;
}

/** Nombres de los prerrequisitos que faltan, para el globo de ayuda del candado. */
function nombresPendientes(codigos: string[]) {
  return codigos.map((c) => asignaturaPorCodigo(c)?.nombre ?? c).join(', ');
}

function DistintivosFila({ fila }: { fila: FilaOferta }) {
  return (
    <>
      {fila.estaInscrita && <Badge color="indigo" size="sm">Inscrita</Badge>}
      {fila.aprobadaEn && (
        <Badge color="teal" variant="outline" size="sm">
          Aprobada en {fila.aprobadaEn}
        </Badge>
      )}
      {fila.fueraDelPlan && (
        <Badge color="slate" variant="outline" size="sm">
          Fuera de tu plan
        </Badge>
      )}
    </>
  );
}

function CandadoPrerrequisito({ fila }: { fila: FilaOferta }) {
  if (fila.prerrequisitosPendientes.length === 0) return null;
  return (
    <Tooltip label={`Te falta aprobar ${nombresPendientes(fila.prerrequisitosPendientes)}`} zIndex={Z_GLOBO}>
      <Box component="span" c="crimson" className={classes.candado}>
        <IconLock size={15} stroke={2} aria-label="Con prerrequisito pendiente" />
      </Box>
    </Tooltip>
  );
}

export function OfertaSecciones({ oferta, onVerSeccion }: OfertaSeccionesProps) {
  const {
    busqueda,
    setBusqueda,
    verTodaLaOferta,
    setVerTodaLaOferta,
    soloConCupo,
    setSoloConCupo,
    modalidades,
    setModalidades,
    jornadas,
    setJornadas,
    dias,
    setDias,
    resultados,
    hayFiltrosActivos,
    limpiarFiltros,
  } = oferta;

  const vacia = resultados.length === 0;

  return (
    <Stack gap="md">
      <Group justify="space-between" align="flex-start" wrap="wrap" gap="sm">
        <TextInput
          placeholder="Buscar por código, asignatura o docente"
          leftSection={<IconSearch size={16} stroke={1.5} />}
          value={busqueda}
          onChange={(e) => setBusqueda(e.currentTarget.value)}
          w={{ base: '100%', sm: 340 }}
          aria-label="Buscar en la oferta"
        />
        <Stack gap="xs">
          <Switch
            label="Ver toda la oferta"
            description="Incluye asignaturas que no están en tu plan"
            checked={verTodaLaOferta}
            onChange={(e) => setVerTodaLaOferta(e.currentTarget.checked)}
          />
          <Switch
            label="Solo con cupo"
            description="Esconde las secciones llenas"
            checked={soloConCupo}
            onChange={(e) => setSoloConCupo(e.currentTarget.checked)}
          />
        </Stack>
      </Group>

      <Stack gap="xs">
        <Chip.Group multiple value={modalidades} onChange={setModalidades}>
          <Group gap="xs">
            <Text fz="sm" c="dimmed" className={classes.grupoLabel}>Modalidad</Text>
            {MODALIDADES.map((m) => (
              <Chip key={m} value={m} color={MODALIDAD_COLOR[m]} variant="light" size="sm">
                {MODALIDAD_LABEL[m]}
              </Chip>
            ))}
          </Group>
        </Chip.Group>

        <Chip.Group multiple value={jornadas} onChange={setJornadas}>
          <Group gap="xs">
            <Text fz="sm" c="dimmed" className={classes.grupoLabel}>Jornada</Text>
            {JORNADAS.map((j) => (
              <Chip key={j} value={j} color="navy" variant="light" size="sm">
                {JORNADA_LABEL[j]}
              </Chip>
            ))}
          </Group>
        </Chip.Group>

        <Chip.Group multiple value={dias} onChange={setDias}>
          <Group gap="xs">
            <Text fz="sm" c="dimmed" className={classes.grupoLabel}>Día</Text>
            {DIAS_FILTRO.map((d) => (
              <Chip key={d.value} value={d.value} color="navy" variant="light" size="sm">
                {d.label}
              </Chip>
            ))}
          </Group>
        </Chip.Group>
      </Stack>

      <Group justify="space-between" gap="sm">
        <Text fz="sm" c="dimmed">
          {resultados.length === 1 ? '1 sección' : `${resultados.length} secciones`}
          {verTodaLaOferta ? ' de todo el período' : ` de tu plan ${estudiante.plan}`}
        </Text>
        {/* Con la lista vacía la acción vive en el EmptyState, no acá. */}
        {hayFiltrosActivos && !vacia && (
          <Button variant="subtle" size="compact-sm" onClick={limpiarFiltros}>
            Limpiar filtros
          </Button>
        )}
      </Group>

      {vacia ? (
        <EmptyState
          title="Ninguna sección pasa estos filtros"
          description="Prueba quitar un filtro o cambiar el término de búsqueda."
          action={
            hayFiltrosActivos ? (
              <Button variant="light" onClick={limpiarFiltros}>
                Limpiar filtros
              </Button>
            ) : undefined
          }
        />
      ) : (
        <>
          {/* Escritorio: tabla */}
          <Box visibleFrom="sm">
            <Table.ScrollContainer minWidth={760}>
              <Table highlightOnHover verticalSpacing="sm">
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Asignatura</Table.Th>
                    <Table.Th>Sección</Table.Th>
                    <Table.Th>Horario</Table.Th>
                    <Table.Th>Docente</Table.Th>
                    <Table.Th w={180}>Cupo</Table.Th>
                    <Table.Th w={56} aria-label="Ver detalle" />
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {resultados.map((fila) => {
                    const { seccion } = fila;
                    return (
                      <Table.Tr key={seccion.id} className={fila.aprobadaEn || fila.fueraDelPlan ? classes.atenuada : undefined}>
                        <Table.Td>
                          <Stack gap={2}>
                            <Group gap={6} wrap="nowrap">
                              <Text component="span" className="sga-code" c="indigo">
                                {seccion.codigoAsignatura}
                              </Text>
                              <CandadoPrerrequisito fila={fila} />
                            </Group>
                            <Text fz="sm" fw={500}>{seccion.nombreAsignatura}</Text>
                            <Group gap={4} wrap="wrap">
                              <DistintivosFila fila={fila} />
                            </Group>
                          </Stack>
                        </Table.Td>
                        <Table.Td>
                          <Text fz="sm">{seccion.seccion}</Text>
                          <Text fz="xs" c="dimmed">{JORNADA_LABEL[seccion.jornada]}</Text>
                          <Badge color={MODALIDAD_COLOR[seccion.modalidad]} size="sm" mt={4}>
                            {MODALIDAD_LABEL[seccion.modalidad]}
                          </Badge>
                        </Table.Td>
                        <Table.Td>
                          <Text fz="sm" className="sga-tnum">{textoBloques(seccion.bloques)}</Text>
                          {seccion.sala && <Text fz="xs" c="dimmed">{seccion.sala}</Text>}
                        </Table.Td>
                        <Table.Td>
                          <Text fz="sm">{seccion.docente}</Text>
                        </Table.Td>
                        <Table.Td>
                          <CupoIndicator inscritos={fila.inscritos} cupo={fila.cupo} compact />
                        </Table.Td>
                        <Table.Td>
                          <Tooltip label="Ver detalle" zIndex={Z_GLOBO}>
                            <ActionIcon
                              variant="subtle"
                              onClick={() => onVerSeccion(fila)}
                              aria-label={`Ver ${seccion.codigoAsignatura} sección ${seccion.seccion}`}
                            >
                              <IconChevronRight size={18} stroke={1.5} />
                            </ActionIcon>
                          </Tooltip>
                        </Table.Td>
                      </Table.Tr>
                    );
                  })}
                </Table.Tbody>
              </Table>
            </Table.ScrollContainer>
          </Box>

          {/* Teléfono: tarjetas */}
          <Box hiddenFrom="sm">
            <Stack gap="sm">
              {resultados.map((fila) => {
                const { seccion } = fila;
                return (
                  <Card
                    key={seccion.id}
                    padding="md"
                    component="button"
                    type="button"
                    onClick={() => onVerSeccion(fila)}
                    className={clsx(classes.tarjeta, (fila.aprobadaEn || fila.fueraDelPlan) && classes.atenuada)}
                  >
                    <Stack gap="sm">
                      <Group justify="space-between" wrap="nowrap" align="flex-start">
                        <Stack gap={2} align="flex-start">
                          <Group gap={6} wrap="nowrap">
                            <Text component="span" className="sga-code" c="indigo">
                              {seccion.codigoAsignatura} · {seccion.seccion}
                            </Text>
                            <CandadoPrerrequisito fila={fila} />
                          </Group>
                          <Text fw={500} ta="left">{seccion.nombreAsignatura}</Text>
                          <Text fz="sm" c="dimmed" ta="left">
                            {seccion.docente} · {JORNADA_LABEL[seccion.jornada]}
                          </Text>
                        </Stack>
                        <IconChevronRight size={18} stroke={1.5} aria-hidden />
                      </Group>

                      <Text fz="sm" className="sga-tnum" ta="left">
                        {textoBloques(seccion.bloques)}
                        {seccion.sala ? ` · ${seccion.sala}` : ''}
                      </Text>

                      <Group gap={4} wrap="wrap">
                        <Badge color={MODALIDAD_COLOR[seccion.modalidad]} size="sm">
                          {MODALIDAD_LABEL[seccion.modalidad]}
                        </Badge>
                        <DistintivosFila fila={fila} />
                      </Group>

                      <CupoIndicator inscritos={fila.inscritos} cupo={fila.cupo} />
                    </Stack>
                  </Card>
                );
              })}
            </Stack>
          </Box>
        </>
      )}
    </Stack>
  );
}
