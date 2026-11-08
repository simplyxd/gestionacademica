import { notifications } from '@mantine/notifications';
import { IconAlertTriangle, IconCheck, IconInfoCircle, IconX } from '@tabler/icons-react';
import type { ReactNode } from 'react';

interface NotifyOptions {
  title?: string;
  message: ReactNode;
  /** ms; false = requiere cierre manual */
  autoClose?: number | false;
  id?: string;
}

const base = { radius: 'md', withBorder: true } as const;

export const notify = {
  success: ({ title = 'Listo', message, autoClose = 4500, id }: NotifyOptions) =>
    notifications.show({ ...base, id, title, message, autoClose, color: 'teal', icon: <IconCheck size={18} stroke={2} /> }),

  error: ({ title = 'No se pudo completar', message, autoClose = 7000, id }: NotifyOptions) =>
    notifications.show({ ...base, id, title, message, autoClose, color: 'crimson', icon: <IconX size={18} stroke={2} /> }),

  warning: ({ title = 'Atención', message, autoClose = 6000, id }: NotifyOptions) =>
    notifications.show({ ...base, id, title, message, autoClose, color: 'orange', icon: <IconAlertTriangle size={18} stroke={2} /> }),

  info: ({ title, message, autoClose = 5000, id }: NotifyOptions) =>
    notifications.show({ ...base, id, title, message, autoClose, color: 'sky', icon: <IconInfoCircle size={18} stroke={2} /> }),

  /** Para operaciones largas: muestra loading y luego actualiza con el mismo id. */
  loading: (id: string, message: ReactNode) =>
    notifications.show({ ...base, id, message, loading: true, autoClose: false, withCloseButton: false }),

  update: (id: string, opts: NotifyOptions & { color: 'teal' | 'crimson' | 'orange' | 'sky' }) =>
    notifications.update({ ...base, id, ...opts, loading: false, withCloseButton: true, autoClose: opts.autoClose ?? 4500 }),
};
