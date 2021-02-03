import {
  extendTheme,
  ThemeOverride,
  theme as chakraTheme,
  useTheme as useChakraTheme,
} from "@chakra-ui/react";
import { createBreakpoints } from "@chakra-ui/theme-tools";

const fonts = { mono: `'Menlo', monospace` };

const breakpoints = createBreakpoints({
  sm: "40em",
  md: "52em",
  lg: "64em",
  xl: "80em",
});

const config: ThemeOverride["config"] = {
  initialColorMode: "light",
  useSystemColorMode: true,
};

export const themeObj = {
  ...chakraTheme,
  config,
  colors: {
    ...chakraTheme.colors,
    black: "#222f3e",
  },
  components: {
    ...chakraTheme.components,
    Container: {
      ...chakraTheme.components.Container,
      sizes: {
        sm: {
          maxWidth: "60ch",
        },
        md: {
          maxWidth: {
            maxWidth: "80ch",
          },
        },
      },
      defaultProps: {
        size: "md",
      },
    },
  },
  fonts,
  breakpoints,
};

const customTheme = extendTheme(themeObj);

export const useCustomTheme = () => useChakraTheme<typeof themeObj>();

export default customTheme;
