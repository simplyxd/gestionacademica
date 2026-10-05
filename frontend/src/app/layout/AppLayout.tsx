import {
  ActionIcon,
  AppShell,
  Avatar,
  Badge,
  Box,
  Burger,
  Group,
  Menu,
  NavLink,
  ScrollArea,
  Stack,
  Text,
  Tooltip,
  useComputedColorScheme,
  useMantineColorScheme,
} from '@mantine/core';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import { IconChevronDown, IconMoon, IconSun, IconUserCheck } from '@tabler/icons-react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/features/auth/AuthContext';
import { PERIODO_ACTUAL } from '@/mock/estructura';
import type { EstadoPeriodo } from '@/mock/types';
import glass from '@/theme/glass.module.css';
import { NAV_BY_ROLE, ROL_LABEL, type Rol } from '../navigation';
import classes from './AppLayout.module.css';

const ESTADO_PERIODO_COLOR: Record<EstadoPeriodo, string> = {
  planificación: 'sky',
  'inscripción abierta': 'teal',
  'en curso': 'orange',
  cerrado: 'slate',
};

const ROLES: Rol[] = ['coordinador', 'estudiante', 'docente', 'admin'];

export function AppLayout() {
  const { usuario, cambiarRol } = useAuth();
  const [mobileOpened, { toggle: toggleMobile, close: closeMobile }] = useDisclosure(false);
  const [desktopCollapsed, { toggle: toggleDesktop }] = useDisclosure(false);
  const isTablet = useMediaQuery('(max-width: 75em)'); // < lg → iconos
  const collapsed = desktopCollapsed || Boolean(isTablet);

  const { setColorScheme } = useMantineColorScheme();
  const scheme = useComputedColorScheme('light');
  const { pathname } = useLocation();
  const items = NAV_BY_ROLE[usuario.rol];

  return (
    <AppShell
      header={{ height: 64 }}
      navbar={{
        width: collapsed ? 76 : 264,
        breakpoint: 'sm',
        collapsed: { mobile: !mobileOpened },
      }}
      padding={{ base: 'md', sm: 'lg', lg: 'xl' }}
      className={glass.pageBackground}
    >
      {/* ---------- Header ---------- */}
      <AppShell.Header className={glass.glassHeader}>
        <Group h="100%" px="md" justify="space-between" wrap="nowrap">
          <Group gap="sm" wrap="nowrap">
            <Burger opened={mobileOpened} onClick={toggleMobile} hiddenFrom="sm" size="sm" aria-label="Abrir menú" />
            <Burger opened={!desktopCollapsed} onClick={toggleDesktop} visibleFrom="lg" size="sm" aria-label="Contraer menú" />
            <Text fw={700} fz="lg" c="navy" component="span">
              SGA
            </Text>
            <Text c="dimmed" fz="sm" visibleFrom="md" component="span">
              Instituto Universitario Nueva Formación
            </Text>
          </Group>

          <Group gap="sm" wrap="nowrap">
            <Badge color={ESTADO_PERIODO_COLOR[PERIODO_ACTUAL.estado]} size="lg" visibleFrom="xs">
              {PERIODO_ACTUAL.codigo} · {PERIODO_ACTUAL.estado}
            </Badge>

            <Tooltip label={scheme === 'dark' ? 'Modo claro' : 'Modo oscuro'}>
              <ActionIcon
                onClick={() => setColorScheme(scheme === 'dark' ? 'light' : 'dark')}
                aria-label="Cambiar esquema de color"
              >
                {scheme === 'dark' ? <IconSun size={18} stroke={1.5} /> : <IconMoon size={18} stroke={1.5} />}
              </ActionIcon>
            </Tooltip>

            <Menu width={260}>
              <Menu.Target>
                <Group gap="xs" component="button" className={classes.userButton} aria-label="Menú de usuario">
                  <Avatar color="navy" radius="xl" size="sm">
                    {usuario.iniciales}
                  </Avatar>
                  <Box visibleFrom="sm" ta="left">
                    <Text fz="sm" fw={600} lh={1.2}>
                      {usuario.nombre}
                    </Text>
                    <Text fz="xs" c="dimmed" lh={1.2}>
                      {ROL_LABEL[usuario.rol]}
                    </Text>
                  </Box>
                  <IconChevronDown size={16} stroke={1.5} />
                </Group>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Label>Probar como… (solo prototipo)</Menu.Label>
                {ROLES.map((rol) => (
                  <Menu.Item
                    key={rol}
                    leftSection={<IconUserCheck size={16} stroke={1.5} />}
                    rightSection={rol === usuario.rol ? <Badge size="xs">Actual</Badge> : null}
                    onClick={() => cambiarRol(rol)}
                  >
                    {ROL_LABEL[rol]}
                  </Menu.Item>
                ))}
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Group>
      </AppShell.Header>

      {/* ---------- Navbar ---------- */}
      <AppShell.Navbar className={glass.glassNavbar} p="sm" aria-label="Navegación principal">
        <ScrollArea type="never" style={{ flex: 1 }}>
          <Stack gap={4}>
            {items.map((item, index) => {
              const showGroupLabel = !collapsed && item.group && items[index - 1]?.group !== item.group;
              const active = item.to === '/' ? pathname === '/' : pathname.startsWith(item.to);
              const link = (
                <NavLink
                  component={Link}
                  to={item.to}
                  label={collapsed ? undefined : item.label}
                  leftSection={<item.icon size={20} stroke={1.5} />}
                  active={active}
                  variant="light"
                  color="navy"
                  onClick={closeMobile}
                  className={classes.navLink}
                  aria-label={item.label}
                  aria-current={active ? 'page' : undefined}
                />
              );
              return (
                <Box key={item.to}>
                  {showGroupLabel && (
                    <Text fz="xs" fw={600} c="dimmed" tt="uppercase" px="sm" pt="md" pb={4}>
                      {item.group}
                    </Text>
                  )}
                  {collapsed ? (
                    <Tooltip label={item.label} position="right">
                      {link}
                    </Tooltip>
                  ) : (
                    link
                  )}
                </Box>
              );
            })}
          </Stack>
        </ScrollArea>
      </AppShell.Navbar>

      {/* ---------- Main ---------- */}
      <AppShell.Main>
        <Box maw="var(--sga-content-max-width)" mx="auto" pb="var(--sga-space-2xl)">
          <Outlet />
        </Box>
      </AppShell.Main>
    </AppShell>
  );
}
