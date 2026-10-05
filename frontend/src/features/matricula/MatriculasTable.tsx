import { ActionIcon, Box, Card, Group, Menu, Stack, Table, Text } from '@mantine/core';
import {
  IconDotsVertical,
  IconPlayerPause,
  IconSchool,
  IconUserMinus,
  type Icon,
} from '@tabler/icons-react';
import clsx from 'clsx';
import { EmptyState } from '@/components/ui/EmptyState';
import { nombreCompleto } from '@/mock/personas';
import type { MatriculaRow } from './catalogos';
import { EstadoMatriculaBadge } from './EstadoMatriculaBadge';
import classes from './MatriculasTable.module.css';
import { transicionesDe } from './rules';
import type { EstadoMatricula } from './types';

/** Acción de la UI por estado destino. «Suspender / Egresar / Retirar»: nunca «eliminar». */
export const ACCION: Record<
  Exclude<EstadoMatricula, 'vigente'>,
  { verbo: string; icon: Icon; destructiva: boolean }
> = {
  suspendida: { verbo: 'Suspender', icon: IconPlayerPause, destructiva: false },
  egresada: { verbo: 'Egresar', icon: IconSchool, destructiva: false },
  retirada: { verbo: 'Retirar', icon: IconUserMinus, destructiva: true },
};

interface MatriculasTableProps {
  rows: MatriculaRow[];
  /** Id de la matrícula recién registrada, para resaltarla. */
  destacadaId?: string | null;
  onCambiarEstado: (row: MatriculaRow, nuevo: Exclude<EstadoMatricula, 'vigente'>) => void;
}

function AccionesMenu({ row, onCambiarEstado }: { row: MatriculaRow; onCambiarEstado: MatriculasTableProps['onCambiarEstado'] }) {
  const destinos = transicionesDe(row.matricula.estado) as readonly Exclude<EstadoMatricula, 'vigente'>[];
  const nombre = nombreCompleto(row.estudiante);

  return (
    <Menu>
      <Menu.Target>
        <ActionIcon aria-label={`Cambiar estado de la matrícula de ${nombre}`}>
          <IconDotsVertical size={18} stroke={1.5} />
        </ActionIcon>
      </Menu.Target>
      <Menu.Dropdown>
        {destinos.length === 0 ? (
          <Menu.Label>Estado final: ya no admite cambios</Menu.Label>
        ) : (
          <>
            <Menu.Label>Cambiar estado</Menu.Label>
            {destinos.map((destino) => {
              const { verbo, icon: IconCmp, destructiva } = ACCION[destino];
              return (
                <Menu.Item
                  key={destino}
                  leftSection={<IconCmp size={16} stroke={1.5} />}
                  color={destructiva ? 'crimson' : undefined}
                  onClick={() => onCambiarEstado(row, destino)}
                >
                  {verbo}
                </Menu.Item>
              );
            })}
          </>
        )}
      </Menu.Dropdown>
    </Menu>
  );
}

export function MatriculasTable({ rows, destacadaId, onCambiarEstado }: MatriculasTableProps) {
  if (rows.length === 0) {
    return (
      <EmptyState
        title="Sin matrículas para estos filtros"
        description="Prueba quitar algún filtro o cambia el término de búsqueda."
      />
    );
  }

  return (
    <>
      {/* Escritorio y tableta: tabla de 6 columnas */}
      <Box visibleFrom="sm">
        <Table.ScrollContainer minWidth={760}>
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Estudiante</Table.Th>
                <Table.Th>Carrera</Table.Th>
                <Table.Th>Plan</Table.Th>
                <Table.Th>Período</Table.Th>
                <Table.Th>Estado</Table.Th>
                <Table.Th w={72} aria-label="Acciones" />
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {rows.map((row) => (
                <Table.Tr key={row.matricula.id} className={clsx(destacadaId === row.matricula.id && classes.rowNueva)}>
                  <Table.Td>
                    <Stack gap={2}>
                      <Text fz="sm" fw={500}>
                        {nombreCompleto(row.estudiante)}
                      </Text>
                      <Text component="span" className="sga-code" c="dimmed" fz="xs">
                        {row.estudiante.rut}
                      </Text>
                    </Stack>
                  </Table.Td>
                  <Table.Td>
                    <Text fz="sm" lineClamp={2}>
                      {row.carrera.nombre}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Text fz="sm">{row.plan.nombre}</Text>
                    {row.plan.estado === 'histórico' && (
                      <Text fz="xs" c="dimmed">
                        histórico
                      </Text>
                    )}
                  </Table.Td>
                  <Table.Td>
                    <Text component="span" className="sga-code sga-tnum sga-code-indigo">
                      {row.periodo.codigo}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <EstadoMatriculaBadge estado={row.matricula.estado} />
                  </Table.Td>
                  <Table.Td>
                    <Group justify="flex-end" wrap="nowrap">
                      <AccionesMenu row={row} onCambiarEstado={onCambiarEstado} />
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      </Box>

      {/* Móvil (< 768px): tabla → lista de cards */}
      <Box hiddenFrom="sm">
        <Stack gap="sm">
          {rows.map((row) => (
            <Card
              key={row.matricula.id}
              padding="md"
              className={clsx(destacadaId === row.matricula.id && classes.rowNueva)}
            >
              <Group justify="space-between" align="flex-start" wrap="nowrap">
                <Stack gap={2}>
                  <Text fw={500}>{nombreCompleto(row.estudiante)}</Text>
                  <Text component="span" className="sga-code" c="dimmed" fz="xs">
                    {row.estudiante.rut}
                  </Text>
                  <Text fz="sm" c="dimmed" mt={4}>
                    {row.carrera.nombre} · {row.plan.nombre}
                  </Text>
                </Stack>
                <AccionesMenu row={row} onCambiarEstado={onCambiarEstado} />
              </Group>
              <Group justify="space-between" mt="sm">
                <Text component="span" className="sga-code sga-tnum sga-code-indigo">
                  {row.periodo.codigo}
                </Text>
                <EstadoMatriculaBadge estado={row.matricula.estado} />
              </Group>
            </Card>
          ))}
        </Stack>
      </Box>
    </>
  );
}
