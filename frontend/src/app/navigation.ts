import {
  IconBooks,
  IconBuildingBank,
  IconCalendarEvent,
  IconCalendarTime,
  IconChartBar,
  IconClipboardList,
  IconHome,
  IconLayoutGrid,
  IconListDetails,
  IconSchool,
  IconSettings,
  IconUsers,
  IconUserSquareRounded,
  type Icon,
} from '@tabler/icons-react';

export type Rol = 'admin' | 'coordinador' | 'docente' | 'estudiante';

export const ROL_LABEL: Record<Rol, string> = {
  admin: 'Administrador',
  coordinador: 'Coordinador académico',
  docente: 'Docente',
  estudiante: 'Estudiante',
};

export interface NavItem {
  label: string;
  to: string;
  icon: Icon;
  /** Grupo visual en la Navbar (se renderiza como etiqueta h6 dimmed). */
  group?: string;
}

export const NAV_BY_ROLE: Record<Rol, NavItem[]> = {
  admin: [
    { label: 'Inicio', to: '/', icon: IconHome },
    { label: 'Usuarios', to: '/admin/usuarios', icon: IconUsers, group: 'Administración' },
    { label: 'Parámetros', to: '/admin/parametros', icon: IconSettings, group: 'Administración' },
    { label: 'Reportes', to: '/reportes', icon: IconChartBar, group: 'Consultas' },
  ],
  coordinador: [
    { label: 'Inicio', to: '/', icon: IconHome },
    { label: 'Sedes y carreras', to: '/estructura/carreras', icon: IconBuildingBank, group: 'Estructura' },
    { label: 'Planes de estudio', to: '/estructura/planes', icon: IconBooks, group: 'Estructura' },
    { label: 'Períodos', to: '/periodos', icon: IconCalendarEvent, group: 'Ciclo' },
    { label: 'Matrícula', to: '/matricula', icon: IconClipboardList, group: 'Ciclo' },
    { label: 'Oferta de secciones', to: '/oferta', icon: IconLayoutGrid, group: 'Ciclo' },
    { label: 'Docentes y estudiantes', to: '/personas', icon: IconUserSquareRounded, group: 'Personas' },
    { label: 'Reportes', to: '/reportes', icon: IconChartBar, group: 'Consultas' },
  ],
  docente: [
    { label: 'Inicio', to: '/', icon: IconHome },
    { label: 'Mis secciones', to: '/docente/secciones', icon: IconSchool },
    { label: 'Mi horario', to: '/docente/horario', icon: IconCalendarTime },
  ],
  estudiante: [
    { label: 'Inicio', to: '/', icon: IconHome },
    { label: 'Oferta académica', to: '/oferta', icon: IconListDetails },
    { label: 'Inscripción', to: '/inscripcion', icon: IconClipboardList },
    { label: 'Mi horario', to: '/horario', icon: IconCalendarTime },
  ],
};
