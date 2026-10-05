import { Badge, Card, SimpleGrid, Stack, Text, Title } from '@mantine/core';
import { useMemo } from 'react';
import { DIAS_LARGOS, fmt } from '@/lib/horas';
import { MODALIDAD_COLOR, MODALIDAD_LABEL, type DiaSemana, type SeccionOfertada } from './types';

interface OfertaSemanalProps {
  secciones: readonly SeccionOfertada[];
}

/** Vista de la semana con los bloques de todas las secciones del período, un día por columna. */
export function OfertaSemanal({ secciones }: OfertaSemanalProps) {
  const porDia = useMemo(() => {
    const dias: DiaSemana[] = [0, 1, 2, 3, 4, 5];
    return dias.map((dia) => ({
      dia,
      eventos: secciones
        .flatMap((s) => s.bloques.filter((b) => b.dia === dia).map((b) => ({ bloque: b, seccion: s })))
        .sort((a, b) => a.bloque.inicioMin - b.bloque.inicioMin),
    }));
  }, [secciones]);

  return (
    <SimpleGrid cols={{ base: 1, xs: 2, md: 3, xl: 6 }} spacing="sm">
      {porDia.map(({ dia, eventos }) => (
        <Card key={dia} withBorder shadow="none" padding="sm">
          <Stack gap="xs">
            <Title order={3} size="h5">
              {DIAS_LARGOS[dia]}
            </Title>
            {eventos.length === 0 ? (
              <Text fz="sm" c="dimmed">
                Sin clases
              </Text>
            ) : (
              eventos.map(({ bloque, seccion }) => (
                <Card key={`${seccion.id}-${bloque.inicioMin}`} padding="xs" radius="sm" bg="var(--mantine-color-default-hover)" shadow="none">
                  <Text fz="sm" fw={600} className="sga-tnum">
                    {fmt(bloque.inicioMin)}–{fmt(bloque.finMin)}
                  </Text>
                  <Text fz="sm" lineClamp={2}>
                    <Text component="span" className="sga-code sga-code-indigo">
                      {seccion.codigoAsignatura}
                    </Text>{' '}
                    · {seccion.seccion}
                  </Text>
                  <Text fz="xs" c="dimmed">
                    {seccion.docente}
                  </Text>
                  <Text fz="xs" c="dimmed" mb={4}>
                    {seccion.sala ?? 'Sin sala'}
                  </Text>
                  <Badge size="sm" color={MODALIDAD_COLOR[seccion.modalidad]}>
                    {MODALIDAD_LABEL[seccion.modalidad]}
                  </Badge>
                </Card>
              ))
            )}
          </Stack>
        </Card>
      ))}
    </SimpleGrid>
  );
}
