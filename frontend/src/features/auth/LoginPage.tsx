import { Alert, Box, Button, Center, Divider, Paper, PasswordInput, Stack, Text, TextInput, Title } from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconLogin2, IconSchool, IconUserCheck } from '@tabler/icons-react';
import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useParametros } from '@/app/parametros/ParametrosContext';
import { BrandLogo } from '@/components/brand/BrandLogo';
import { ApiError } from '@/lib/api';
import { session } from '@/lib/session';
import { CUENTAS_DEMO } from '@/mocks/demoUsuarios';
import glass from '@/theme/glass.module.css';
import { useAuth } from './AuthContext';
import { ComprobandoSesion, ErrorDeSesion } from './EstadoSesion';
import { esAbort } from './usuario';
import { destinoTrasLogin } from './rutaInicio';

interface Credenciales {
  correo: string;
  contrasena: string;
}

const CORREO_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function LoginPage() {
  const { usuario, sesion, cargando, errorSesion, iniciarSesion, iniciarSesionDemo, recargarSesion, cerrarSesion } = useAuth();
  const { parametros } = useParametros();
  const location = useLocation();
  const navigate = useNavigate();
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<Credenciales>({
    initialValues: { correo: '', contrasena: '' },
    validate: {
      correo: (v) => (!v.trim() ? 'Ingresa tu correo.' : CORREO_VALIDO.test(v.trim()) ? null : 'Ingresa un correo válido.'),
      contrasena: (v) => (v ? null : 'Ingresa tu contraseña.'),
    },
  });

  if (cargando) return <ComprobandoSesion />;
  if (!sesion && errorSesion && session.getToken()) {
    return <ErrorDeSesion mensaje={errorSesion} onReintentar={recargarSesion} onSalir={cerrarSesion} />;
  }
  if (sesion) {
    return <Navigate to={destinoTrasLogin(usuario.rol, usuario.debeCambiarClave, location.state)} replace state={location.state} />;
  }

  const irTrasEntrar = (entrado: typeof usuario) => {
    navigate(destinoTrasLogin(entrado.rol, entrado.debeCambiarClave, location.state), {
      replace: true,
      state: location.state,
    });
  };

  const enviar = form.onSubmit(
    async (values) => {
      setError(null);
      setEnviando(true);
      try {
        const entrado = await iniciarSesion(values.correo.trim(), values.contrasena);
        irTrasEntrar(entrado);
      } catch (causa) {
        if (esAbort(causa)) return;
        // Un 401 de login es clave o correo incorrectos: no hay token, así que no es una sesión vencida.
        setError(causa instanceof ApiError ? causa.message : 'No se pudo iniciar sesión. Inténtalo de nuevo.');
      } finally {
        setEnviando(false);
      }
    },
    (errores) => {
      const primero = Object.keys(errores)[0];
      if (primero) form.getInputNode(primero)?.focus();
    },
  );

  const estudiante = CUENTAS_DEMO.find((c) => c.rol === 'estudiante');
  const coordinador = CUENTAS_DEMO.find((c) => c.rol === 'coordinador');

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

            <Stack gap="sm">
              <Text fz="sm" fw={600}>
                Demo para el profesor
              </Text>
              <Text c="dimmed" fz="sm">
                Entra sin backend: el alumno puede inscribir y el coordinador administra períodos.
              </Text>
              {estudiante && (
                <Button
                  variant="filled"
                  fullWidth
                  leftSection={<IconSchool size={18} stroke={1.5} />}
                  disabled={enviando}
                  onClick={() => irTrasEntrar(iniciarSesionDemo(estudiante))}
                >
                  Entrar como {estudiante.nombre} (estudiante)
                </Button>
              )}
              {coordinador && (
                <Button
                  variant="light"
                  fullWidth
                  leftSection={<IconUserCheck size={18} stroke={1.5} />}
                  disabled={enviando}
                  onClick={() => irTrasEntrar(iniciarSesionDemo(coordinador))}
                >
                  Entrar como coordinador (períodos)
                </Button>
              )}
              {estudiante && (
                <Text c="dimmed" fz="xs">
                  Correo demo: {estudiante.correo}
                </Text>
              )}
            </Stack>

            <Divider label="o con cuenta del servidor" labelPosition="center" />

            <form onSubmit={enviar} noValidate>
              <Stack gap="md">
                {error && (
                  <Alert color="crimson" role="alert">
                    {error}
                  </Alert>
                )}
                <TextInput
                  label="Correo institucional"
                  type="email"
                  autoComplete="username"
                  placeholder="nombre@instituto.example"
                  withAsterisk
                  disabled={enviando}
                  {...form.getInputProps('correo')}
                />
                <PasswordInput
                  label="Contraseña"
                  autoComplete="current-password"
                  withAsterisk
                  disabled={enviando}
                  {...form.getInputProps('contrasena')}
                />
                <Button type="submit" fullWidth mt="xs" loading={enviando} leftSection={<IconLogin2 size={18} stroke={1.5} />}>
                  Iniciar sesión
                </Button>
              </Stack>
            </form>
          </Stack>
        </Paper>
      </Center>
    </Box>
  );
}
