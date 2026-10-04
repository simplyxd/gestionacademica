import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/notifications/styles.css';
import './tokens.css';

import 'dayjs/locale/es';
import dayjs from 'dayjs';

import { MantineProvider } from '@mantine/core';
import { DatesProvider } from '@mantine/dates';
import { Notifications } from '@mantine/notifications';
import type { PropsWithChildren } from 'react';
import { cssVariablesResolver } from './cssVariablesResolver';
import { theme } from './theme';

dayjs.locale('es');

export function ThemeProvider({ children }: PropsWithChildren) {
  return (
    <MantineProvider
      theme={theme}
      cssVariablesResolver={cssVariablesResolver}
      defaultColorScheme="auto"
    >
      <DatesProvider settings={{ locale: 'es', firstDayOfWeek: 1, weekendDays: [0, 6] }}>
        <Notifications position="top-right" limit={3} autoClose={5000} zIndex={1000} />
        {children}
      </DatesProvider>
    </MantineProvider>
  );
}
