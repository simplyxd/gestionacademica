import {
  ActionIcon,
  AppShell,
  Avatar,
  Badge,
  Box,
  Burger,
  Group,
  NavLink,
  ScrollArea,
  Select,
  Stack,
  Text,
  Tooltip,
  useComputedColorScheme,
  useMantineColorScheme,
} from '@mantine/core';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import { IconFlask, IconMoon, IconSun } from '@tabler/icons-react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { NAV_ESTUDIANTE } from '@/app/navigation';
import { useSga } from '@/app/SgaContext';
import { ESCENARIOS } from '@/features/inscripcion/reglas';
import { estudiante, PERIODO_ACTUAL } from '@/mocks/sga';
import glass from '@/theme/glass.module.css';
import classes from './AppLayout.module.css';

const ESTADO_POR_ESCENARIO = {
  normal: { label: 'inscripción abierta', color: 'teal' },
  'sin-matricula': { label: 'inscripción abierta', color: 'teal' },
  'ventana-futura': { label: 'planificación', color: 'sky' },
  'ventana-cerrada': { label: 'cerrado', color: 'slate' },
} as const;

export function AppLayout() {
  const [mobileOpened, { toggle: toggleMobile, close: closeMobile }] = useDisclosure(false);
  const [desktopCollapsed, { toggle: toggleDesktop }] = useDisclosure(false);
  const isTablet = useMediaQuery('(max-width: 75em)');
  const collapsed = desktopCollapsed || Boolean(isTablet);

  const { setColorScheme } = useMantineColorScheme();
  const scheme = useComputedColorScheme('light');
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { escenario, setEscenario } = useSga();
  const estado = ESTADO_POR_ESCENARIO[escenario];

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
      styles={{ main: { backgroundColor: 'transparent' } }}
    >
      <AppShell.Header className={glass.glassHeader}>
        <Group h="100%" px="md" justify="space-between" wrap="nowrap">
          <Group gap="sm" wrap="nowrap">
            <Burger opened={mobileOpened} onClick={toggleMobile} hiddenFrom="sm" size="sm" aria-label="Abrir menú" />
            <Burger
              opened={!desktopCollapsed}
              onClick={toggleDesktop}
              visibleFrom="lg"
              size="sm"
              aria-label="Contraer menú"
            />
            <Text fw={700} fz="lg" c="navy" component="span">
              SGA
            </Text>
            <Text c="dimmed" fz="sm" visibleFrom="md" component="span">
              Instituto Universitario Nueva Formación
            </Text>
          </Group>

          <Group gap="sm" wrap="nowrap">
            <Badge color={estado.color} size="lg" visibleFrom="xs">
              {PERIODO_ACTUAL} · {estado.label}
            </Badge>

            <Select
              aria-label="Escenario de prueba"
              leftSection={<IconFlask size={16} stroke={1.5} />}
              data={ESCENARIOS}
              value={escenario}
              onChange={(v) => v && setEscenario(v as typeof escenario)}
              allowDeselect={false}
              w={{ base: 44, sm: 260 }}
              visibleFrom="sm"
            />

            <Tooltip label={scheme === 'dark' ? 'Modo claro' : 'Modo oscuro'}>
              <ActionIcon
                onClick={() => setColorScheme(scheme === 'dark' ? 'light' : 'dark')}
                aria-label="Cambiar esquema de color"
              >
                {scheme === 'dark' ? <IconSun size={18} stroke={1.5} /> : <IconMoon size={18} stroke={1.5} />}
              </ActionIcon>
            </Tooltip>

            <Group gap="xs" className={classes.userButton}>
              <Avatar color="navy" radius="xl" size="sm">JS</Avatar>
              <Box visibleFrom="sm" ta="left">
                <Text fz="sm" fw={600} lh={1.2}>{estudiante.nombre}</Text>
                <Text fz="xs" c="dimmed" lh={1.2}>Estudiante</Text>
              </Box>
            </Group>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar className={glass.glassNavbar} p="sm">
        <ScrollArea type="never" style={{ flex: 1 }}>
          <Stack gap={4}>
            {NAV_ESTUDIANTE.map((item) => {
              const active = pathname === item.to || pathname.startsWith(`${item.to}/`);
              const link = (
                <NavLink
                  key={item.to}
                  label={collapsed ? undefined : item.label}
                  leftSection={<item.icon size={20} stroke={1.5} />}
                  active={active}
                  variant="light"
                  color="navy"
                  onClick={() => {
                    navigate(item.to);
                    closeMobile();
                  }}
                  className={classes.navLink}
                  aria-label={item.label}
                />
              );
              return collapsed ? (
                <Tooltip key={item.to} label={item.label} position="right">
                  {link}
                </Tooltip>
              ) : (
                link
              );
            })}
          </Stack>
        </ScrollArea>
      </AppShell.Navbar>

      <AppShell.Main>
        <Box maw="var(--sga-content-max-width)" mx="auto" pb="var(--sga-space-2xl)">
          <Outlet />
        </Box>
      </AppShell.Main>
    </AppShell>
  );
}
