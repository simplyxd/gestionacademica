import { Button, Card } from '@mantine/core';
import { IconHammer } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { EmptyState } from '@/components/ui/EmptyState';

/** Destino de las rutas del menú que aún no tienen pantalla en el prototipo. */
export function ComingSoonPage() {
  return (
    <Card>
      <EmptyState
        icon={IconHammer}
        title="Esta sección aún no está disponible"
        description="Todavía no se construye esta pantalla del prototipo."
        action={
          <Button component={Link} to="/" variant="light">
            Volver al inicio
          </Button>
        }
      />
    </Card>
  );
}
