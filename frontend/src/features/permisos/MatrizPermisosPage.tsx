import { Button, Card, Checkbox, Group, Stack, Table, Text } from '@mantine/core';
import { IconCheck } from '@tabler/icons-react';
import { useState } from 'react';
import { ROL_LABEL, type Rol } from '@/app/navigation';
import { PageHeader } from '@/components/layout/PageHeader';
import { notify } from '@/lib/notify';
import { usePermisos, type Funcionalidad } from './PermisosContext';

const PERFILES: Rol[] = ['admin', 'coordinador', 'docente', 'estudiante'];

export function MatrizPermisosPage() {
  const { matriz, guardar } = usePermisos();
  const [borrador, setBorrador] = useState<Funcionalidad[]>(matriz);

  const hayCambios = JSON.stringify(borrador) !== JSON.stringify(matriz);

  const cambiar = (idFila: string, perfil: Rol, permitido: boolean) => {
    setBorrador((actual) =>
      actual.map((f) => (f.id === idFila ? { ...f, permisos: { ...f.permisos, [perfil]: permitido } } : f)),
    );
  };

  const confirmar = () => {
    guardar(borrador);
    notify.success({ title: 'Permisos guardados', message: 'La matriz de permisos por perfil quedó actualizada.' });
  };

  return (
    <>
      <PageHeader
        title="Permisos por perfil"
        description="Define qué perfil puede usar cada módulo. El Administrador siempre conserva el acceso a su gestión."
        breadcrumbs={[{ label: 'Inicio', to: '/' }, { label: 'Permisos' }]}
        actions={
          <Button leftSection={<IconCheck size={18} stroke={1.5} />} onClick={confirmar} disabled={!hayCambios}>
            Guardar cambios
          </Button>
        }
      />

      <Card>
        <Stack gap="md">
          <Table.ScrollContainer minWidth={640}>
            <Table>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Módulo / funcionalidad</Table.Th>
                  {PERFILES.map((p) => (
                    <Table.Th key={p} ta="center">
                      {ROL_LABEL[p]}
                    </Table.Th>
                  ))}
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {borrador.map((fila) => (
                  <Table.Tr key={fila.id}>
                    <Table.Th scope="row" fw={500}>
                      {fila.nombre}
                    </Table.Th>
                    {PERFILES.map((perfil) => (
                      <Table.Td key={perfil}>
                        <Group justify="center">
                          <Checkbox
                            aria-label={`${ROL_LABEL[perfil]}: ${fila.nombre}`}
                            checked={perfil === 'admin' ? fila.permisos.admin : fila.permisos[perfil]}
                            disabled={perfil === 'admin'}
                            onChange={(e) => cambiar(fila.id, perfil, e.currentTarget.checked)}
                          />
                        </Group>
                      </Table.Td>
                    ))}
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>

          <Text fz="sm" c="dimmed" role="status" aria-live="polite">
            {hayCambios ? 'Tienes cambios sin guardar.' : 'Sin cambios pendientes.'}
          </Text>
        </Stack>
      </Card>
    </>
  );
}
