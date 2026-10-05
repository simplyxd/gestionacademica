import {
  ActionIcon,
  Alert,
  Anchor,
  Badge,
  Button,
  Card,
  Checkbox,
  Container,
  createTheme,
  defaultVariantColorsResolver,
  Drawer,
  Menu,
  Modal,
  MultiSelect,
  NumberInput,
  Pagination,
  Paper,
  parseThemeColor,
  PasswordInput,
  Popover,
  Progress,
  rem,
  Select,
  Switch,
  Table,
  Tabs,
  Textarea,
  TextInput,
  Tooltip,
  type VariantColorsResolver,
} from '@mantine/core';
import { DateInput, DatePickerInput, TimeInput } from '@mantine/dates';
import { sgaColors } from './colors';

/**
 * Corrige el contraste de la variante `light` para ámbar y naranja:
 * el tono 6 no alcanza AA como texto sobre fondo claro, por eso el texto
 * usa una variable resuelta por esquema (tono 8 en claro, tono 3 en oscuro).
 */
const variantColorResolver: VariantColorsResolver = (input) => {
  const resolved = defaultVariantColorsResolver(input);
  const parsed = parseThemeColor({
    color: input.color || input.theme.primaryColor,
    theme: input.theme,
  });

  if (
    input.variant === 'light' &&
    parsed.isThemeColor &&
    (parsed.color === 'amber' || parsed.color === 'orange')
  ) {
    return {
      ...resolved,
      color: `var(--sga-${parsed.color}-text)`,
    };
  }

  return resolved;
};

