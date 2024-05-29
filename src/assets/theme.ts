import { DefaultTheme } from "styled-components";
const size = {
  mini: "376px",
  xs: "430px",
  sm: "576px",
  md: "920px",
  lg: "1278px",
  xl: "1200px",
};
export const Theme: DefaultTheme = {
  mini: `(max-width: ${size.mini})`,
  xs: `(max-width: ${size.xs})`,
  sm: `(max-width: ${size.sm})`,
  md: `(max-width: ${size.md})`,
  lg: `(max-width: ${size.lg})`,
  xl: `(min-width: ${size.xl})`,
};
