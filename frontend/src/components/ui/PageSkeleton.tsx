import { Skeleton, Stack } from '@mantine/core';

/** Marcador de carga con la forma de una página (título, descripción y contenido). */
export function PageSkeleton() {
  return (
    <Stack gap="lg" role="status" aria-busy="true" aria-label="Cargando contenido">
      <Stack gap="xs">
        <Skeleton height={34} width="35%" />
        <Skeleton height={16} width="55%" />
      </Stack>
      <Skeleton height={320} radius="md" />
    </Stack>
  );
}
