import { Button, Card } from '@mantine/core';
import { IconLock } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { EmptyState } from '@/components/ui/EmptyState';
import { useAuth } from '@/features/auth/AuthContext';
import { ROL_LABEL } from '../navigation';

/** Página 403 (system design §6.5): EmptyState en `slate`, sin revelar la pantalla protegida. */
export function ForbiddenPage() {
  const { usuario } = useAuth();
  return (
    <Card role="alert">
      <EmptyState
        icon={IconLock}
        title="No tienes acceso a esta sección"
        description={`Tu perfil de ${ROL_LABEL[usuario.rol]} no incluye esta función.`}
        action={
          <Button component={Link} to="/" variant="light">
            Volver al inicio
          </Button>
        }
      />
    </Card>
  );
}
