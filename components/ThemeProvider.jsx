'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';

export function ThemeProvider({ children }) {
  return <NextThemesProvider defaultTheme="dark" enableSystem={false} attribute="data-theme">{children}</NextThemesProvider>;
}
