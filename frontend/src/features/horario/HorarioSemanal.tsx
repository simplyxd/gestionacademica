import { Box, Group, HoverCard, ScrollArea, SegmentedControl, Stack, Text } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { IconAlertTriangle } from '@tabler/icons-react';
import clsx from 'clsx';
import { useMemo, useState, type CSSProperties } from 'react';
import { DIAS, DIAS_CORTOS, DIAS_LARGOS, fmt } from '@/lib/horas';
import classes from './HorarioSemanal.module.css';
import { detectarChoques, repartirColumnas, type BloqueHorario } from './types';

const START_HOUR = 8;
const END_HOUR = 22;
const HOUR_PX = 56;

interface HorarioSemanalProps {
  bloques: BloqueHorario[];
  /** Bloques de la sección que el estudiante está evaluando inscribir. */
  propuestos?: BloqueHorario[];
  onBloqueClick?: (b: BloqueHorario) => void;
}

export function HorarioSemanal({ bloques, propuestos = [], onBloqueClick }: HorarioSemanalProps) {
  const esMovil = useMediaQuery('(max-width: 48em)');
  const [diaMovil, setDiaMovil] = useState('0');

  const { todos, choques } = useMemo(() => {
    const merged = [...bloques, ...propuestos.map((p) => ({ ...p, estado: 'propuesta' as const }))];
    const pares = detectarChoques(merged);
    const conflictIds = new Set(pares.flat());
    const marcados = merged.map((b) => (conflictIds.has(b.id) ? { ...b, estado: 'conflicto' as const } : b));
    return { todos: marcados, choques: pares };
  }, [bloques, propuestos]);

  const horas = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i);
  const diasVisibles = esMovil ? [Number(diaMovil)] : [0, 1, 2, 3, 4, 5];

  const gridStyle: CSSProperties & Record<string, string | number> = {
    '--hours': END_HOUR - START_HOUR,
    gridTemplateColumns: `3.5rem repeat(${diasVisibles.length}, minmax(${esMovil ? '0' : '7.5rem'}, 1fr))`,
    minWidth: esMovil ? 0 : '50rem',
  };

  return (
    <Stack gap="sm">
      {esMovil && (
        <SegmentedControl
          fullWidth
          value={diaMovil}
          onChange={setDiaMovil}
          aria-label="Día de la semana"
          data={DIAS_CORTOS.map((d, i) => ({ value: String(i), label: d }))}
        />
      )}

      <ScrollArea type="auto" offsetScrollbars>
        <Box
          className={classes.grid}
          style={gridStyle}
          role="grid"
          aria-label={esMovil ? `Horario del ${DIAS_LARGOS[Number(diaMovil)]}` : 'Horario semanal'}
        >
          {/* Cabecera */}
          <Box className={classes.corner} />
          {diasVisibles.map((dia) => (
            <Box key={dia} className={classes.dayHeader} role="columnheader">
              <Text fz="sm" fw={600}>{DIAS[dia]}</Text>
            </Box>
          ))}

          {/* Columna de horas */}
          <Box className={classes.hoursCol}>
            {horas.map((h) => (
              <Text key={h} fz="xs" c="dimmed" className={clsx(classes.hourLabel, 'sga-tnum')}>
                {String(h).padStart(2, '0')}:00
              </Text>
            ))}
          </Box>

          {/* Columnas de días */}
          {diasVisibles.map((dia) => {
            const delDia = todos.filter((b) => b.dia === dia);
            const columnas = repartirColumnas(delDia);
            return (
              <Box key={dia} className={classes.dayCol} role="gridcell">
                {delDia.map((b) => {
                  const top = ((b.inicioMin - START_HOUR * 60) / 60) * HOUR_PX;
                  const height = ((b.finMin - b.inicioMin) / 60) * HOUR_PX;
                  const { col, cols } = columnas.get(b.id) ?? { col: 0, cols: 1 };
                  const left = `calc(${(col / cols) * 100}% + 4px)`;
                  const width = `calc(${100 / cols}% - 8px)`;
                  /** Al compartir el espacio con otro bloque no cabe el detalle: queda en el HoverCard. */
                  const compacto = cols > 1;
                  return (
                    <HoverCard key={b.id} width={260} shadow="md" openDelay={250} zIndex={100}>
                      <HoverCard.Target>
                        <Box
                          component="button"
                          type="button"
                          className={clsx(classes.bloque, classes[b.estado])}
                          style={{ top, height, left, width }}
                          onClick={() => onBloqueClick?.(b)}
                          aria-label={`${b.codigoAsignatura} ${b.nombreAsignatura}, ${DIAS_LARGOS[b.dia]} ${fmt(b.inicioMin)} a ${fmt(b.finMin)}${
                            b.estado === 'conflicto' ? ', choque de horario' : ''
                          }`}
                        >
                          <Group gap={4} wrap="nowrap" justify="space-between">
                            <Text className="sga-code" fz="xs">{b.codigoAsignatura}</Text>
                            {b.estado === 'conflicto' && <IconAlertTriangle size={14} stroke={2} aria-hidden />}
                          </Group>
                          <Text fz="xs" fw={500} lineClamp={!compacto && height > 60 ? 2 : 1}>
                            {b.nombreAsignatura}
                          </Text>
                          {!compacto && height > 80 && (
                            <Text fz="xs" className={classes.meta}>
                              Sec. {b.seccion}{b.sala ? ` · ${b.sala}` : ''}
                            </Text>
                          )}
                        </Box>
                      </HoverCard.Target>
                      <HoverCard.Dropdown>
                        <Stack gap={4}>
                          <Text fw={600} fz="sm">{b.codigoAsignatura} · {b.nombreAsignatura}</Text>
                          <Text fz="sm" c="dimmed">
                            {DIAS[b.dia]} {fmt(b.inicioMin)}–{fmt(b.finMin)} · Sección {b.seccion}
                          </Text>
                          {b.sala && <Text fz="sm" c="dimmed">{b.sala}</Text>}
                          {b.estado === 'conflicto' && (
                            <Text fz="sm" c="crimson" fw={500}>
                              Se solapa con otra inscripción de este período.
                            </Text>
                          )}
                        </Stack>
                      </HoverCard.Dropdown>
                    </HoverCard>
                  );
                })}
              </Box>
            );
          })}
        </Box>
      </ScrollArea>

      {choques.length > 0 && (
        <Text fz="sm" c="crimson" role="status">
          {choques.length === 1 ? '1 choque de horario detectado.' : `${choques.length} choques de horario detectados.`}
        </Text>
      )}
    </Stack>
  );
}
