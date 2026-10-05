import { Anchor, Breadcrumbs, Group, Stack, Text, Title } from '@mantine/core';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: { label: string; to?: string }[];
  /** Acción primaria (un solo Button filled) y secundarias (light/subtle). */
  actions?: ReactNode;
}

export function PageHeader({ title, description, breadcrumbs, actions }: PageHeaderProps) {
  return (
    <Stack gap="xs" mb="lg">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumbs separatorMargin="xs" fz="sm">
          {breadcrumbs.map((b) =>
            b.to ? (
              <Anchor key={b.label} component={Link} to={b.to} c="dimmed" fz="sm">
                {b.label}
              </Anchor>
            ) : (
              <Text key={b.label} c="dimmed" fz="sm">
                {b.label}
              </Text>
            ),
          )}
        </Breadcrumbs>
      )}
      <Group justify="space-between" align="flex-start" wrap="wrap" gap="md">
        <Stack gap={4} style={{ flex: 1, minWidth: 240 }}>
          <Title order={1}>{title}</Title>
          {description && (
            <Text c="dimmed" fz="md" maw={720}>
              {description}
            </Text>
          )}
        </Stack>
        {actions && <Group gap="sm">{actions}</Group>}
      </Group>
    </Stack>
  );
}
