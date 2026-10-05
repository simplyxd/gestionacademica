import { Alert, Button, Grid, Select, Stack, Text, useMantineTheme } from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconAlertCircle, IconCheck } from '@tabler/icons-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { DetailDrawer } from '@/components/ui/DetailDrawer';
import { usePeriodos } from '@/features/periodos/PeriodosContext';
import { CARRERAS } from '@/mock/estructura';
import type { Periodo } from '@/mock/types';
import { ESTUDIANTES, nombreCompleto } from '@/mock/personas';
import { notify } from '@/lib/notify';
import { planesDeCarrera, resolver } from './catalogos';
import { useMatriculas } from './MatriculaContext';
import type { ErrorMatricula, Matricula, NuevaMatricula } from './types';

interface MatriculaFormDrawerProps {
  opened: boolean;
  onClose: () => void;
  onRegistrada: (matricula: Matricula) => void;
}

const FORM_ID = 'matricula-form';

const INITIAL: NuevaMatricula = {
  estudianteId: '',
  carreraId: '',
  planId: '',
  periodoId: '',
};

const REQUERIDO: Record<keyof NuevaMatricula, string> = {
  estudianteId: 'Selecciona al estudiante',
  carreraId: 'Selecciona la carrera',
  planId: 'Selecciona el plan de estudio',
  periodoId: 'Selecciona el período académico',
};

interface ErrorVista {
  title: string;
  message: string;
}

/** Copy del error de negocio: nombra la regla, da el dato concreto y una salida (system design §6.4). */
function describir(error: ErrorMatricula, periodos: readonly Periodo[]): ErrorVista {
  if (error.code === 'MATRICULA_VIGENTE_EN_PERIODO' && error.existente) {
    const fila = resolver(error.existente, periodos);
    if (fila) {
      return {
        title: 'Este estudiante ya tiene una matrícula vigente en el período',
        message:
          `${nombreCompleto(fila.estudiante)} ya tiene la matrícula ${fila.matricula.id} vigente en ` +
          `${fila.carrera.nombre} · ${fila.plan.nombre} durante ${fila.periodo.codigo}. Solo se permite una matrícula ` +
          `vigente por estudiante en cada período. Elige otro período, o suspende o retira la matrícula existente desde la lista.`,
      };
    }
  }
  if (error.code === 'PLAN_FUERA_DE_CARRERA') {
    return {
      title: 'El plan no pertenece a la carrera',
      message: 'Elige un plan de estudio de la carrera seleccionada.',
    };
  }
  return { title: 'No se pudo registrar la matrícula', message: 'Revisa los datos e inténtalo de nuevo.' };
}

