import { ActionIcon, Alert, Button, Grid, Group, NumberInput, Select, Stack, Text, Title, useMantineTheme } from '@mantine/core';
import { TimeInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { IconAlertTriangle, IconCheck, IconPlus, IconX } from '@tabler/icons-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { DetailDrawer } from '@/components/ui/DetailDrawer';
import { useSedes } from '@/features/estructura/SedesContext';
import { usePeriodos } from '@/features/periodos/PeriodosContext';
import { aMinutos, DIAS_LARGOS, fmt } from '@/lib/horas';
import { notify } from '@/lib/notify';
import { usePersonas } from '@/features/personas/PersonasContext';
import { nombreCompleto } from '@/mock/personas';
import { SALAS } from '@/mock/docentes';
import { asignaturas } from '@/mocks/sga';
import { mensajeConflicto } from './conflictos';
import { useOfertaStore } from './OfertaContext';
import { conflictosDeInput, validarSeccion, type SeccionInput } from './reglasOferta';
import { JORNADA_LABEL, MODALIDAD_LABEL, type BloqueSeccion, type SeccionOfertada } from './types';

interface SeccionFormDrawerProps {
  opened: boolean;
  onClose: () => void;
  /** Sección que se edita; sin ella, el formulario crea una nueva en `periodoInicial`. */
  seccion: SeccionOfertada | null;
  periodoInicial: string;
}

const FORM_ID = 'seccion-form';

type BloqueForm = BloqueSeccion & { key: string };
type SeccionForm = Omit<SeccionInput, 'bloques'> & { bloques: BloqueForm[] };

let secuenciaBloque = 0;
const nuevoBloque = (): BloqueForm => ({ key: `b${++secuenciaBloque}`, dia: 0, inicioMin: 8 * 60 + 30, finMin: 10 * 60 });

const vacio = (periodoId: string): SeccionForm => ({
  codigoAsignatura: '',
  docente: '',
  sede: '',
  jornada: '',
  modalidad: '',
  cupo: 30,
  sala: '',
  periodoId,
  bloques: [nuevoBloque()],
});

const desdeSeccion = (s: SeccionOfertada): SeccionForm => ({
  codigoAsignatura: s.codigoAsignatura,
  docente: s.docente,
  sede: s.sede,
  jornada: s.jornada,
  modalidad: s.modalidad,
  cupo: s.cupo,
  sala: s.sala ?? '',
  periodoId: s.periodoId,
  bloques: s.bloques.map((b) => ({ ...b, key: `b${++secuenciaBloque}` })),
});

export function SeccionFormDrawer({ opened, onClose, seccion, periodoInicial }: SeccionFormDrawerProps) {
  const { secciones, guardar } = useOfertaStore();
  const { periodos } = usePeriodos();
  const { sedes } = useSedes();
  const { docentesActivos } = usePersonas();
  const theme = useMantineTheme();
  const editando = seccion !== null;
  const [intentoBloqueado, setIntentoBloqueado] = useState(false);
  const resumenRef = useRef<HTMLDivElement>(null);

  const form = useForm<SeccionForm>({
    initialValues: vacio(periodoInicial),
    validate: (values) => validarSeccion(values, seccion ?? undefined),
  });

  useEffect(() => {
    if (!opened) return;
    form.setValues(seccion ? desdeSeccion(seccion) : vacio(periodoInicial));
    form.resetDirty();
    form.clearErrors();
    setIntentoBloqueado(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened, seccion]);

  useEffect(() => {
    if (intentoBloqueado) resumenRef.current?.focus();
  }, [intentoBloqueado]);

  // Los choques se calculan en vivo contra el resto de la oferta del período.
  const conflictos = useMemo(
    () => conflictosDeInput(form.values, seccion?.id ?? '', secciones),
    [form.values, seccion, secciones],
  );

  const periodosElegibles = periodos
    .filter((p) => p.estado !== 'cerrado' || p.id === seccion?.periodoId)
    .map((p) => ({ value: p.id, label: `${p.codigo} · ${p.estado}` }));
  const sedesElegibles = sedes
    .filter((s) => s.estado === 'activa' || s.nombre === seccion?.sede)
    .map((s) => ({ value: s.nombre, label: s.nombre }));
  const online = form.values.modalidad === 'online';

  const cambiarModalidad = (v: string | null) => {
    form.setFieldValue('modalidad', (v ?? '') as SeccionForm['modalidad']);
    if (v === 'online') {
      form.setFieldValue('sala', '');
      form.clearFieldError('sala');
    }
  };

  const cambiarBloque = (key: string, cambios: Partial<BloqueSeccion>) => {
    form.setFieldValue(
      'bloques',
      form.values.bloques.map((b) => (b.key === key ? { ...b, ...cambios } : b)),
    );
    setIntentoBloqueado(false);
  };

  const enviar = form.onSubmit(
    (values) => {
      setIntentoBloqueado(false);
      const r = guardar(values, seccion?.id);
      if (r.ok) {
        notify.success({
          title: editando ? 'Sección actualizada' : 'Sección creada',
          message: `${r.value.codigoAsignatura} sección ${r.value.seccion} quedó programada con ${r.value.docente}.`,
        });
        onClose();
        return;
      }
      if (Object.keys(r.errores).length > 0) form.setErrors(r.errores);
      if (r.conflictos.length > 0) setIntentoBloqueado(true);
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
      title={editando ? `Editar ${seccion.codigoAsignatura} · sección ${seccion.seccion}` : 'Nueva sección'}
      subtitle="Define docente, espacio y los bloques horarios en que se reúne la sección."
      footer={
        <>
          <Button variant="subtle" color="slate" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" form={FORM_ID} leftSection={<IconCheck size={18} stroke={1.5} />}>
            {editando ? 'Guardar cambios' : 'Crear sección'}
          </Button>
        </>
      }
    >
      <form id={FORM_ID} onSubmit={enviar} noValidate>
        <Stack gap="lg">
          {intentoBloqueado && (
            <Alert
              ref={resumenRef}
              tabIndex={-1}
              color="crimson"
              icon={<IconAlertTriangle size={18} stroke={1.5} />}
              title="No se puede guardar esta sección"
            >
              Hay choques de horario con otras secciones del período. Cambia el docente, la sala o el horario para resolverlos.
            </Alert>
          )}

          <Text fz="sm" c="dimmed">
            * Campo obligatorio
          </Text>

          <Grid gutter="md">
            <Grid.Col span={12}>
              <Select
                label="Asignatura"
                placeholder="Selecciona una asignatura"
                withAsterisk
                allowDeselect={false}
                disabled={editando}
                description={editando ? 'No se puede cambiar la asignatura de una sección existente' : undefined}
                data={asignaturas.map((a) => ({ value: a.codigo, label: `${a.codigo} · ${a.nombre}` }))}
                {...form.getInputProps('codigoAsignatura')}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Select
                label="Docente"
                placeholder="Selecciona un docente"
                description="Solo docentes activos"
                withAsterisk
                allowDeselect={false}
                data={[...new Set([...docentesActivos.map((d) => nombreCompleto(d)), ...(seccion ? [seccion.docente] : [])])]}
                {...form.getInputProps('docente')}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Select
                label="Período"
                withAsterisk
                searchable={false}
                allowDeselect={false}
                disabled={editando}
                data={periodosElegibles}
                {...form.getInputProps('periodoId')}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Select
                label="Sede"
                placeholder="Selecciona una sede"
                description="Solo sedes activas"
                withAsterisk
                allowDeselect={false}
                searchable={false}
                data={sedesElegibles}
                {...form.getInputProps('sede')}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Select
                label="Jornada"
                placeholder="Selecciona una jornada"
                withAsterisk
                allowDeselect={false}
                searchable={false}
                data={Object.entries(JORNADA_LABEL).map(([value, label]) => ({ value, label }))}
                {...form.getInputProps('jornada')}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Select
                label="Modalidad"
                placeholder="Selecciona una modalidad"
                withAsterisk
                allowDeselect={false}
                searchable={false}
                data={Object.entries(MODALIDAD_LABEL).map(([value, label]) => ({ value, label }))}
                {...form.getInputProps('modalidad')}
                onChange={cambiarModalidad}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Select
                label="Sala"
                placeholder={online ? 'No requiere sala' : 'Selecciona una sala'}
                description={online ? 'Las secciones online no ocupan sala' : undefined}
                withAsterisk={!online}
                allowDeselect={false}
                disabled={online}
                data={SALAS}
                {...form.getInputProps('sala')}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <NumberInput
                label="Cupos"
                withAsterisk
                min={1}
                allowDecimal={false}
                description={editando ? `Inscritos actuales: ${seccion.inscritosOtros}` : undefined}
                {...form.getInputProps('cupo')}
              />
            </Grid.Col>
          </Grid>

          <Stack gap="sm" component="section" aria-labelledby="titulo-bloques">
            <Group justify="space-between" align="flex-end" wrap="wrap">
              <div>
                <Title id="titulo-bloques" order={3} size="h5">
                  Bloques horarios
                </Title>
                <Text fz="sm" c="dimmed">
                  Todos los días y tramos en que se reúne la sección (entre 08:00 y 22:00).
                </Text>
              </div>
              <Button
                variant="light"
                size="xs"
                leftSection={<IconPlus size={16} stroke={1.5} />}
                onClick={() => form.insertListItem('bloques', nuevoBloque())}
              >
                Agregar bloque
              </Button>
            </Group>

            {form.values.bloques.map((bloque, i) => (
              <Grid key={bloque.key} gutter="xs" align="flex-end">
                <Grid.Col span={{ base: 12, xs: 5 }}>
                  <Select
                    label={`Día · bloque ${i + 1}`}
                    searchable={false}
                    allowDeselect={false}
                    data={DIAS_LARGOS.map((d, idx) => ({ value: String(idx), label: d }))}
                    value={String(bloque.dia)}
                    onChange={(v) => cambiarBloque(bloque.key, { dia: Number(v) as BloqueSeccion['dia'] })}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 5, xs: 3 }}>
                  <TimeInput
                    label="Inicio"
                    value={fmt(bloque.inicioMin)}
                    onChange={(e) => cambiarBloque(bloque.key, { inicioMin: aMinutos(e.currentTarget.value) })}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 5, xs: 3 }}>
                  <TimeInput
                    label="Término"
                    value={fmt(bloque.finMin)}
                    onChange={(e) => cambiarBloque(bloque.key, { finMin: aMinutos(e.currentTarget.value) })}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 2, xs: 1 }}>
                  <ActionIcon
                    color="crimson"
                    variant="subtle"
                    disabled={form.values.bloques.length === 1}
                    onClick={() => form.removeListItem('bloques', i)}
                    aria-label={`Quitar el bloque ${i + 1}`}
                  >
                    <IconX size={18} stroke={1.5} />
                  </ActionIcon>
                </Grid.Col>
              </Grid>
            ))}
            {form.errors.bloques && (
              <Text c="crimson" fz="sm" role="alert">
                {form.errors.bloques}
              </Text>
            )}
          </Stack>

          {conflictos.length > 0 && (
            <Stack gap="xs" role="status" aria-live="polite">
              {conflictos.map((c, i) => (
                <Alert
                  key={`${c.tipo}-${c.con.id}-${c.dia}-${i}`}
                  color="crimson"
                  variant="light"
                  icon={<IconAlertTriangle size={18} stroke={1.5} />}
                  title={c.tipo === 'docente' ? 'Choque de docente' : 'Choque de sala'}
                >
                  {mensajeConflicto(c, form.values)}
                </Alert>
              ))}
              <Text fz="sm" c="dimmed">
                Resuelve los choques para poder guardar.
              </Text>
            </Stack>
          )}
        </Stack>
      </form>
    </DetailDrawer>
  );
}
