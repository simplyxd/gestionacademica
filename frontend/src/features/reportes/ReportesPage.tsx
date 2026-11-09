import { Badge, Group, Paper, Select, Stack, Tabs, Text } from '@mantine/core';
import { useMemo, useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import {
  CARRERAS_REPORTE,
  PERIODOS_REPORTE,
  cargaDocente,
  estudiantesPorAsignatura,
  filtrarPorCarrera,
  matriculaPorCarrera,
  ocupacionSecciones,
} from '@/mocks/reportes';
import { ReportTable } from './ReportTable';
import glass from '@/theme/glass.module.css';

export function ReportesPage() {
  const [periodo, setPeriodo] = useState(PERIODOS_REPORTE[0]?.value ?? '2026-2');
  const [carrera, setCarrera] = useState('todas');

  const matricula = useMemo(() => filtrarPorCarrera(matriculaPorCarrera, carrera), [carrera]);
  const porAsignatura = useMemo(
    () => filtrarPorCarrera(estudiantesPorAsignatura, carrera),
    [carrera],
  );

  const periodoLabel = PERIODOS_REPORTE.find((p) => p.value === periodo)?.label ?? periodo;

  return (
    <>
      <PageHeader
        title="Reportes y consultas"
        description="RF12 / CU10 — solo lectura con datos mock. Sin exportación a servidor."
      />

      <Paper className={glass.glass} p="md" radius="md" mb="lg">
        <Group align="flex-end" wrap="wrap" gap="md">
          <Select
            label="Período"
            data={PERIODOS_REPORTE.map((p) => ({ value: p.value, label: p.label }))}
            value={periodo}
            onChange={(v) => v && setPeriodo(v)}
            allowDeselect={false}
            w={{ base: '100%', sm: 280 }}
          />
          <Select
            label="Carrera"
            data={CARRERAS_REPORTE.map((c) => ({ value: c.value, label: c.label }))}
            value={carrera}
            onChange={(v) => v && setCarrera(v)}
            allowDeselect={false}
            w={{ base: '100%', sm: 280 }}
          />
          <Badge color="slate" size="lg" variant="light">
            Vista mock · {periodoLabel}
          </Badge>
        </Group>
      </Paper>

      <Tabs defaultValue="matricula" color="navy" keepMounted={false}>
        <Tabs.List mb="md">
          <Tabs.Tab value="matricula">Matrícula por carrera</Tabs.Tab>
          <Tabs.Tab value="ocupacion">Ocupación y cupos</Tabs.Tab>
          <Tabs.Tab value="carga">Carga docente</Tabs.Tab>
          <Tabs.Tab value="asignatura">Estudiantes por asignatura</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="matricula">
          <Stack gap="xs">
            <Text size="sm" c="dimmed">
              Totales simulados de matrícula vigente en el período seleccionado.
            </Text>
            <ReportTable
              rows={matricula}
              columns={[
                { key: 'carrera', header: 'Carrera', render: (r) => r.carrera },
                { key: 'sede', header: 'Sede', render: (r) => r.sede },
                {
                  key: 'matriculados',
                  header: 'Matriculados',
                  align: 'right',
                  render: (r) => r.matriculados,
                },
                { key: 'nuevos', header: 'Nuevos', align: 'right', render: (r) => r.nuevos },
                { key: 'retiros', header: 'Retiros', align: 'right', render: (r) => r.retiros },
              ]}
            />
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="ocupacion">
          <Stack gap="xs">
            <Text size="sm" c="dimmed">
              Ocupación de secciones y cupos disponibles (sin edición de oferta).
            </Text>
            <ReportTable
              rows={ocupacionSecciones}
              columns={[
                { key: 'asignatura', header: 'Asignatura', render: (r) => r.asignatura },
                { key: 'seccion', header: 'Sección', render: (r) => r.seccion },
                { key: 'docente', header: 'Docente', render: (r) => r.docente },
                { key: 'inscritos', header: 'Inscritos', align: 'right', render: (r) => r.inscritos },
                { key: 'cupo', header: 'Cupo', align: 'right', render: (r) => r.cupo },
                {
                  key: 'disp',
                  header: 'Disponibles',
                  align: 'right',
                  render: (r) => {
                    const libres = r.cupo - r.inscritos;
                    return libres <= 0 ? (
                      <Text c="crimson" fw={600} component="span">
                        Sin cupo
                      </Text>
                    ) : (
                      libres
                    );
                  },
                },
              ]}
            />
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="carga">
          <ReportTable
            rows={cargaDocente}
            columns={[
              { key: 'docente', header: 'Docente', render: (r) => r.docente },
              { key: 'asignaturas', header: 'Asignaturas', render: (r) => r.asignaturas },
              { key: 'secciones', header: 'Secciones', align: 'right', render: (r) => r.secciones },
              {
                key: 'horas',
                header: 'Horas/semana',
                align: 'right',
                render: (r) => r.horasSemanales,
              },
            ]}
          />
        </Tabs.Panel>

        <Tabs.Panel value="asignatura">
          <ReportTable
            rows={porAsignatura}
            columns={[
              { key: 'asignatura', header: 'Asignatura', render: (r) => r.asignatura },
              { key: 'carrera', header: 'Carrera', render: (r) => r.carrera },
              { key: 'inscritos', header: 'Inscritos', align: 'right', render: (r) => r.inscritos },
            ]}
          />
        </Tabs.Panel>
      </Tabs>
    </>
  );
}
