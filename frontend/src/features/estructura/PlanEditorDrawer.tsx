import {
  ActionIcon,
  Badge,
  Button,
  Card,
  Grid,
  Group,
  NumberInput,
  Select,
  Stack,
  Text,
  TextInput,
  Title,
  useMantineTheme,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconPlus, IconX } from '@tabler/icons-react';
import { useEffect, useMemo } from 'react';
import { DetailDrawer } from '@/components/ui/DetailDrawer';
import { EmptyState } from '@/components/ui/EmptyState';
import { notify } from '@/lib/notify';
import type { TipoAsignaturaPlan } from '@/mock/types';
import { useEstructura } from './EstructuraContext';
import { buscarAsignatura, resumenPlan, validarAsignaturaEnPlan, type AsignaturaEnPlanInput } from './rules';

interface PlanEditorDrawerProps {
  /** Plan que se edita; `null` = cerrado. Se lee del store para ver cada cambio al instante. */
  planId: string | null;
  onClose: () => void;
}

/** Valores tal como los entregan los inputs: NumberInput puede dar '' y Select, `null`. */
interface AsignaturaForm {
  codigo: string;
  nombre: string;
  creditos: number | string;
  semestre: string | null;
  tipo: TipoAsignaturaPlan;
}

const VACIA: AsignaturaForm = { codigo: '', nombre: '', creditos: '', semestre: '1', tipo: 'obligatoria' };

const TIPO_COLOR: Record<TipoAsignaturaPlan, string> = {
  obligatoria: 'navy',
  electiva: 'sky',
};

const aInput = (v: AsignaturaForm): AsignaturaEnPlanInput => ({
  codigo: v.codigo,
  nombre: v.nombre,
  creditos: v.creditos === '' ? Number.NaN : Number(v.creditos),
  semestre: v.semestre ? Number(v.semestre) : Number.NaN,
  tipo: v.tipo,
});

