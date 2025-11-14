'use client';

import { ReactNode } from 'react';
import { AppDataProvider } from './app-data-provider';

export function Providers({ children }: { children: ReactNode }) {
  return <AppDataProvider>{children}</AppDataProvider>;
}
