import { Alert, Box, Button, Center, Paper, PasswordInput, Stack, Text, Title } from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconCheck } from '@tabler/icons-react';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useParametros } from '@/app/parametros/ParametrosContext';
import { BrandLogo } from '@/components/brand/BrandLogo';
import { ApiError, api } from '@/lib/api';
import { notify } from '@/lib/notify';
import glass from '@/theme/glass.module.css';
import { useAuth } from './AuthContext';
import { validarCambioClave, type CambioClave } from './clave';
import { destinoTrasCambiarClave } from './rutaInicio';
import { esAbort } from './usuario';

export function CambiarClavePage() {
  const { usuario, cerrarSesion, refrescarUsuario } = useAuth();
  const { parametros } = useParametros();
  const location = useLocation();
  const navigate = useNavigate();
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const obligatoria = usuario.debeCambiarClave;

  const form = useForm<CambioClave>({
    initialValues: { actual: '', nueva: '', confirmacion: '' },
    validate: validarCambioClave,
  });
  const vacio = !form.values.actual && !form.values.nueva && !form.values.confirmacion;

  const salir = () => {
    cerrarSesion();
    navigate('/login', { replace: true });
  };

  const enviar = form.onSubmit(
    async (values) => {
      setError(null);
      setEnviando(true);
      try {
        await api.post('/auth/cambiar-clave', { actual: values.actual, nueva: values.nueva });
        const fresco = await refrescarUsuario();
        if (fresco.debeCambiarClave) {
          setError('La contraseña no quedó actualizada. Inténtalo de nuevo.');
          return;
        }
        notify.success({ title: 'Contraseña actualizada', message: 'Ya puedes seguir usando el sistema.' });
        navigate(destinoTrasCambiarClave(fresco.rol, location.state), { replace: true });
      } catch (causa) {
        if (esAbort(causa)) return;
        // Un 401 de sesión vencida lo resuelve api.ts y EscucharSesionInvalida. La clave actual incorrecta se queda en el formulario.
        if (causa instanceof ApiError && causa.status === 401 && causa.code !== 'AUT_CLAVE_ACTUAL_INCORRECTA') return;
        setError(causa instanceof ApiError ? causa.message : 'No se pudo cambiar la contraseña. Inténtalo de nuevo.');
      } finally {
        setEnviando(false);
      }
    },
    (errores) => {
      const primero = Object.keys(errores)[0];
      if (primero) form.getInputNode(primero)?.focus();
    },
  );

  return (
    <Box className={glass.pageBackground}>
      <Center mih="100dvh" px="md" py="xl">
        <Paper component="main" className={glass.glassStrong} p={{ base: 'lg', sm: 'xl' }} radius="md" w="100%" maw={460}>
          <Stack gap="lg">
            <Stack gap="xs" align="center" ta="center">
              <BrandLogo size={44} wordmark={parametros.siglasPortal} />
              <Title order={1} fz="h2" mt="sm">
                Cambia tu contraseña
              </Title>
              <Text c="dimmed" fz="sm">
                {obligatoria
                  ? 'Antes de continuar tienes que elegir una contraseña nueva. Hasta que la cambies no puedes usar el resto del sistema.'
                  : 'Elige una contraseña distinta a la que usas ahora.'}
              </Text>
            </Stack>

            <form onSubmit={enviar} noValidate>
              <Stack gap="md">
                {error && (
                  <Alert color="crimson" role="alert">
                    {error}
                  </Alert>
                )}
                {vacio && !error && (
                  <Text c="dimmed" fz="sm" role="status">
                    Todavía no escribes la contraseña nueva.
                  </Text>
                )}
                <PasswordInput
                  label="Contraseña actual"
                  autoComplete="current-password"
                  withAsterisk
                  disabled={enviando}
                  data-autofocus
                  {...form.getInputProps('actual')}
                />
                <PasswordInput
                  label="Contraseña nueva"
                  description="Mínimo 10 caracteres, con una letra y un número."
                  autoComplete="new-password"
                  withAsterisk
                  disabled={enviando}
                  {...form.getInputProps('nueva')}
                />
                <PasswordInput
                  label="Repite la contraseña nueva"
                  autoComplete="new-password"
                  withAsterisk
                  disabled={enviando}
                  {...form.getInputProps('confirmacion')}
                />
                <Button type="submit" fullWidth mt="xs" loading={enviando} leftSection={<IconCheck size={18} stroke={1.5} />}>
                  Guardar contraseña
                </Button>
              </Stack>
            </form>

            <Button variant="subtle" color="slate" onClick={salir} disabled={enviando}>
              Cerrar sesión
            </Button>
          </Stack>
        </Paper>
      </Center>
    </Box>
  );
}
