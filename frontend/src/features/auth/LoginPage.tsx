import { Box, Button, Center, Paper, PasswordInput, Stack, Text, TextInput, Title } from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconLogin2 } from '@tabler/icons-react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useParametros } from '@/app/parametros/ParametrosContext';
import { BrandLogo } from '@/components/brand/BrandLogo';
import glass from '@/theme/glass.module.css';
import { useAuth } from './AuthContext';
import { rutaInicio } from './rutaInicio';

interface Credenciales {
  correo: string;
  contrasena: string;
}

const CORREO_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Ruta a la que volver tras iniciar sesión: la que pidió RequireAuth, si es interna y no es /login. */
function rutaDestino(state: unknown): string | null {
  const from = (state as { from?: unknown } | null)?.from;
  if (typeof from !== 'string' || !from.startsWith('/') || from.startsWith('//')) return null;
  return from.startsWith('/login') ? null : from;
}

/**
 * Login simulado, fuera del AppShell (system design: tarjeta `glassStrong`).
 * Prototipo: cualquier correo con formato válido y cualquier contraseña no vacía inician sesión;
 * la contraseña no se guarda. El perfil sigue siendo el elegido en «Probar como…».
 */
export function LoginPage() {
  const { usuario, sesion, iniciarSesion } = useAuth();
  const { parametros } = useParametros();
  const location = useLocation();
  const navigate = useNavigate();
  const destino = rutaDestino(location.state) ?? rutaInicio(usuario.rol);

  const form = useForm<Credenciales>({
    initialValues: { correo: '', contrasena: '' },
    validate: {
      correo: (v) =>
        !v.trim() ? 'Ingresa tu correo.' : CORREO_VALIDO.test(v.trim()) ? null : 'Ingresa un correo válido.',
      contrasena: (v) => (v ? null : 'Ingresa tu contraseña.'),
    },
  });

  if (sesion) return <Navigate to={destino} replace />;

  const enviar = form.onSubmit(
    (values) => {
      iniciarSesion(values.correo.trim());
      navigate(destino, { replace: true });
    },
    (errors) => {
      const primero = Object.keys(errors)[0];
      if (primero) form.getInputNode(primero)?.focus();
    },
  );

  return (
    <Box className={glass.pageBackground}>
      <Center mih="100dvh" px="md" py="xl">
        <Paper component="main" className={glass.glassStrong} p={{ base: 'lg', sm: 'xl' }} radius="md" w="100%" maw={420}>
          <Stack gap="lg">
            <Stack gap="xs" align="center" ta="center">
              <BrandLogo size={44} wordmark={parametros.siglasPortal} />
              <Title order={1} fz="h2" mt="sm">
                Iniciar sesión
              </Title>
              <Text c="dimmed" fz="sm">
                {parametros.nombreInstitucion}
              </Text>
            </Stack>

            <form onSubmit={enviar} noValidate>
              <Stack gap="md">
                <TextInput
                  label="Correo institucional"
                  type="email"
                  autoComplete="username"
                  placeholder="nombre@instituto.example"
                  withAsterisk
                  {...form.getInputProps('correo')}
                />
                <PasswordInput
                  label="Contraseña"
                  autoComplete="current-password"
                  withAsterisk
                  {...form.getInputProps('contrasena')}
                />
                <Button type="submit" fullWidth mt="xs" leftSection={<IconLogin2 size={18} stroke={1.5} />}>
                  Iniciar sesión
                </Button>
              </Stack>
            </form>

            <Text c="dimmed" fz="xs" ta="center">
              Prototipo: cualquier correo y contraseña sirven.
            </Text>
          </Stack>
        </Paper>
      </Center>
    </Box>
  );
}
