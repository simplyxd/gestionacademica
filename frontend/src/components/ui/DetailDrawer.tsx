import { Drawer, Group, Stack, Text, Title, type DrawerProps } from '@mantine/core';
import clsx from 'clsx';
import type { ReactNode } from 'react';
import glass from '@/theme/glass.module.css';
import classes from './DetailDrawer.module.css';

interface DetailDrawerProps extends Omit<DrawerProps, 'title'> {
  title: string;
  subtitle?: string;
  footer?: ReactNode;
}

export function DetailDrawer({ title, subtitle, footer, children, ...rest }: DetailDrawerProps) {
  return (
    <Drawer
      {...rest}
      classNames={{ content: clsx(glass.glassStrong, classes.content), body: classes.body }}
      title={
        <Stack gap={2}>
          <Title order={3}>{title}</Title>
          {subtitle && (
            <Text fz="sm" c="dimmed">
              {subtitle}
            </Text>
          )}
        </Stack>
      }
    >
      <Stack gap="lg" className={classes.main}>
        {children}
      </Stack>
      {footer && (
        <div className={classes.footer}>
          <Group justify="flex-end" gap="sm">
            {footer}
          </Group>
        </div>
      )}
    </Drawer>
  );
}
