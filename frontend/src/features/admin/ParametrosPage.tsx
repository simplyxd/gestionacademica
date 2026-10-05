import {
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
import { notify } from '@/lib/notify';
import { ZONAS_HORARIAS } from '@/mocks/parametros';
import { ParametroField } from './components/ParametroField';
import glass from '@/theme/glass.module.css';

export function ParametrosPage() {
  const { parametros, updateCampo, guardar, restablecer, dirty } = useParametros();

  const onGuardar = () => {
    guardar();
    notify.success({
      title: 'Parámetros guardados',
      message: 'Los valores mock quedaron en este navegador.',
    });
  };

  return (
    <>
      <PageHeader
        title="Parámetros institucionales"
        description="Ajustes de identidad y operación del portal. No reemplaza la estructura académica (sedes, carreras ni secciones)."
        actions={
          <Group gap="sm">
            <Button
              variant="default"
              leftSection={<IconRotate size={16} />}
              onClick={() => {
                restablecer();
                notify.info({
                  title: 'Valores restablecidos',
                  message: 'Se restauró la configuración inicial mock.',
                });
              }}
            >
              Restablecer
            </Button>
            <Button
              color="navy"
              leftSection={<IconDeviceFloppy size={16} />}
              onClick={onGuardar}
              disabled={!dirty}
            >
              Guardar cambios
            </Button>
          </Group>
        }
      />

      <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg">
        <Paper className={glass.glass} p="lg" radius="md">
          <Stack gap="md">
            <Title order={3}>Identidad</Title>
            <ParametroField
              label="Nombre institucional"
              value={parametros.nombreInstitucion}
              onChange={(e) => updateCampo('nombreInstitucion', e.currentTarget.value)}
              hint="Se muestra en el encabezado de todas las pantallas mock."
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
              maxLength={12}
            />
          </Stack>
        </Paper>

        <Paper className={glass.glass} p="lg" radius="md">
          <Stack gap="md">
            <Title order={3}>Contacto y mensajes</Title>
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
            <Title order={3}>Operación del portal</Title>
            <Select
              label="Zona horaria"
              data={ZONAS_HORARIAS}
              value={parametros.zonaHoraria}
              onChange={(v) => v && updateCampo('zonaHoraria', v)}
              allowDeselect={false}
            />
            <NumberInput
              label="Duración de sesión (minutos)"
              min={15}
              max={240}
              value={parametros.duracionSesionMinutos}
              onChange={(v) => updateCampo('duracionSesionMinutos', Number(v) || 45)}
            />
            <Switch
              label="Permitir recuperación de clave (mock)"
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
            <Title order={4}>Vista previa</Title>
            <Text size="sm" c="dimmed">
              Así se verá el encabezado tras guardar (lectura en cliente):
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
                Hay cambios sin guardar en este navegador.
              </Text>
            )}
          </Stack>
        </Paper>
      </SimpleGrid>
    </>
  );
}