export const theme = createTheme({
  /* ---------- Identidad ---------- */
  primaryColor: 'navy',
  primaryShade: { light: 6, dark: 5 },
  colors: sgaColors,
  white: '#FFFFFF',
  black: '#0F172A',
  autoContrast: true,
  luminanceThreshold: 0.35,
  variantColorResolver,
  defaultGradient: { from: 'navy.6', to: 'indigo.5', deg: 135 },

  /* ---------- Tipografía ---------- */
  fontFamily:
    "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  fontFamilyMonospace:
    "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
  fontSmoothing: true,
  fontSizes: {
    xs: rem(12),
    sm: rem(14),
    md: rem(16),
    lg: rem(18),
    xl: rem(20),
  },
  lineHeights: {
    xs: '1.4',
    sm: '1.45',
    md: '1.55',
    lg: '1.6',
    xl: '1.65',
  },
  headings: {
    fontFamily:
      "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    fontWeight: '600',
    textWrap: 'balance',
    sizes: {
      h1: { fontSize: rem(30), lineHeight: '1.25', fontWeight: '700' },
      h2: { fontSize: rem(24), lineHeight: '1.3', fontWeight: '700' },
      h3: { fontSize: rem(20), lineHeight: '1.35', fontWeight: '600' },
      h4: { fontSize: rem(18), lineHeight: '1.4', fontWeight: '600' },
      h5: { fontSize: rem(16), lineHeight: '1.45', fontWeight: '600' },
      h6: { fontSize: rem(14), lineHeight: '1.5', fontWeight: '600' },
    },
  },

  /* ---------- Forma ---------- */
  defaultRadius: 'md',
  radius: {
    xs: rem(4),
    sm: rem(6),
    md: rem(10),
    lg: rem(14),
    xl: rem(20),
  },
  spacing: {
    xs: rem(8),
    sm: rem(12),
    md: rem(16),
    lg: rem(24),
    xl: rem(32),
  },
  shadows: {
    xs: '0 1px 2px rgba(15, 23, 42, 0.04)',
    sm: '0 2px 8px rgba(15, 23, 42, 0.06)',
    md: '0 8px 24px rgba(15, 23, 42, 0.08)',
    lg: '0 16px 40px rgba(15, 23, 42, 0.10)',
    xl: '0 24px 56px rgba(15, 23, 42, 0.14)',
  },
  breakpoints: {
    xs: '36em', // 576px
    sm: '48em', // 768px
    md: '62em', // 992px
    lg: '75em', // 1200px
    xl: '88em', // 1408px
  },
  cursorType: 'pointer',
  focusRing: 'auto',
  respectReducedMotion: true,

  /* ---------- Tokens propios ---------- */
  other: {
    glass: {
      blur: '12px',
      saturateLight: '180%',
      saturateDark: '160%',
      bgLight: 'rgba(255, 255, 255, 0.75)',
      bgDark: 'rgba(15, 23, 42, 0.80)',
      bgStrongLight: 'rgba(255, 255, 255, 0.88)',
      bgStrongDark: 'rgba(15, 23, 42, 0.92)',
      bgFallbackLight: 'rgba(255, 255, 255, 0.97)',
      bgFallbackDark: 'rgba(15, 23, 42, 0.97)',
      borderLight: 'rgba(0, 0, 0, 0.08)',
      borderDark: 'rgba(255, 255, 255, 0.14)',
      highlightLight: 'rgba(255, 255, 255, 0.30)',
      highlightDark: 'rgba(255, 255, 255, 0.06)',
      shadowLight: '0 8px 32px 0 rgba(0, 0, 0, 0.07)',
      shadowDark: '0 8px 32px 0 rgba(0, 0, 0, 0.35)',
    },
    layout: {
      headerHeight: 64,
      navbarWidth: 264,
      navbarWidthCollapsed: 76,
      contentMaxWidth: 1440,
      tableRowHeight: 52,
      drawerWidthMd: 480,
      drawerWidthLg: 640,
    },
    schedule: {
      hourHeight: 56,
      startHour: 8,
      endHour: 22,
    },
  },

  /* ---------- defaultProps por componente ---------- */
  components: {
    /* Acciones */
    Button: Button.extend({
      defaultProps: { size: 'md', radius: 'md', fw: 600 },
      styles: { root: { transition: 'background-color 120ms ease, transform 120ms ease' } },
    }),
    ActionIcon: ActionIcon.extend({
      defaultProps: { variant: 'subtle', color: 'slate', size: 'lg', radius: 'md' },
    }),
    Anchor: Anchor.extend({
      defaultProps: { underline: 'hover', fw: 500 },
    }),

    /* Contenedores */
    Container: Container.extend({
      defaultProps: { size: 'xl' },
    }),
    Paper: Paper.extend({
      defaultProps: { radius: 'md', p: 'lg', withBorder: true, shadow: 'sm' },
    }),
    Card: Card.extend({
      defaultProps: { radius: 'md', padding: 'lg', withBorder: true, shadow: 'sm' },
    }),

    /* Datos */
    Table: Table.extend({
      defaultProps: {
        verticalSpacing: 'sm',
        horizontalSpacing: 'md',
        highlightOnHover: true,
        withRowBorders: true,
        withTableBorder: false,
        striped: false,
        layout: 'auto',
      },
    }),
    Badge: Badge.extend({
      defaultProps: { variant: 'light', radius: 'sm', size: 'md', tt: 'none', fw: 600 },
    }),
    Progress: Progress.extend({
      defaultProps: { radius: 'xl', size: 'sm', transitionDuration: 200 },
    }),
    Pagination: Pagination.extend({
      defaultProps: { radius: 'md', size: 'md', withEdges: false, siblings: 1 },
    }),
    Tabs: Tabs.extend({
      defaultProps: { variant: 'default', radius: 'md', keepMounted: false },
    }),

    /* Overlays */
    Modal: Modal.extend({
      defaultProps: {
        centered: true,
        radius: 'md',
        padding: 'lg',
        size: 'md',
        overlayProps: { backgroundOpacity: 0.45, blur: 4 },
        transitionProps: { transition: 'pop', duration: 180 },
        closeButtonProps: { 'aria-label': 'Cerrar' },
      },
    }),
    Drawer: Drawer.extend({
      defaultProps: {
        position: 'right',
        size: 480,
        offset: 8,
        radius: 'md',
        padding: 'lg',
        overlayProps: { backgroundOpacity: 0.35, blur: 3 },
        transitionProps: { transition: 'slide-left', duration: 220 },
        closeButtonProps: { 'aria-label': 'Cerrar panel' },
      },
    }),
    Popover: Popover.extend({
      defaultProps: { radius: 'md', shadow: 'md', withArrow: true },
    }),
    Menu: Menu.extend({
      defaultProps: { radius: 'md', shadow: 'md', position: 'bottom-end', withinPortal: true },
    }),
    Tooltip: Tooltip.extend({
      defaultProps: { radius: 'sm', withArrow: true, openDelay: 300, multiline: true, maw: 280 },
    }),

    /* Feedback */
    Alert: Alert.extend({
      defaultProps: { variant: 'light', radius: 'md' },
    }),

    /* Formularios */
    TextInput: TextInput.extend({ defaultProps: { size: 'md', radius: 'md' } }),
    PasswordInput: PasswordInput.extend({ defaultProps: { size: 'md', radius: 'md' } }),
    NumberInput: NumberInput.extend({ defaultProps: { size: 'md', radius: 'md' } }),
    Textarea: Textarea.extend({
      defaultProps: { size: 'md', radius: 'md', autosize: true, minRows: 3, maxRows: 8 },
    }),
    Select: Select.extend({
      defaultProps: {
        size: 'md',
        radius: 'md',
        searchable: true,
        nothingFoundMessage: 'Sin resultados',
        checkIconPosition: 'right',
        comboboxProps: { shadow: 'md', radius: 'md' },
      },
    }),
    MultiSelect: MultiSelect.extend({
      defaultProps: {
        size: 'md',
        radius: 'md',
        searchable: true,
        nothingFoundMessage: 'Sin resultados',
        comboboxProps: { shadow: 'md', radius: 'md' },
      },
    }),
    Checkbox: Checkbox.extend({ defaultProps: { radius: 'xs', size: 'md' } }),
    Switch: Switch.extend({ defaultProps: { size: 'md' } }),
    DateInput: DateInput.extend({
      defaultProps: { size: 'md', radius: 'md', valueFormat: 'DD/MM/YYYY', locale: 'es' },
    }),
    DatePickerInput: DatePickerInput.extend({
      defaultProps: { size: 'md', radius: 'md', valueFormat: 'DD/MM/YYYY', locale: 'es' },
    }),
    TimeInput: TimeInput.extend({ defaultProps: { size: 'md', radius: 'md' } }),
  },
});
