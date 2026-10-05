import { Button, Card, Group, SimpleGrid, Stack, Text, Title } from '@mantine/core';
import { IconChartBar, IconSettings } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import glass from '@/theme/glass.module.css';

export function AdminHomePage() {
  const navigate = useNavigate();

  return (
    <>
      <PageHeader
        title="Panel administrador"
        description="Usuarios, parámetros institucionales y consultas de solo lectura (RF1 / RF12)."
      />

      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
        <Card className={glass.glass} padding="lg" radius="md">
          <Stack gap="md">
            <Group gap="sm">
              <IconSettings size={24} stroke={1.5} color="var(--mantine-color-navy-6)" />
              <Title order={3}>Parámetros institucionales</Title>
            </Group>
            <Text c="dimmed" size="sm">
              Identidad del portal, contacto y preferencias de sesión. Los cambios se guardan en el
              navegador para que otras pantallas mock las lean en cliente.
            </Text>
            <Button color="navy" onClick={() => navigate('/admin/parametros')}>
              Abrir parámetros
            </Button>
          </Stack>
        </Card>

        <Card className={glass.glass} padding="lg" radius="md">
          <Stack gap="md">
            <Group gap="sm">
              <IconChartBar size={24} stroke={1.5} color="var(--mantine-color-indigo-6)" />
              <Title order={3}>Reportes (RF12)</Title>
            </Group>
            <Text c="dimmed" size="sm">
              Consultas de matrícula, ocupación de secciones, cupos y carga docente con datos mock.
              Solo lectura, con filtros por período y carrera.
            </Text>
            <Button variant="light" color="indigo" onClick={() => navigate('/reportes')}>
              Ver reportes
            </Button>
          </Stack>
        </Card>
      </SimpleGrid>
    </>
  );
}
