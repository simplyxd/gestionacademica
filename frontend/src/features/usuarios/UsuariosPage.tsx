import {
  ActionIcon,
  Alert,
  Badge,
  Box,
  Button,
  Card,
  Grid,
  Group,
  MultiSelect,
  Select,
  SimpleGrid,
  Stack,
  Table,
  Text,
  TextInput,
  Tooltip,
  useMantineTheme,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconCheck, IconPencil, IconPlus, IconUserOff } from '@tabler/icons-react';
import clsx from 'clsx';
import { useState, useSyncExternalStore } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { DetailDrawer } from '@/components/ui/DetailDrawer';
import { EmptyState } from '@/components/ui/EmptyState';
import { PaginacionBar } from '@/components/ui/PaginacionBar';
import { useAuth } from '@/features/auth/AuthContext';
import { notify } from '@/lib/notify';
import { usePaginacion } from '@/lib/usePaginacion';
import classes from './UsuariosPage.module.css';
import {
  CARRERAS,
  DEPARTAMENTOS,
  ESTADOS,
  ROLES,
  SEDES,
  deactivateUser,
  emptyDraft,
  emptyFilters,
  filterUsers,
  getUsers,
  saveUser,
  subscribeUsers,
  validateUser,
  type Filters,
  type Role,
  type User,
  type UserDraft,
} from './users';

const FORM_ID = 'usuario-form';
const roleOptions = Object.entries(ROLES).map(([value, label]) => ({ value, label }));

function EstadoBadge({ user }: { user: User }) {
  return <Badge color={user.estado === 'activo' ? 'teal' : 'slate'}>{user.estado === 'activo' ? 'Activo' : 'Desactivado'}</Badge>;
}

function Acciones({ user, onEditar, onDesactivar }: { user: User; onEditar: () => void; onDesactivar: () => void }) {
  return (
    <Group gap="xs" wrap="nowrap">
      <Tooltip label={`Editar a ${user.nombre}`}>
        <ActionIcon aria-label={`Editar a ${user.nombre}`} color="navy" variant="light" size={44} onClick={onEditar}>
          <IconPencil size={18} stroke={1.5} aria-hidden />
        </ActionIcon>
      </Tooltip>
      <Tooltip label={user.estado === 'activo' ? `Desactivar a ${user.nombre}` : 'La cuenta ya está desactivada'}>
        <ActionIcon
          aria-label={`Desactivar a ${user.nombre}`}
          color="crimson"
          variant="light"
          size={44}
          disabled={user.estado === 'inactivo'}
          onClick={onDesactivar}
        >
          <IconUserOff size={18} stroke={1.5} aria-hidden />
        </ActionIcon>
      </Tooltip>
    </Group>
  );
}

