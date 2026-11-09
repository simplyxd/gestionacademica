import { Alert, Button, Grid, Select, Stack, Text, TextInput, useMantineTheme } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { IconCheck, IconInfoCircle } from '@tabler/icons-react';
import dayjs from 'dayjs';
import { useEffect } from 'react';
import { DetailDrawer } from '@/components/ui/DetailDrawer';
import { notify } from '@/lib/notify';
import type { Periodo } from '@/mock/types';
import { usePeriodos } from './PeriodosContext';
import { ESTADOS_PERIODO, validarPeriodo, type PeriodoInput } from './rules';

interface PeriodoFormDrawerProps {
  opened: boolean;
  onClose: () => void;
  /** Período que se edita; sin él, el formulario crea uno nuevo. */
  periodo: Periodo | null;
}

const FORM_ID = 'periodo-form';

const VACIO: PeriodoInput = {
  codigo: '',
  nombre: '',
  inicio: '',
  termino: '',
  inscripcionInicio: '',
  inscripcionTermino: '',
  estado: 'planificación',
};

const aFecha = (iso: string) => (iso ? dayjs(iso).toDate() : null);
const aIso = (d: Date | null) => (d ? dayjs(d).format('YYYY-MM-DD') : '');

export function PeriodoFormDrawer({ opened, onClose, periodo }: PeriodoFormDrawerProps) {
  const { periodos, guardar } = usePeriodos();
  const theme = useMantineTheme();
  const editando = periodo !== null;

  const form = useForm<PeriodoInput>({
    initialValues: VACIO,
    validate: (values) => validarPeriodo(values, periodos, periodo?.id),
  });

  // Cada vez que se abre, parte del período a editar (o vacío).
  useEffect(() => {
    if (!opened) return;
    form.setValues(periodo ? { ...periodo } : VACIO);
    form.resetDirty();
    form.clearErrors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened, periodo]);

  const enviar = form.onSubmit(
    (values) => {
      const r = guardar(values, periodo?.id);
      if (!r.ok) {
        form.setErrors(r.errores);
        return;
      }
      notify.success({
        title: editando ? 'Período actualizado' : 'Período creado',
        message: `${r.value.codigo} · ${r.value.nombre} quedó en estado «${r.value.estado}».`,
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
      size={theme.other.layout.drawerWidthLg}
      title={editando ? `Editar período ${periodo.codigo}` : 'Crear período'}
      subtitle="Las fechas del período y su ventana de inscripción se definen por separado."
      footer={
        <>
          <Button variant="subtle" color="slate" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" form={FORM_ID} leftSection={<IconCheck size={18} stroke={1.5} />}>
            {editando ? 'Guardar cambios' : 'Crear período'}
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
              <TextInput
                label="Código"
                description="Año y semestre"
                placeholder="2027-2"
                withAsterisk
                {...form.getInputProps('codigo')}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 8 }}>
              <TextInput
                label="Nombre"
                placeholder="2027 · Segundo semestre"
                withAsterisk
                {...form.getInputProps('nombre')}
              />
            </Grid.Col>

            <Grid.Col span={12}>
              <Text fw={600} fz="sm">
                Fechas académicas
              </Text>
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <DateInput
                label="Inicio"
                withAsterisk
                clearable
                value={aFecha(form.values.inicio)}
                onChange={(d) => form.setFieldValue('inicio', aIso(d))}
                error={form.errors.inicio}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <DateInput
                label="Término"
                withAsterisk
                clearable
                minDate={aFecha(form.values.inicio) ?? undefined}
                value={aFecha(form.values.termino)}
                onChange={(d) => form.setFieldValue('termino', aIso(d))}
                error={form.errors.termino}
              />
            </Grid.Col>

            <Grid.Col span={12}>
              <Text fw={600} fz="sm">
                Ventana de inscripción
              </Text>
              <Text fz="sm" c="dimmed">
                Puede abrir antes del inicio académico.
              </Text>
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <DateInput
                label="Apertura"
                withAsterisk
                clearable
                value={aFecha(form.values.inscripcionInicio)}
                onChange={(d) => form.setFieldValue('inscripcionInicio', aIso(d))}
                error={form.errors.inscripcionInicio}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <DateInput
                label="Cierre"
                withAsterisk
                clearable
                minDate={aFecha(form.values.inscripcionInicio) ?? undefined}
                value={aFecha(form.values.inscripcionTermino)}
                onChange={(d) => form.setFieldValue('inscripcionTermino', aIso(d))}
                error={form.errors.inscripcionTermino}
              />
            </Grid.Col>

            <Grid.Col span={12}>
              <Select
                label="Estado"
                withAsterisk
                searchable={false}
                allowDeselect={false}
                data={ESTADOS_PERIODO.map((e) => ({ value: e, label: e }))}
                {...form.getInputProps('estado')}
              />
            </Grid.Col>
          </Grid>

          <Alert color="sky" variant="light" icon={<IconInfoCircle size={18} stroke={1.5} />}>
            Solo puede haber un período «en curso»: es el que se muestra en el encabezado y el que ve el estudiante en su oferta.
          </Alert>
        </Stack>
      </form>
    </DetailDrawer>
  );
}
