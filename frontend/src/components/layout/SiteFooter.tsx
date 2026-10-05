import { Group, Stack, Text, UnstyledButton } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { useParametros } from '@/app/parametros/ParametrosContext';
import { BrandLogo } from '@/components/brand/BrandLogo';
import glass from '@/theme/glass.module.css';
import classes from './SiteFooter.module.css';

interface FooterLink {
  label: string;
  href: string;
}

interface SiteFooterProps {
  links?: FooterLink[];
  year?: number;
}

const DEFAULT_LINKS: FooterLink[] = [
  { label: 'Oferta académica', href: '/oferta' },
  { label: 'Inscripción', href: '/inscripcion' },
  { label: 'Mi horario', href: '/horario' },
];

const CURRENT_YEAR = 2026;

/**
 * Pie de página compartido: marca, enlaces de navegación y créditos.
 * Recibe `links` por props para reutilizarlo con contenidos distintos.
 */
export function SiteFooter({
  links = DEFAULT_LINKS,
  year = CURRENT_YEAR,
}: SiteFooterProps) {
  const navigate = useNavigate();
  const { parametros } = useParametros();

  return (
    <footer className={`${glass.glass} ${classes.footer}`} aria-label="Pie de página">
      <Group justify="space-between" align="flex-start" wrap="wrap" gap="lg">
        <Stack gap={6}>
          <BrandLogo size={28} wordmark={parametros.siglasPortal} />
          <Text size="sm" c="dimmed" maw={360}>
            Sistema Web de Gestión Académica — Instituto Universitario Nueva Formación.
            Prototipo frontend con datos de ejemplo.
          </Text>
        </Stack>

        <Stack gap={6}>
          <Text size="sm" fw={600}>
            Navegación
          </Text>
          <Group gap="md" wrap="wrap">
            {links.map((link) => (
              <UnstyledButton
                key={link.href}
                onClick={() => navigate(link.href)}
                className={classes.footerLink}
              >
                {link.label}
              </UnstyledButton>
            ))}
          </Group>
        </Stack>
      </Group>

      <Text size="xs" c="dimmed" mt="md" className={classes.copy}>
        © {year} Instituto Universitario Nueva Formación · Prototipo académico
      </Text>
    </footer>
  );
}
