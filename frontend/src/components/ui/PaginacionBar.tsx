import { Group, Pagination, Text } from '@mantine/core';

interface PaginacionBarProps {
  pagina: number;
  total: number;
  desde: number;
  hasta: number;
  cantidad: number;
  onChange: (pagina: number) => void;
}

/** Pie de tabla: «Mostrando 1–8 de 20» y los controles de página (system design §5: paginación siempre). */
export function PaginacionBar({ pagina, total, desde, hasta, cantidad, onChange }: PaginacionBarProps) {
  return (
    <Group justify="space-between" wrap="wrap" gap="sm">
      <Text fz="sm" c="dimmed" className="sga-tnum">
        Mostrando {desde}–{hasta} de {cantidad}
      </Text>
      <Pagination total={total} value={pagina} onChange={onChange} />
    </Group>
  );
}
