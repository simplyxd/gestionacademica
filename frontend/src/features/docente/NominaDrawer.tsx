import { Skeleton, Stack, Table, Text, useMantineTheme } from '@mantine/core';
import { IconUsers } from '@tabler/icons-react';
import { DetailDrawer } from '@/components/ui/DetailDrawer';
import { EmptyState } from '@/components/ui/EmptyState';
import { textoBloques } from '@/lib/horas';
import { AvisoError } from './EstadoConsulta';
import type { SeccionDocente } from './types';
import { useNomina } from './useSeccionesDocente';

interface NominaDrawerProps {
  seccion: SeccionDocente | null;
  onClose: () => void;
}

/** Nómina activa de una sección propia. El id del docente no se envía. */
export function NominaDrawer({ seccion, onClose }: NominaDrawerProps) {
  const theme = useMantineTheme();
  const { datos, cargando, error, recargar } = useNomina(seccion?.id ?? null);
  const lista = datos ?? [];
  const letra = seccion?.letra ?? '—';

  return (
    <DetailDrawer
      opened={seccion !== null}
      onClose={onClose}
      size={theme.other.layout.drawerWidthLg}
      title={seccion ? `${seccion.codigoAsignatura ?? 'Sección'} · ${seccion.nombreAsignatura ?? 'Asignatura'}` : ''}
      subtitle={seccion ? `Sección ${letra} · ${textoBloques(seccion.bloques)}` : undefined}
    >
      {seccion && (
        <Stack gap="md">
          {cargando ? (
            <Skeleton height={140} radius="md" role="status" aria-busy="true" aria-label="Cargando la nómina" />
          ) : error ? (
            <AvisoError mensaje={error} onReintentar={recargar} />
          ) : (
            <>
              <Text fz="sm" c="dimmed" role="status">
                {lista.length} {lista.length === 1 ? 'inscrito' : 'inscritos'}
                {seccion.cupoMaximo != null ? ` de ${seccion.cupoMaximo} cupos` : ''}
              </Text>

              {lista.length === 0 ? (
                <EmptyState
                  icon={IconUsers}
                  title="Sin estudiantes inscritos"
                  description="Cuando haya inscripciones activas, aparecerán aquí."
                />
              ) : (
                <Table.ScrollContainer minWidth={480}>
                  <Table>
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th>Estudiante</Table.Th>
                        <Table.Th>Código</Table.Th>
                        <Table.Th>RUT</Table.Th>
                        <Table.Th>Correo</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {lista.map((estudiante) => (
                        <Table.Tr key={estudiante.rut}>
                          <Table.Td>
                            <Text fz="sm" fw={500}>
                              {estudiante.nombre}
                            </Text>
                          </Table.Td>
                          <Table.Td>
                            <Text component="span" className="sga-code" fz="xs">
                              {estudiante.codigoEstudiante ?? '—'}
                            </Text>
                          </Table.Td>
                          <Table.Td>
                            <Text component="span" className="sga-code" fz="xs">
                              {estudiante.rut}
                            </Text>
                          </Table.Td>
                          <Table.Td>
                            <Text fz="sm">{estudiante.correo}</Text>
                          </Table.Td>
                        </Table.Tr>
                      ))}
                    </Table.Tbody>
                  </Table>
                </Table.ScrollContainer>
              )}
            </>
          )}
        </Stack>
      )}
    </DetailDrawer>
  );
}