export function MatriculaFormDrawer({ opened, onClose, onRegistrada }: MatriculaFormDrawerProps) {
  const { registrar } = useMatriculas();
  const { periodos: periodosStore, periodoActual } = usePeriodos();
  const theme = useMantineTheme();
  const [errorNegocio, setErrorNegocio] = useState<ErrorVista | null>(null);
  const alertRef = useRef<HTMLDivElement>(null);

  const form = useForm<NuevaMatricula>({
    initialValues: INITIAL,
    validate: {
      estudianteId: (v) => (v ? null : REQUERIDO.estudianteId),
      carreraId: (v) => (v ? null : REQUERIDO.carreraId),
      planId: (v) => (v ? null : REQUERIDO.planId),
      periodoId: (v) => (v ? null : REQUERIDO.periodoId),
    },
  });

  // Cada vez que se abre, el formulario parte limpio.
  useEffect(() => {
    if (opened) {
      form.reset();
      // El período en curso viene preseleccionado.
      form.setFieldValue('periodoId', periodoActual?.id ?? '');
      setErrorNegocio(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened]);

  // Tras un rechazo, el foco va al resumen del error para que se lea (lectores de pantalla incluidos).
  useEffect(() => {
    if (errorNegocio) alertRef.current?.focus();
  }, [errorNegocio]);

  const estudiantes = useMemo(
    () => ESTUDIANTES.map((e) => ({ value: e.id, label: `${nombreCompleto(e)} · ${e.rut}` })),
    [],
  );
  const carreras = useMemo(() => CARRERAS.map((c) => ({ value: c.id, label: c.nombre })), []);
  const periodos = useMemo(
    () => periodosStore.map((p) => ({ value: p.id, label: `${p.codigo} · ${p.estado}` })),
    [periodosStore],
  );
  const planes = useMemo(
    () => planesDeCarrera(form.values.carreraId).map((p) => ({ value: p.id, label: `${p.nombre} · ${p.estado}` })),
    [form.values.carreraId],
  );

  const cambiarCampo = (campo: keyof NuevaMatricula, valor: string | null) => {
    form.setFieldValue(campo, valor ?? '');
    // Cambiar estudiante o período invalida el rechazo anterior.
    if (campo === 'estudianteId' || campo === 'periodoId') {
      setErrorNegocio(null);
      form.clearFieldError('estudianteId');
      form.clearFieldError('periodoId');
    }
  };

  const cambiarCarrera = (carreraId: string | null) => {
    const id = carreraId ?? '';
    const delPlan = planesDeCarrera(id);
    form.setValues({ carreraId: id, planId: delPlan.length === 1 ? delPlan[0].id : '' });
    form.clearFieldError('planId');
  };

  const enviar = form.onSubmit(
    (values) => {
      setErrorNegocio(null);
      const r = registrar(values);
      if (r.ok) {
        const fila = resolver(r.value, periodosStore);
        notify.success({
          title: 'Matrícula registrada',
          message: fila
            ? `${nombreCompleto(fila.estudiante)} quedó vigente en ${fila.carrera.nombre} · ${fila.plan.nombre} (${fila.periodo.codigo}).`
            : 'La matrícula quedó vigente.',
        });
        onRegistrada(r.value);
        return;
      }
      const vista = describir(r.error, periodosStore);
      setErrorNegocio(vista);
      if (r.error.field) {
        form.setFieldError(
          r.error.field,
          r.error.code === 'MATRICULA_VIGENTE_EN_PERIODO'
            ? 'Este estudiante ya tiene matrícula vigente en este período'
            : vista.title,
        );
      }
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
      title="Matricular estudiante"
      subtitle="Asigna carrera, plan de estudio y período a un estudiante."
      footer={
        <>
          <Button variant="subtle" color="slate" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" form={FORM_ID} leftSection={<IconCheck size={18} stroke={1.5} />}>
            Registrar matrícula
          </Button>
        </>
      }
    >
      <form id={FORM_ID} onSubmit={enviar} noValidate>
        <Stack gap="md">
          {errorNegocio && (
            <Alert
              ref={alertRef}
              tabIndex={-1}
              color="crimson"
              icon={<IconAlertCircle size={18} stroke={1.5} />}
              title={errorNegocio.title}
            >
              {errorNegocio.message}
            </Alert>
          )}

          <Text fz="sm" c="dimmed">
            * Campo obligatorio
          </Text>

          <Grid gutter="md">
            <Grid.Col span={12}>
              <Select
                label="Estudiante"
                description="Busca por nombre o RUT"
                placeholder="Selecciona un estudiante"
                withAsterisk
                data={estudiantes}
                {...form.getInputProps('estudianteId')}
                onChange={(v) => cambiarCampo('estudianteId', v)}
              />
            </Grid.Col>
            <Grid.Col span={12}>
              <Select
                label="Carrera"
                placeholder="Selecciona una carrera"
                withAsterisk
                data={carreras}
                {...form.getInputProps('carreraId')}
                onChange={cambiarCarrera}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Select
                label="Plan de estudio"
                placeholder={form.values.carreraId ? 'Selecciona un plan' : 'Primero elige la carrera'}
                withAsterisk
                searchable={false}
                disabled={!form.values.carreraId}
                data={planes}
                {...form.getInputProps('planId')}
                onChange={(v) => cambiarCampo('planId', v)}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Select
                label="Período académico"
                placeholder="Selecciona un período"
                withAsterisk
                searchable={false}
                data={periodos}
                {...form.getInputProps('periodoId')}
                onChange={(v) => cambiarCampo('periodoId', v)}
              />
            </Grid.Col>
          </Grid>
        </Stack>
      </form>
    </DetailDrawer>
  );
}
