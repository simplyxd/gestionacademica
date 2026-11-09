import { Alert, Button, Grid, MultiSelect, PasswordInput, Select, Stack, TagsInput, Text, TextInput, useMantineTheme } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { IconCheck } from '@tabler/icons-react';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { DetailDrawer } from '@/components/ui/DetailDrawer';
import { ApiError } from '@/lib/api';
import {
  ETIQUETA_VINCULO,
  NIVELES,
  ROLES_USUARIO,
  TIPOS_VINCULO,
  borradorDe,
  borradorVacio,
  cuerpoDeUsuario,
  erroresDeApi,
  validarBorrador,
  type BorradorUsuario,
  type CuerpoUsuario,
  type OpcionSede,
  type UsuarioLista,
} from './users';

const FORM_ID = 'usuario-form';
const aFecha = (iso: string) => (iso ? dayjs(iso).toDate() : null);
const aIso = (fecha: Date | null) => (fecha ? dayjs(fecha).format('YYYY-MM-DD') : '');

const VINCULOS = TIPOS_VINCULO.map((value) => ({ value, label: ETIQUETA_VINCULO[value] }));

interface UsuarioFormDrawerProps {
  opened: boolean;
  usuario: UsuarioLista | null;
  sedes: OpcionSede[];
  errorSedes: string | null;
  cargandoSedes: boolean;
  guardando: boolean;
  onClose: () => void;
  onSubmit: (cuerpo: CuerpoUsuario) => Promise<void>;
}

