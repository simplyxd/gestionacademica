import { Badge, Button, Card, Group, Stack, Text } from '@mantine/core';
import { IconRepeat } from '@tabler/icons-react';
import { EmptyState } from '@/components/ui/EmptyState';
import { CupoIndicator } from '@/features/inscripcion/CupoIndicator';
import { JORNADA_LABEL, MODALIDAD_LABEL } from '@/features/oferta/types';
import type { FilaOferta } from '@/features/oferta/useOferta';
import { textoBloques } from '@/lib/horas';

interface CambiarSeccionPanelProps {
  actuales: FilaOferta[];
  onElegir: (fila: FilaOferta) => void;
}

export function CambiarSeccionPanel({ actuales, onElegir }: CambiarSeccionPanelProps) {
  if (actuales.length === 0) {
    return (
      <EmptyState
        icon={IconRepeat}
        title="No hay otras secciones"
        description="No hay otras secciones de esta asignatura en este período."
      />
    );
  }

  return (
    <Stack gap="sm">
      <Text fz="sm" c="dimmed">
        Tu sección actual sigue inscrita hasta que elijas otra que cumpla las condiciones.
      </Text>
      {actuales.map((fila) => {
        const { seccion } = fila;
        return (
          <Card key={seccion.id} padding="md" withBorder>
            <Stack gap="sm">
              <Group justify="space-between" wrap="nowrap">
                <Stack gap={2}>
                  <Text fw={600}>Sección {seccion.seccion}</Text>
                  <Text fz="sm" c="dimmed">{seccion.docente}</Text>
                </Stack>
                <Badge color="navy" variant="light">
                  {MODALIDAD_LABEL[seccion.modalidad]} · {JORNADA_LABEL[seccion.jornada]}
                </Badge>
              </Group>
              <Text fz="sm" className="sga-tnum">
                {textoBloques(seccion.bloques)}
                {seccion.sala ? ` · ${seccion.sala}` : ''}
              </Text>
              <CupoIndicator inscritos={fila.inscritos} cupo={fila.cupo} compact />
              <Button
                variant="light"
                onClick={() => onElegir(fila)}
                aria-label={`Elegir sección ${seccion.seccion}`}
              >
                Elegir esta sección
              </Button>
            </Stack>
          </Card>
        );
      })}
    </Stack>
  );
}
