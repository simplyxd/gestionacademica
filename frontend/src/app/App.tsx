import { useState } from 'react';
import { ActionIcon, Alert, AppShell, Badge, Burger, Group, MantineProvider, NavLink, Text } from '@mantine/core';
import { IconMoon, IconSun, IconUsers } from '@tabler/icons-react';
import { theme, cssVariablesResolver } from '../theme/theme';
import { UsuariosPage } from '../features/usuarios/UsuariosPage';
import { canManageUsers, ROLES, type Role } from '../features/usuarios/users.ts';

// Sesión de prueba en cliente, configurada al iniciar Vite. No se guarda en el navegador.
const mockRole: unknown = import.meta.env.VITE_MOCK_ROLE ?? 'admin';

export function App() {
  const [mobileOpened, setMobileOpened] = useState(false);
  const [scheme, setScheme] = useState<'light' | 'dark'>('light');
  const allowed = canManageUsers(mockRole);
  const roleLabel = typeof mockRole === 'string' && Object.hasOwn(ROLES, mockRole) ? ROLES[mockRole as Role] : 'Sin rol';
  return (
    <MantineProvider theme={theme} cssVariablesResolver={cssVariablesResolver} forceColorScheme={scheme}>
      <AppShell header={{ height: 64 }} navbar={{ width: { sm: 76, md: 264 }, breakpoint: 'sm', collapsed: { mobile: !mobileOpened } }} padding={{ base: 'md', sm: 'lg', lg: 'xl' }}>
        <AppShell.Header className="glass">
          <Group h="100%" px="lg" justify="space-between" wrap="nowrap">
            <Group gap="sm" wrap="nowrap">
              <Burger opened={mobileOpened} onClick={() => setMobileOpened(!mobileOpened)} hiddenFrom="sm" size="sm" aria-label="Abrir navegación" />
              <Text fw={800} c="navy" size="xl">SGA</Text>
              <Text visibleFrom="sm" size="sm" c="dimmed">Nueva Formación</Text>
            </Group>
            <Group gap="sm" wrap="nowrap">
              <Badge color={allowed ? 'navy' : 'slate'}>{roleLabel}</Badge>
              <ActionIcon aria-label={scheme === 'light' ? 'Activar tema oscuro' : 'Activar tema claro'} onClick={() => setScheme(scheme === 'light' ? 'dark' : 'light')}>
                {scheme === 'light' ? <IconMoon size={20} aria-hidden /> : <IconSun size={20} aria-hidden />}
              </ActionIcon>
            </Group>
          </Group>
        </AppShell.Header>
        <AppShell.Navbar className="glass" p="sm">
          <Text className="nav-label" size="xs" c="dimmed" fw={600} px="sm" mt="md" mb="sm">ADMINISTRACIÓN</Text>
          {allowed && <NavLink component="a" href="/admin/usuarios" active label={<span className="nav-label">Usuarios</span>} leftSection={<IconUsers size={22} aria-hidden />} aria-label="Usuarios" onClick={() => setMobileOpened(false)} />}
        </AppShell.Navbar>
        <AppShell.Main>
          <div className="page-container">
            {!allowed ? <Alert color="crimson" title="Acceso restringido" role="alert">Solo el Administrador puede acceder a la administración de usuarios.</Alert>
              : window.location.pathname !== '/admin/usuarios' ? <Alert title="Página no encontrada"><a href="/admin/usuarios">Ir a Usuarios</a></Alert>
              : <UsuariosPage actor={mockRole} />}
          </div>
        </AppShell.Main>
      </AppShell>
    </MantineProvider>
  );
}
