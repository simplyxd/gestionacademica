import { Badge } from '@mantine/core';
import { IconCircleCheck, IconPlayerPause, IconSchool, IconUserMinus, type Icon } from '@tabler/icons-react';
import type { EstadoMatricula } from './types';

/** Color semántico por estado (system design §2.1.5): el estado siempre lleva icono y texto. */
export const ESTADO_COLOR: Record<EstadoMatricula, string> = {
  vigente: 'teal',
  suspendida: 'orange',
  egresada: 'indigo',
  retirada: 'crimson',
};

const ESTADO_ICON: Record<EstadoMatricula, Icon> = {
  vigente: IconCircleCheck,
  suspendida: IconPlayerPause,
  egresada: IconSchool,
  retirada: IconUserMinus,
};

export function EstadoMatriculaBadge({ estado }: { estado: EstadoMatricula }) {
  const IconCmp = ESTADO_ICON[estado];
  return (
    <Badge color={ESTADO_COLOR[estado]} leftSection={<IconCmp size={14} stroke={1.5} aria-hidden />}>
      {estado}
    </Badge>
  );
}
