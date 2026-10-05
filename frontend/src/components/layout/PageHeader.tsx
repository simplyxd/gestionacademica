import { Group, Stack, Text, Title } from '@mantine/core';
import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <Group justify="space-between" align="flex-end" wrap="wrap" gap="md" mb="lg">
      <Stack gap={4}>
        <Title order={1}>{title}</Title>
        {description && <Text c="dimmed">{description}</Text>}
      </Stack>
      {actions}
    </Group>
  );
}
