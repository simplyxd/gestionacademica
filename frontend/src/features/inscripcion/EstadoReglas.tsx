import { Alert, Group, List, Stack, Text, ThemeIcon } from '@mantine/core';
import {
  IconBookOff,
  IconCalendarEvent,
  IconCalendarX,
  IconCircleCheck,
  IconCircleCheckFilled,
  IconIdOff,
  IconLock,
  IconUsers,
  type Icon,
} from '@tabler/icons-react';
import { REGLAS, type CodigoRegla, type ReglaRechazada } from './reglas';

const ICONO: Record<CodigoRegla, Icon> = {
  MATRICULA_NO_VIGENTE: IconIdOff,
  FUERA_DE_VENTANA: IconCalendarEvent,
  SIN_CUPO: IconUsers,
  FUERA_DE_PLAN: IconBookOff,
  PRERREQUISITO_PENDIENTE: IconLock,
  YA_APROBADA: IconCircleCheck,
  CHOQUE_HORARIO: IconCalendarX,
};

interface EstadoReglasProps {
  rechazadas: ReglaRechazada[];
  /** El checklist de las 7 solo tiene sentido antes de intentar. */
  conChecklist?: boolean;
}

export function EstadoReglas({ rechazadas, conChecklist = true }: EstadoReglasProps) {
  const porCodigo = new Map(rechazadas.map((r) => [r.code, r]));
  const ok = rechazadas.length === 0;

  return (
    <Stack gap="sm">
      <Group gap="xs">
        <ThemeIcon variant="light" color={ok ? 'teal' : 'crimson'} size="sm" radius="xl">
          {ok ? <IconCircleCheckFilled size={12} /> : <IconLock size={12} stroke={2} />}
        </ThemeIcon>
        <Text fz="sm" fw={600}>
          {ok
            ? 'Cumples todas las condiciones para inscribir'
            : rechazadas.length === 1
              ? '1 de 7 condiciones no se cumple'
              : `${rechazadas.length} de 7 condiciones no se cumplen`}
        </Text>
      </Group>

      {conChecklist && (
        <List spacing={6} size="sm" center>
          {REGLAS.map((meta) => {
            const rechazo = porCodigo.get(meta.code);
            const IconCmp = rechazo ? ICONO[meta.code] : IconCircleCheck;
            return (
              <List.Item
                key={meta.code}
                icon={
                  <ThemeIcon variant="light" color={rechazo ? 'crimson' : 'teal'} size={22} radius="xl">
                    <IconCmp size={14} stroke={2} />
                  </ThemeIcon>
                }
              >
                <Text fz="sm" c={rechazo ? undefined : 'dimmed'} fw={rechazo ? 500 : 400}>
                  {meta.nombre}
                </Text>
              </List.Item>
            );
          })}
        </List>
      )}

      {rechazadas.map((r) => {
        const IconCmp = ICONO[r.code];
        return (
          <Alert key={r.code} color="crimson" icon={<IconCmp size={18} stroke={1.5} />} title={r.titulo}>
            {r.mensaje}
          </Alert>
        );
      })}
    </Stack>
  );
}
