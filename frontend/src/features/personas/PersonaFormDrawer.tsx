import { Alert, Button, Grid, Select, Stack, Text, TextInput, Title, useMantineTheme } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { IconCheck, IconInfoCircle } from '@tabler/icons-react';
import dayjs from 'dayjs';
import { useEffect } from 'react';
import { DetailDrawer } from '@/components/ui/DetailDrawer';
import { useOfertaStore } from '@/features/oferta/OfertaContext';
import { notify } from '@/lib/notify';
import { nombreCompleto } from '@/mock/personas';
import { usePersonas } from './PersonasContext';
import { CAMPOS_DE, inputDePersona, validarPersona, type ErroresPersona } from './rules';
import { NIVELES, PERSONA_VACIA, TIPOS_VINCULO, type Persona, type PersonaInput, type RolPersona } from './types';

interface PersonaFormDrawerProps {
  opened: boolean;
  onClose: () => void;
  rol: RolPersona;
  /** Persona que se edita; sin ella, el formulario da de alta una nueva (siempre activa). */
  persona: Persona | null;
}

const FORM_ID = 'persona-form';
const aFecha = (iso: string) => (iso ? dayjs(iso).toDate() : null);
const aIso = (d: Date | null) => (d ? dayjs(d).format('YYYY-MM-DD') : '');

export function PersonaFormDrawer({ opened, onClose, rol, persona }: PersonaFormDrawerProps) {
  const { docentes, estudiantes, guardarDocente, guardarEstudiante } = usePersonas();
  const { secciones } = useOfertaStore();
  const theme = useMantineTheme();
  const editando = persona !== null;
  const esDocente = rol === 'docente';

  const form = useForm<PersonaInput>({
    initialValues: PERSONA_VACIA,
    validate: (values) => validarPersona(rol, values, esDocente ? docentes : estudiantes, persona?.id),
  });

  useEffect(() => {
    if (!opened) return;
    form.setValues(persona ? inputDePersona(persona) : PERSONA_VACIA);
    form.resetDirty();
    form.clearErrors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened, persona, rol]);

  // Las secciones guardan el nombre del docente: si ya tiene alguna, cambiarlo la dejaría huérfana.
  const nombreBloqueado =
    esDocente && persona !== null && secciones.some((s) => s.docente === nombreCompleto(persona));

  const enviar = form.onSubmit(
    (values) => {
      const r = esDocente ? guardarDocente(values, persona?.id) : guardarEstudiante(values, persona?.id);
      if (!r.ok) {
        form.setErrors(r.errores as ErroresPersona);
        return;
      }
      notify.success({
        title: editando ? 'Datos actualizados' : esDocente ? 'Docente registrado' : 'Estudiante registrado',
        message: `${nombreCompleto(r.value)} quedó ${editando ? 'actualizado' : 'activo'}.`,
      });
      onClose();
    },
    (errors) => {
      const primero = CAMPOS_DE[rol].find((c) => errors[c]);
      if (primero) form.getInputNode(primero)?.focus();
    },
  );

  const nombreRol = esDocente ? 'docente' : 'estudiante';

  return (
    <DetailDrawer
      opened={opened}
      onClose={onClose}
      size={theme.other.layout.drawerWidthLg}
      title={editando ? `Editar ${nombreRol}` : `Nuevo ${nombreRol}`}
      subtitle={editando ? nombreCompleto(persona) : 'El alta queda activa. El estado se cambia desde la lista.'}
      footer={
        <>
          <Button variant="subtle" color="slate" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" form={FORM_ID} leftSection={<IconCheck size={18} stroke={1.5} />}>
            {editando ? 'Guardar cambios' : `Registrar ${nombreRol}`}
          </Button>
        </>
      }
    >
      <form id={FORM_ID} onSubmit={enviar} noValidate>
        <Stack gap="lg">
          <Text fz="sm" c="dimmed">
            * Campo obligatorio
          </Text>

          <Stack gap="sm" component="section" aria-labelledby="titulo-personales">
            <Title id="titulo-personales" order={3} size="h5">
              Datos personales
            </Title>
            <Grid gutter="md">
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <TextInput
                  label="Nombres"
                  withAsterisk
                  autoComplete="given-name"
                  disabled={nombreBloqueado}
                  {...form.getInputProps('nombres')}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <TextInput
                  label="Apellidos"
                  withAsterisk
                  autoComplete="family-name"
                  disabled={nombreBloqueado}
                  {...form.getInputProps('apellidos')}
                />
              </Grid.Col>
              {nombreBloqueado && (
                <Grid.Col span={12}>
                  <Alert color="sky" variant="light" icon={<IconInfoCircle size={18} stroke={1.5} />}>
                    Tiene secciones asignadas: el nombre no se puede cambiar mientras figure en la oferta.
                  </Alert>
                </Grid.Col>
              )}
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <TextInput label="RUT" withAsterisk placeholder="12.345.678-5" {...form.getInputProps('rut')} />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <TextInput label="Teléfono" withAsterisk type="tel" autoComplete="tel" {...form.getInputProps('telefono')} />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 8 }}>
                <TextInput
                  label="Correo institucional"
                  withAsterisk
                  type="email"
                  autoComplete="email"
                  {...form.getInputProps('email')}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 4 }}>
                <DateInput
                  label="Fecha de incorporación"
                  withAsterisk
                  clearable
                  maxDate={new Date()}
                  value={aFecha(form.values.incorporacion)}
                  onChange={(d) => form.setFieldValue('incorporacion', aIso(d))}
                  error={form.errors.incorporacion}
                />
              </Grid.Col>
            </Grid>
          </Stack>

          <Stack gap="sm" component="section" aria-labelledby="titulo-rol">
            <Title id="titulo-rol" order={3} size="h5">
              {esDocente ? 'Datos del docente' : 'Datos del estudiante'}
            </Title>
            {esDocente ? (
              <Grid gutter="md">
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <TextInput
                    label="Especialidad o área"
                    withAsterisk
                    placeholder="Ej. Informática"
                    {...form.getInputProps('especialidad')}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <Select
                    label="Tipo de vínculo con la institución"
                    withAsterisk
                    searchable={false}
                    allowDeselect={false}
                    placeholder="Selecciona un vínculo"
                    data={[...TIPOS_VINCULO]}
                    {...form.getInputProps('tipoVinculo')}
                  />
                </Grid.Col>
              </Grid>
            ) : (
              <Grid gutter="md">
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <TextInput
                    label="Código de estudiante"
                    withAsterisk
                    placeholder="EST-2026-014"
                    {...form.getInputProps('codigoEstudiante')}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <Select
                    label="Nivel que está cursando"
                    withAsterisk
                    searchable={false}
                    allowDeselect={false}
                    placeholder="Selecciona un nivel"
                    data={[...NIVELES]}
                    {...form.getInputProps('nivelCursando')}
                  />
                </Grid.Col>
                <Grid.Col span={12}>
                  <TextInput
                    label="Contacto de emergencia"
                    description="Nombre y teléfono"
                    withAsterisk
                    {...form.getInputProps('contactoEmergencia')}
                  />
                </Grid.Col>
              </Grid>
            )}
          </Stack>
        </Stack>
      </form>
    </DetailDrawer>
  );
}