/** ABM de usuarios (RF1): alta, edición y baja lógica de cuentas por perfil. Solo el Administrador. */
export function UsuariosPage() {
  const { usuario } = useAuth();
  const actor = usuario.rol;
  const theme = useMantineTheme();
  const users = useSyncExternalStore(subscribeUsers, getUsers);
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [editing, setEditing] = useState<User | null>(null);
  const [formOpened, setFormOpened] = useState(false);
  const [pendingDeactivation, setPendingDeactivation] = useState<User | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const filtered = filterUsers(users, filters);
  const pag = usePaginacion(filtered, 8);

  const form = useForm<UserDraft>({
    initialValues: emptyDraft(),
    validate: (values) => validateUser(values, editing?.id),
  });
  const limitedSedes = form.values.rol === 'docente' || form.values.rol === 'estudiante';

  const changeFilter = (field: keyof Filters, values: string[]) => {
    setFilters((previous) => ({ ...previous, [field]: values }));
    pag.setPagina(1);
  };

  const openForm = (user: User | null) => {
    setEditing(user);
    form.setValues(user ? structuredClone(user) : emptyDraft());
    form.resetDirty(user ? structuredClone(user) : emptyDraft());
    form.clearErrors();
    setFormError(null);
    setFormOpened(true);
  };

  const submit = (values: UserDraft) => {
    try {
      const saved = saveUser(values, actor, editing?.id);
      notify.success({
        title: editing ? 'Cuenta actualizada' : 'Cuenta creada',
        message: `La cuenta de ${saved.nombre} quedó ${editing ? 'actualizada' : 'creada'}.`,
      });
      setFormOpened(false);
      setEditing(null);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'No se pudo guardar la cuenta.');
    }
  };

  const confirmDeactivation = () => {
    if (!pendingDeactivation) return;
    try {
      deactivateUser(pendingDeactivation.id, actor);
      notify.success({ title: 'Cuenta desactivada', message: `La cuenta de ${pendingDeactivation.nombre} quedó desactivada.` });
    } catch (error) {
      notify.error({ title: 'No se pudo desactivar', message: error instanceof Error ? error.message : 'Inténtalo de nuevo.' });
    }
    setPendingDeactivation(null);
  };

  const detalle = (user: User) => (user.rol === 'estudiante' ? user.carreras : user.departamentos).join(', ') || '—';

  return (
    <>
      <PageHeader
        title="Usuarios"
        description="Administra las cuentas de acceso por perfil."
        breadcrumbs={[{ label: 'Inicio', to: '/admin' }, { label: 'Usuarios' }]}
        actions={
          <Button leftSection={<IconPlus size={18} stroke={1.5} />} onClick={() => openForm(null)}>
            Crear usuario
          </Button>
        }
      />

      <Stack gap="md">
        <Card>
          <Group justify="space-between" mb="md">
            <Text fw={600}>Filtrar usuarios</Text>
            <Button variant="subtle" color="slate" size="sm" onClick={() => { setFilters(emptyFilters()); pag.setPagina(1); }}>
              Limpiar filtros
            </Button>
          </Group>
          <SimpleGrid cols={{ base: 1, xs: 2, lg: 4 }} spacing="md">
            <MultiSelect label="Sedes" placeholder="Todas las sedes" data={SEDES} value={filters.sedes} onChange={(v) => changeFilter('sedes', v)} clearable />
            <MultiSelect label="Carreras" placeholder="Todas las carreras" data={CARRERAS} value={filters.carreras} onChange={(v) => changeFilter('carreras', v)} clearable />
            <MultiSelect label="Roles" placeholder="Todos los roles" data={roleOptions} value={filters.roles} onChange={(v) => changeFilter('roles', v)} clearable />
            <MultiSelect label="Estado" placeholder="Todos los estados" data={ESTADOS} value={filters.estados} onChange={(v) => changeFilter('estados', v)} clearable />
          </SimpleGrid>
          <Text fz="sm" c="dimmed" mt="sm">
            Sin selección se incluyen todos los valores.
          </Text>
        </Card>

        <Card>
          <Stack gap="md">
            <Text fz="sm" c="dimmed" role="status" aria-live="polite">
              {filtered.length} de {users.length} cuentas
            </Text>

            {filtered.length === 0 ? (
              <EmptyState title="No hay usuarios que coincidan" description="Ajusta o limpia los filtros para ver otras cuentas." />
            ) : (
              <>
                {/* Escritorio y tableta: tabla de 7 columnas */}
                <Box visibleFrom="sm">
                  <Table.ScrollContainer minWidth={900}>
                    <Table aria-label="Cuentas de usuarios">
                      <Table.Thead>
                        <Table.Tr>
                          <Table.Th>Usuario</Table.Th>
                          <Table.Th>Rol</Table.Th>
                          <Table.Th>Sedes</Table.Th>
                          <Table.Th>Carreras / departamentos</Table.Th>
                          <Table.Th>Contacto</Table.Th>
                          <Table.Th w={130} aria-label="Acciones" />
                          <Table.Th>Estado</Table.Th>
                        </Table.Tr>
                      </Table.Thead>
                      <Table.Tbody>
                        {pag.visibles.map((user) => (
                          <Table.Tr key={user.id} className={clsx(user.estado === 'inactivo' && classes.inactiva)}>
                            <Table.Td>
                              <Text fz="sm" fw={500}>{user.nombre}</Text>
                              <Text component="span" className="sga-code" c="dimmed" fz="xs">{user.rut}</Text>
                            </Table.Td>
                            <Table.Td><Text fz="sm">{ROLES[user.rol]}</Text></Table.Td>
                            <Table.Td><Text fz="sm">{user.sedes.join(', ')}</Text></Table.Td>
                            <Table.Td><Text fz="sm">{detalle(user)}</Text></Table.Td>
                            <Table.Td>
                              <Text fz="sm" className={classes.largo}>{user.correo}</Text>
                              <Text fz="xs" c="dimmed">{user.telefono || '—'}</Text>
                            </Table.Td>
                            <Table.Td>
                              <Acciones user={user} onEditar={() => openForm(user)} onDesactivar={() => setPendingDeactivation(user)} />
                            </Table.Td>
                            <Table.Td><EstadoBadge user={user} /></Table.Td>
                          </Table.Tr>
                        ))}
                      </Table.Tbody>
                    </Table>
                  </Table.ScrollContainer>
                </Box>

                {/* Móvil: una card por cuenta */}
                <Stack hiddenFrom="sm" gap="sm">
                  {pag.visibles.map((user) => (
                    <Card key={user.id} withBorder shadow="none" padding="md" className={clsx(classes.card, user.estado === 'inactivo' && classes.inactiva)}>
                      <Stack gap="xs">
                        <Box>
                          <Text fw={600}>{user.nombre}</Text>
                          <Text component="span" className="sga-code" c="dimmed" fz="xs">{user.rut}</Text>
                        </Box>
                        <Text fz="sm">{ROLES[user.rol]} · {user.sedes.join(', ')}</Text>
                        {user.rol === 'estudiante' && <Text fz="sm">Carreras: {user.carreras.join(', ') || '—'}</Text>}
                        {user.rol === 'docente' && <Text fz="sm">Departamentos: {user.departamentos.join(', ') || '—'}</Text>}
                        <Text fz="sm" className={classes.largo}>{user.correo}<br />{user.telefono || '—'}</Text>
                        <Group justify="space-between">
                          <Acciones user={user} onEditar={() => openForm(user)} onDesactivar={() => setPendingDeactivation(user)} />
                          <EstadoBadge user={user} />
                        </Group>
                      </Stack>
                    </Card>
                  ))}
                </Stack>

                <PaginacionBar pagina={pag.pagina} total={pag.total} desde={pag.desde} hasta={pag.hasta} cantidad={filtered.length} onChange={pag.setPagina} />
              </>
            )}
          </Stack>
        </Card>
      </Stack>

      <DetailDrawer
        opened={formOpened}
        onClose={() => setFormOpened(false)}
        size={theme.other.layout.drawerWidthLg}
        title={editing ? 'Editar usuario' : 'Crear usuario'}
        subtitle="Cuenta de acceso, perfil y alcance (sedes, carreras o departamentos)."
        closeOnClickOutside={!form.isDirty()}
        footer={
          <>
            <Button variant="subtle" color="slate" onClick={() => setFormOpened(false)}>Cancelar</Button>
            <Button type="submit" form={FORM_ID} leftSection={<IconCheck size={18} stroke={1.5} />}>
              {editing ? 'Guardar cambios' : 'Crear cuenta'}
            </Button>
          </>
        }
      >
        <form
          id={FORM_ID}
          noValidate
          onSubmit={form.onSubmit(submit, (errors) => {
            const field = Object.keys(errors)[0];
            if (field) form.getInputNode(field)?.focus();
          })}
        >
          <Stack gap="md">
            <Text fz="sm" c="dimmed">* Campo obligatorio</Text>
            {formError && <Alert color="crimson" role="alert">{formError}</Alert>}
            <Grid gutter="md">
              <Grid.Col span={12}>
                <TextInput label="Nombre" withAsterisk autoComplete="name" data-autofocus {...form.getInputProps('nombre')} />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <TextInput label="RUT" withAsterisk placeholder="12.345.678-5" {...form.getInputProps('rut')} />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <Select
                  label="Rol"
                  withAsterisk
                  searchable={false}
                  allowDeselect={false}
                  data={roleOptions}
                  {...form.getInputProps('rol')}
                  onChange={(value) => {
                    if (value) {
                      form.setFieldValue('rol', value as Role);
                      form.clearErrors();
                    }
                  }}
                />
              </Grid.Col>
              <Grid.Col span={12}>
                <MultiSelect
                  label="Sedes"
                  withAsterisk
                  data={SEDES}
                  maxValues={limitedSedes ? 3 : undefined}
                  description={limitedSedes ? 'Máximo 3 sedes.' : 'Una, varias o todas las sedes.'}
                  {...form.getInputProps('sedes')}
                />
                {!limitedSedes && (
                  <Button variant="subtle" size="sm" mt="xs" onClick={() => form.setFieldValue('sedes', [...SEDES])}>
                    Seleccionar todas las sedes
                  </Button>
                )}
              </Grid.Col>
              {form.values.rol === 'estudiante' && (
                <Grid.Col span={12}>
                  <MultiSelect label="Carreras" data={CARRERAS} maxValues={2} description="Máximo 2 carreras." {...form.getInputProps('carreras')} />
                </Grid.Col>
              )}
              {form.values.rol === 'docente' && (
                <Grid.Col span={12}>
                  <MultiSelect label="Departamentos" data={DEPARTAMENTOS} maxValues={3} description="Máximo 3 departamentos." {...form.getInputProps('departamentos')} />
                </Grid.Col>
              )}
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <TextInput label="Correo" withAsterisk type="email" autoComplete="email" {...form.getInputProps('correo')} />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <TextInput label="Teléfono" type="tel" autoComplete="tel" {...form.getInputProps('telefono')} />
              </Grid.Col>
            </Grid>
          </Stack>
        </form>
      </DetailDrawer>

      <ConfirmModal
        opened={pendingDeactivation !== null}
        onClose={() => setPendingDeactivation(null)}
        title="¿Desactivar usuario?"
        message={
          pendingDeactivation ? (
            <>
              La cuenta de <strong>{pendingDeactivation.nombre}</strong> ({pendingDeactivation.rut}) quedará desactivada y seguirá visible en el listado.
            </>
          ) : (
            ''
          )
        }
        confirmLabel="Desactivar"
        destructive
        onConfirm={confirmDeactivation}
      />
    </>
  );
}
