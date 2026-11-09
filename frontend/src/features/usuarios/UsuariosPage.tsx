import {
  ActionIcon,
  Alert,
  Badge,
  Box,
  Button,
  Card,
  Group,
  Modal,
  Select,
  SimpleGrid,
  Skeleton,
  Stack,
  Table,
  Text,
  TextInput,
  Tooltip,
} from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { IconKey, IconPencil, IconPlus, IconUserCheck, IconUserOff } from '@tabler/icons-react';
import clsx from 'clsx';
import { useEffect, useMemo, useState } from 'react';
import { ForbiddenPage } from '@/app/pages/ForbiddenPage';
import { PageHeader } from '@/components/layout/PageHeader';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { EmptyState } from '@/components/ui/EmptyState';
import { PaginacionBar } from '@/components/ui/PaginacionBar';
import { useAuth } from '@/features/auth/AuthContext';
import { ApiError, api, type RespuestaItem, type RespuestaLista } from '@/lib/api';
import { notify } from '@/lib/notify';
import { usePaginacionServidor } from '@/lib/usePaginacionServidor';
import classes from './UsuariosPage.module.css';
import { UsuarioFormDrawer } from './UsuarioFormDrawer';
import {
  ESTADOS_USUARIO,
  ROLES_USUARIO,
  esAbort,
  leerClaveTemporal,
  normalizarListado,
  normalizarSedes,
  rangoPagina,
  textoPerfil,
  type CuerpoUsuario,
  type OpcionSede,
  type UsuarioLista,
} from './users';

const LIMITE = 20;

function EstadoBadge({ usuario }: { usuario: UsuarioLista }) {
  return <Badge color={usuario.estado === 'activo' ? 'teal' : 'slate'}>{usuario.estado === 'activo' ? 'Activo' : 'Desactivado'}</Badge>;
}

