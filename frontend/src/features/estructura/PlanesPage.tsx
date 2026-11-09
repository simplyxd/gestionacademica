import { ActionIcon, Badge, Box, Button, Card, Group, Menu, Select, Stack, Table, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconDotsVertical, IconEdit, IconHistory, IconListDetails, IconPlus, IconRosetteDiscountCheck } from '@tabler/icons-react';
import { useMemo, useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { PaginacionBar } from '@/components/ui/PaginacionBar';
import { notify } from '@/lib/notify';
import { usePaginacion } from '@/lib/usePaginacion';
import type { EstadoPlan, PlanEstudio } from '@/mock/types';
import { useEstructura } from './EstructuraContext';
import { PlanEditorDrawer } from './PlanEditorDrawer';
import { PlanFormDrawer } from './PlanFormDrawer';
import { resumenPlan } from './rules';

const ESTADO_COLOR: Record<EstadoPlan, string> = {
  vigente: 'teal',
  histórico: 'slate',
};

function AccionesPlan({
  plan,
  onEditar,
  onAsignaturas,
  onCambiarEstado,
}: {
  plan: PlanEstudio;
  onEditar: () => void;
  onAsignaturas: () => void;
  onCambiarEstado: () => void;
}) {
  const vigente = plan.estado === 'vigente';
  return (
    <Menu>
      <Menu.Target>
        <ActionIcon aria-label={`Acciones de ${plan.nombre}`}>
          <IconDotsVertical size={18} stroke={1.5} />
        </ActionIcon>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Item leftSection={<IconEdit size={16} stroke={1.5} />} onClick={onEditar}>
          Editar datos
        </Menu.Item>
        <Menu.Item leftSection={<IconListDetails size={16} stroke={1.5} />} onClick={onAsignaturas}>
          Editar asignaturas
        </Menu.Item>
        <Menu.Item
          leftSection={
            vigente ? <IconHistory size={16} stroke={1.5} /> : <IconRosetteDiscountCheck size={16} stroke={1.5} />
          }
          onClick={onCambiarEstado}
        >
          {vigente ? 'Marcar histórico' : 'Marcar vigente'}
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}

export function PlanesPage() {
  const { carreras, planes, catalogo, cambiarEstadoPlan } = useEstructura();
  const [abierto, drawer] = useDisclosure(false);
  const [editando, setEditando] = useState<PlanEstudio | null>(null);
  const [editorId, setEditorId] = useState<string | null>(null);
  const [carreraId, setCarreraId] = useState<string | null>(null);

  const filtrados = useMemo(
    () => (carreraId ? planes.filter((p) => p.carreraId === carreraId) : planes),
    [planes, carreraId],
  );
  const pag = usePaginacion(filtrados, 8);

  const carreraDe = (p: PlanEstudio) => carreras.find((c) => c.id === p.carreraId);
  const opcionesCarreras = useMemo(
    () => carreras.map((c) => ({ value: c.id, label: `${c.codigo} · ${c.nombre}` })),
    [carreras],
  );

  const crear = () => {
    setEditando(null);
    drawer.open();
  };
  const editar = (plan: PlanEstudio) => {
    setEditando(plan);
    drawer.open();
  };

  const cambiarEstado = (plan: PlanEstudio) => {
    const destino: EstadoPlan = plan.estado === 'vigente' ? 'histórico' : 'vigente';
    const r = cambiarEstadoPlan(plan.id, destino);
    if (!r.ok) {
      notify.error({ title: 'No se pudo marcar como vigente', message: r.errores.estado ?? 'Revisa los datos del plan.' });
      return;
    }
    notify.success({
      title: destino === 'vigente' ? 'Plan vigente' : 'Plan histórico',
      message:
        destino === 'vigente'
          ? `${plan.nombre} es ahora el plan de los nuevos ingresos de ${carreraDe(plan)?.nombre ?? 'la carrera'}.`
          : `${plan.nombre} queda para las cohortes anteriores. Sus matrículas no cambian.`,
    });
  };

  const resumen = (plan: PlanEstudio) => {
    const r = resumenPlan(plan, catalogo);
    return `${r.asignaturas} ${r.asignaturas === 1 ? 'asignatura' : 'asignaturas'} · ${r.creditos} créditos`;
  };

  return (
    <>
      <PageHeader
        title="Planes de estudio"
        description="Las asignaturas que componen cada carrera, semestre a semestre. Solo un plan vigente por carrera."
        breadcrumbs={[{ label: 'Inicio', to: '/' }, { label: 'Planes de estudio' }]}
        actions={
          <Button leftSection={<IconPlus size={18} stroke={1.5} />} onClick={crear}>
            Crear plan
          </Button>
        }
      />

      <Card>
        <Stack gap="md">
          <Group justify="space-between" align="flex-end" wrap="wrap" gap="sm">
            <Select
              label="Carrera"
              placeholder="Todas las carreras"
              clearable
              data={opcionesCarreras}
              value={carreraId}
              onChange={setCarreraId}
              w={{ base: '100%', sm: 320 }}
            />
            <Text fz="sm" c="dimmed" role="status" aria-live="polite">
              {filtrados.length} {filtrados.length === 1 ? 'plan' : 'planes'} ·{' '}
              {filtrados.filter((p) => p.estado === 'vigente').length} vigentes
            </Text>
          </Group>

          {filtrados.length === 0 ? (
            <EmptyState
              title={carreraId ? 'Esta carrera aún no tiene planes' : 'Aún no hay planes de estudio'}
              description="Crea un plan y luego agrega sus asignaturas por semestre."
              action={
                <Button variant="light" onClick={crear}>
                  Crear plan
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
                        <Table.Th>Plan</Table.Th>
                        <Table.Th>Carrera</Table.Th>
                        <Table.Th>Estado</Table.Th>
                        <Table.Th>Asignaturas</Table.Th>
                        <Table.Th w={72} aria-label="Acciones" />
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {pag.visibles.map((plan) => (
                        <Table.Tr key={plan.id}>
                          <Table.Td>
                            <Text fz="sm" fw={500}>
                              {plan.nombre}
                            </Text>
                          </Table.Td>
                          <Table.Td>
                            <Text fz="sm">{carreraDe(plan)?.nombre ?? '—'}</Text>
                          </Table.Td>
                          <Table.Td>
                            <Badge color={ESTADO_COLOR[plan.estado]}>{plan.estado}</Badge>
                          </Table.Td>
                          <Table.Td>
                            <Text fz="sm" className="sga-tnum">
                              {resumen(plan)}
                            </Text>
                          </Table.Td>
                          <Table.Td>
                            <AccionesPlan
                              plan={plan}
                              onEditar={() => editar(plan)}
                              onAsignaturas={() => setEditorId(plan.id)}
                              onCambiarEstado={() => cambiarEstado(plan)}
                            />
                          </Table.Td>
                        </Table.Tr>
                      ))}
                    </Table.Tbody>
                  </Table>
                </Table.ScrollContainer>
              </Box>

              {/* Móvil: una card por plan */}
              <Stack gap="sm" hiddenFrom="sm">
                {pag.visibles.map((plan) => (
                  <Card key={plan.id} withBorder shadow="none" padding="md">
                    <Group justify="space-between" align="flex-start" wrap="nowrap">
                      <Stack gap={2}>
                        <Text fw={600}>{plan.nombre}</Text>
                        <Text fz="sm" c="dimmed">
                          {carreraDe(plan)?.nombre ?? '—'}
                        </Text>
                        <Text fz="sm" c="dimmed" className="sga-tnum">
                          {resumen(plan)}
                        </Text>
                      </Stack>
                      <AccionesPlan
                        plan={plan}
                        onEditar={() => editar(plan)}
                        onAsignaturas={() => setEditorId(plan.id)}
                        onCambiarEstado={() => cambiarEstado(plan)}
                      />
                    </Group>
                    <Badge mt="sm" color={ESTADO_COLOR[plan.estado]}>
                      {plan.estado}
                    </Badge>
                  </Card>
                ))}
              </Stack>

              <PaginacionBar
                pagina={pag.pagina}
                total={pag.total}
                desde={pag.desde}
                hasta={pag.hasta}
                cantidad={filtrados.length}
                onChange={pag.setPagina}
              />
            </>
          )}
        </Stack>
      </Card>

      <PlanFormDrawer opened={abierto} onClose={drawer.close} plan={editando} carreraInicial={carreraId} />
      <PlanEditorDrawer planId={editorId} onClose={() => setEditorId(null)} />
    </>
  );
}
