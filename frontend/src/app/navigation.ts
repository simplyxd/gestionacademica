import {
  IconCalendarTime,
  IconClipboardList,
  IconListDetails,
  type Icon,
} from '@tabler/icons-react';

export interface NavItem {
  label: string;
  to: string;
  icon: Icon;
}

/** Rutas de la tarjeta #98: oferta, inscripción y horario. */
export const NAV_ESTUDIANTE: NavItem[] = [
  { label: 'Oferta académica', to: '/oferta', icon: IconListDetails },
  { label: 'Inscripción', to: '/inscripcion', icon: IconClipboardList },
  { label: 'Mi horario', to: '/horario', icon: IconCalendarTime },
];
