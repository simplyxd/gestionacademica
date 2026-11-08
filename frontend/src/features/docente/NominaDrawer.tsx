import { Stack, Table, Text, useMantineTheme } from '@mantine/core';
import { IconUsers } from '@tabler/icons-react';
import { DetailDrawer } from '@/components/ui/DetailDrawer';
import { EmptyState } from '@/components/ui/EmptyState';
import { textoBloques } from '@/lib/horas';
import { usePersonas } from '@/features/personas/PersonasContext';
import { nombreCompleto } from '@/mock/personas';
import type { SeccionOfertada } from '@/features/oferta/types';

interface NominaDrawerProps {
  seccion: SeccionOfertada | null;
  onClose: () => void;
}

/**
 * Nómina de estudiantes de una sección (E9-2). Los datos son de ejemplo: se muestran hasta 12 personas del
 * catálogo mock, aunque la sección tenga más inscritos.
 */
export function NominaDrawer({ seccion, onClose }: NominaDrawerProps) {
  const theme = useMantineTheme();
  const { estudiantesActivos } = usePersonas();
  const total = seccion?.inscritosOtros ?? 0;
  const lista = estudiantesActivos.slice(0, Math.min(total, estudiantesActivos.length));

  return (
    <DetailDrawer
      opened={seccion !== null}
      onClose={onClose}
      size={theme.other.layout.drawerWidthLg}
      title={seccion ? `${seccion.codigoAsignatura} · ${seccion.nombreAsignatura}` : ''}
      subtitle={seccion ? `Sección ${seccion.seccion} · ${textoBloques(seccion.bloques)}` : undefined}
    >
      {seccion && (
        <Stack gap="md">
          <Text fz="sm" c="dimmed" role="status">
            {total} {total === 1 ? 'inscrito' : 'inscritos'} de {seccion.cupo} cupos
            {lista.length < total ? ` · se muestran ${lista.length} (datos de ejemplo)` : ''}
          </Text>

          {lista.length === 0 ? (
            <EmptyState icon={IconUsers} title="Sin estudiantes inscritos" description="Cuando haya inscripciones, aparecerán aquí." />
          ) : (
            <Table.ScrollContainer minWidth={420}>
              <Table>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Estudiante</Table.Th>
                    <Table.Th>RUT</Table.Th>
                    <Table.Th>Correo</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {lista.map((e) => (
                    <Table.Tr key={e.id}>
                      <Table.Td>
                        <Text fz="sm" fw={500}>
                          {nombreCompleto(e)}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Text component="span" className="sga-code" fz="xs">
                          {e.rut}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Text fz="sm">{e.email}</Text>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Table.ScrollContainer>
          )}
        </Stack>
      )}
    </DetailDrawer>
  );
}