export function UsuariosPage() {
  const { usuario: actor, refrescarUsuario } = useAuth();
  const [rol, setRol] = useState<string | null>(null);
  const [estado, setEstado] = useState<string | null>(null);
  const [q, setQ] = useState('');
  const [qAplicada] = useDebouncedValue(q.trim(), 300);
  const filtros = useMemo(
    () => ({
      ...(rol ? { rol } : {}),
      ...(estado ? { estado } : {}),
      ...(qAplicada ? { q: qAplicada } : {}),
    }),
    [rol, estado, qAplicada],
  );
  const pag = usePaginacionServidor<unknown>({ ruta: '/usuarios', limite: LIMITE, filtros });
  const usuarios = useMemo(() => normalizarListado(pag.datos), [pag.datos]);
  const rango = rangoPagina(pag.pagina, pag.limite, pag.total);
  const errorLista = pag.error && pag.error.status !== 401 ? pag.error : null;
  const omitidas = !pag.cargando && pag.datos.length > usuarios.length ? pag.datos.length - usuarios.length : 0;

  const [sedes, setSedes] = useState<OpcionSede[]>([]);
  const [sedesEstado, setSedesEstado] = useState<'cargando' | 'listo' | 'error'>('cargando');
  const [errorSedes, setErrorSedes] = useState<string | null>(null);

  const [formOpened, setFormOpened] = useState(false);
  const [editing, setEditing] = useState<UsuarioLista | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [pendienteEstado, setPendienteEstado] = useState<UsuarioLista | null>(null);
  const [cambiandoEstado, setCambiandoEstado] = useState(false);
  const [pendienteClave, setPendienteClave] = useState<UsuarioLista | null>(null);
  const [generandoClave, setGenerandoClave] = useState(false);
  const [claveTemporal, setClaveTemporal] = useState<{ id: string; nombre: string; clave: string | null } | null>(null);

  useEffect(() => {
    const control = new AbortController();
    api
      .get<RespuestaLista<unknown>>('/sedes', { query: { limit: 100 }, senal: control.signal })
      .then((respuesta) => {
        setSedes(normalizarSedes(respuesta.data));
        setErrorSedes(null);
        setSedesEstado('listo');
      })
      .catch((causa: unknown) => {
        if (esAbort(causa)) return;
        if (causa instanceof ApiError && causa.status === 401) return;
        setSedesEstado('error');
        setErrorSedes(causa instanceof ApiError ? causa.message : 'No se pudieron cargar las sedes.');
      });
    return () => control.abort();
  }, []);

  const abrirFormulario = (cuenta: UsuarioLista | null) => {
    setEditing(cuenta);
    setFormOpened(true);
  };

  const guardar = async (cuerpo: CuerpoUsuario) => {
    setGuardando(true);
    try {
      if (editing) {
        await api.patch(`/usuarios/${encodeURIComponent(editing.id)}`, cuerpo);
        notify.success({ title: 'Cuenta actualizada', message: `La cuenta de ${cuerpo.nombre} quedó actualizada.` });
      } else {
        await api.post('/usuarios', cuerpo);
        notify.success({ title: 'Cuenta creada', message: `La cuenta de ${cuerpo.nombre} quedó creada.` });
      }
      setFormOpened(false);
      setEditing(null);
      pag.recargar();
    } finally {
      setGuardando(false);
    }
  };

  const confirmarEstado = async () => {
    if (!pendienteEstado) return;
    const siguiente = pendienteEstado.estado === 'activo' ? 'inactivo' : 'activo';
    setCambiandoEstado(true);
    try {
      await api.patch(`/usuarios/${encodeURIComponent(pendienteEstado.id)}/estado`, { estado: siguiente });
      notify.success({
        title: siguiente === 'inactivo' ? 'Cuenta desactivada' : 'Cuenta activada',
        message:
          siguiente === 'inactivo'
            ? `La cuenta de ${pendienteEstado.nombre} quedó desactivada.`
            : `La cuenta de ${pendienteEstado.nombre} quedó activa de nuevo.`,
      });
      setPendienteEstado(null);
      pag.recargar();
    } catch (causa) {
      if (causa instanceof ApiError && causa.status === 401) return;
      notify.error({
        title: 'No se pudo cambiar el estado',
        message: causa instanceof ApiError ? causa.message : 'Inténtalo de nuevo.',
      });
    } finally {
      setCambiandoEstado(false);
    }
  };

  const confirmarClave = async () => {
    if (!pendienteClave) return;
    setGenerandoClave(true);
    try {
      const respuesta = await api.post<RespuestaItem<unknown>>(`/usuarios/${encodeURIComponent(pendienteClave.id)}/restablecer-clave`);
      setClaveTemporal({ id: pendienteClave.id, nombre: pendienteClave.nombre, clave: leerClaveTemporal(respuesta.data) });
      setPendienteClave(null);
      pag.recargar();
    } catch (causa) {
      if (causa instanceof ApiError && causa.status === 401) return;
      notify.error({
        title: 'No se pudo restablecer la clave',
        message: causa instanceof ApiError ? causa.message : 'Inténtalo de nuevo.',
      });
    } finally {
      setGenerandoClave(false);
    }
  };

  const copiarClave = async () => {
    if (!claveTemporal?.clave) return;
    try {
      await navigator.clipboard.writeText(claveTemporal.clave);
      notify.success({ title: 'Clave copiada', message: 'Pégala en un canal seguro. No se vuelve a mostrar.' });
    } catch {
      notify.error({ title: 'No se pudo copiar', message: 'Selecciónala y cópiala a mano.' });
    }
  };

  const cerrarClave = () => {
    const eraYo = claveTemporal?.id === actor.id;
    setClaveTemporal(null);
    if (!eraYo) return;
    void refrescarUsuario().catch((causa: unknown) => {
      if (causa instanceof ApiError && causa.status === 401) return;
      notify.error({
        title: 'No se pudo actualizar tu sesión',
        message: causa instanceof ApiError ? causa.message : 'Inténtalo de nuevo.',
      });
    });
  };

  const limpiarFiltros = () => {
    setRol(null);
    setEstado(null);
    setQ('');
  };
  const hayFiltros = Boolean(rol || estado || q.trim());

  if (!pag.cargando && errorLista?.status === 403) return <ForbiddenPage />;

  return (
    <>
      <PageHeader
        title="Usuarios"
        description="Administra las cuentas de acceso. El perfil de docentes y estudiantes se completa en el mismo formulario."
        breadcrumbs={[{ label: 'Inicio', to: '/admin' }, { label: 'Usuarios' }]}
        actions={
          <Button leftSection={<IconPlus size={18} stroke={1.5} />} onClick={() => abrirFormulario(null)}>
            Crear usuario
          </Button>
        }
      />

      <Stack gap="md">
        <Card>
          <Group justify="space-between" mb="md">
            <Text fw={600}>Filtrar usuarios</Text>
            <Button variant="subtle" color="slate" size="sm" onClick={limpiarFiltros} disabled={!hayFiltros}>
              Limpiar filtros
            </Button>
          </Group>
          <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
            <TextInput
              label="Buscar"
              placeholder="Nombre, correo o RUT"
              value={q}
              onChange={(event) => setQ(event.currentTarget.value)}
            />
            <Select
              label="Rol"
              placeholder="Todos los roles"
              data={ROLES_USUARIO}
              value={rol}
              onChange={setRol}
              clearable
              searchable={false}
            />
            <Select
              label="Estado"
              placeholder="Todos los estados"
              data={[...ESTADOS_USUARIO]}
              value={estado}
              onChange={setEstado}
              clearable
              searchable={false}
            />
          </SimpleGrid>
        </Card>

        <Card>
          <Stack gap="md">
            {!pag.cargando && pag.total > 0 && (
              <Text fz="sm" c="dimmed" role="status" aria-live="polite">
                {pag.total} {pag.total === 1 ? 'cuenta' : 'cuentas'}
              </Text>
            )}
            {pag.cargando && usuarios.length > 0 && (
              <Text fz="sm" c="dimmed" role="status" aria-live="polite">
                Cargando cuentas…
              </Text>
            )}
            {omitidas > 0 && (
              <Text fz="sm" c="dimmed">
                {omitidas === 1 ? 'Una fila no se pudo leer.' : `${omitidas} filas no se pudieron leer.`}
              </Text>
            )}

            {errorLista && usuarios.length === 0 ? (
              <Alert color="crimson" role="alert" title="No se pudo cargar el listado">
                <Stack gap="sm" align="flex-start">
                  <Text>{errorLista.message}</Text>
                  <Button variant="light" onClick={() => pag.recargar()}>
                    Reintentar
                  </Button>
                </Stack>
              </Alert>
            ) : pag.cargando && usuarios.length === 0 ? (
              <Stack gap="sm" role="status" aria-busy="true" aria-label="Cargando cuentas">
                <Skeleton height={18} width="30%" />
                <Skeleton height={240} radius="md" />
              </Stack>
            ) : !pag.cargando && usuarios.length === 0 && pag.datos.length > 0 ? (
              <Alert color="crimson" role="alert" title="No se pudo leer el listado">
                El servidor respondió, pero las cuentas no tienen el formato esperado.
              </Alert>
            ) : usuarios.length === 0 ? (
              <EmptyState
                title={hayFiltros ? 'Ninguna cuenta coincide' : 'Todavía no hay cuentas'}
                description={
                  hayFiltros
                    ? 'Prueba con otro nombre, rol o estado, o limpia los filtros.'
                    : 'Cuando crees la primera cuenta, aparecerá aquí.'
                }
              />
            ) : (
              <>
                {errorLista && (
                  <Alert color="crimson" role="alert">
                    {errorLista.message}
                  </Alert>
                )}
                <Box visibleFrom="sm">
                  <Table.ScrollContainer minWidth={960}>
                    <Table aria-label="Cuentas de usuarios">
                      <Table.Thead>
                        <Table.Tr>
                          <Table.Th>Usuario</Table.Th>
                          <Table.Th>Rol</Table.Th>
                          <Table.Th>Sedes</Table.Th>
                          <Table.Th>Perfil</Table.Th>
                          <Table.Th>Contacto</Table.Th>
                          <Table.Th w={180} aria-label="Acciones" />
                          <Table.Th>Estado</Table.Th>
                        </Table.Tr>
                      </Table.Thead>
                      <Table.Tbody>
                        {usuarios.map((cuenta) => (
                          <Table.Tr key={cuenta.id} className={clsx(cuenta.estado === 'inactivo' && classes.inactiva)}>
                            <Table.Td>
                              <Text fz="sm" fw={500}>{cuenta.nombre}</Text>
                              <Text component="span" className="sga-code" c="dimmed" fz="xs">{cuenta.rut || '—'}</Text>
                            </Table.Td>
                            <Table.Td><Text fz="sm">{ROLES_USUARIO.find((item) => item.value === cuenta.rol)?.label}</Text></Table.Td>
                            <Table.Td><Text fz="sm">{cuenta.sedes.map((sede) => sede.nombre).join(', ') || '—'}</Text></Table.Td>
                            <Table.Td><Text fz="sm" className={classes.largo}>{textoPerfil(cuenta)}</Text></Table.Td>
                            <Table.Td>
                              <Text fz="sm" className={classes.largo}>{cuenta.correo || '—'}</Text>
                              <Text fz="xs" c="dimmed">{cuenta.telefono || '—'}</Text>
                            </Table.Td>
                            <Table.Td>
                              <Acciones
                                cuenta={cuenta}
                                esPropia={cuenta.id === actor.id}
                                onEditar={() => abrirFormulario(cuenta)}
                                onEstado={() => setPendienteEstado(cuenta)}
                                onClave={() => setPendienteClave(cuenta)}
                              />
                            </Table.Td>
                            <Table.Td><EstadoBadge usuario={cuenta} /></Table.Td>
                          </Table.Tr>
                        ))}
                      </Table.Tbody>
                    </Table>
                  </Table.ScrollContainer>
                </Box>

                <Stack hiddenFrom="sm" gap="sm">
                  {usuarios.map((cuenta) => (
                    <Card key={cuenta.id} withBorder shadow="none" padding="md" className={clsx(classes.card, cuenta.estado === 'inactivo' && classes.inactiva)}>
                      <Stack gap="xs">
                        <Box>
                          <Text fw={600}>{cuenta.nombre}</Text>
                          <Text component="span" className="sga-code" c="dimmed" fz="xs">{cuenta.rut || '—'}</Text>
                        </Box>
                        <Text fz="sm">{ROLES_USUARIO.find((item) => item.value === cuenta.rol)?.label}</Text>
                        <Text fz="sm">Sedes: {cuenta.sedes.map((sede) => sede.nombre).join(', ') || '—'}</Text>
                        <Text fz="sm" className={classes.largo}>{textoPerfil(cuenta)}</Text>
                        <Text fz="sm" className={classes.largo}>{cuenta.correo || '—'}<br />{cuenta.telefono || '—'}</Text>
                        <Group justify="space-between">
                          <Acciones
                            cuenta={cuenta}
                            esPropia={cuenta.id === actor.id}
                            onEditar={() => abrirFormulario(cuenta)}
                            onEstado={() => setPendienteEstado(cuenta)}
                            onClave={() => setPendienteClave(cuenta)}
                          />
                          <EstadoBadge usuario={cuenta} />
                        </Group>
                      </Stack>
                    </Card>
                  ))}
                </Stack>

                <PaginacionBar
                  pagina={pag.pagina}
                  total={pag.totalPaginas}
                  desde={rango.desde}
                  hasta={rango.hasta}
                  cantidad={pag.total}
                  onChange={pag.setPagina}
                />
              </>
            )}
          </Stack>
        </Card>
      </Stack>

      <UsuarioFormDrawer
        opened={formOpened}
        usuario={editing}
        sedes={sedes}
        errorSedes={sedesEstado === 'error' ? errorSedes : null}
        cargandoSedes={sedesEstado === 'cargando'}
        guardando={guardando}
        onClose={() => setFormOpened(false)}
        onSubmit={guardar}
      />

      <ConfirmModal
        opened={pendienteEstado !== null}
        onClose={() => {
          if (!cambiandoEstado) setPendienteEstado(null);
        }}
        title={pendienteEstado?.estado === 'activo' ? '¿Desactivar usuario?' : '¿Activar usuario?'}
        message={
          pendienteEstado ? (
            pendienteEstado.estado === 'activo' ? (
              <>
                La cuenta de <strong>{pendienteEstado.nombre}</strong> quedará desactivada y seguirá visible en el listado.
              </>
            ) : (
              <>
                La cuenta de <strong>{pendienteEstado.nombre}</strong> volverá a poder iniciar sesión.
              </>
            )
          ) : (
            ''
          )
        }
        confirmLabel={pendienteEstado?.estado === 'activo' ? 'Desactivar' : 'Activar'}
        destructive={pendienteEstado?.estado === 'activo'}
        loading={cambiandoEstado}
        onConfirm={() => void confirmarEstado()}
      />

      <ConfirmModal
        opened={pendienteClave !== null}
        onClose={() => {
          if (!generandoClave) setPendienteClave(null);
        }}
        title="¿Restablecer la clave?"
        message={
          pendienteClave ? (
            <>
              Vas a generar una clave temporal para <strong>{pendienteClave.nombre}</strong>. La anterior dejará de servir y la nueva se muestra una sola vez.
            </>
          ) : (
            ''
          )
        }
        confirmLabel="Generar clave"
        loading={generandoClave}
        onConfirm={() => void confirmarClave()}
      />

      <Modal opened={claveTemporal !== null} onClose={cerrarClave} title="Clave temporal" closeOnClickOutside={false} size="sm">
        <Stack gap="md">
          {claveTemporal?.clave ? (
            <>
              <Text>
                Esta es la clave de <strong>{claveTemporal.nombre}</strong>. Cópiala ahora: no se vuelve a mostrar.
              </Text>
              <Text className="sga-code" fz="lg">
                {claveTemporal.clave}
              </Text>
              <Group justify="flex-end" gap="sm">
                <Button variant="subtle" color="slate" onClick={() => void copiarClave()}>
                  Copiar
                </Button>
                <Button onClick={cerrarClave}>Ya la copié</Button>
              </Group>
            </>
          ) : (
            <>
              <Alert color="orange" role="alert">
                La clave se restableció, pero la respuesta no trajo la clave temporal. Si la generas de nuevo, la anterior deja de servir.
              </Alert>
              <Group justify="flex-end">
                <Button onClick={cerrarClave}>Entendido</Button>
              </Group>
            </>
          )}
        </Stack>
      </Modal>
    </>
  );
}

