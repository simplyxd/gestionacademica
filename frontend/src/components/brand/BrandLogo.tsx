import { Group, Text } from '@mantine/core';
import classes from './BrandLogo.module.css';

interface BrandLogoProps {
  /** Mostrar el nombre institucional junto al monograma. */
  showWordmark?: boolean;
  /** Tamaño del monograma en px. */
  size?: number;
}

/**
 * Monograma SGA — azul marino + acento ámbar institucional.
 * Reutilizable en header, footer y favicon embebido via props.
 */
export function BrandLogo({ showWordmark = true, size = 32 }: BrandLogoProps) {
  return (
    <Group gap="sm" wrap="nowrap" align="center">
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        role="img"
        aria-label="Logo SGA"
      >
        <rect width="32" height="32" rx="8" className={classes.mark} />
        <path
          d="M22.2 12.1c-.4-1.6-1.7-2.6-3.7-2.6-2.2 0-3.7 1.2-3.7 3 0 1.5.8 2.3 3.1 2.9l1.5.4c2.9.7 4.4 2.1 4.4 4.5 0 3-2.5 5-6.1 5-3.4 0-5.8-1.6-6.4-4.3l2.5-.6c.4 1.7 1.8 2.7 3.9 2.7 2.3 0 3.7-1.2 3.7-3 0-1.5-.9-2.4-3.3-3l-1.5-.4c-2.7-.7-4.2-2.1-4.2-4.4 0-2.9 2.4-4.8 5.9-4.8 3.1 0 5.4 1.5 6 4.1l-2.1.5Z"
          className={classes.glyph}
        />
        <circle cx="24.5" cy="8.5" r="2.6" className={classes.dot} />
      </svg>
      {showWordmark && (
        <Text fw={700} fz="lg" className={classes.wordmark} component="span" lh={1.1}>
          SGA
        </Text>
      )}
    </Group>
  );
}
