import { Badge, Divider, Group, List, Stack, Text, ThemeIcon } from '@mantine/core';
import {
  IconCalendarTime,
  IconCircleCheck,
  IconDeviceLaptop,
  IconLock,
  IconMapPin,
  IconUser,
} from '@tabler/icons-react';
import type { ReactNode } from 'react';
import { DetailDrawer } from '@/components/ui/DetailDrawer';
import { CupoIndicator } from '@/features/inscripcion/CupoIndicator';
import { EstadoReglas } from '@/features/inscripcion/EstadoReglas';
import type { ReglaRechazada } from '@/features/inscripcion/reglas';
import { textoBloques } from '@/lib/horas';
import { asignaturaPorCodigo } from '@/mocks/sga';
import { JORNADA_LABEL, MODALIDAD_LABEL } from './types';
import type { FilaOferta } from './useOferta';

interface OfertaSeccionDrawerProps {
  fila: FilaOferta | null;
  onClose: () => void;
  /** Condiciones que no se cumplen, evaluadas antes de intentar inscribir. */
  rechazadas: ReglaRechazada[];
  footer?: ReactNode;
}

function Dato({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <Stack gap={4}>
      <Group gap="xs" c="dimmed">
        {icon}
        <Text fz="sm">{label}</Text>
      </Group>
      {children}
    </Stack>
  );
}

export function OfertaSeccionDrawer({ fila, onClose, rechazadas, footer }: OfertaSeccionDrawerProps) {
  const seccion = fila?.seccion;
  const prerrequisitos = seccion
    ? (asignaturaPorCodigo(seccion.codigoAsignatura)?.prerrequisitos ?? [])
    : [];

  return (
    <DetailDrawer
      opened={fila !== null}
      onClose={onClose}
      position="right"
      size={480}
      title={seccion ? `${seccion.codigoAsignatura} · ${seccion.nombreAsignatura}` : ''}
      subtitle={seccion ? `Sección ${seccion.seccion} · ${seccion.docente}` : undefined}
      footer={footer}
    >
      {fila && seccion && (
        <>
          <Group gap="xs">
            {fila.estaInscrita && <Badge color="indigo">Inscrita</Badge>}
            {fila.aprobadaEn && (
              <Badge color="teal" variant="outline">Aprobada en {fila.aprobadaEn}</Badge>
            )}
            {fila.fueraDelPlan && (
              <Badge color="slate" variant="outline">Fuera de tu plan</Badge>
            )}
          </Group>

          <Dato icon={<IconCalendarTime size={18} stroke={1.5} aria-hidden />} label="Horario">
            <Text className="sga-tnum">{textoBloques(seccion.bloques)}</Text>
          </Dato>

          <Dato icon={<IconUser size={18} stroke={1.5} aria-hidden />} label="Docente">
            <Text>{seccion.docente}</Text>
          </Dato>

          <Dato icon={<IconDeviceLaptop size={18} stroke={1.5} aria-hidden />} label="Modalidad y jornada">
            <Text>
              {MODALIDAD_LABEL[seccion.modalidad]} · {JORNADA_LABEL[seccion.jornada]}
            </Text>
          </Dato>

          {seccion.sala && (
            <Dato icon={<IconMapPin size={18} stroke={1.5} aria-hidden />} label="Sala">
              <Text>{seccion.sala}</Text>
            </Dato>
          )}

          {prerrequisitos.length > 0 && (
            <Dato icon={<IconLock size={18} stroke={1.5} aria-hidden />} label="Prerrequisitos">
              <List spacing={6} size="sm" center>
                {prerrequisitos.map((codigo) => {
                  const pendiente = fila.prerrequisitosPendientes.includes(codigo);
                  return (
                    <List.Item
                      key={codigo}
                      icon={
                        <ThemeIcon
                          variant="light"
                          color={pendiente ? 'crimson' : 'teal'}
                          size={22}
                          radius="xl"
                        >
                          {pendiente ? <IconLock size={14} stroke={2} /> : <IconCircleCheck size={14} stroke={2} />}
                        </ThemeIcon>
                      }
                    >
                      <Text fz="sm">
                        {asignaturaPorCodigo(codigo)?.nombre ?? codigo} ({codigo}) ·{' '}
                        {pendiente ? 'pendiente' : 'aprobada'}
                      </Text>
                    </List.Item>
                  );
                })}
              </List>
            </Dato>
          )}

          <Stack gap={4}>
            <Text fz="sm" c="dimmed">Cupo de la sección</Text>
            <CupoIndicator inscritos={fila.inscritos} cupo={fila.cupo} />
          </Stack>

          <Divider />

          <EstadoReglas rechazadas={rechazadas} />
        </>
      )}
    </DetailDrawer>
  );
}
