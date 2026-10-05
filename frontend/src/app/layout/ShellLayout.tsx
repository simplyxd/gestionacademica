import {
  ActionIcon,
  AppShell,
  Avatar,
  Box,
  Burger,
  Group,
  NavLink,
  ScrollArea,
  Stack,
  Text,
  Title,
  Tooltip,
  useComputedColorScheme,
  useMantineColorScheme,
} from '@mantine/core';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import { IconMoon, IconSun } from '@tabler/icons-react';
import type { ReactNode } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { BrandLogo } from '@/components/brand/BrandLogo';
import { SiteFooter } from '@/components/layout/SiteFooter';
import type { NavItem } from '@/app/navigation';
import { useParametros } from '@/app/parametros/ParametrosContext';
import glass from '@/theme/glass.module.css';
import classes from './AppLayout.module.css';

export interface ShellUsuario {
  nombre: string;
  rolLabel: string;
  iniciales: string;
}

interface ShellLayoutProps {
  navItems: NavItem[];
  usuario: ShellUsuario;
  institucionNombre: string;
  headerBadge?: ReactNode;
  headerExtra?: ReactNode;
  footerLinks: { label: string; href: string }[];
  groupedNav?: boolean;
}

export function ShellLayout({
  navItems,
  usuario,
  institucionNombre,
  headerBadge,
  headerExtra,
  footerLinks,
  groupedNav = false,
}: ShellLayoutProps) {
  const [mobileOpened, { toggle: toggleMobile, close: closeMobile }] = useDisclosure(false);
  const [desktopCollapsed, { toggle: toggleDesktop }] = useDisclosure(false);
  const isTablet = useMediaQuery('(max-width: 75em)');
  const collapsed = desktopCollapsed || Boolean(isTablet);

  const { setColorScheme } = useMantineColorScheme();
  const scheme = useComputedColorScheme('light');
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { parametros } = useParametros();

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
            <BrandLogo size={30} wordmark={parametros.siglasPortal} />
            <Text c="dimmed" fz="sm" visibleFrom="md" component="span" lineClamp={1}>
              {institucionNombre}
            </Text>
          </Group>

          <Group gap="sm" wrap="nowrap">
            {headerBadge}
            {headerExtra}

            <Tooltip label={scheme === 'dark' ? 'Modo claro' : 'Modo oscuro'}>
              <ActionIcon
                onClick={() => setColorScheme(scheme === 'dark' ? 'light' : 'dark')}
                aria-label="Cambiar esquema de color"
              >
                {scheme === 'dark' ? <IconSun size={18} stroke={1.5} /> : <IconMoon size={18} stroke={1.5} />}
              </ActionIcon>
            </Tooltip>

            <Group gap="xs" className={classes.userButton}>
              <Avatar color="navy" radius="xl" size="sm">
                {usuario.iniciales}
              </Avatar>
              <Box visibleFrom="sm" ta="left">
                <Text fz="sm" fw={600} lh={1.2}>
                  {usuario.nombre}
                </Text>
                <Text fz="xs" c="dimmed" lh={1.2}>
                  {usuario.rolLabel}
                </Text>
              </Box>
            </Group>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar className={glass.glassNavbar} p="sm">
        <ScrollArea type="never" style={{ flex: 1 }}>
          <Stack gap={4}>
            {navItems.map((item, index) => {
              const prev = navItems[index - 1];
              const showGroup =
                groupedNav && item.group && item.group !== prev?.group && !collapsed;

              const active =
                item.to === '/admin'
                  ? pathname === '/admin'
                  : pathname === item.to || pathname.startsWith(`${item.to}/`);

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

              return (
                <Box key={item.to}>
                  {showGroup && (
                    <Title order={6} c="dimmed" tt="uppercase" fz={10} fw={700} mb={4} mt="xs" px="sm">
                      {item.group}
                    </Title>
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

      <AppShell.Main>
        <Box
          maw="var(--sga-content-max-width)"
          mx="auto"
          pb="var(--sga-space-2xl)"
          component="main"
          id="contenido-principal"
        >
          <Outlet />
          <SiteFooter links={footerLinks} />
        </Box>
      </AppShell.Main>
    </AppShell>
  );
}
