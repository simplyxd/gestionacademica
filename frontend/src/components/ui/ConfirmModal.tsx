import { Button, Group, Modal, Stack, Text } from '@mantine/core';
import type { ReactNode } from 'react';

interface ConfirmModalProps {
  opened: boolean;
  title: string;
  message: ReactNode;
  confirmLabel: string;
  destructive?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function ConfirmModal({
  opened,
  title,
  message,
  confirmLabel,
  destructive,
  loading,
  onConfirm,
  onClose,
}: ConfirmModalProps) {
  return (
    /* Por encima del Drawer (z-index 200 de Mantine): un Drawer puede abrir esta
       confirmación y debe quedar debajo. Las notificaciones siguen arriba (1000). */
    <Modal opened={opened} onClose={onClose} title={title} size="sm" zIndex={300}>
      <Stack gap="lg">
        <Text>{message}</Text>
        <Group justify="flex-end" gap="sm">
          <Button variant="subtle" color="slate" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button color={destructive ? 'crimson' : 'navy'} onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
