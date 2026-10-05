import {
  ActionIcon, Alert, Badge, Button, Drawer, Modal, MultiSelect, Paper, Select, Table, TextInput,
  createTheme, defaultVariantColorsResolver, parseThemeColor, rem,
  type CSSVariablesResolver,
} from '@mantine/core';

// Tokens de system-desing.md, §§2–3.
export const theme = createTheme({
  primaryColor: 'navy',
  primaryShade: { light: 6, dark: 5 },
  colors: {
    navy: ['#EEF2FB', '#D7E0F4', '#B3C2E6', '#8AA0D6', '#6480C4', '#4462AF', '#2E4A95', '#1F3777', '#14285A', '#0B1B3F'],
    indigo: ['#EEF0FC', '#DCE0F8', '#BCC3F0', '#98A3E6', '#7583DA', '#5766CC', '#4351B8', '#35409A', '#293178', '#1E2456'],
    amber: ['#FFF8E6', '#FFEDC2', '#FFDE94', '#FFCC61', '#F7B93A', '#E6A420', '#C98A12', '#A36E0C', '#7C5308', '#563A05'],
    slate: ['#F8FAFC', '#F1F5F9', '#E2E8F0', '#CBD5E1', '#94A3B8', '#64748B', '#475569', '#334155', '#1E293B', '#0F172A'],
    teal: ['#ECFDF7', '#CDF7EA', '#9EEFD7', '#66E0BF', '#34C9A4', '#12AC89', '#0B7F66', '#0A6753', '#0B5243', '#083A30'],
    crimson: ['#FEF1F2', '#FDDDE0', '#FBBFC5', '#F7919C', '#EF5F6F', '#E23A4E', '#C4283B', '#A41F31', '#861C2C', '#6E1626'],
    orange: ['#FFF5EB', '#FFE6CC', '#FFCF99', '#FFB05C', '#FF9129', '#F5760F', '#D95E07', '#B4480A', '#90390D', '#6E2D0C'],
    sky: ['#EFF8FF', '#D9EEFF', '#B6E0FF', '#85CCFA', '#4DB3F2', '#2496E0', '#0E6FB3', '#0F5A91', '#124B76', '#10395A'],
  },
  white: '#FFFFFF', black: '#0F172A', autoContrast: true, luminanceThreshold: 0.35,
  variantColorResolver: input => {
    const resolved = defaultVariantColorsResolver(input);
    const parsed = parseThemeColor({ color: input.color || input.theme.primaryColor, theme: input.theme });
    if (input.variant === 'light' && parsed.isThemeColor && (parsed.color === 'amber' || parsed.color === 'orange')) {
      return { ...resolved, color: `var(--sga-${parsed.color}-text)` };
    }
    return resolved;
  },
  fontFamily: "'Inter Variable', Inter, system-ui, sans-serif",
  fontFamilyMonospace: "'JetBrains Mono Variable', 'JetBrains Mono', ui-monospace, monospace",
  fontSizes: { xs: rem(12), sm: rem(14), md: rem(16), lg: rem(18), xl: rem(20) },
  lineHeights: { xs: '1.4', sm: '1.45', md: '1.55', lg: '1.6', xl: '1.65' },
  headings: { fontWeight: '600', sizes: {
    h1: { fontSize: rem(30), lineHeight: '1.25', fontWeight: '700' },
    h2: { fontSize: rem(24), lineHeight: '1.3', fontWeight: '700' },
    h3: { fontSize: rem(20), lineHeight: '1.35', fontWeight: '600' },
  } },
  defaultRadius: 'md', radius: { xs: rem(4), sm: rem(6), md: rem(10), lg: rem(14), xl: rem(20) },
  spacing: { xs: rem(8), sm: rem(12), md: rem(16), lg: rem(24), xl: rem(32) },
  breakpoints: { xs: '36em', sm: '48em', md: '62em', lg: '75em', xl: '88em' },
  cursorType: 'pointer', focusRing: 'auto', respectReducedMotion: true,
  // simplified: solo defaults de los controles usados; ampliar al incorporar otras pantallas.
  components: {
    Button: Button.extend({ defaultProps: { size: 'md', radius: 'md', fw: 600 }, styles: { root: { minHeight: rem(44) } } }),
    ActionIcon: ActionIcon.extend({ defaultProps: { size: 44, variant: 'subtle', color: 'slate', radius: 'md' } }),
    Paper: Paper.extend({ defaultProps: { withBorder: true, radius: 'md', p: 'lg' } }),
    Table: Table.extend({ defaultProps: { verticalSpacing: 'sm', horizontalSpacing: 'md', highlightOnHover: true } }),
    Badge: Badge.extend({ defaultProps: { variant: 'light', radius: 'sm', tt: 'none', fw: 600 } }),
    Alert: Alert.extend({ defaultProps: { variant: 'light', radius: 'md' } }),
    TextInput: TextInput.extend({ defaultProps: { size: 'md', radius: 'md' } }),
    Select: Select.extend({ defaultProps: { size: 'md', radius: 'md', searchable: true, nothingFoundMessage: 'Sin resultados' } }),
    MultiSelect: MultiSelect.extend({ defaultProps: { size: 'md', radius: 'md', searchable: true, nothingFoundMessage: 'Sin resultados' } }),
    Drawer: Drawer.extend({ defaultProps: { position: 'right', size: 640, offset: 8, radius: 'md', padding: 'lg', overlayProps: { backgroundOpacity: 0.35, blur: 3 }, closeButtonProps: { 'aria-label': 'Cerrar formulario' } } }),
    Modal: Modal.extend({ defaultProps: { centered: true, size: 'sm', radius: 'md', padding: 'lg', overlayProps: { backgroundOpacity: 0.45, blur: 4 }, closeButtonProps: { 'aria-label': 'Cerrar confirmación' } } }),
  },
});