function Acciones({
  cuenta,
  esPropia,
  onEditar,
  onEstado,
  onClave,
}: {
  cuenta: UsuarioLista;
  esPropia: boolean;
  onEditar: () => void;
  onEstado: () => void;
  onClave: () => void;
}) {
  const desactivar = cuenta.estado === 'activo';
  const bloqueada = desactivar && esPropia;
  return (
    <Group gap="xs" wrap="nowrap">
      <Tooltip label={`Editar a ${cuenta.nombre}`}>
        <ActionIcon aria-label={`Editar a ${cuenta.nombre}`} color="navy" variant="light" size={44} onClick={onEditar}>
          <IconPencil size={18} stroke={1.5} aria-hidden />
        </ActionIcon>
      </Tooltip>
      <Tooltip label={bloqueada ? 'No puedes desactivar tu propia cuenta' : desactivar ? `Desactivar a ${cuenta.nombre}` : `Activar a ${cuenta.nombre}`}>
        <ActionIcon
          aria-label={desactivar ? `Desactivar a ${cuenta.nombre}` : `Activar a ${cuenta.nombre}`}
          color={desactivar ? 'crimson' : 'navy'}
          variant="light"
          size={44}
          disabled={bloqueada}
          onClick={onEstado}
        >
          {desactivar ? <IconUserOff size={18} stroke={1.5} aria-hidden /> : <IconUserCheck size={18} stroke={1.5} aria-hidden />}
        </ActionIcon>
      </Tooltip>
      <Tooltip label={`Restablecer la clave de ${cuenta.nombre}`}>
        <ActionIcon aria-label={`Restablecer la clave de ${cuenta.nombre}`} color="navy" variant="light" size={44} onClick={onClave}>
          <IconKey size={18} stroke={1.5} aria-hidden />
        </ActionIcon>
      </Tooltip>
    </Group>
  );
}
