import { Alert, Button, Skeleton, Stack, Text } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';

export function AvisoError({ mensaje, onReintentar }: { mensaje: string; onReintentar: () => void }) {
  return (
    <Alert
      color="crimson"
      variant="light"
      role="alert"
      icon={<IconAlertCircle size={18} stroke={1.5} />}
      title="No pudimos completar la consulta"
    >
      <Stack gap="sm">
        <Text fz="sm">{mensaje}</Text>
        <Button variant="light" color="crimson" size="xs" onClick={onReintentar}>
          Reintentar
        </Button>
      </Stack>
    </Alert>
  );
}

export function CargandoBloque({ etiqueta }: { etiqueta: string }) {
  return <Skeleton height={180} radius="md" role="status" aria-busy="true" aria-label={etiqueta} />;
}
