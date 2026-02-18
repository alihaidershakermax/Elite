/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    primary: '#4F6630',
    onPrimary: '#FFFFFF',
    primaryContainer: '#D0EDB5',
    onPrimaryContainer: '#111F00',
    secondary: '#586249',
    onSecondary: '#FFFFFF',
    secondaryContainer: '#DCE7C8',
    onSecondaryContainer: '#151E0B',
    tertiary: '#386663',
    onTertiary: '#FFFFFF',
    tertiaryContainer: '#BBECE7',
    onTertiaryContainer: '#00201E',
    error: '#BA1A1A',
    onError: '#FFFFFF',
    errorContainer: '#FFDAD6',
    onErrorContainer: '#410002',
    background: '#FAFBEB',
    onBackground: '#1B1C18',
    surface: '#FDFCF5',
    onSurface: '#1B1C18',
    surfaceVariant: '#E1E4D5',
    onSurfaceVariant: '#44483D',
    outline: '#75796C',
    elevation: {
      level0: 'transparent',
      level1: '#F7F9E8',
      level2: '#F1F4DE',
      level3: '#EBEED4',
      level4: '#E9ECCF',
      level5: '#E5E9C7',
    },
  },
  dark: {
    primary: '#B4D19B',
    onPrimary: '#223605',
    primaryContainer: '#384E1A',
    onPrimaryContainer: '#D0EDB5',
    secondary: '#C0CBAE',
    onSecondary: '#2A331E',
    secondaryContainer: '#404A33',
    onSecondaryContainer: '#DCE7C8',
    tertiary: '#A0CFCC',
    onTertiary: '#003734',
    tertiaryContainer: '#1E4E4B',
    onTertiaryContainer: '#BBECE7',
    error: '#FFB4AB',
    onError: '#690005',
    errorContainer: '#93000A',
    onErrorContainer: '#FFDAD6',
    background: '#1B1C18',
    onBackground: '#E3E3DC',
    surface: '#121411',
    onSurface: '#E3E3DC',
    surfaceVariant: '#44483D',
    onSurfaceVariant: '#C5C8BA',
    outline: '#8F9285',
    elevation: {
      level0: 'transparent',
      level1: '#21251E',
      level2: '#272C22',
      level3: '#2D3327',
      level4: '#303629',
      level5: '#353D2F',
    },
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
