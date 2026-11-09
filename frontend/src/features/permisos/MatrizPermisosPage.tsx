import { Alert, Button, Card, Group, Skeleton, Stack, Table, Text } from '@mantine/core';
import { useEffect, useState } from 'react';
import { ROL_LABEL, type Rol } from '@/app/navigation';
import { ForbiddenPage } from '@/app/pages/ForbiddenPage';
import { PageHeader } from '@/components/layout/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { ApiError, api, type RespuestaItem } from '@/lib/api';
import { esAbort } from '@/features/auth/usuario';
import { leerMatriz, type FilaPermiso } from './matriz';

const PERFILES: Rol[] = ['admin', 'coordinador', 'docente', 'estudiante'];

export function MatrizPermisosPage() {
  const [estado, setEstado] = useState<'cargando' | 'listo' | 'error'>('cargando');
  const [filas, setFilas] = useState<FilaPermiso[]>([]);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    const control = new AbortController();
    let vivo = true;

    api
      .get<RespuestaItem<unknown>>('/permisos', { senal: control.signal })
      .then((respuesta) => {
        if (!vivo) return;
        const matriz = leerMatriz(respuesta.data);
        if (!matriz) {
          setEstado('error');
          setMensaje('No se pudo leer la matriz de permisos.');
          return;
        }
        setFilas(matriz);
        setMensaje(null);
        setEstado('listo');
      })
      .catch((causa: unknown) => {
        if (!vivo || esAbort(causa)) return;
        if (causa instanceof ApiError && causa.status === 401) return;
        setEstado('error');
        if (causa instanceof ApiError && causa.status === 403) {
          setMensaje('403');
          return;
        }
        setMensaje(causa instanceof ApiError ? causa.message : 'No se pudo cargar la matriz de permisos.');
      });

    return () => {
      vivo = false;
      control.abort();
    };
  }, [intento]);

  const reintentar = () => {
    setEstado('cargando');
    setMensaje(null);
    setIntento((n) => n + 1);
  };

  if (estado === 'error' && mensaje === '403') return <ForbiddenPage />;

  return (
    <>
      <PageHeader
        title="Permisos por perfil"
        description="Consulta qué puede hacer cada perfil. Esta matriz es fija: no se edita desde aquí."
        breadcrumbs={[{ label: 'Inicio', to: '/admin' }, { label: 'Permisos' }]}
      />

      {estado === 'cargando' ? (
        <Card>
          <Stack gap="sm" role="status" aria-busy="true" aria-label="Cargando permisos">
            <Skeleton height={18} width="40%" />
            <Skeleton height={240} radius="md" />
          </Stack>
        </Card>
      ) : estado === 'error' ? (
        <Alert color="crimson" role="alert" title="No se pudo cargar la matriz">
          <Stack gap="sm" align="flex-start">
            <Text>{mensaje}</Text>
            <Button variant="light" onClick={reintentar}>
              Reintentar
            </Button>
          </Stack>
        </Alert>
      ) : filas.length === 0 ? (
        <Card>
          <EmptyState title="No hay permisos definidos" description="Cuando el sistema publique la matriz, la verás aquí." />
        </Card>
      ) : (
        <Card>
          <Stack gap="md">
            <Table.ScrollContainer minWidth={640}>
              <Table aria-label="Permisos por perfil">
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Módulo / funcionalidad</Table.Th>
                    {PERFILES.map((perfil) => (
                      <Table.Th key={perfil} ta="center">
                        {ROL_LABEL[perfil]}
                      </Table.Th>
                    ))}
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {filas.map((fila) => (
                    <Table.Tr key={fila.id}>
                      <Table.Th scope="row" fw={500}>
                        {fila.nombre}
                      </Table.Th>
                      {PERFILES.map((perfil) => (
                        <Table.Td key={perfil} ta="center">
                          <Text fz="sm" aria-label={`${ROL_LABEL[perfil]}: ${fila.nombre}, ${fila.permisos[perfil] ? 'sí' : 'no'}`}>
                            {fila.permisos[perfil] ? 'Sí' : 'No'}
                          </Text>
                        </Table.Td>
                      ))}
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Table.ScrollContainer>
            <Group justify="space-between">
              <Text fz="sm" c="dimmed" role="status">
                Solo lectura. Los cambios de permiso se hacen en el sistema, no en esta pantalla.
              </Text>
            </Group>
          </Stack>
        </Card>
      )}
    </>
  );
}
