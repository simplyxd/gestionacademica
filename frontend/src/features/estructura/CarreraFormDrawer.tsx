import { Button, Grid, MultiSelect, NumberInput, Select, Stack, Text, TextInput, useMantineTheme } from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconCheck } from '@tabler/icons-react';
import { useEffect, useMemo } from 'react';
import { DetailDrawer } from '@/components/ui/DetailDrawer';
import { JORNADA_LABEL, MODALIDAD_LABEL } from '@/features/oferta/types';
import { notify } from '@/lib/notify';
import type { Carrera } from '@/mock/types';
import { useEstructura } from './EstructuraContext';
import { DURACION_MAXIMA, JORNADAS, MODALIDADES, validarCarrera, type CarreraInput } from './rules';
import { useSedes } from './SedesContext';

interface CarreraFormDrawerProps {
  opened: boolean;
  onClose: () => void;
  /** Carrera que se edita; sin ella, el formulario registra una nueva. */
  carrera: Carrera | null;
}

const FORM_ID = 'carrera-form';
const VACIA: CarreraInput = {
  codigo: '',
  nombre: '',
  sedes: [],
  modalidad: 'presencial',
  jornada: 'diurna',
  duracionSemestres: 8,
};

export function CarreraFormDrawer({ opened, onClose, carrera }: CarreraFormDrawerProps) {
  const { carreras, guardarCarrera } = useEstructura();
  const { sedes } = useSedes();
  const theme = useMantineTheme();
  const editando = carrera !== null;

  const form = useForm<CarreraInput>({
    initialValues: VACIA,
    validate: (values) => validarCarrera(values, carreras, carrera?.id),
  });

  useEffect(() => {
    if (!opened) return;
    form.setValues(
      carrera
        ? {
            codigo: carrera.codigo,
            nombre: carrera.nombre,
            sedes: carrera.sedes,
            modalidad: carrera.modalidad,
            jornada: carrera.jornada,
            duracionSemestres: carrera.duracionSemestres,
          }
        : VACIA,
    );
    form.resetDirty();
    form.clearErrors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened, carrera]);

  // Solo se eligen sedes no inactivas; al editar se conservan las ya asignadas aunque estén inactivas.
  const opcionesSedes = useMemo(
    () =>
      sedes
        .filter((s) => s.estado !== 'inactiva' || carrera?.sedes.includes(s.id))
        .map((s) => ({ value: s.id, label: s.estado === 'activa' ? s.nombre : `${s.nombre} · ${s.estado}` })),
    [sedes, carrera],
  );

  const enviar = form.onSubmit(
    (values) => {
      const r = guardarCarrera(values, carrera?.id);
      if (!r.ok) {
        form.setErrors(r.errores);
        return;
      }
      notify.success({
        title: editando ? 'Carrera actualizada' : 'Carrera registrada',
        message: `${r.value.codigo} · ${r.value.nombre} quedó ${r.value.estado}.`,
      });
      onClose();
    },
    (errors) => {
      const primero = Object.keys(errors)[0];
      if (primero) form.getInputNode(primero)?.focus();
    },
  );

  return (
    <DetailDrawer
      opened={opened}
      onClose={onClose}
      size={theme.other.layout.drawerWidthMd}
      title={editando ? `Editar ${carrera.nombre}` : 'Registrar carrera'}
      subtitle="Las carreras activas se pueden elegir al matricular estudiantes."
      footer={
        <>
          <Button variant="subtle" color="slate" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" form={FORM_ID} leftSection={<IconCheck size={18} stroke={1.5} />}>
            {editando ? 'Guardar cambios' : 'Registrar carrera'}
          </Button>
        </>
      }
    >
      <form id={FORM_ID} onSubmit={enviar} noValidate>
        <Stack gap="md">
          <Text fz="sm" c="dimmed">
            * Campo obligatorio
          </Text>
          <Grid gutter="md">
            <Grid.Col span={{ base: 12, sm: 4 }}>
              <TextInput label="Código" placeholder="Ej. INF" withAsterisk maxLength={10} {...form.getInputProps('codigo')} />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 8 }}>
              <TextInput
                label="Nombre de la carrera"
                placeholder="Ej. Ingeniería en Informática"
                withAsterisk
                maxLength={100}
                {...form.getInputProps('nombre')}
              />
            </Grid.Col>
          </Grid>
          <MultiSelect
            label="Sedes donde se imparte"
            placeholder={form.values.sedes.length === 0 ? 'Selecciona una o más sedes' : undefined}
            withAsterisk
            data={opcionesSedes}
            {...form.getInputProps('sedes')}
          />
          <Grid gutter="md">
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Select
                label="Modalidad"
                withAsterisk
                searchable={false}
                allowDeselect={false}
                data={MODALIDADES.map((m) => ({ value: m, label: MODALIDAD_LABEL[m] }))}
                {...form.getInputProps('modalidad')}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Select
                label="Jornada"
                withAsterisk
                searchable={false}
                allowDeselect={false}
                data={JORNADAS.map((j) => ({ value: j, label: JORNADA_LABEL[j] }))}
                {...form.getInputProps('jornada')}
              />
            </Grid.Col>
          </Grid>
          <NumberInput
            label="Duración"
            description={`En semestres, de 1 a ${DURACION_MAXIMA}.`}
            withAsterisk
            min={1}
            max={DURACION_MAXIMA}
            allowDecimal={false}
            allowNegative={false}
            suffix=" semestres"
            {...form.getInputProps('duracionSemestres')}
          />
        </Stack>
      </form>
    </DetailDrawer>
  );
}
