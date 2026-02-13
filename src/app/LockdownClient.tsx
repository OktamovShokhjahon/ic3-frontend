'use client';

import { useEffect } from 'react';
import { startLockdown } from '../lib/lockdown';

export function LockdownClient() {
  useEffect(() => {
    const stop = startLockdown();
    return () => {
      stop();
    };
  }, []);

  return null;
}

