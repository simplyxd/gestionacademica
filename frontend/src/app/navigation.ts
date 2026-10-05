import {
  IconCalendarTime,
  IconChartBar,
  IconClipboardList,
  IconHome,
  IconListDetails,
  IconSettings,
  type Icon,
} from '@tabler/icons-react';

export type Rol = 'admin' | 'estudiante';

export interface NavItem {
  label: string;
  to: string;
  icon: Icon;
  /** Etiqueta de grupo en la barra lateral (solo admin). */
  group?: string;
}

/** Rutas estudiante (RF9–RF10). */
export const NAV_ESTUDIANTE: NavItem[] = [
  { label: 'Oferta académica', to: '/oferta', icon: IconListDetails },
  { label: 'Inscripción', to: '/inscripcion', icon: IconClipboardList },
  { label: 'Mi horario', to: '/horario', icon: IconCalendarTime },
];

/** Rutas administrador (issue #93 — parámetros y consultas RF12). */
export const NAV_ADMIN: NavItem[] = [
  { label: 'Inicio', to: '/admin', icon: IconHome },
  {
    label: 'Parámetros',
    to: '/admin/parametros',
    icon: IconSettings,
    group: 'Administración',
  },
  {
    label: 'Reportes',
    to: '/reportes',
    icon: IconChartBar,
    group: 'Consultas',
  },
];
