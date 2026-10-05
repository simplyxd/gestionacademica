import { useState, useSyncExternalStore } from 'react';
import {
  ActionIcon, Alert, Badge, Box, Button, Divider, Drawer, Grid, Group, Modal, MultiSelect,
  Pagination, Paper, ScrollArea, Select, SimpleGrid, Stack, Table, Text, TextInput, Title, Tooltip,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useMediaQuery } from '@mantine/hooks';
import { IconPencil, IconPlus, IconUserOff } from '@tabler/icons-react';
import {
  CARRERAS, DEPARTAMENTOS, ESTADOS, ROLES, SEDES, deactivateUser, emptyDraft, emptyFilters,
  filterUsers, getUsers, saveUser, subscribeUsers, validateUser,
  type Filters, type Role, type User, type UserDraft,
} from './users.ts';

const PAGE_SIZE = 8;
const roleOptions = Object.entries(ROLES).map(([value, label]) => ({ value, label }));

export function UsuariosPage({ actor }: { actor: unknown }) {
  const users = useSyncExternalStore(subscribeUsers, getUsers);
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<User | null>(null);
  const [formOpened, setFormOpened] = useState(false);
  const [pendingDeactivation, setPendingDeactivation] = useState<User | null>(null);
  const [feedback, setFeedback] = useState<{ text: string; error?: boolean } | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const mobile = useMediaQuery('(max-width: 47.99em)');
  const form = useForm<UserDraft>({
    initialValues: emptyDraft(),
    validate: values => validateUser(values, editing?.id),
  });
  const filtered = filterUsers(users, filters);
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pages);
  const visible = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const limitedSedes = form.values.rol === 'docente' || form.values.rol === 'estudiante';

  function changeFilter(field: keyof Filters, values: string[]) {
    setFilters(previous => ({ ...previous, [field]: values }));
    setPage(1);
  }

  function openForm(user: User | null) {
    setEditing(user);
    form.setValues(user ? structuredClone(user) : emptyDraft());
    form.resetDirty(user ? structuredClone(user) : emptyDraft());
    form.clearErrors();
    setFormError(null);
    setFormOpened(true);
  }

  function submit(values: UserDraft) {
    try {
      const saved = saveUser(values, actor, editing?.id);
      setFeedback({ text: `${saved.nombre}: cuenta ${editing ? 'actualizada' : 'creada'}.` });
      setFormOpened(false);
      setEditing(null);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'No se pudo guardar la cuenta.');
    }
  }

  function confirmDeactivation() {
    if (!pendingDeactivation) return;
    try {
      deactivateUser(pendingDeactivation.id, actor);
      setFeedback({ text: `${pendingDeactivation.nombre}: cuenta desactivada.` });
      setPendingDeactivation(null);
    } catch (error) {
      setFeedback({ text: error instanceof Error ? error.message : 'No se pudo desactivar la cuenta.', error: true });
    }
  }

  function actions(user: User) {
    return <Group gap="xs" wrap="nowrap">
      <Tooltip label={`Editar a ${user.nombre}`}><ActionIcon aria-label={`Editar a ${user.nombre}`} color="navy" variant="light" onClick={() => openForm(user)}><IconPencil size={18} aria-hidden /></ActionIcon></Tooltip>
      <Tooltip label={user.estado === 'activo' ? `Desactivar a ${user.nombre}` : 'La cuenta ya está desactivada'}><ActionIcon aria-label={`Desactivar a ${user.nombre}`} color="crimson" variant="light" disabled={user.estado === 'inactivo'} onClick={() => setPendingDeactivation(user)}><IconUserOff size={18} aria-hidden /></ActionIcon></Tooltip>
    </Group>;
  }

  function stateBadge(user: User) {
    return <Badge color={user.estado === 'activo' ? 'teal' : 'slate'}>{user.estado === 'activo' ? 'Activo' : 'Desactivado'}</Badge>;
  }

  return <Stack gap="lg">
    <Group justify="space-between" align="flex-start">
      <Box><Text size="xs" fw={600} c="dimmed" mb="xs">ADMINISTRACIÓN</Text><Title order={1}>Usuarios</Title><Text c="dimmed" mt="xs">Administra las cuentas de acceso por perfil.</Text></Box>
      <Button leftSection={<IconPlus size={18} aria-hidden />} onClick={() => openForm(null)}>Crear usuario</Button>
    </Group>
    {feedback && <Alert role={feedback.error ? 'alert' : 'status'} color={feedback.error ? 'crimson' : 'teal'} withCloseButton closeButtonLabel="Cerrar mensaje" onClose={() => setFeedback(null)}>{feedback.text}</Alert>}
    <Paper>
      <Group justify="space-between" mb="md"><Text fw={600}>Filtrar usuarios</Text><Button variant="subtle" color="slate" size="sm" onClick={() => { setFilters(emptyFilters()); setPage(1); }}>Limpiar filtros</Button></Group>
      <SimpleGrid cols={{ base: 1, xs: 2, lg: 4 }} spacing="md">
        <MultiSelect label="Sedes" placeholder="Todas las sedes" data={SEDES} value={filters.sedes} onChange={values => changeFilter('sedes', values)} clearable />
        <MultiSelect label="Carreras" placeholder="Todas las carreras" data={CARRERAS} value={filters.carreras} onChange={values => changeFilter('carreras', values)} clearable />
        <MultiSelect label="Roles" placeholder="Todos los roles" data={roleOptions} value={filters.roles} onChange={values => changeFilter('roles', values)} clearable />
        <MultiSelect label="Estado" placeholder="Todos los estados" data={ESTADOS} value={filters.estados} onChange={values => changeFilter('estados', values)} clearable />
      </SimpleGrid>
      <Text size="sm" c="dimmed" mt="sm">Sin selección se incluyen todos los valores. Se muestran cuentas que cumplen los filtros elegidos.</Text>
    </Paper>
    <Paper p={0}>
      <Group justify="space-between" p="lg"><Title order={2} size="h3">Cuentas de usuarios</Title><Text size="sm" c="dimmed" role="status">{filtered.length} de {users.length} cuentas</Text></Group>
      {filtered.length === 0 ? <Stack align="center" p="xl"><Text fw={600}>No hay usuarios que coincidan</Text><Text size="sm" c="dimmed">Ajusta o limpia los filtros para ver otras cuentas.</Text></Stack> : <>
        <Box visibleFrom="sm">
          <Table className="users-table" aria-label="Cuentas de usuarios">
            <Table.Thead><Table.Tr>
              <Table.Th w="20%">Usuario</Table.Th><Table.Th>Rol</Table.Th><Table.Th>Sedes</Table.Th>
              <Table.Th className="table-detail">Carreras / Departamentos</Table.Th><Table.Th className="table-detail" w="20%">Contacto</Table.Th>
              <Table.Th w={120}>Acciones</Table.Th><Table.Th w={130}>Estado</Table.Th>
            </Table.Tr></Table.Thead>
            <Table.Tbody>{visible.map(user => <Table.Tr key={user.id} className={user.estado === 'inactivo' ? 'inactive' : undefined}>
              <Table.Td><Text size="sm" fw={600}>{user.nombre}</Text><Text size="xs" c="dimmed" className="mono">{user.rut}</Text></Table.Td>
              <Table.Td><Text size="sm">{ROLES[user.rol]}</Text></Table.Td>
              <Table.Td><Text size="sm">{user.sedes.join(', ')}</Text></Table.Td>
              <Table.Td className="table-detail"><Text size="sm">{(user.rol === 'estudiante' ? user.carreras : user.departamentos).join(', ') || '—'}</Text></Table.Td>
              <Table.Td className="table-detail"><Text size="sm">{user.correo}</Text><Text size="xs" c="dimmed">{user.telefono || '—'}</Text></Table.Td>
              <Table.Td>{actions(user)}</Table.Td><Table.Td>{stateBadge(user)}</Table.Td>
            </Table.Tr>)}</Table.Tbody>
          </Table>
        </Box>
        <Stack hiddenFrom="sm" gap="sm" px="md">
          {visible.map(user => <Paper key={user.id} className={`user-card ${user.estado === 'inactivo' ? 'inactive' : ''}`} p="md">
            <Stack gap="sm">
              <Box><Text fw={600}>{user.nombre}</Text><Text className="mono" size="sm" c="dimmed">{user.rut}</Text></Box>
              <Text size="sm">{ROLES[user.rol]} · {user.sedes.join(', ')}</Text>
              {user.rol === 'estudiante' && <Text size="sm">Carreras: {user.carreras.join(', ') || '—'}</Text>}
              {user.rol === 'docente' && <Text size="sm">Departamentos: {user.departamentos.join(', ') || '—'}</Text>}
              <Text size="sm" style={{ overflowWrap: 'anywhere' }}>{user.correo}<br />{user.telefono || '—'}</Text>
              <Group justify="space-between">{actions(user)}{stateBadge(user)}</Group>
            </Stack>
          </Paper>)}
        </Stack>
      </>}
      <Group p="lg" justify="space-between"><Text size="sm" c="dimmed">Página {currentPage} de {pages}</Text><Pagination total={pages} value={currentPage} onChange={setPage} size="md" getItemProps={number => ({ 'aria-label': `Página ${number}` })} getControlProps={control => ({ 'aria-label': control === 'next' ? 'Página siguiente' : 'Página anterior' })} /></Group>
    </Paper>
    <Drawer opened={formOpened} onClose={() => setFormOpened(false)} title={<Title order={2} size="h3">{editing ? 'Editar usuario' : 'Crear usuario'}</Title>} size={mobile ? '100%' : 640} offset={mobile ? 0 : 8} classNames={{ content: 'glass glass-strong users-drawer' }} closeOnClickOutside={!form.isDirty()} scrollAreaComponent={ScrollArea.Autosize}>
      <form className="drawer-form" onSubmit={form.onSubmit(submit, errors => { const field = Object.keys(errors)[0]; if (field) form.getInputNode(field)?.focus(); })}>
        <Stack gap="lg">
          <Text size="sm" c="dimmed">* Campo obligatorio</Text>
          {formError && <Alert color="crimson" role="alert">{formError}</Alert>}
          <Grid>
            <Grid.Col span={12}><TextInput label="Nombre" withAsterisk autoComplete="name" data-autofocus {...form.getInputProps('nombre')} /></Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}><TextInput label="RUT" withAsterisk placeholder="12.345.678-5" {...form.getInputProps('rut')} /></Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}><Select label="Rol" withAsterisk data={roleOptions} {...form.getInputProps('rol')} onChange={value => { if (value) { form.setFieldValue('rol', value as Role); form.clearErrors(); } }} allowDeselect={false} /></Grid.Col>
            <Grid.Col span={12}>
              <MultiSelect label="Sedes" withAsterisk data={SEDES} maxValues={limitedSedes ? 3 : undefined} description={limitedSedes ? 'Máximo 3 sedes.' : 'Una, varias o todas las sedes.'} {...form.getInputProps('sedes')} />
              {!limitedSedes && <Button variant="subtle" size="sm" mt="xs" onClick={() => form.setFieldValue('sedes', [...SEDES])}>Seleccionar todas las sedes</Button>}
            </Grid.Col>
            {form.values.rol === 'estudiante' && <Grid.Col span={12}><MultiSelect label="Carreras" data={CARRERAS} maxValues={2} description="Máximo 2 carreras." {...form.getInputProps('carreras')} /></Grid.Col>}
            {form.values.rol === 'docente' && <Grid.Col span={12}><MultiSelect label="Departamentos" data={DEPARTAMENTOS} maxValues={3} description="Máximo 3 departamentos." {...form.getInputProps('departamentos')} /></Grid.Col>}
            <Grid.Col span={{ base: 12, sm: 6 }}><TextInput label="Correo" withAsterisk type="email" autoComplete="email" {...form.getInputProps('correo')} /></Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}><TextInput label="Teléfono" type="tel" autoComplete="tel" {...form.getInputProps('telefono')} /></Grid.Col>
          </Grid>
          <Divider />
          <Group justify="flex-end" className="drawer-footer"><Button variant="subtle" color="slate" onClick={() => setFormOpened(false)}>Cancelar</Button><Button type="submit">{editing ? 'Guardar cambios' : 'Crear cuenta'}</Button></Group>
        </Stack>
      </form>
    </Drawer>
    <Modal opened={pendingDeactivation !== null} onClose={() => setPendingDeactivation(null)} title={<Title order={2} size="h3">¿Desactivar usuario?</Title>} classNames={{ content: 'glass glass-strong' }}>
      <Stack gap="lg">
        <Box><Text fw={600}>{pendingDeactivation?.nombre}</Text><Text size="sm" c="dimmed">{pendingDeactivation?.rut}</Text></Box>
        <Text>La cuenta quedará desactivada y seguirá visible en el listado.</Text>
        <Group justify="flex-end"><Button variant="subtle" color="slate" onClick={() => setPendingDeactivation(null)}>Cancelar</Button><Button color="crimson" onClick={confirmDeactivation}>Desactivar</Button></Group>
      </Stack>
    </Modal>
  </Stack>;
}