export function UsuarioFormDrawer({
  opened,
  usuario,
  sedes,
  errorSedes,
  cargandoSedes,
  guardando,
  onClose,
  onSubmit,
}: UsuarioFormDrawerProps) {
  const theme = useMantineTheme();
  const modo = usuario ? 'editar' : 'crear';
  const [formError, setFormError] = useState<string | null>(null);
  const form = useForm<BorradorUsuario>({
    initialValues: borradorVacio(),
    validate: (values) => validarBorrador(values, modo),
  });

  useEffect(() => {
    if (!opened) return;
    const valores = usuario ? borradorDe(usuario) : borradorVacio();
    form.setValues(valores);
    form.resetDirty(valores);
    form.clearErrors();
    setFormError(null);
    // El objeto form de Mantine cambia de identidad; reabrir depende de la cuenta, no del form.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened, usuario]);

  const opcionesSedes = (() => {
    const mapa = new Map<string, string>();
    for (const sede of sedes) mapa.set(sede.id, sede.nombre);
    for (const sede of usuario?.sedes ?? []) mapa.set(sede.id, sede.nombre);
    return [...mapa.entries()].map(([value, label]) => ({ value, label }));
  })();

  const enviar = form.onSubmit(
    async (values) => {
      setFormError(null);
      try {
        await onSubmit(cuerpoDeUsuario(values, modo));
      } catch (causa) {
        if (causa instanceof ApiError && causa.status === 401) return;
        if (causa instanceof ApiError) {
          const campos = erroresDeApi(causa);
          for (const [campo, mensaje] of Object.entries(campos)) form.setFieldError(campo, mensaje);
          setFormError(causa.message);
          return;
        }
        setFormError('No se pudo guardar la cuenta. Inténtalo de nuevo.');
      }
    },
    (errores) => {
      const primero = Object.keys(errores)[0];
      if (primero) form.getInputNode(primero)?.focus();
    },
  );

  const rol = form.values.rol;

  return (
    <DetailDrawer
      opened={opened}
      onClose={() => {
        if (!guardando) onClose();
      }}
      size={theme.other.layout.drawerWidthLg}
      title={usuario ? 'Editar usuario' : 'Crear usuario'}
      subtitle="Cuenta de acceso y, si corresponde, el perfil académico."
      closeOnClickOutside={!form.isDirty() && !guardando}
      footer={
        <>
          <Button variant="subtle" color="slate" onClick={onClose} disabled={guardando}>
            Cancelar
          </Button>
          <Button type="submit" form={FORM_ID} loading={guardando} leftSection={<IconCheck size={18} stroke={1.5} />}>
            {usuario ? 'Guardar cambios' : 'Crear cuenta'}
          </Button>
        </>
      }
    >
      {/* La cuenta la edita el administrador. El perfil académico embebido va en este mismo formulario. */}
      <form id={FORM_ID} noValidate onSubmit={enviar}>
        <Stack gap="md">
          <Text fz="sm" c="dimmed">
            Tú editas la cuenta. Si el rol es docente o estudiante, el perfil académico va en este mismo formulario.
          </Text>
          <Text fz="sm" c="dimmed">
            * Campo obligatorio
          </Text>
          {formError && (
            <Alert color="crimson" role="alert">
              {formError}
            </Alert>
          )}
          <Grid gutter="md">
            <Grid.Col span={12}>
              <TextInput label="Nombre" withAsterisk autoComplete="name" data-autofocus disabled={guardando} {...form.getInputProps('nombre')} />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <TextInput label="RUT" withAsterisk placeholder="12.345.678-5" disabled={guardando} {...form.getInputProps('rut')} />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Select
                label="Rol"
                withAsterisk
                searchable={false}
                allowDeselect={false}
                data={ROLES_USUARIO}
                disabled={guardando}
                {...form.getInputProps('rol')}
                onChange={(value) => {
                  if (value === 'admin' || value === 'coordinador' || value === 'docente' || value === 'estudiante') {
                    form.setFieldValue('rol', value);
                    form.clearErrors();
                  }
                }}
              />
            </Grid.Col>
            <Grid.Col span={12}>
              <MultiSelect
                label="Sedes"
                withAsterisk
                data={opcionesSedes}
                placeholder={cargandoSedes ? 'Cargando sedes…' : 'Selecciona sedes'}
                description={errorSedes ? undefined : 'Puedes elegir una o varias.'}
                disabled={guardando || cargandoSedes}
                {...form.getInputProps('sedes')}
                error={form.errors.sedes || errorSedes || undefined}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <TextInput label="Correo" withAsterisk type="email" autoComplete="email" disabled={guardando} {...form.getInputProps('correo')} />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <TextInput label="Teléfono" type="tel" autoComplete="tel" disabled={guardando} {...form.getInputProps('telefono')} />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <DateInput
                label="Fecha de incorporación"
                withAsterisk
                clearable
                disabled={guardando}
                value={aFecha(form.values.incorporacion)}
                onChange={(fecha) => form.setFieldValue('incorporacion', aIso(fecha))}
                error={form.errors.incorporacion}
              />
            </Grid.Col>
          </Grid>

          {rol === 'docente' && (
            <Stack gap="sm">
              <Text fw={600}>Perfil docente</Text>
              <Grid gutter="md">
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <TextInput label="Especialidad" placeholder="Ej. Informática" disabled={guardando} {...form.getInputProps('especialidad')} />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <Select
                    label="Tipo de vínculo"
                    withAsterisk
                    searchable={false}
                    allowDeselect={false}
                    placeholder="Selecciona un vínculo"
                    data={VINCULOS}
                    disabled={guardando}
                    {...form.getInputProps('tipoVinculo')}
                  />
                </Grid.Col>
                <Grid.Col span={12}>
                  <TagsInput
                    label="Departamentos"
                    description="Escribe un departamento y presiona Enter."
                    placeholder="Computación"
                    disabled={guardando}
                    {...form.getInputProps('departamentos')}
                  />
                </Grid.Col>
              </Grid>
            </Stack>
          )}

          {rol === 'estudiante' && (
            <Stack gap="sm">
              <Text fw={600}>Perfil estudiante</Text>
              <Grid gutter="md">
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <TextInput
                    label="Código de estudiante"
                    withAsterisk
                    placeholder="EST-2026-014"
                    disabled={guardando}
                    {...form.getInputProps('codigoEstudiante')}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <Select
                    label="Nivel que cursa"
                    withAsterisk
                    searchable={false}
                    allowDeselect={false}
                    placeholder="Selecciona un nivel"
                    data={NIVELES}
                    disabled={guardando}
                    {...form.getInputProps('nivelCursando')}
                  />
                </Grid.Col>
                <Grid.Col span={12}>
                  <TextInput
                    label="Contacto de emergencia"
                    description="Nombre y teléfono"
                    withAsterisk
                    disabled={guardando}
                    {...form.getInputProps('contactoEmergencia')}
                  />
                </Grid.Col>
              </Grid>
            </Stack>
          )}

          {modo === 'crear' && (
            <Grid gutter="md">
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <PasswordInput
                  label="Contraseña inicial"
                  description="Mínimo 10 caracteres, con una letra y un número."
                  withAsterisk
                  autoComplete="new-password"
                  disabled={guardando}
                  {...form.getInputProps('password')}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <PasswordInput
                  label="Repite la contraseña"
                  withAsterisk
                  autoComplete="new-password"
                  disabled={guardando}
                  {...form.getInputProps('confirmacion')}
                />
              </Grid.Col>
            </Grid>
          )}

          {modo === 'editar' && (
            <Text fz="sm" c="dimmed">
              Para cambiar la clave usa «Restablecer clave» en el listado. Se muestra una sola vez.
            </Text>
          )}
        </Stack>
      </form>
    </DetailDrawer>
  );
}
