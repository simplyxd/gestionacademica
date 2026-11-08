import type { DefaultMantineColor, MantineColorsTuple } from '@mantine/core';

type SgaColors =
  | 'navy'
  | 'indigo'
  | 'amber'
  | 'slate'
  | 'teal'
  | 'crimson'
  | 'orange'
  | 'sky'
  | DefaultMantineColor;

declare module '@mantine/core' {
  export interface MantineThemeColorsOverride {
    colors: Record<SgaColors, MantineColorsTuple>;
  }

  export interface MantineThemeOther {
    glass: {
      blur: string;
      saturateLight: string;
      saturateDark: string;
      bgLight: string;
      bgDark: string;
      bgStrongLight: string;
      bgStrongDark: string;
      bgFallbackLight: string;
      bgFallbackDark: string;
      borderLight: string;
      borderDark: string;
      highlightLight: string;
      highlightDark: string;
      shadowLight: string;
      shadowDark: string;
    };
    layout: {
      headerHeight: number;
      navbarWidth: number;
      navbarWidthCollapsed: number;
      contentMaxWidth: number;
      tableRowHeight: number;
      drawerWidthMd: number;
      drawerWidthLg: number;
    };
    schedule: {
      hourHeight: number;
      startHour: number;
      endHour: number;
    };
  }
}
