import { ActionIcon, Badge, Box, Button, Card, Group, Menu, Stack, Table, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconArchive, IconArchiveOff, IconDotsVertical, IconEdit, IconPlus } from '@tabler/icons-react';
import { useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { EmptyState } from '@/components/ui/EmptyState';
import { PaginacionBar } from '@/components/ui/PaginacionBar';
import { notify } from '@/lib/notify';
import { usePaginacion } from '@/lib/usePaginacion';
import type { EstadoSede, Sede } from '@/mock/types';
import { SedeFormDrawer } from './SedeFormDrawer';
import { useSedes } from './SedesContext';

const ESTADO_COLOR: Record<EstadoSede, string> = {
  activa: 'teal',
  'en mantenimiento': 'orange',
  inactiva: 'slate',
};

function AccionesSede({
  sede,
  onEditar,
  onCambiarEstado,
}: {
  sede: Sede;
  onEditar: () => void;
  onCambiarEstado: () => void;
}) {
  const inactiva = sede.estado === 'inactiva';
  return (
    <Menu>
      <Menu.Target>
        <ActionIcon aria-label={`Acciones de ${sede.nombre}`}>
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

export function SedesPage() {
  const { sedes, cambiarEstado } = useSedes();
  const [abierto, drawer] = useDisclosure(false);
  const [editando, setEditando] = useState<Sede | null>(null);
  const [pendiente, setPendiente] = useState<Sede | null>(null);
  const pag = usePaginacion(sedes, 8);

  const registrar = () => {
    setEditando(null);
    drawer.open();
  };
  const editar = (sede: Sede) => {
    setEditando(sede);
    drawer.open();
  };

  const confirmarInactivar = () => {
    if (!pendiente) return;
    cambiarEstado(pendiente.id, 'inactiva');
    notify.success({
      title: 'Sede inactivada',
      message: `${pendiente.nombre} ya no se puede elegir al programar secciones. Puedes reactivarla cuando quieras.`,
    });
    setPendiente(null);
  };

  const accionar = (sede: Sede) => {
    if (sede.estado === 'inactiva') {
      cambiarEstado(sede.id, 'activa');
      notify.success({ title: 'Sede reactivada', message: `${sede.nombre} volvió a estar activa.` });
    } else {
      setPendiente(sede);
    }
  };

  return (
    <>
      <PageHeader
        title="Sedes"
        description="Estructura institucional: las sedes donde se dictan las secciones."
        breadcrumbs={[{ label: 'Inicio', to: '/' }, { label: 'Sedes' }]}
        actions={
          <Button leftSection={<IconPlus size={18} stroke={1.5} />} onClick={registrar}>
            Registrar sede
          </Button>
        }
      />

      <Card>
        <Stack gap="md">
          <Text fz="sm" c="dimmed" role="status" aria-live="polite">
            {sedes.length} {sedes.length === 1 ? 'sede' : 'sedes'} · {sedes.filter((s) => s.estado === 'activa').length} activas
          </Text>

          {sedes.length === 0 ? (
            <EmptyState
              title="Aún no hay sedes"
              description="Registra la primera sede para poder programar secciones."
              action={
                <Button variant="light" onClick={registrar}>
                  Registrar sede
                </Button>
              }
            />
          ) : (
            <>
              {/* Escritorio y tableta: tabla de 5 columnas */}
              <Box visibleFrom="sm">
                <Table.ScrollContainer minWidth={640}>
                  <Table>
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th>Sede</Table.Th>
                        <Table.Th>Dirección</Table.Th>
                        <Table.Th>Comuna</Table.Th>
                        <Table.Th>Estado</Table.Th>
                        <Table.Th w={72} aria-label="Acciones" />
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {pag.visibles.map((sede) => (
                        <Table.Tr key={sede.id}>
                          <Table.Td>
                            <Text fz="sm" fw={500}>
                              {sede.nombre}
                            </Text>
                          </Table.Td>
                          <Table.Td>
                            <Text fz="sm">{sede.direccion}</Text>
                          </Table.Td>
                          <Table.Td>
                            <Text fz="sm">{sede.comuna}</Text>
                          </Table.Td>
                          <Table.Td>
                            <Badge color={ESTADO_COLOR[sede.estado]}>{sede.estado}</Badge>
                          </Table.Td>
                          <Table.Td>
                            <AccionesSede sede={sede} onEditar={() => editar(sede)} onCambiarEstado={() => accionar(sede)} />
                          </Table.Td>
                        </Table.Tr>
                      ))}
                    </Table.Tbody>
                  </Table>
                </Table.ScrollContainer>
              </Box>

              {/* Móvil: una card por sede */}
              <Stack gap="sm" hiddenFrom="sm">
                {pag.visibles.map((sede) => (
                  <Card key={sede.id} withBorder shadow="none" padding="md">
                    <Group justify="space-between" align="flex-start" wrap="nowrap">
                      <Stack gap={2}>
                        <Text fw={600}>{sede.nombre}</Text>
                        <Text fz="sm" c="dimmed">
                          {sede.direccion} · {sede.comuna}
                        </Text>
                      </Stack>
                      <AccionesSede sede={sede} onEditar={() => editar(sede)} onCambiarEstado={() => accionar(sede)} />
                    </Group>
                    <Badge mt="sm" color={ESTADO_COLOR[sede.estado]}>
                      {sede.estado}
                    </Badge>
                  </Card>
                ))}
              </Stack>

              <PaginacionBar
                pagina={pag.pagina}
                total={pag.total}
                desde={pag.desde}
                hasta={pag.hasta}
                cantidad={sedes.length}
                onChange={pag.setPagina}
              />
            </>
          )}
        </Stack>
      </Card>

      <SedeFormDrawer opened={abierto} onClose={drawer.close} sede={editando} />

      <ConfirmModal
        opened={pendiente !== null}
        onClose={() => setPendiente(null)}
        title="Inactivar sede"
        message={
          pendiente ? (
            <>
              <strong>{pendiente.nombre}</strong> dejará de aparecer al programar secciones nuevas. Las secciones que ya
              tiene no se modifican, y puedes reactivarla cuando quieras.
            </>
          ) : (
            ''
          )
        }
        confirmLabel="Inactivar sede"
        destructive
        onConfirm={confirmarInactivar}
      />
    </>
  );
}
