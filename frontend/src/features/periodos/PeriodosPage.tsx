import { Alert, Badge, Button, Card, Group, SimpleGrid, Stack, Text, Title } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconEdit, IconInfoCircle, IconPlus } from '@tabler/icons-react';
import { useMemo, useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import type { Periodo } from '@/mock/types';
import { ESTADO_PERIODO_COLOR, formatearFecha } from './estado';
import { PeriodoFormDrawer } from './PeriodoFormDrawer';
import { usePeriodos } from './PeriodosContext';

export function PeriodosPage() {
  const { periodos } = usePeriodos();
  const [abierto, drawer] = useDisclosure(false);
  const [editando, setEditando] = useState<Periodo | null>(null);

  const ordenados = useMemo(() => [...periodos].sort((a, b) => a.inicio.localeCompare(b.inicio)), [periodos]);

  const crear = () => {
    setEditando(null);
    drawer.open();
  };
  const editar = (periodo: Periodo) => {
    setEditando(periodo);
    drawer.open();
  };

  return (
    <>
      <PageHeader
        title="Períodos académicos"
        description="Administra las fechas de cada período y su ventana de inscripción por separado."
        breadcrumbs={[{ label: 'Inicio', to: '/' }, { label: 'Períodos' }]}
        actions={
          <Button leftSection={<IconPlus size={18} stroke={1.5} />} onClick={crear}>
            Crear período
          </Button>
        }
      />

      <Text fz="sm" c="dimmed" mb="md" role="status">
        {periodos.length} {periodos.length === 1 ? 'período' : 'períodos'}
      </Text>

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
        {ordenados.map((periodo) => (
          <Card key={periodo.id}>
            <Stack gap="sm" h="100%" justify="space-between">
              <Stack gap="sm">
                <Group justify="space-between" align="flex-start" wrap="nowrap" gap="xs">
                  <Stack gap={2}>
                    <Text component="span" className="sga-code sga-code-indigo">
                      {periodo.codigo}
                    </Text>
                    <Title order={2} size="h4">
                      {periodo.nombre}
                    </Title>
                  </Stack>
                  <Badge color={ESTADO_PERIODO_COLOR[periodo.estado]}>{periodo.estado}</Badge>
                </Group>

                <Stack gap={2}>
                  <Text fz="sm">
                    <Text component="span" fw={600}>
                      Período:
                    </Text>{' '}
                    <span className="sga-tnum">
                      {formatearFecha(periodo.inicio)} – {formatearFecha(periodo.termino)}
                    </span>
                  </Text>
                  <Text fz="sm">
                    <Text component="span" fw={600}>
                      Inscripción:
                    </Text>{' '}
                    <span className="sga-tnum">
                      {formatearFecha(periodo.inscripcionInicio)} – {formatearFecha(periodo.inscripcionTermino)}
                    </span>
                  </Text>
                </Stack>

                {periodo.estado === 'cerrado' && (
                  <Alert color="slate" variant="light" icon={<IconInfoCircle size={18} stroke={1.5} />} title="Período cerrado">
                    Ya no se programan secciones ni se hacen inscripciones.
                  </Alert>
                )}
              </Stack>

              <Button
                variant="light"
                leftSection={<IconEdit size={16} stroke={1.5} />}
                onClick={() => editar(periodo)}
                aria-label={`Editar el período ${periodo.codigo}`}
              >
                Editar período
              </Button>
            </Stack>
          </Card>
        ))}
      </SimpleGrid>

      <PeriodoFormDrawer opened={abierto} onClose={drawer.close} periodo={editando} />
    </>
  );
}
