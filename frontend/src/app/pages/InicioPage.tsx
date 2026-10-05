import { Button, Card, Stack, Text } from '@mantine/core';
import { IconClipboardList } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import { useAuth } from '@/features/auth/AuthContext';
import { ROL_LABEL } from '../navigation';

export function InicioPage() {
  const { usuario } = useAuth();
  const esCoordinador = usuario.rol === 'coordinador';

  return (
    <>
      <PageHeader title="Inicio" description={`Hola, ${usuario.nombre}. Estás usando el SGA como ${ROL_LABEL[usuario.rol]}.`} />
      <Card>
        <Stack gap="sm" align="flex-start">
          <Text>
            Este prototipo es solo frontend y usa datos de ejemplo. Por ahora está disponible la pantalla de
            matrícula del Coordinador académico.
          </Text>
          {esCoordinador ? (
            <Button component={Link} to="/matricula" variant="light" leftSection={<IconClipboardList size={18} stroke={1.5} />}>
              Ir a Matrícula
            </Button>
          ) : (
            <Text c="dimmed" fz="sm">
              Tu perfil no tiene pantallas disponibles todavía.
            </Text>
          )}
        </Stack>
      </Card>
    </>
  );
}
