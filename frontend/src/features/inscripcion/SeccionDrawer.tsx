import { Badge, Button, Group, Stack, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconCalendarTime, IconCircleMinus, IconRepeat } from '@tabler/icons-react';
import { useState } from 'react';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { DetailDrawer } from '@/components/ui/DetailDrawer';
import type { BloqueHorario } from '@/features/horario/types';
import type { FilaOferta } from '@/features/oferta/useOferta';
import { DIAS_LARGOS, fmt } from '@/lib/horas';
import { CambiarSeccionPanel } from './CambiarSeccionPanel';
import { CupoIndicator } from './CupoIndicator';
import { evaluarReglas, type Escenario, type ReglaRechazada } from './reglas';
import { ReglasRechazadasModal } from './ReglasRechazadasModal';

interface SeccionDrawerProps {
  bloque: BloqueHorario | null;
  ocupacion: { inscritos: number; cupo: number };
  alternativas: FilaOferta[];
  bloquesInscritos: BloqueHorario[];
  escenario: Escenario;
  onClose: () => void;
  onAnular: (seccionId: string) => void;
  onCambiar: (desdeId: string, hacia: FilaOferta) => void;
}

export function SeccionDrawer({
  bloque,
  ocupacion,
  alternativas,
  bloquesInscritos,
  escenario,
  onClose,
  onAnular,
  onCambiar,
}: SeccionDrawerProps) {
  const [confirmando, { open: abrirConfirmacion, close: cerrarConfirmacion }] = useDisclosure(false);
  const [eligiendo, setEligiendo] = useState(false);
  const [etiqueta, setEtiqueta] = useState('');
  const [rechazo, setRechazo] = useState<ReglaRechazada[] | null>(null);

  const pedirConfirmacion = () => {
    if (!bloque) return;
    setEtiqueta(`${bloque.nombreAsignatura} (${bloque.codigoAsignatura}) sección ${bloque.seccion}`);
    abrirConfirmacion();
  };

  const confirmarAnulacion = () => {
    if (!bloque) return;
    cerrarConfirmacion();
    onAnular(bloque.seccionId);
    onClose();
  };

  const elegirAlternativa = (fila: FilaOferta) => {
    if (!bloque) return;
    const rechazadas = evaluarReglas({
      fila,
      bloquesInscritos,
      escenario,
      ignorarSeccionId: bloque.seccionId,
    });
    if (rechazadas.length > 0) {
      setRechazo(rechazadas);
      return;
    }
    onCambiar(bloque.seccionId, fila);
    onClose();
  };

  return (
    <>
      <DetailDrawer
        opened={bloque !== null}
        onClose={onClose}
        title={bloque ? `${bloque.codigoAsignatura} · ${bloque.nombreAsignatura}` : ''}
        subtitle={
          bloque
            ? eligiendo
              ? 'Elige otra sección'
              : `Sección ${bloque.seccion}${bloque.sala ? ` · ${bloque.sala}` : ''}`
            : undefined
        }
        footer={
          eligiendo ? (
            <Button variant="subtle" color="slate" onClick={() => setEligiendo(false)}>
              Seguir con esta sección
            </Button>
          ) : (
            <>
              <Button
                variant="light"
                onClick={() => setEligiendo(true)}
                leftSection={<IconRepeat size={18} stroke={1.5} />}
              >
                Cambiar sección
              </Button>
              <Button color="crimson" onClick={pedirConfirmacion} leftSection={<IconCircleMinus size={18} stroke={1.5} />}>
                Anular
              </Button>
            </>
          )
        }
      >
        {bloque && !eligiendo && (
          <>
            <Group gap="xs">
              <Badge color="indigo">Inscrita</Badge>
              {bloque.estado === 'conflicto' && <Badge color="crimson">Choque de horario</Badge>}
            </Group>

            <Stack gap={4}>
              <Group gap="xs" c="dimmed">
                <IconCalendarTime size={18} stroke={1.5} aria-hidden />
                <Text fz="sm">Horario</Text>
              </Group>
              <Text className="sga-tnum">
                {DIAS_LARGOS[bloque.dia]} de {fmt(bloque.inicioMin)} a {fmt(bloque.finMin)}
              </Text>
            </Stack>

            <Stack gap={4}>
              <Text fz="sm" c="dimmed">Cupo de la sección</Text>
              <CupoIndicator inscritos={ocupacion.inscritos} cupo={ocupacion.cupo} />
            </Stack>
          </>
        )}

        {bloque && eligiendo && (
          <CambiarSeccionPanel actuales={alternativas} onElegir={elegirAlternativa} />
        )}
      </DetailDrawer>

      <ConfirmModal
        opened={confirmando}
        onClose={cerrarConfirmacion}
        title="¿Anular esta inscripción?"
        message={`Vas a anular ${etiqueta}. Su cupo queda disponible y la asignatura vuelve a tus asignaturas por tomar.`}
        confirmLabel="Anular"
        destructive
        onConfirm={confirmarAnulacion}
      />

      <ReglasRechazadasModal
        reglas={rechazo}
        asignatura={bloque ? `${bloque.nombreAsignatura} sección ${bloque.seccion}` : ''}
        titulo="No se pudo cambiar de sección"
        onClose={() => setRechazo(null)}
      />
    </>
  );
}
