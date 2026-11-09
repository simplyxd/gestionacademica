import { Alert, Box, Button, Center, Group, Loader, Paper, Stack, Text, Title } from '@mantine/core';
import type { ReactNode } from 'react';
import glass from '@/theme/glass.module.css';

function Marco({ children }: { children: ReactNode }) {
  return (
    <Box className={glass.pageBackground}>
      <Center mih="100dvh" px="md" py="xl">
        {children}
      </Center>
    </Box>
  );
}

/** Mientras /auth/me confirma el token guardado. */
export function ComprobandoSesion() {
  return (
    <Marco>
      <Stack align="center" gap="sm" role="status" aria-live="polite" aria-busy="true">
        <Loader color="navy" />
        <Text c="dimmed">Comprobando tu sesión…</Text>
      </Stack>
    </Marco>
  );
}

interface ErrorDeSesionProps {
  mensaje: string;
  onReintentar: () => void;
  onSalir: () => void;
}

/** El token sigue guardado, pero no pudimos hablar con el servidor. No te mandamos al login en silencio. */
export function ErrorDeSesion({ mensaje, onReintentar, onSalir }: ErrorDeSesionProps) {
  return (
    <Marco>
      <Paper component="main" className={glass.glassStrong} p={{ base: 'lg', sm: 'xl' }} radius="md" w="100%" maw={420}>
        <Stack gap="lg">
          <Title order={1} fz="h2">
            No pudimos comprobar tu sesión
          </Title>
          <Alert color="crimson" role="alert">
            {mensaje}
          </Alert>
          <Group justify="flex-end" gap="sm">
            <Button variant="subtle" color="slate" onClick={onSalir}>
              Ir al inicio de sesión
            </Button>
            <Button onClick={onReintentar}>Reintentar</Button>
          </Group>
        </Stack>
      </Paper>
    </Marco>
  );
}
