import { ActionIcon, Badge, Box, Button, Card, Group, Menu, Stack, Table, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconArchive, IconArchiveOff, IconDotsVertical, IconEdit, IconPlus } from '@tabler/icons-react';
import { useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { EmptyState } from '@/components/ui/EmptyState';
import { PaginacionBar } from '@/components/ui/PaginacionBar';
import { JORNADA_LABEL, MODALIDAD_LABEL } from '@/features/oferta/types';
import { notify } from '@/lib/notify';
import { usePaginacion } from '@/lib/usePaginacion';
import type { Carrera, EstadoCarrera } from '@/mock/types';
import { CarreraFormDrawer } from './CarreraFormDrawer';
import { useEstructura } from './EstructuraContext';
import { useSedes } from './SedesContext';

const ESTADO_COLOR: Record<EstadoCarrera, string> = {
  activa: 'teal',
  inactiva: 'slate',
};

const duracion = (n: number) => `${n} ${n === 1 ? 'semestre' : 'semestres'}`;

function AccionesCarrera({
  carrera,
  onEditar,
  onCambiarEstado,
}: {
  carrera: Carrera;
  onEditar: () => void;
  onCambiarEstado: () => void;
}) {
  const inactiva = carrera.estado === 'inactiva';
  return (
    <Menu>
      <Menu.Target>
        <ActionIcon aria-label={`Acciones de ${carrera.nombre}`}>
          <IconDotsVertical size={18} stroke={1.5} />
        </ActionIcon>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Item leftSection={<IconEdit size={16} stroke={1.5} />} onClick={onEditar}>
          Editar
        </Menu.Item>
        <Menu.Item
          leftSection={inactiva ? <IconArchiveOff size={16} stroke={1.5} /> : <IconArchive size={16} stroke={1.5} />}
          color={inactiva ? undefined : 'crimson'}
          onClick={onCambiarEstado}
        >
          {inactiva ? 'Reactivar' : 'Inactivar'}
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}

export function CarrerasPage() {
  const { carreras, cambiarEstadoCarrera } = useEstructura();
  const { sedes } = useSedes();
  const [abierto, drawer] = useDisclosure(false);
  const [editando, setEditando] = useState<Carrera | null>(null);
  const [pendiente, setPendiente] = useState<Carrera | null>(null);
  const pag = usePaginacion(carreras, 8);

  const nombresSedes = (c: Carrera) => c.sedes.map((id) => sedes.find((s) => s.id === id)?.nombre ?? id).join(', ');

  const registrar = () => {
    setEditando(null);
    drawer.open();
  };
  const editar = (carrera: Carrera) => {
    setEditando(carrera);
    drawer.open();
  };

  const confirmarInactivar = () => {
    if (!pendiente) return;
    cambiarEstadoCarrera(pendiente.id, 'inactiva');
    notify.success({
      title: 'Carrera inactivada',
      message: `${pendiente.nombre} ya no se puede elegir al matricular. Puedes reactivarla cuando quieras.`,
    });
    setPendiente(null);
  };

  const accionar = (carrera: Carrera) => {
    if (carrera.estado === 'inactiva') {
      cambiarEstadoCarrera(carrera.id, 'activa');
      notify.success({ title: 'Carrera reactivada', message: `${carrera.nombre} volvió a estar activa.` });
    } else {
      setPendiente(carrera);
    }
  };

  return (
    <>
      <PageHeader
        title="Carreras"
        description="Estructura institucional: las carreras que se imparten, en qué sedes y con qué duración."
        breadcrumbs={[{ label: 'Inicio', to: '/' }, { label: 'Carreras' }]}
        actions={
          <Button leftSection={<IconPlus size={18} stroke={1.5} />} onClick={registrar}>
            Registrar carrera
          </Button>
        }
      />

      <Card>
        <Stack gap="md">
          <Text fz="sm" c="dimmed" role="status" aria-live="polite">
            {carreras.length} {carreras.length === 1 ? 'carrera' : 'carreras'} ·{' '}
            {carreras.filter((c) => c.estado === 'activa').length} activas
          </Text>

          {carreras.length === 0 ? (
            <EmptyState
              title="Aún no hay carreras"
              description="Registra la primera carrera para poder crear sus planes de estudio."
              action={
                <Button variant="light" onClick={registrar}>
                  Registrar carrera
                </Button>
              }
            />
          ) : (
            <>
              {/* Escritorio y tableta: tabla de 7 columnas */}
              <Box visibleFrom="sm">
                <Table.ScrollContainer minWidth={820}>
                  <Table>
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th>Carrera</Table.Th>
                        <Table.Th>Sedes</Table.Th>
                        <Table.Th>Modalidad</Table.Th>
                        <Table.Th>Jornada</Table.Th>
                        <Table.Th>Duración</Table.Th>
                        <Table.Th w={110}>Estado</Table.Th>
                        <Table.Th w={72} aria-label="Acciones" />
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {pag.visibles.map((carrera) => (
                        <Table.Tr key={carrera.id}>
                          <Table.Td>
                            <Text fz="sm" fw={600}>
                              {carrera.codigo}
                            </Text>
                            <Text fz="sm">{carrera.nombre}</Text>
                          </Table.Td>
                          <Table.Td>
                            <Text fz="sm">{nombresSedes(carrera)}</Text>
                          </Table.Td>
                          <Table.Td>
                            <Text fz="sm">{MODALIDAD_LABEL[carrera.modalidad]}</Text>
                          </Table.Td>
                          <Table.Td>
                            <Text fz="sm">{JORNADA_LABEL[carrera.jornada]}</Text>
                          </Table.Td>
                          <Table.Td>
                            <Text fz="sm" className="sga-tnum" style={{ whiteSpace: 'nowrap' }}>
                              {duracion(carrera.duracionSemestres)}
                            </Text>
                          </Table.Td>
                          <Table.Td>
                            <Badge color={ESTADO_COLOR[carrera.estado]} style={{ flexShrink: 0 }}>
                              {carrera.estado}
                            </Badge>
                          </Table.Td>
                          <Table.Td>
                            <AccionesCarrera
                              carrera={carrera}
                              onEditar={() => editar(carrera)}
                              onCambiarEstado={() => accionar(carrera)}
                            />
                          </Table.Td>
                        </Table.Tr>
                      ))}
                    </Table.Tbody>
                  </Table>
                </Table.ScrollContainer>
              </Box>

              {/* Móvil: una card por carrera */}
              <Stack gap="sm" hiddenFrom="sm">
                {pag.visibles.map((carrera) => (
                  <Card key={carrera.id} withBorder shadow="none" padding="md">
                    <Group justify="space-between" align="flex-start" wrap="nowrap">
                      <Stack gap={2}>
                        <Text fw={600}>
                          {carrera.codigo} · {carrera.nombre}
                        </Text>
                        <Text fz="sm" c="dimmed">
                          {nombresSedes(carrera)}
                        </Text>
                        <Text fz="sm" c="dimmed">
                          {MODALIDAD_LABEL[carrera.modalidad]} · {JORNADA_LABEL[carrera.jornada]} ·{' '}
                          {duracion(carrera.duracionSemestres)}
                        </Text>
                      </Stack>
                      <AccionesCarrera
                        carrera={carrera}
                        onEditar={() => editar(carrera)}
                        onCambiarEstado={() => accionar(carrera)}
                      />
                    </Group>
                    <Badge mt="sm" color={ESTADO_COLOR[carrera.estado]}>
                      {carrera.estado}
                    </Badge>
                  </Card>
                ))}
              </Stack>

              <PaginacionBar
                pagina={pag.pagina}
                total={pag.total}
                desde={pag.desde}
                hasta={pag.hasta}
                cantidad={carreras.length}
                onChange={pag.setPagina}
              />
            </>
          )}
        </Stack>
      </Card>

      <CarreraFormDrawer opened={abierto} onClose={drawer.close} carrera={editando} />

      <ConfirmModal
        opened={pendiente !== null}
        onClose={() => setPendiente(null)}
        title="Inactivar carrera"
        message={
          pendiente ? (
            <>
              <strong>{pendiente.nombre}</strong> dejará de aparecer al matricular estudiantes nuevos. Las matrículas y
              planes que ya tiene no se modifican, y puedes reactivarla cuando quieras.
            </>
          ) : (
            ''
          )
        }
        confirmLabel="Inactivar carrera"
        destructive
        onConfirm={confirmarInactivar}
      />
    </>
  );
}
