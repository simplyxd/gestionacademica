import { Button, Select, Stack, Text, TextInput, useMantineTheme } from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconCheck } from '@tabler/icons-react';
import { useEffect } from 'react';
import { DetailDrawer } from '@/components/ui/DetailDrawer';
import { notify } from '@/lib/notify';
import type { Sede } from '@/mock/types';
import { ESTADOS_SEDE, validarSede, type SedeInput } from './rules';
import { useSedes } from './SedesContext';

interface SedeFormDrawerProps {
  opened: boolean;
  onClose: () => void;
  /** Sede que se edita; sin ella, el formulario registra una nueva. */
  sede: Sede | null;
}

const FORM_ID = 'sede-form';
const VACIA: SedeInput = { nombre: '', direccion: '', comuna: '', estado: 'activa' };

export function SedeFormDrawer({ opened, onClose, sede }: SedeFormDrawerProps) {
  const { sedes, guardar } = useSedes();
  const theme = useMantineTheme();
  const editando = sede !== null;

  const form = useForm<SedeInput>({
    initialValues: VACIA,
    validate: (values) => validarSede(values, sedes, sede?.id),
  });

  useEffect(() => {
    if (!opened) return;
    form.setValues(sede ? { nombre: sede.nombre, direccion: sede.direccion, comuna: sede.comuna, estado: sede.estado } : VACIA);
    form.resetDirty();
    form.clearErrors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened, sede]);

  const enviar = form.onSubmit(
    (values) => {
      const r = guardar(values, sede?.id);
      if (!r.ok) {
        form.setErrors(r.errores);
        return;
      }
      notify.success({
        title: editando ? 'Sede actualizada' : 'Sede registrada',
        message: `${r.value.nombre} (${r.value.comuna}) quedó ${r.value.estado}.`,
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
      title={editando ? `Editar ${sede.nombre}` : 'Registrar sede'}
      subtitle="Las sedes activas se pueden elegir al programar secciones."
      footer={
        <>
          <Button variant="subtle" color="slate" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" form={FORM_ID} leftSection={<IconCheck size={18} stroke={1.5} />}>
            {editando ? 'Guardar cambios' : 'Registrar sede'}
          </Button>
        </>
      }
    >
      <form id={FORM_ID} onSubmit={enviar} noValidate>
        <Stack gap="md">
          <Text fz="sm" c="dimmed">
            * Campo obligatorio
          </Text>
          <TextInput
            label="Nombre de la sede"
            placeholder="Ej. Sede Providencia"
            withAsterisk
            maxLength={100}
            {...form.getInputProps('nombre')}
          />
          <TextInput
            label="Dirección física"
            placeholder="Ej. Av. Principal 1234"
            withAsterisk
            maxLength={160}
            {...form.getInputProps('direccion')}
          />
          <TextInput
            label="Comuna o ciudad"
            placeholder="Ej. Santiago"
            withAsterisk
            maxLength={80}
            {...form.getInputProps('comuna')}
          />
          <Select
            label="Estado operativo"
            withAsterisk
            searchable={false}
            allowDeselect={false}
            data={ESTADOS_SEDE.map((e) => ({ value: e, label: e }))}
            {...form.getInputProps('estado')}
          />
        </Stack>
      </form>
    </DetailDrawer>
  );
}
