import {
  Alert,
  Button,
  Group,
  NumberInput,
  Paper,
  Select,
  SimpleGrid,
  Stack,
  Switch,
  Text,
  Textarea,
  Title,
} from '@mantine/core';
import { IconDeviceFloppy, IconRotate } from '@tabler/icons-react';
import { useParametros } from '@/app/parametros/ParametrosContext';
import { PageHeader } from '@/components/layout/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageSkeleton } from '@/components/ui/PageSkeleton';
import { notify } from '@/lib/notify';
import { ZONAS_HORARIAS } from '@/mocks/parametros';
import { ParametroField } from './components/ParametroField';
import glass from '@/theme/glass.module.css';

export function ParametrosPage() {
  const {
    parametros,
    updateCampo,
    guardar,
    restablecer,
    dirty,
    estado,
    error,
    errorGuardado,
    cargando,
    guardando,
    recargar,
  } = useParametros();

  if (cargando && estado !== 'listo' && estado !== 'vacio') {
    return <PageSkeleton />;
  }

  const onGuardar = async () => {
    const ok = await guardar();
    if (ok) {
      notify.success({
        title: 'Parámetros guardados',
        message: 'Los cambios ya están en el portal.',
      });
    }
  };

  const formulario = (
    <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg">
      <Paper className={glass.glass} p="lg" radius="md">
        <Stack gap="md">
          <Title order={2} size="h3">Identidad</Title>
          <ParametroField
            label="Nombre institucional"
            value={parametros.nombreInstitucion}
            onChange={(e) => updateCampo('nombreInstitucion', e.currentTarget.value)}
            hint="Se muestra en el encabezado de todas las pantallas."
          />
          <ParametroField
            label="Nombre corto"
            value={parametros.nombreCorto}
            onChange={(e) => updateCampo('nombreCorto', e.currentTarget.value)}
          />
          <ParametroField
            label="Siglas del portal"
            value={parametros.siglasPortal}
            onChange={(e) => updateCampo('siglasPortal', e.currentTarget.value)}
            maxLength={20}
          />
        </Stack>
      </Paper>

      <Paper className={glass.glass} p="lg" radius="md">
        <Stack gap="md">
          <Title order={2} size="h3">Contacto y mensajes</Title>
          <ParametroField
            label="Correo mesa de ayuda"
            type="email"
            value={parametros.correoContacto}
            onChange={(e) => updateCampo('correoContacto', e.currentTarget.value)}
          />
          <ParametroField
            label="Teléfono mesa de ayuda"
            value={parametros.telefonoMesa}
            onChange={(e) => updateCampo('telefonoMesa', e.currentTarget.value)}
          />
          <Textarea
            label="Mensaje de bienvenida"
            minRows={3}
            value={parametros.mensajeBienvenida}
            onChange={(e) => updateCampo('mensajeBienvenida', e.currentTarget.value)}
          />
        </Stack>
      </Paper>

      <Paper className={glass.glass} p="lg" radius="md">
        <Stack gap="md">
          <Title order={2} size="h3">Operación del portal</Title>
          <Select
            label="Zona horaria"
            data={ZONAS_HORARIAS}
            value={parametros.zonaHoraria}
            onChange={(v) => v && updateCampo('zonaHoraria', v)}
            allowDeselect={false}
          />
          <NumberInput
            label="Duración de sesión (minutos)"
            description="Entre 5 y 720 minutos."
            min={5}
            max={720}
            value={parametros.duracionSesionMinutos}
            onChange={(v) => updateCampo('duracionSesionMinutos', Number(v) || 5)}
          />
          <Switch
            label="Permitir recuperación de clave"
            checked={parametros.permitirRecuperacionClave}
            onChange={(e) => updateCampo('permitirRecuperacionClave', e.currentTarget.checked)}
          />
          <Switch
            label="Mostrar código de asignatura en tablas"
            checked={parametros.mostrarCodigoAsignaturaEnTablas}
            onChange={(e) => updateCampo('mostrarCodigoAsignaturaEnTablas', e.currentTarget.checked)}
          />
        </Stack>
      </Paper>

      <Paper className={glass.glassStrong} p="lg" radius="md">
        <Stack gap="sm">
          <Title order={3} size="h4">Vista previa</Title>
          <Text size="sm" c="dimmed">
            Así se verá el encabezado:
          </Text>
          <Text fw={700} c="navy">
            {parametros.siglasPortal} · {parametros.nombreInstitucion}
          </Text>
          <Text size="sm">{parametros.mensajeBienvenida}</Text>
          <Text size="xs" c="dimmed">
            Contacto: {parametros.correoContacto} · {parametros.telefonoMesa}
          </Text>
          {dirty && (
            <Text size="xs" c="orange">
              Hay cambios sin guardar.
            </Text>
          )}
        </Stack>
      </Paper>
    </SimpleGrid>
  );

  return (
    <>
      <PageHeader
        title="Parámetros institucionales"
        description="Ajustes de identidad y operación del portal. No reemplaza la estructura académica (sedes, carreras ni secciones)."
        actions={
          estado === 'listo' || estado === 'vacio' ? (
            <Group gap="sm">
              <Button
                variant="default"
                leftSection={<IconRotate size={16} />}
                disabled={!dirty || guardando}
                onClick={() => {
                  restablecer();
                  notify.info({
                    title: 'Cambios descartados',
                    message: 'Volviste a los últimos parámetros guardados.',
                  });
                }}
              >
                Restablecer
              </Button>
              <Button
                color="navy"
                leftSection={<IconDeviceFloppy size={16} />}
                onClick={() => void onGuardar()}
                disabled={guardando || (!dirty && estado !== 'vacio')}
                loading={guardando}
              >
                Guardar cambios
              </Button>
            </Group>
          ) : null
        }
      />

      {estado === 'error' && (
        <Alert color="crimson" role="alert" title="No se pudieron cargar los parámetros">
          <Stack gap="sm">
            <Text size="sm">{error}</Text>
            <Button variant="default" onClick={() => void recargar()} w="fit-content">
              Reintentar
            </Button>
          </Stack>
        </Alert>
      )}

      {estado === 'vacio' && (
        <EmptyState
          title="Aún no hay parámetros guardados"
          description="Completa el formulario y guárdalo. Así creas la configuración de la institución."
        />
      )}

      {(estado === 'listo' || estado === 'vacio') && (
        <Stack gap="md">
          {errorGuardado && (
            <Alert color="crimson" role="alert" title="No se pudieron guardar los cambios">
              {errorGuardado}
            </Alert>
          )}
          {formulario}
        </Stack>
      )}
    </>
  );
}
