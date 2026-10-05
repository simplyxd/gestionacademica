import { Badge, Card, Group, Stack, Text } from '@mantine/core';
import { IconChevronRight, IconLock } from '@tabler/icons-react';
import { EmptyState } from '@/components/ui/EmptyState';
import type { Asignatura } from '@/features/oferta/types';
import { asignaturaPorCodigo } from '@/mocks/sga';
import classes from './PorTomarList.module.css';

export interface AsignaturaPorTomar {
  asignatura: Asignatura;
  fueAnulada: boolean;
  prerrequisitosPendientes: string[];
}

interface PorTomarListProps {
  items: AsignaturaPorTomar[];
  onElegir: (codigo: string) => void;
}

export function PorTomarList({ items, onElegir }: PorTomarListProps) {
  if (items.length === 0) {
    return (
      <EmptyState
        title="No te quedan asignaturas por tomar"
        description="Las de tu plan están inscritas o ya las aprobaste."
      />
    );
  }

  return (
    <Stack gap="sm">
      {items.map(({ asignatura, fueAnulada, prerrequisitosPendientes }) => {
        const pide = asignatura.prerrequisitos.map((c) => asignaturaPorCodigo(c)?.nombre ?? c);

        return (
          <Card
            key={asignatura.codigo}
            padding="md"
            component="button"
            type="button"
            onClick={() => onElegir(asignatura.codigo)}
            className={classes.tarjeta}
          >
            <Group justify="space-between" wrap="nowrap" align="flex-start">
              <Stack gap={4} align="flex-start">
                <Group gap="xs">
                  <Text className="sga-code" c="indigo">{asignatura.codigo}</Text>
                  {fueAnulada && (
                    <Badge color="crimson" variant="outline" size="sm">Anulada</Badge>
                  )}
                  {prerrequisitosPendientes.length > 0 && (
                    <Badge color="crimson" variant="light" size="sm" leftSection={<IconLock size={12} />}>
                      Prerrequisito
                    </Badge>
                  )}
                </Group>
                <Text fw={500}>{asignatura.nombre}</Text>
                <Text fz="sm" c="dimmed">
                  {asignatura.creditos} créditos
                  {pide.length > 0 ? ` · pide ${pide.join(', ')}` : ''}
                </Text>
              </Stack>
              <IconChevronRight size={18} stroke={1.5} aria-hidden />
            </Group>
          </Card>
        );
      })}
    </Stack>
  );
}
