import { Badge, Group, Stack, Text } from '@mantine/core';
import { IconCircleMinus } from '@tabler/icons-react';
import { EmptyState } from '@/components/ui/EmptyState';
import { seccionPorId } from './useInscripciones';
import type { Inscripcion } from './types';

interface AnuladasListProps {
  anuladas: Inscripcion[];
}

export function AnuladasList({ anuladas }: AnuladasListProps) {
  if (anuladas.length === 0) {
    return (
      <EmptyState
        icon={IconCircleMinus}
        title="No has anulado inscripciones"
        description="Si anulas una asignatura, queda registrada acá con su sección y su período."
      />
    );
  }

  return (
    <Stack gap="sm">
      {anuladas.map((inscripcion) => {
        const seccion = seccionPorId(inscripcion.seccionId);
        if (!seccion) return null;
        return (
          <Group key={inscripcion.id} justify="space-between" wrap="nowrap" gap="md">
            <Group gap="sm" wrap="nowrap">
              <Text component="span" className="sga-code sga-code-indigo">
                {seccion.codigoAsignatura}
              </Text>
              <Stack gap={0}>
                <Text fw={500}>{seccion.nombreAsignatura}</Text>
                <Text fz="sm" c="dimmed">Sección {seccion.seccion}</Text>
              </Stack>
            </Group>
            <Badge color="crimson" variant="outline">Anulada</Badge>
          </Group>
        );
      })}
    </Stack>
  );
}