/** Editor de plan de estudios (wireframe E2-4): asignaturas agrupadas por semestre y alta de nuevas. */
export function PlanEditorDrawer({ planId, onClose }: PlanEditorDrawerProps) {
  const { planes, carreras, catalogo, agregarAsignatura, quitarAsignatura } = useEstructura();
  const theme = useMantineTheme();
  const plan = planes.find((p) => p.id === planId) ?? null;
  const carrera = carreras.find((c) => c.id === plan?.carreraId);
  const duracion = carrera?.duracionSemestres ?? 1;

  const form = useForm<AsignaturaForm>({
    initialValues: VACIA,
    validate: (values) => (plan ? validarAsignaturaEnPlan(aInput(values), plan, duracion) : {}),
  });

  useEffect(() => {
    if (!planId) return;
    form.setValues(VACIA);
    form.clearErrors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [planId]);

  const existente = buscarAsignatura(catalogo, form.values.codigo.trim());

  const semestres = useMemo(() => {
    if (!plan) return [];
    const porSemestre = new Map<number, typeof plan.asignaturas>();
    for (const a of plan.asignaturas) porSemestre.set(a.semestre, [...(porSemestre.get(a.semestre) ?? []), a]);
    return [...porSemestre.entries()].sort(([a], [b]) => a - b);
  }, [plan]);

  // Si el código ya existe en el catálogo, se reutiliza: nombre y créditos vienen de ahí.
  const cambiarCodigo = (codigo: string) => {
    const encontrada = buscarAsignatura(catalogo, codigo.trim());
    if (encontrada) {
      form.setValues({ codigo, nombre: encontrada.nombre, creditos: encontrada.creditos });
    } else if (existente) {
      form.setValues({ codigo, nombre: '', creditos: '' });
    } else {
      form.setFieldValue('codigo', codigo);
    }
    form.clearFieldError('nombre');
    form.clearFieldError('creditos');
  };

  const enviar = form.onSubmit(
    (values) => {
      if (!plan) return;
      const r = agregarAsignatura(plan.id, aInput(values));
      if (!r.ok) {
        form.setErrors(r.errores);
        return;
      }
      const agregada = r.value.asignaturas[r.value.asignaturas.length - 1];
      notify.success({
        title: 'Asignatura agregada',
        message: `${agregada.codigo} quedó en el semestre ${agregada.semestre} de ${plan.nombre}.`,
      });
      // Semestre y tipo se mantienen para cargar varias seguidas.
      form.setValues({ codigo: '', nombre: '', creditos: '' });
      form.clearErrors();
      form.getInputNode('codigo')?.focus();
    },
    (errors) => {
      const primero = Object.keys(errors)[0];
      if (primero) form.getInputNode(primero)?.focus();
    },
  );

  const quitar = (codigo: string) => {
    if (!plan) return;
    quitarAsignatura(plan.id, codigo);
    notify.success({ title: 'Asignatura quitada', message: `${codigo} ya no forma parte de ${plan.nombre}.` });
  };

  const resumen = plan ? resumenPlan(plan, catalogo) : { asignaturas: 0, creditos: 0 };
  const nombreDe = (codigo: string) => buscarAsignatura(catalogo, codigo);

  return (
    <DetailDrawer
      opened={plan !== null}
      onClose={onClose}
      size={theme.other.layout.drawerWidthLg}
      title={plan ? `${carrera?.nombre ?? 'Carrera'} · ${plan.nombre}` : ''}
      subtitle={
        plan
          ? `${resumen.asignaturas} asignaturas · ${resumen.creditos} créditos · ${duracion} semestres · plan ${plan.estado}`
          : undefined
      }
      footer={
        <Button variant="subtle" color="slate" onClick={onClose}>
          Cerrar
        </Button>
      }
    >
      {plan && (
        <>
          {semestres.length === 0 ? (
            <EmptyState
              title="El plan aún no tiene asignaturas"
              description="Agrégalas con el formulario de abajo, indicando en qué semestre se cursan."
            />
          ) : (
            <Stack gap="md">
              {semestres.map(([semestre, items]) => (
                <Card key={semestre} withBorder shadow="none" padding="md">
                  <Group justify="space-between" mb="xs">
                    <Title order={4}>Semestre {semestre}</Title>
                    <Text fz="sm" c="dimmed" className="sga-tnum">
                      {items.reduce((t, a) => t + (nombreDe(a.codigo)?.creditos ?? 0), 0)} créditos
                    </Text>
                  </Group>
                  <Stack gap="xs">
                    {items.map((a) => {
                      const info = nombreDe(a.codigo);
                      return (
                        <Group key={a.codigo} justify="space-between" wrap="nowrap" gap="sm">
                          <Stack gap={0} miw={0}>
                            <Text fz="sm" fw={600} className="sga-tnum">
                              {a.codigo}
                            </Text>
                            <Text fz="sm">{info?.nombre ?? 'Asignatura sin nombre'}</Text>
                          </Stack>
                          <Group gap="sm" wrap="nowrap">
                            <Text fz="sm" c="dimmed" className="sga-tnum">
                              {info?.creditos ?? 0} cr.
                            </Text>
                            <Badge color={TIPO_COLOR[a.tipo]}>{a.tipo}</Badge>
                            <ActionIcon
                              color="crimson"
                              variant="subtle"
                              onClick={() => quitar(a.codigo)}
                              aria-label={`Quitar ${a.codigo} del plan`}
                            >
                              <IconX size={18} stroke={1.5} />
                            </ActionIcon>
                          </Group>
                        </Group>
                      );
                    })}
                  </Stack>
                </Card>
              ))}
            </Stack>
          )}

          <Card withBorder shadow="none" padding="md">
            <form onSubmit={enviar} noValidate>
              <Stack gap="md">
                <Stack gap={2}>
                  <Title order={4}>Agregar asignatura al plan</Title>
                  <Text fz="sm" c="dimmed">
                    Si el código ya existe, se reutiliza.
                  </Text>
                </Stack>
                <Grid gutter="md">
                  <Grid.Col span={{ base: 12, sm: 4 }}>
                    <TextInput
                      label="Código"
                      placeholder="Ej. INF-401"
                      withAsterisk
                      maxLength={12}
                      {...form.getInputProps('codigo')}
                      onChange={(e) => cambiarCodigo(e.currentTarget.value)}
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, sm: 8 }}>
                    <TextInput
                      label="Nombre"
                      placeholder="Ej. Ingeniería de Software"
                      withAsterisk
                      maxLength={100}
                      readOnly={!!existente}
                      description={existente ? 'Tomado del catálogo de asignaturas' : undefined}
                      {...form.getInputProps('nombre')}
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, sm: 4 }}>
                    <NumberInput
                      label="Créditos"
                      withAsterisk
                      min={1}
                      max={30}
                      allowDecimal={false}
                      allowNegative={false}
                      readOnly={!!existente}
                      {...form.getInputProps('creditos')}
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, sm: 4 }}>
                    <Select
                      label="Semestre"
                      withAsterisk
                      searchable={false}
                      allowDeselect={false}
                      data={Array.from({ length: duracion }, (_, i) => ({ value: String(i + 1), label: `Semestre ${i + 1}` }))}
                      {...form.getInputProps('semestre')}
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, sm: 4 }}>
                    <Select
                      label="Tipo"
                      withAsterisk
                      searchable={false}
                      allowDeselect={false}
                      data={[
                        { value: 'obligatoria', label: 'Obligatoria' },
                        { value: 'electiva', label: 'Electiva' },
                      ]}
                      {...form.getInputProps('tipo')}
                    />
                  </Grid.Col>
                </Grid>
                <Group justify="flex-end">
                  <Button type="submit" variant="light" leftSection={<IconPlus size={18} stroke={1.5} />}>
                    Agregar al plan
                  </Button>
                </Group>
              </Stack>
            </form>
          </Card>
        </>
      )}
    </DetailDrawer>
  );
}
