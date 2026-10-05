import { Button, Select, Stack, Text, TextInput, useMantineTheme } from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconCheck } from '@tabler/icons-react';
import { useEffect, useMemo } from 'react';
import { DetailDrawer } from '@/components/ui/DetailDrawer';
import { notify } from '@/lib/notify';
import type { EstadoPlan, PlanEstudio } from '@/mock/types';
import { useEstructura } from './EstructuraContext';
import { ESTADOS_PLAN, validarPlan, type PlanInput } from './rules';

interface PlanFormDrawerProps {
  opened: boolean;
  onClose: () => void;
  /** Plan que se edita; sin él, el formulario crea uno nuevo. */
  plan: PlanEstudio | null;
  /** Carrera preseleccionada al crear (la del filtro de la lista, si hay). */
  carreraInicial?: string | null;
}

const FORM_ID = 'plan-form';
const VACIO: PlanInput = { carreraId: '', nombre: '', estado: 'vigente' };

export function PlanFormDrawer({ opened, onClose, plan, carreraInicial }: PlanFormDrawerProps) {
  const { carreras, planes, guardarPlan } = useEstructura();
  const theme = useMantineTheme();
  const editando = plan !== null;

  const form = useForm<PlanInput>({
    initialValues: VACIO,
    validate: (values) => validarPlan(values, planes, plan?.id),
  });

  /** Un plan nuevo nace vigente solo si su carrera aún no tiene uno vigente. */
  const estadoSugerido = (carreraId: string): EstadoPlan =>
    planes.some((p) => p.carreraId === carreraId && p.estado === 'vigente') ? 'histórico' : 'vigente';

  useEffect(() => {
    if (!opened) return;
    const carreraId = carreraInicial ?? '';
    form.setValues(
      plan
        ? { carreraId: plan.carreraId, nombre: plan.nombre, estado: plan.estado }
        : { ...VACIO, carreraId, estado: carreraId ? estadoSugerido(carreraId) : 'vigente' },
    );
    form.resetDirty();
    form.clearErrors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened, plan]);

  // Solo carreras activas; al editar se conserva la actual aunque esté inactiva.
  const opcionesCarreras = useMemo(
    () =>
      carreras
        .filter((c) => c.estado === 'activa' || c.id === plan?.carreraId)
        .map((c) => ({ value: c.id, label: `${c.codigo} · ${c.nombre}` })),
    [carreras, plan],
  );

  const cambiarCarrera = (valor: string | null) => {
    const carreraId = valor ?? '';
    form.setFieldValue('carreraId', carreraId);
    if (!editando && carreraId) form.setFieldValue('estado', estadoSugerido(carreraId));
    form.clearFieldError('nombre');
    form.clearFieldError('estado');
  };

  const enviar = form.onSubmit(
    (values) => {
      const r = guardarPlan(values, plan?.id);
      if (!r.ok) {
        form.setErrors(r.errores);
        return;
      }
      const carrera = carreras.find((c) => c.id === r.value.carreraId);
      notify.success({
        title: editando ? 'Plan actualizado' : 'Plan creado',
        message: `${carrera?.nombre ?? 'La carrera'} · ${r.value.nombre} quedó ${r.value.estado}.`,
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
      title={editando ? `Editar ${plan.nombre}` : 'Crear plan de estudios'}
      subtitle="El plan vigente es el que se asigna a los nuevos ingresos de la carrera."
      footer={
        <>
          <Button variant="subtle" color="slate" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" form={FORM_ID} leftSection={<IconCheck size={18} stroke={1.5} />}>
            {editando ? 'Guardar cambios' : 'Crear plan'}
          </Button>
        </>
      }
    >
      <form id={FORM_ID} onSubmit={enviar} noValidate>
        <Stack gap="md">
          <Text fz="sm" c="dimmed">
            * Campo obligatorio
          </Text>
          <Select
            label="Carrera"
            placeholder="Selecciona una carrera"
            withAsterisk
            data={opcionesCarreras}
            {...form.getInputProps('carreraId')}
            onChange={cambiarCarrera}
          />
          <TextInput label="Nombre del plan" placeholder="Ej. Plan 2026" withAsterisk maxLength={60} {...form.getInputProps('nombre')} />
          <Select
            label="Estado"
            description="Solo puede haber un plan vigente por carrera."
            withAsterisk
            searchable={false}
            allowDeselect={false}
            data={ESTADOS_PLAN.map((e) => ({ value: e, label: e }))}
            {...form.getInputProps('estado')}
          />
        </Stack>
      </form>
    </DetailDrawer>
  );
}
