import { Button, Card, Group, SimpleGrid, Stack, Text, Title } from '@mantine/core';
import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import { useAuth } from '@/features/auth/AuthContext';
import glass from '@/theme/glass.module.css';
import { NAV_BY_ROLE, ROL_LABEL } from '../navigation';

/** Qué se hace en cada pantalla. Una ruta sin descripción igual aparece, solo con su nombre. */
const DESCRIPCION: Record<string, string> = {
  '/estructura/sedes': 'Sedes donde se dictan las secciones y su estado.',
  '/estructura/carreras': 'Carreras, sedes, modalidad, jornada y duración.',
  '/estructura/planes': 'Asignaturas de cada plan por semestre y sus prerrequisitos.',
  '/periodos': 'Fechas de cada período y su ventana de inscripción.',
  '/matricula': 'Matrícula de estudiantes en carrera, plan y período.',
  '/coordinador/oferta': 'Secciones, docentes, salas y bloques horarios del período.',
  '/personas': 'Ficha de docentes y estudiantes, con su carga académica.',
  '/reportes': 'Matrícula, ocupación, cupos y carga docente. Solo lectura.',
  '/docente/secciones': 'Las secciones que dictas en el período y su nómina.',
  '/docente/horario': 'Tu semana de clases, con sala y sede.',
  '/oferta': 'Secciones abiertas de tu plan en el período.',
  '/inscripcion': 'Inscribe asignaturas y revisa por qué alguna no se puede tomar.',
  '/horario': 'Tu horario semanal con las asignaturas inscritas.',
};

export function InicioPage() {
  const { usuario } = useAuth();
  const accesos = NAV_BY_ROLE[usuario.rol].filter((item) => item.to !== '/' && item.to !== '/admin');

  return (
    <>
      <PageHeader title="Inicio" description={`Hola, ${usuario.nombre}. Estás usando el SGA como ${ROL_LABEL[usuario.rol]}.`} />

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
        {accesos.map(({ label, to, icon: Icono }) => (
          <Card key={to} className={glass.glass} padding="lg" radius="md">
            <Stack gap="md" h="100%" justify="space-between">
              <Stack gap="xs">
                <Group gap="sm" wrap="nowrap">
                  <Icono size={24} stroke={1.5} color="var(--mantine-color-navy-6)" aria-hidden />
                  <Title order={2} size="h4">{label}</Title>
                </Group>
                {DESCRIPCION[to] && <Text c="dimmed" size="sm">{DESCRIPCION[to]}</Text>}
              </Stack>
              <Button component={Link} to={to} variant="light" color="navy">
                Abrir {label.toLowerCase()}
              </Button>
            </Stack>
          </Card>
        ))}
      </SimpleGrid>
    </>
  );
}
