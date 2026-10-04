import { Group, Text } from '@mantine/core';

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
        <rect width="32" height="32" rx="8" fill="#1F3777" />
        <path
          d="M8 22V10h5.2c2.6 0 4.2 1.4 4.2 3.5 0 1.4-.7 2.5-1.9 3.1L18.8 22h-2.6l-3-5.1H10.4V22H8Zm2.4-7.3h2.6c1.3 0 2-.6 2-1.6s-.7-1.5-2-1.5h-2.6v3.1Z"
          fill="#F8FAFC"
        />
        <circle cx="24" cy="9" r="3" fill="#E6A420" />
      </svg>
      {showWordmark && (
        <Text fw={700} fz="lg" c="navy" component="span" lh={1.1}>
          SGA
        </Text>
      )}
    </Group>
  );
}
