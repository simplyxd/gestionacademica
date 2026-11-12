import { Button, Card, Group, Stack, Text } from '@mantine/core';
import { IconCalendarEvent, IconClipboardList, IconListDetails } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import { useAuth } from '@/features/auth/AuthContext';
import { ROL_LABEL } from '../navigation';

export function InicioPage() {
  const { usuario } = useAuth();
  const esCoordinador = usuario.rol === 'coordinador';
  const esEstudiante = usuario.rol === 'estudiante';

  return (
    <>
      <PageHeader title="Inicio" description={`Hola, ${usuario.nombre}. Estás usando el SGA como ${ROL_LABEL[usuario.rol]}.`} />
      <Card>
        <Stack gap="sm" align="flex-start">
          {esEstudiante ? (
            <>
              <Text>
                Puedes consultar la oferta del período, inscribir asignaturas (con las 7 reglas) y ver tu horario.
              </Text>
              <Group gap="sm">
                <Button component={Link} to="/inscripcion" leftSection={<IconClipboardList size={18} stroke={1.5} />}>
                  Ir a Inscripción
                </Button>
                <Button component={Link} to="/oferta" variant="light" leftSection={<IconListDetails size={18} stroke={1.5} />}>
                  Ver oferta
                </Button>
              </Group>
            </>
          ) : esCoordinador ? (
            <>
              <Text>
                Administra los períodos académicos (fechas del semestre y ventana de inscripción) y revisa la oferta.
              </Text>
              <Group gap="sm">
                <Button component={Link} to="/periodos" leftSection={<IconCalendarEvent size={18} stroke={1.5} />}>
                  Ir a Períodos
                </Button>
                <Button component={Link} to="/matricula" variant="light" leftSection={<IconClipboardList size={18} stroke={1.5} />}>
                  Ir a Matrícula
                </Button>
              </Group>
            </>
          ) : (
            <Text c="dimmed" fz="sm">
              Usa el menú de la izquierda para navegar según tu perfil.
            </Text>
          )}
        </Stack>
      </Card>
    </>
  );
}
