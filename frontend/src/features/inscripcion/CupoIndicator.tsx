import { Badge, Group, Progress, Stack, Text, type MantineColor, type StackProps } from '@mantine/core';

export type EstadoCupo = 'disponible' | 'critico' | 'lleno';

export function estadoCupo(inscritos: number, cupo: number): EstadoCupo {
  if (cupo <= 0 || inscritos >= cupo) return 'lleno';
  const ratio = inscritos / cupo;
  return ratio >= 0.75 ? 'critico' : 'disponible';
}

const CUPO_COLOR: Record<EstadoCupo, MantineColor> = {
  disponible: 'teal',
  critico: 'orange',
  lleno: 'crimson',
};

function etiqueta(estado: EstadoCupo, restantes: number) {
  if (estado === 'lleno') return 'Sin cupo';
  if (estado === 'critico') return `Cupos críticos · quedan ${restantes}`;
  return 'Cupo disponible';
}

interface CupoIndicatorProps extends StackProps {
  inscritos: number;
  cupo: number;
  /** Solo barra + texto corto (para celdas de tabla). */
  compact?: boolean;
}

export function CupoIndicator({ inscritos, cupo, compact, ...rest }: CupoIndicatorProps) {
  const estado = estadoCupo(inscritos, cupo);
  const color = CUPO_COLOR[estado];
  const pct = cupo > 0 ? Math.min(100, Math.round((inscritos / cupo) * 100)) : 100;
  const restantes = Math.max(0, cupo - inscritos);

  return (
    <Stack gap={4} {...rest}>
      <Group justify="space-between" gap="xs" wrap="nowrap">
        <Text fz="xs" className="sga-tnum" c={compact ? 'dimmed' : undefined}>
          {inscritos}/{cupo}
        </Text>
        {compact ? (
          <Text fz="xs" c={`${color}.${estado === 'disponible' ? 7 : 8}`} fw={600}>
            {estado === 'lleno' ? 'Sin cupo' : estado === 'critico' ? `Quedan ${restantes}` : 'Disponible'}
          </Text>
        ) : (
          <Badge color={color} size="sm">{etiqueta(estado, restantes)}</Badge>
        )}
      </Group>
      <Progress
        value={pct}
        color={color}
        aria-label={`Ocupación ${pct} %: ${etiqueta(estado, restantes)}`}
        striped={estado === 'lleno'}
      />
    </Stack>
  );
}
