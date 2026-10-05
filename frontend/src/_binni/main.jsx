import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { MantineProvider, createTheme } from '@mantine/core'
import '@fontsource-variable/inter'
import './index.css'
import '@mantine/core/styles.css'
import './theme.css'
import App from './App.jsx'

const colors = {
  navy: [
    '#EEF2FB',
    '#D7E0F4',
    '#B3C2E6',
    '#8AA0D6',
    '#6480C4',
    '#4462AF',
    '#2E4A95',
    '#1F3777',
    '#14285A',
    '#0B1B3F',
  ],
  indigo: [
    '#EEF0FC',
    '#DCE0F8',
    '#BCC3F0',
    '#98A3E6',
    '#7583DA',
    '#5766CC',
    '#4351B8',
    '#35409A',
    '#293178',
    '#1E2456',
  ],
  amber: [
    '#FFF8E6',
    '#FFEDC2',
    '#FFDE94',
    '#FFCC61',
    '#F7B93A',
    '#E6A420',
    '#C98A12',
    '#A36E0C',
    '#7C5308',
    '#563A05',
  ],
  slate: [
    '#F8FAFC',
    '#F1F5F9',
    '#E2E8F0',
    '#CBD5E1',
    '#94A3B8',
    '#64748B',
    '#475569',
    '#334155',
    '#1E293B',
    '#0F172A',
  ],
  teal: [
    '#ECFDF7',
    '#CDF7EA',
    '#9EEFD7',
    '#66E0BF',
    '#34C9A4',
    '#12AC89',
    '#0B7F66',
    '#0A6753',
    '#0B5243',
    '#083A30',
  ],
  crimson: [
    '#FEF1F2',
    '#FDDDE0',
    '#FBBFC5',
    '#F7919C',
    '#EF5F6F',
    '#E23A4E',
    '#C4283B',
    '#A41F31',
    '#861C2C',
    '#6E1626',
  ],
  orange: [
    '#FFF5EB',
    '#FFE6CC',
    '#FFCF99',
    '#FFB05C',
    '#FF9129',
    '#F5760F',
    '#D95E07',
    '#B4480A',
    '#90390D',
    '#6E2D0C',
  ],
  sky: [
    '#EFF8FF',
    '#D9EEFF',
    '#B6E0FF',
    '#85CCFA',
    '#4DB3F2',
    '#2496E0',
    '#0E6FB3',
    '#0F5A91',
    '#124B76',
    '#10395A',
  ],
}

const theme = createTheme({
  colors,
  primaryColor: 'navy',
  primaryShade: { light: 6, dark: 5 },
  defaultRadius: 'md',
  radius: {
    xs: '4px',
    sm: '6px',
    md: '10px',
    lg: '14px',
    xl: '20px',
  },
  spacing: {
    xs: '8px',
    sm: '12px',
    md: '16px',
    lg: '24px',
    xl: '32px',
  },
  fontFamily:
    "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  fontFamilyMonospace:
    "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
  fontSizes: {
    xs: '12px',
    sm: '14px',
    md: '16px',
    lg: '18px',
    xl: '20px',
  },
  headings: {
    fontFamily:
      "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    fontWeight: '600',
    sizes: {
      h1: { fontSize: '30px', lineHeight: '1.25', fontWeight: '700' },
      h2: { fontSize: '24px', lineHeight: '1.3', fontWeight: '700' },
      h3: { fontSize: '20px', lineHeight: '1.35', fontWeight: '600' },
      h4: { fontSize: '18px', lineHeight: '1.4', fontWeight: '600' },
      h5: { fontSize: '16px', lineHeight: '1.45', fontWeight: '600' },
      h6: { fontSize: '14px', lineHeight: '1.5', fontWeight: '600' },
    },
  },
  shadows: {
    xs: '0 1px 2px rgba(15, 23, 42, 0.04)',
    sm: '0 2px 8px rgba(15, 23, 42, 0.06)',
    md: '0 8px 24px rgba(15, 23, 42, 0.08)',
    lg: '0 16px 40px rgba(15, 23, 42, 0.10)',
    xl: '0 24px 56px rgba(15, 23, 42, 0.14)',
  },
  autoContrast: true,
  luminanceThreshold: 0.35,
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <MantineProvider theme={theme} defaultColorScheme="auto">
      <App />
    </MantineProvider>
  </StrictMode>,
)
