import { Stack, Text, ThemeIcon } from '@mantine/core';
import { IconInbox, type Icon } from '@tabler/icons-react';
import type { ReactNode } from 'react';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: Icon;
  action?: ReactNode;
}

export function EmptyState({ title, description, icon: IconCmp = IconInbox, action }: EmptyStateProps) {
  return (
    <Stack align="center" gap="sm" py="xl" ta="center">
      <ThemeIcon variant="light" color="slate" size={56} radius="xl">
        <IconCmp size={28} stroke={1.5} />
      </ThemeIcon>
      <Text fw={600}>{title}</Text>
      {description && (
        <Text c="dimmed" fz="sm" maw={360}>
          {description}
        </Text>
      )}
      {action}
    </Stack>
  );
}
