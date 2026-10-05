import { Button, Card, Chip, Group, Pagination, Select, Stack, Text, TextInput } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconPlus, IconSearch } from '@tabler/icons-react';
import { useEffect, useMemo, useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { notify } from '@/lib/notify';
import { usePeriodos } from '@/features/periodos/PeriodosContext';
import { nombreCompleto } from '@/mock/personas';
import { resolver, type MatriculaRow } from './catalogos';
import { useMatriculas } from './MatriculaContext';
import { MatriculaFormDrawer } from './MatriculaFormDrawer';
import { ACCION, MatriculasTable } from './MatriculasTable';
import { ESTADOS_MATRICULA, type EstadoMatricula, type Matricula } from './types';

type FiltroEstado = 'todas' | EstadoMatricula;
type EstadoDestino = Exclude<EstadoMatricula, 'vigente'>;

interface CambioPendiente {
  row: MatriculaRow;
  nuevo: EstadoDestino;
}

const FILTROS_ESTADO: { value: FiltroEstado; label: string }[] = [
  { value: 'todas', label: 'Todas' },
  ...ESTADOS_MATRICULA.map((e) => ({ value: e, label: e.charAt(0).toUpperCase() + e.slice(1) })),
];

const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/** Copy de confirmación por estado destino (system design §6.5). */
function textoConfirmacion({ row, nuevo }: CambioPendiente) {
  const nombre = nombreCompleto(row.estudiante);
  const periodo = row.periodo.codigo;
  const cierre = 'Esta acción no se puede deshacer desde esta pantalla; el registro se conserva en el historial.';
  switch (nuevo) {
    case 'suspendida':
      return {
        title: `¿Suspender la matrícula de ${nombre}?`,
        message: `Dejará de estar vigente en ${periodo} y no podrá inscribir asignaturas mientras esté suspendida. ${cierre}`,
      };
    case 'egresada':
      return {
        title: `¿Egresar la matrícula de ${nombre}?`,
        message: `Se marcará como egresada en ${row.carrera.nombre} (${periodo}). ${cierre}`,
      };
    case 'retirada':
      return {
        title: `¿Retirar la matrícula de ${nombre}?`,
        message: `Dejará de estar vigente en ${periodo} y no podrá inscribir asignaturas. ${cierre}`,
      };
  }
}

const PASADO: Record<EstadoDestino, string> = {
  suspendida: 'suspendida',
  egresada: 'egresada',
  retirada: 'retirada',
};

export function MatriculaPage() {
  const { matriculas, cambiarEstado } = useMatriculas();
  const { periodos } = usePeriodos();
  const [drawerAbierto, drawer] = useDisclosure(false);

  const [busqueda, setBusqueda] = useState('');
  const [estado, setEstado] = useState<FiltroEstado>('todas');
  const [periodoId, setPeriodoId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const [pendiente, setPendiente] = useState<CambioPendiente | null>(null);
  const [destacadaId, setDestacadaId] = useState<string | null>(null);

  // El resaltado de la matrícula nueva dura unos segundos.
  useEffect(() => {
    if (!destacadaId) return;
    const t = window.setTimeout(() => setDestacadaId(null), 4000);
    return () => window.clearTimeout(t);
  }, [destacadaId]);

  const filas = useMemo(
    () =>
      [...matriculas]
        .sort((a, b) => b.creadaEn.localeCompare(a.creadaEn))
        .map((m) => resolver(m, periodos))
        .filter((r): r is MatriculaRow => r !== null),
    [matriculas, periodos],
  );

  const filtradas = useMemo(() => {
    const q = norm(busqueda.trim());
    return filas.filter((r) => {
      if (estado !== 'todas' && r.matricula.estado !== estado) return false;
      if (periodoId && r.periodo.id !== periodoId) return false;
      if (!q) return true;
      return norm(`${nombreCompleto(r.estudiante)} ${r.estudiante.rut} ${r.carrera.nombre}`).includes(q);
    });
  }, [filas, busqueda, estado, periodoId]);

  const totalPaginas = Math.max(1, Math.ceil(filtradas.length / pageSize));
  const paginaActual = Math.min(page, totalPaginas);
  const visibles = filtradas.slice((paginaActual - 1) * pageSize, paginaActual * pageSize);
  const desde = filtradas.length === 0 ? 0 : (paginaActual - 1) * pageSize + 1;
  const hasta = Math.min(paginaActual * pageSize, filtradas.length);
  const vigentes = filtradas.filter((r) => r.matricula.estado === 'vigente').length;

  const registrada = (m: Matricula) => {
    // Limpia filtros para que la matrícula nueva se vea en la lista.
    setBusqueda('');
    setEstado('todas');
    setPeriodoId(null);
    setPage(1);
    setDestacadaId(m.id);
    drawer.close();
  };

  const confirmar = () => {
    if (!pendiente) return;
    const { row, nuevo } = pendiente;
    const r = cambiarEstado(row.matricula.id, nuevo);
    setPendiente(null);
    if (r.ok) {
      notify.success({
        title: `Matrícula ${PASADO[nuevo]}`,
        message: `La matrícula de ${nombreCompleto(row.estudiante)} en ${row.periodo.codigo} quedó ${PASADO[nuevo]}.`,
      });
    } else {
      notify.error({
        title: 'No se pudo cambiar el estado',
        message: 'Esa matrícula ya no admite este cambio. Revisa su estado actual en la lista.',
      });
    }
  };

  const textos = pendiente ? textoConfirmacion(pendiente) : null;

  return (
    <>
      <PageHeader
        title="Matrícula"
        description="Registra la matrícula de un estudiante en una carrera, plan de estudio y período. Es requisito para que pueda inscribir asignaturas."
        breadcrumbs={[{ label: 'Inicio', to: '/' }, { label: 'Matrícula' }]}
        actions={
          <Button leftSection={<IconPlus size={18} stroke={1.5} />} onClick={drawer.open}>
            Matricular estudiante
          </Button>
        }
      />

      <Card>
        <Stack gap="md">
          {/* 1. Toolbar */}
          <Group justify="space-between" align="flex-end" wrap="wrap" gap="sm">
            <Group gap="sm" wrap="wrap" align="flex-end">
              <TextInput
                placeholder="Buscar por nombre, RUT o carrera"
                leftSection={<IconSearch size={16} stroke={1.5} />}
                value={busqueda}
                onChange={(e) => {
                  setBusqueda(e.currentTarget.value);
                  setPage(1);
                }}
                w={{ base: '100%', sm: 320 }}
                size="sm"
                aria-label="Buscar matrículas"
              />
              <Select
                size="sm"
                w={{ base: '100%', sm: 190 }}
                placeholder="Todos los períodos"
                aria-label="Filtrar por período"
                searchable={false}
                clearable
                value={periodoId}
                onChange={(v) => {
                  setPeriodoId(v);
                  setPage(1);
                }}
                data={periodos.map((p) => ({ value: p.id, label: `${p.codigo} · ${p.estado}` }))}
              />
            </Group>
            <Chip.Group
              multiple={false}
              value={estado}
              onChange={(v) => {
                setEstado(v as FiltroEstado);
                setPage(1);
              }}
            >
              <Group gap="xs" role="group" aria-label="Filtrar por estado">
                {FILTROS_ESTADO.map((f) => (
                  <Chip key={f.value} value={f.value} variant="light" size="sm">
                    {f.label}
                  </Chip>
                ))}
              </Group>
            </Chip.Group>
          </Group>

          {/* 2. Resumen */}
          <Text fz="sm" c="dimmed" role="status" aria-live="polite">
            {filtradas.length} {filtradas.length === 1 ? 'matrícula' : 'matrículas'} · {vigentes}{' '}
            {vigentes === 1 ? 'vigente' : 'vigentes'}
          </Text>

          {/* 3. Tabla / cards */}
          <MatriculasTable
            rows={visibles}
            destacadaId={destacadaId}
            onCambiarEstado={(row, nuevo) => setPendiente({ row, nuevo })}
          />

          {/* 5. Paginación (siempre visible) */}
          <Group justify="space-between" wrap="wrap" gap="sm">
            <Group gap="sm">
              <Text fz="sm" c="dimmed" className="sga-tnum">
                Mostrando {desde}–{hasta} de {filtradas.length}
              </Text>
              <Select
                size="xs"
                w={90}
                value={String(pageSize)}
                onChange={(v) => {
                  if (!v) return;
                  setPageSize(Number(v));
                  setPage(1);
                }}
                data={['20', '50', '100']}
                searchable={false}
                allowDeselect={false}
                aria-label="Filas por página"
              />
            </Group>
            <Pagination total={totalPaginas} value={paginaActual} onChange={setPage} />
          </Group>
        </Stack>
      </Card>

      <MatriculaFormDrawer opened={drawerAbierto} onClose={drawer.close} onRegistrada={registrada} />

      <ConfirmModal
        opened={pendiente !== null}
        onClose={() => setPendiente(null)}
        title={textos?.title ?? ''}
        message={textos?.message ?? ''}
        confirmLabel={pendiente ? ACCION[pendiente.nuevo].verbo : 'Confirmar'}
        destructive={pendiente ? ACCION[pendiente.nuevo].destructiva : false}
        onConfirm={confirmar}
      />
    </>
  );
}
