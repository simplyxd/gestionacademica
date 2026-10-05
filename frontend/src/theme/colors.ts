import type { MantineColorsTuple } from '@mantine/core';

/** Azul Marino Institucional — color primario de marca. */
export const navy: MantineColorsTuple = [
  '#EEF2FB', '#D7E0F4', '#B3C2E6', '#8AA0D6', '#6480C4',
  '#4462AF', '#2E4A95', '#1F3777', '#14285A', '#0B1B3F',
];

/** Índigo Académico — marca secundaria, elementos académicos. */
export const indigo: MantineColorsTuple = [
  '#EEF0FC', '#DCE0F8', '#BCC3F0', '#98A3E6', '#7583DA',
  '#5766CC', '#4351B8', '#35409A', '#293178', '#1E2456',
];

/** Ámbar cálido / Dorado académico — acento, prestigio, atención positiva. */
export const amber: MantineColorsTuple = [
  '#FFF8E6', '#FFEDC2', '#FFDE94', '#FFCC61', '#F7B93A',
  '#E6A420', '#C98A12', '#A36E0C', '#7C5308', '#563A05',
];

/** Pizarra fría — neutros: fondos, bordes, texto. */
export const slate: MantineColorsTuple = [
  '#F8FAFC', '#F1F5F9', '#E2E8F0', '#CBD5E1', '#94A3B8',
  '#64748B', '#475569', '#334155', '#1E293B', '#0F172A',
];

/** Éxito / aprobado / cupo disponible. */
export const teal: MantineColorsTuple = [
  '#ECFDF7', '#CDF7EA', '#9EEFD7', '#66E0BF', '#34C9A4',
  '#12AC89', '#0B7F66', '#0A6753', '#0B5243', '#083A30',
];

/** Error / choque de horario / bloqueo. */
export const crimson: MantineColorsTuple = [
  '#FEF1F2', '#FDDDE0', '#FBBFC5', '#F7919C', '#EF5F6F',
  '#E23A4E', '#C4283B', '#A41F31', '#861C2C', '#6E1626',
];

/** Alerta / cupos críticos. */
export const orange: MantineColorsTuple = [
  '#FFF5EB', '#FFE6CC', '#FFCF99', '#FFB05C', '#FF9129',
  '#F5760F', '#D95E07', '#B4480A', '#90390D', '#6E2D0C',
];

/** Informativo. */
export const sky: MantineColorsTuple = [
  '#EFF8FF', '#D9EEFF', '#B6E0FF', '#85CCFA', '#4DB3F2',
  '#2496E0', '#0E6FB3', '#0F5A91', '#124B76', '#10395A',
];

export const sgaColors = { navy, indigo, amber, slate, teal, crimson, orange, sky } as const;
