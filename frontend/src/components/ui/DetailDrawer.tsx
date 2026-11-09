import { Box, Drawer, Group, ScrollArea, Stack, Text, Title, type DrawerProps } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import clsx from 'clsx';
import type { ReactNode } from 'react';
import glass from '@/theme/glass.module.css';
import classes from './DetailDrawer.module.css';

interface DetailDrawerProps extends Omit<DrawerProps, 'title'> {
  title: string;
  subtitle?: string;
  footer?: ReactNode;
}

export function DetailDrawer({ title, subtitle, footer, children, size, ...rest }: DetailDrawerProps) {
  const esMovil = useMediaQuery('(max-width: 48em)');

  return (
    <Drawer
      {...rest}
      size={esMovil ? '100%' : size}
      classNames={{ content: clsx(glass.glassStrong, classes.content), body: classes.body }}
      title={
        <Stack gap={2}>
          <Title order={3}>{title}</Title>
          {subtitle && <Text fz="sm" c="dimmed">{subtitle}</Text>}
        </Stack>
      }
    >
      <ScrollArea.Autosize className={classes.scroll} type="auto">
        <Stack gap="lg">{children}</Stack>
      </ScrollArea.Autosize>

      {footer && (
        <Box className={classes.footer}>
          <Group justify="flex-end" gap="sm" className={classes.footerActions}>
            {footer}
          </Group>
        </Box>
      )}
    </Drawer>
  );
}
