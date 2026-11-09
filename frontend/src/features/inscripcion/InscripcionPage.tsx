import { Alert, Card, Stack, Title } from '@mantine/core';
import { IconCalendarEvent, IconCalendarOff, IconIdOff } from '@tabler/icons-react';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSga } from '@/app/SgaContext';
import { PageHeader } from '@/components/layout/PageHeader';
import { AnuladasList } from './AnuladasList';
import { PorTomarList } from './PorTomarList';
import { reglaDeMatricula, reglaDeVentana } from './reglas';
import { asignaturaPorCodigo, estudiante } from '@/mocks/sga';

export function InscripcionPage() {
  const navigate = useNavigate();
  const { anuladas, codigosInscritos, escenario, seccionPorId } = useSga();

  const matricula = reglaDeMatricula(escenario);
  const ventana = reglaDeVentana(escenario);

  const porTomar = useMemo(() => {
    const aprobadas = new Set(estudiante.aprobadas.map((a) => a.codigo));
    const anuladasCodigos = new Set(
      anuladas
        .map((i) => seccionPorId(i.seccionId)?.codigoAsignatura)
        .filter((c): c is string => Boolean(c)),
    );

    return estudiante.codigosDelPlan.flatMap((codigo) => {
      const asignatura = asignaturaPorCodigo(codigo);
      if (!asignatura) return [];
      if (aprobadas.has(codigo)) return [];
      if (codigosInscritos.has(codigo)) return [];
      return [{
        asignatura,
        fueAnulada: anuladasCodigos.has(codigo),
        prerrequisitosPendientes: asignatura.prerrequisitos.filter((c) => !aprobadas.has(c)),
      }];
    });
  }, [anuladas, codigosInscritos, seccionPorId]);

  return (
    <>
      <PageHeader
        title="Inscripción"
        description="Las asignaturas de tu plan que todavía no inscribes. Toca una para ver sus secciones."
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
              escenario === 'ventana-futura'
                ? <IconCalendarEvent size={18} stroke={1.5} />
                : <IconCalendarOff size={18} stroke={1.5} />
            }
            title={ventana.titulo}
          >
            {ventana.mensaje}
          </Alert>
        )}

        <Card>
          <Card.Section inheritPadding withBorder py="sm">
            <Title order={2} size="h3">Asignaturas por tomar</Title>
          </Card.Section>
          <Card.Section inheritPadding py="md">
            <PorTomarList
              items={porTomar}
              onElegir={(codigo) => navigate(`/oferta?codigo=${encodeURIComponent(codigo)}`)}
            />
          </Card.Section>
        </Card>

        <Card>
          <Card.Section inheritPadding withBorder py="sm">
            <Title order={2} size="h3">Inscripciones anuladas</Title>
          </Card.Section>
          <Card.Section inheritPadding py="md">
            <AnuladasList anuladas={anuladas} />
          </Card.Section>
        </Card>
      </Stack>
    </>
  );
}
