'use client';

import { useEffect } from 'react';
import { storageService } from '@/services/storage';
import { defaultSites } from '@/data/sites';

export function StorageInitializer() {
  useEffect(() => {
    if (storageService.getSites().length === 0) {
      storageService.saveSites(defaultSites);
    }
  }, []);

  return null;
} 