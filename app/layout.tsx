import '@mantine/core/styles.css';
import React from 'react';
import { MantineProvider, ColorSchemeScript } from '@mantine/core';
import { theme } from '../theme';
import { PostHogProvider } from '@/components/PostHogProvider';

export const metadata = {
  title: 'deps-matrix',
  description:
    'Analyze the versions of dependencies across all repositories in your GitHub organization.',
};

export default function RootLayout({ children }: { children: any }) {
  return (
    <html lang="en">
      <head>
        <ColorSchemeScript />
        <link rel="shortcut icon" href="/favicon.jpeg" />
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width, user-scalable=no"
        />
      </head>
      <body>
        <MantineProvider theme={theme}>
          <PostHogProvider>{children}</PostHogProvider>
        </MantineProvider>
      </body>
    </html>
  );
}
