'use client';

import posthog from 'posthog-js';
import { PostHogProvider as OriginalPostHogProvider } from 'posthog-js/react';
import { ReactNode } from 'react';

if (typeof window !== 'undefined') {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY || '', {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
  });
}

export function PostHogProvider({ children }: { children: ReactNode }) {
  return <OriginalPostHogProvider client={posthog}>{children}</OriginalPostHogProvider>;
}
