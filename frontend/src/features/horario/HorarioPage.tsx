import { Card, Stack, Title } from '@mantine/core';
import { useMemo, useState } from 'react';
import { useSga } from '@/app/SgaContext';
import { PageHeader } from '@/components/layout/PageHeader';
import { AnuladasList } from '@/features/inscripcion/AnuladasList';
import { SeccionDrawer } from '@/features/inscripcion/SeccionDrawer';
import { seccionPorId } from '@/features/inscripcion/useInscripciones';
import { notify } from '@/lib/notify';
import { HorarioSemanal } from './HorarioSemanal';
import type { BloqueHorario } from './types';
import type { FilaOferta } from '@/features/oferta/useOferta';

export function HorarioPage() {
  const {
    bloquesInscritos,
    anuladas,
    anular,
    cambiarSeccion,
    estaInscrita,
    ocupacionDe,
    filas,
    escenario,
  } = useSga();
  const [seleccionado, setSeleccionado] = useState<BloqueHorario | null>(null);

  const alternativas = useMemo(() => {
    if (!seleccionado) return [];
    return filas.filter(
      (f) =>
        f.seccion.codigoAsignatura === seleccionado.codigoAsignatura &&
        f.seccion.id !== seleccionado.seccionId,
    );
  }, [filas, seleccionado]);

  const anularSeccion = (seccionId: string) => {
    const seccion = seccionPorId(seccionId);
    anular(seccionId);
    notify.success({
      title: seccion ? `${seccion.nombreAsignatura} · sección ${seccion.seccion}` : undefined,
      message: 'Asignatura anulada correctamente.',
    });
  };

  const cambiar = (desdeId: string, hacia: FilaOferta) => {
    cambiarSeccion(desdeId, hacia.seccion.id);
    notify.success({
      title: `${hacia.seccion.nombreAsignatura} · sección ${hacia.seccion.seccion}`,
      message: 'Cambio de sección realizado correctamente.',
    });
  };

  return (
    <>
      <PageHeader
        title="Mi horario"
        description="Tus asignaturas inscritas de este período. Toca un bloque para anularlo o cambiar de sección."
      />

      <Stack gap="xl">
        <HorarioSemanal
          bloques={bloquesInscritos}
          onBloqueClick={(b) => {
            if (estaInscrita(b.seccionId)) setSeleccionado(b);
          }}
        />

        <Card>
          <Card.Section inheritPadding withBorder py="sm">
            <Title order={2} size="h3">Inscripciones anuladas</Title>
          </Card.Section>
          <Card.Section inheritPadding py="md">
            <AnuladasList anuladas={anuladas} />
          </Card.Section>
        </Card>
      </Stack>

      <SeccionDrawer
        key={seleccionado?.seccionId ?? 'cerrado'}
        bloque={seleccionado}
        ocupacion={seleccionado ? ocupacionDe(seleccionado.seccionId) : { inscritos: 0, cupo: 0 }}
        alternativas={alternativas}
        bloquesInscritos={bloquesInscritos}
        escenario={escenario}
        onClose={() => setSeleccionado(null)}
        onAnular={anularSeccion}
        onCambiar={cambiar}
      />
    </>
  );
}
