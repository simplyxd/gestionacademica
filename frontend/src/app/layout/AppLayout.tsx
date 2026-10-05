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
  Select,
  Stack,
  Text,
  Tooltip,
  useComputedColorScheme,
  useMantineColorScheme,
} from '@mantine/core';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import { IconChevronDown, IconFlask, IconMoon, IconSun, IconUserCheck } from '@tabler/icons-react';
import { Suspense, useEffect, useRef } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useSga } from '@/app/SgaContext';
import { BrandLogo } from '@/components/brand/BrandLogo';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { PageSkeleton } from '@/components/ui/PageSkeleton';
import { useAuth } from '@/features/auth/AuthContext';
import { ESCENARIOS } from '@/features/inscripcion/reglas';
import { PERIODO_ACTUAL as PERIODO_SGA } from '@/mocks/sga';
import { ESTADO_PERIODO_COLOR } from '@/features/periodos/estado';
import { usePeriodos } from '@/features/periodos/PeriodosContext';
import glass from '@/theme/glass.module.css';
import { NAV_BY_ROLE, ROL_LABEL, type Rol } from '../navigation';
import classes from './AppLayout.module.css';

/** Estado del período para el Estudiante: lo dicta el «escenario de prueba» de la inscripción. */
const ESTADO_POR_ESCENARIO = {
  normal: { label: 'inscripción abierta', color: 'teal' },
  'sin-matricula': { label: 'inscripción abierta', color: 'teal' },
  'ventana-futura': { label: 'planificación', color: 'sky' },
  'ventana-cerrada': { label: 'cerrado', color: 'slate' },
} as const;

const ROLES: Rol[] = ['coordinador', 'estudiante', 'docente', 'admin'];

export function AppLayout() {
  const { usuario, cambiarRol } = useAuth();
  const { escenario, setEscenario } = useSga();
  const { periodoActual } = usePeriodos();
  const esEstudiante = usuario.rol === 'estudiante';
  const [mobileOpened, { toggle: toggleMobile, close: closeMobile }] = useDisclosure(false);
  const [desktopCollapsed, { toggle: toggleDesktop }] = useDisclosure(false);
  const isTablet = useMediaQuery('(max-width: 75em)'); // < lg → iconos
  const collapsed = desktopCollapsed || Boolean(isTablet);

  const { setColorScheme } = useMantineColorScheme();
  const scheme = useComputedColorScheme('light');
  const { pathname } = useLocation();
  const items = NAV_BY_ROLE[usuario.rol];

  // En una SPA el foco se queda en el enlace pulsado al cambiar de ruta: lo llevamos al contenido
  // para que teclado y lector de pantalla empiecen en la página nueva (no en la carga inicial).
  const mainRef = useRef<HTMLElement>(null);
  const rutaPrevia = useRef(pathname);
  useEffect(() => {
    if (rutaPrevia.current !== pathname) {
      rutaPrevia.current = pathname;
      mainRef.current?.focus({ preventScroll: true });
    }
  }, [pathname]);

  return (
    <>
    <a href="#contenido-principal" className={classes.skipLink}>
      Saltar al contenido
    </a>
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
        {/* ---------- Header ---------- */}
        <AppShell.Header className={glass.glassHeader}>
          <Group h="100%" px="md" justify="space-between" wrap="nowrap">
            <Group gap="sm" wrap="nowrap">
              <Burger opened={mobileOpened} onClick={toggleMobile} hiddenFrom="sm" size="sm" aria-label="Abrir menú" />
              <Burger opened={!desktopCollapsed} onClick={toggleDesktop} visibleFrom="lg" size="sm" aria-label="Contraer menú" />
              <BrandLogo size={30} />
              <Text c="dimmed" fz="sm" visibleFrom="md" component="span">
                Instituto Universitario Nueva Formación
              </Text>
            </Group>

            <Group gap="sm" wrap="nowrap">
              {esEstudiante ? (
                <>
                  <Badge color={ESTADO_POR_ESCENARIO[escenario].color} size="lg" visibleFrom="xs">
                    {periodoActual?.codigo ?? PERIODO_SGA} · {ESTADO_POR_ESCENARIO[escenario].label}
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
                </>
              ) : (
                periodoActual && (
                  <Badge color={ESTADO_PERIODO_COLOR[periodoActual.estado]} size="lg" visibleFrom="xs">
                    {periodoActual.codigo} · {periodoActual.estado}
                  </Badge>
                )
              )}

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
          <ScrollArea type="never" flex={1}>
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
        <AppShell.Main id="contenido-principal" ref={mainRef} tabIndex={-1} className={classes.main}>
          <Box maw="var(--sga-content-max-width)" mx="auto" pb="var(--sga-space-2xl)">
            <Suspense fallback={<PageSkeleton />}>
              <Outlet />
            </Suspense>
            <SiteFooter links={items.map((item) => ({ label: item.label, href: item.to }))} />
          </Box>
        </AppShell.Main>
      </AppShell>
    </>
  );
}
