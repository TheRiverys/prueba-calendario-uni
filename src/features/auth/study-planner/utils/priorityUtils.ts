import type { ConfigSettings } from '@/types';
import { DEFAULT_PRIORITY_VARIATIONS } from '@/utils/config';

import type { Priority } from '../types';

export const getPriorityValue = (priority: Priority, config?: ConfigSettings): number => {
  const variations = config?.priorityVariations ?? DEFAULT_PRIORITY_VARIATIONS;
  return variations[priority];
};
