import { rem, type CSSVariablesResolver } from '@mantine/core';

export const cssVariablesResolver: CSSVariablesResolver = (theme) => ({
  variables: {
    /* Layout */
    '--sga-header-height': rem(theme.other.layout.headerHeight),
    '--sga-navbar-width': rem(theme.other.layout.navbarWidth),
    '--sga-navbar-width-collapsed': rem(theme.other.layout.navbarWidthCollapsed),
    '--sga-content-max-width': rem(theme.other.layout.contentMaxWidth),
    '--sga-table-row-height': rem(theme.other.layout.tableRowHeight),
    '--sga-control-height': rem(42),
    '--sga-space-2xl': rem(48),

    /* Horario */
    '--sga-schedule-hour-height': rem(theme.other.schedule.hourHeight),
    '--sga-schedule-start': String(theme.other.schedule.startHour),
    '--sga-schedule-end': String(theme.other.schedule.endHour),

    /* Glass (comunes) */
    '--sga-glass-blur': theme.other.glass.blur,
  },

  light: {
    /* Texto atenuado AA: slate-6 sobre blanco ≈ 7.6:1 (el gris por defecto de Mantine da ≈ 3.9:1). */
    '--mantine-color-dimmed': theme.colors.slate[6],

    '--sga-page-bg': theme.colors.slate[0],
    '--sga-aurora-1': 'rgba(46, 74, 149, 0.08)',
    '--sga-aurora-2': 'rgba(67, 81, 184, 0.07)',
    '--sga-aurora-3': 'rgba(230, 164, 32, 0.06)',

    '--sga-glass-bg': theme.other.glass.bgLight,
    '--sga-glass-bg-strong': theme.other.glass.bgStrongLight,
    '--sga-glass-bg-fallback': theme.other.glass.bgFallbackLight,
    '--sga-glass-border': theme.other.glass.borderLight,
    '--sga-glass-highlight': theme.other.glass.highlightLight,
    '--sga-glass-saturate': theme.other.glass.saturateLight,
    '--sga-glass-shadow': theme.other.glass.shadowLight,

    /* Texto de alto contraste para colores cálidos */
    '--sga-amber-text': theme.colors.amber[8],
    '--sga-orange-text': theme.colors.orange[8],

    /* Superficies del horario */
    '--sga-schedule-grid-line': theme.colors.slate[2],
    '--sga-schedule-now-line': theme.colors.crimson[5],
  },

  dark: {
    /* slate-4 sobre slate-8/9 ≈ 5.5–7:1 */
    '--mantine-color-dimmed': theme.colors.slate[4],

    '--sga-page-bg': theme.colors.slate[9],
    '--sga-aurora-1': 'rgba(100, 128, 196, 0.16)',
    '--sga-aurora-2': 'rgba(117, 131, 218, 0.14)',
    '--sga-aurora-3': 'rgba(247, 185, 58, 0.07)',

    '--sga-glass-bg': theme.other.glass.bgDark,
    '--sga-glass-bg-strong': theme.other.glass.bgStrongDark,
    '--sga-glass-bg-fallback': theme.other.glass.bgFallbackDark,
    '--sga-glass-border': theme.other.glass.borderDark,
    '--sga-glass-highlight': theme.other.glass.highlightDark,
    '--sga-glass-saturate': theme.other.glass.saturateDark,
    '--sga-glass-shadow': theme.other.glass.shadowDark,

    '--sga-amber-text': theme.colors.amber[3],
    '--sga-orange-text': theme.colors.orange[3],

    '--sga-schedule-grid-line': theme.colors.slate[7],
    '--sga-schedule-now-line': theme.colors.crimson[4],
  },
});