export const cssVariablesResolver: CSSVariablesResolver = theme => ({
  variables: {
    '--sga-header-height': rem(64), '--sga-navbar-width': rem(264), '--sga-content-max-width': rem(1440),
    '--sga-table-row-height': rem(52), '--sga-glass-blur': '12px',
  },
  light: {
    '--sga-page-bg': theme.colors.slate[0], '--sga-muted-row': theme.colors.slate[1],
    '--sga-aurora-1': 'rgba(46, 74, 149, 0.08)', '--sga-aurora-2': 'rgba(67, 81, 184, 0.07)',
    '--sga-glass-bg': 'rgba(255, 255, 255, 0.75)', '--sga-glass-bg-strong': 'rgba(255, 255, 255, 0.88)',
    '--sga-glass-bg-fallback': 'rgba(255, 255, 255, 0.97)', '--sga-glass-border': 'rgba(0, 0, 0, 0.08)',
    '--sga-glass-saturate': '180%', '--sga-glass-highlight': 'rgba(255, 255, 255, 0.30)', '--sga-glass-shadow': '0 8px 32px rgba(0, 0, 0, 0.07)',
    '--sga-amber-text': theme.colors.amber[8], '--sga-orange-text': theme.colors.orange[8],
  },
  dark: {
    '--sga-page-bg': theme.colors.slate[9], '--sga-muted-row': theme.colors.slate[8],
    '--sga-aurora-1': 'rgba(100, 128, 196, 0.16)', '--sga-aurora-2': 'rgba(117, 131, 218, 0.14)',
    '--sga-glass-bg': 'rgba(15, 23, 42, 0.80)', '--sga-glass-bg-strong': 'rgba(15, 23, 42, 0.92)',
    '--sga-glass-bg-fallback': 'rgba(15, 23, 42, 0.97)', '--sga-glass-border': 'rgba(255, 255, 255, 0.14)',
    '--sga-glass-saturate': '160%', '--sga-glass-highlight': 'rgba(255, 255, 255, 0.06)', '--sga-glass-shadow': '0 8px 32px rgba(0, 0, 0, 0.35)',
    '--sga-amber-text': theme.colors.amber[3], '--sga-orange-text': theme.colors.orange[3],
  },
});
