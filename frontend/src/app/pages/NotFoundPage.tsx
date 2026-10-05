import { Button, Card, Code } from '@mantine/core';
import { IconMapOff } from '@tabler/icons-react';
import { Link, useLocation } from 'react-router-dom';
import { EmptyState } from '@/components/ui/EmptyState';
import { useAuth } from '@/features/auth/AuthContext';
import { rutaInicio } from '@/features/auth/rutaInicio';

/** Página 404 para rutas que no existen: misma forma que la 403, con la ruta pedida a la vista. */
export function NotFoundPage() {
  const { usuario } = useAuth();
  const { pathname } = useLocation();
  return (
    <Card role="alert">
      <EmptyState
        icon={IconMapOff}
        title="No encontramos esta página"
        description={
          <>
            La dirección <Code style={{ wordBreak: 'break-all' }}>{pathname}</Code> no existe o cambió. Revisa el enlace o vuelve al inicio.
          </>
        }
        action={
          <Button component={Link} to={rutaInicio(usuario.rol)} variant="light">
            Volver al inicio
          </Button>
        }
      />
    </Card>
  );
}
