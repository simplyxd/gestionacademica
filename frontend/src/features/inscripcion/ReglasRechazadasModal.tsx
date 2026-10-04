import { Button, Group, Modal, Stack, Text } from '@mantine/core';
import { EstadoReglas } from './EstadoReglas';
import type { ReglaRechazada } from './reglas';

interface ReglasRechazadasModalProps {
  /** `null` mantiene el modal cerrado. */
  reglas: ReglaRechazada[] | null;
  asignatura: string;
  titulo?: string;
  onClose: () => void;
}

export function ReglasRechazadasModal({
  reglas,
  asignatura,
  titulo,
  onClose,
}: ReglasRechazadasModalProps) {
  return (
    /* Por encima del Drawer que lo abre, igual que la confirmación de anular. */
    <Modal
      opened={reglas !== null}
      onClose={onClose}
      title={titulo ?? `No se pudo inscribir ${asignatura}`}
      size="md"
      zIndex={300}
    >
      {reglas && (
        <Stack gap="lg">
          <Text c="dimmed" fz="sm">
            Se revisaron las 7 condiciones de inscripción. Estas son las que no se cumplen:
          </Text>
          <EstadoReglas rechazadas={reglas} conChecklist={false} />
          <Group justify="flex-end">
            <Button onClick={onClose}>Entendido</Button>
          </Group>
        </Stack>
      )}
    </Modal>
  );
}
