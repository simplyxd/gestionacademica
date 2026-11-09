import { Alert, Badge, Button, Group, Stack, Text } from '@mantine/core';
import {
  IconCalendarEvent,
  IconCalendarOff,
  IconIdOff,
  IconPlus,
  IconRepeat,
} from '@tabler/icons-react';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSga } from '@/app/SgaContext';
import { PageHeader } from '@/components/layout/PageHeader';
import { ReglasRechazadasModal } from '@/features/inscripcion/ReglasRechazadasModal';
import { evaluarReglas, reglaDeMatricula, reglaDeVentana, type ReglaRechazada } from '@/features/inscripcion/reglas';
import { notify } from '@/lib/notify';
import { OfertaSeccionDrawer } from './OfertaSeccionDrawer';
import { OfertaSecciones } from './OfertaSecciones';
import { useOferta, type FilaOferta } from './useOferta';

export function OfertaPage() {
  const {
    filas,
    bloquesInscritos,
    escenario,
    inscribir,
    cambiarSeccion,
    estaInscrita,
    otraSeccionDeLaAsignatura,
  } = useSga();
  const [searchParams] = useSearchParams();
  const oferta = useOferta(filas);
  const setBusqueda = oferta.setBusqueda;
  const [seleccionada, setSeleccionada] = useState<FilaOferta | null>(null);
  const [rechazo, setRechazo] = useState<ReglaRechazada[] | null>(null);
  const [tituloRechazo, setTituloRechazo] = useState<string | undefined>();

  const codigoUrl = searchParams.get('codigo') ?? '';
  useEffect(() => {
    if (codigoUrl) setBusqueda(codigoUrl);
  }, [codigoUrl, setBusqueda]);

  const rechazadas = useMemo(
    () => {
      if (!seleccionada) return [];
      const otra = otraSeccionDeLaAsignatura(seleccionada.seccion.codigoAsignatura, seleccionada.seccion.id);
      return evaluarReglas({
        fila: seleccionada,
        bloquesInscritos,
        escenario,
        ignorarSeccionId: otra?.id,
      });
    },
    [seleccionada, bloquesInscritos, escenario, otraSeccionDeLaAsignatura],
  );

  const matricula = reglaDeMatricula(escenario);
  const ventana = reglaDeVentana(escenario);

  const seccion = seleccionada?.seccion;
  const yaInscrita = seccion ? estaInscrita(seccion.id) : false;
  const otraSeccion = seccion
    ? otraSeccionDeLaAsignatura(seccion.codigoAsignatura, seccion.id)
    : undefined;

  const intentarInscribir = () => {
    if (!seccion || !seleccionada) return;
    if (rechazadas.length > 0) {
      setTituloRechazo(undefined);
      setRechazo(rechazadas);
      return;
    }
    inscribir(seccion.id);
    setSeleccionada(null);
    notify.success({
      title: `${seccion.nombreAsignatura} · sección ${seccion.seccion}`,
      message: 'Inscripción realizada correctamente.',
    });
  };

  const intentarCambiar = () => {
    if (!seccion || !seleccionada || !otraSeccion) return;
    if (rechazadas.length > 0) {
      setTituloRechazo('No se pudo cambiar de sección');
      setRechazo(rechazadas);
      return;
    }
    cambiarSeccion(otraSeccion.id, seccion.id);
    setSeleccionada(null);
    notify.success({
      title: `${seccion.nombreAsignatura} · sección ${seccion.seccion}`,
      message: 'Cambio de sección realizado correctamente.',
    });
  };

  return (
    <>
      <PageHeader
        title="Oferta académica"
        description="Las secciones que se dictan este período. Abre una para ver si cumples las condiciones."
      />

      <Stack gap="xl">
        {matricula && (
          <Alert color="crimson" icon={<IconIdOff size={18} stroke={1.5} />} title={matricula.titulo}>
            {matricula.mensaje}
          </Alert>
        )}

        {ventana && (
          <Alert
            color={escenario === 'ventana-futura' ? 'sky' : 'orange'}
            icon={
              escenario === 'ventana-futura' ? (
                <IconCalendarEvent size={18} stroke={1.5} />
              ) : (
                <IconCalendarOff size={18} stroke={1.5} />
              )
            }
            title={ventana.titulo}
          >
            {ventana.mensaje}
          </Alert>
        )}

        <OfertaSecciones oferta={oferta} onVerSeccion={setSeleccionada} />

        <OfertaSeccionDrawer
          fila={seleccionada}
          rechazadas={rechazadas}
          onClose={() => setSeleccionada(null)}
          footer={
            yaInscrita ? (
              <Badge color="indigo" size="lg" variant="light">
                Ya está en tu horario
              </Badge>
            ) : otraSeccion ? (
              <Group gap="sm">
                {rechazadas.length > 0 && (
                  <Text fz="sm" c="dimmed">
                    {rechazadas.length === 1
                      ? 'Falta 1 condición'
                      : `Faltan ${rechazadas.length} condiciones`}
                  </Text>
                )}
                <Button onClick={intentarCambiar} leftSection={<IconRepeat size={18} stroke={1.5} />}>
                  Cambiar a esta sección
                </Button>
              </Group>
            ) : (
              <Group gap="sm">
                {rechazadas.length > 0 && (
                  <Text fz="sm" c="dimmed">
                    {rechazadas.length === 1
                      ? 'Falta 1 condición'
                      : `Faltan ${rechazadas.length} condiciones`}
                  </Text>
                )}
                <Button onClick={intentarInscribir} leftSection={<IconPlus size={18} stroke={1.5} />}>
                  Inscribir
                </Button>
              </Group>
            )
          }
        />

        <ReglasRechazadasModal
          reglas={rechazo}
          asignatura={seccion ? `${seccion.nombreAsignatura} sección ${seccion.seccion}` : ''}
          titulo={tituloRechazo}
          onClose={() => setRechazo(null)}
        />
      </Stack>
    </>
  );
}
