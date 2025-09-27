import type { ConfigSettings, PriorityVariations } from '../types';

const isNumber = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);

const normalizeInteger = (candidate: unknown, fallback: number, minimum = 1): number => {
  if (!isNumber(candidate)) {
    return fallback;
  }
  if (Number.isNaN(candidate)) {
    return fallback;
  }
  return Math.max(minimum, Math.round(candidate));
};

const sanitizePriorityVariations = (value: unknown): PriorityVariations => {
  const fallback = DEFAULT_PRIORITY_VARIATIONS;
  if (!value || typeof value !== 'object') {
    return { ...fallback };
  }
  const record = value as Record<string, unknown>;
  return {
    high: isNumber(record.high) ? record.high : fallback.high,
    normal: isNumber(record.normal) ? record.normal : fallback.normal,
    low: isNumber(record.low) ? record.low : fallback.low
  };
};

const extractLegacyBaseStudyDays = (value: unknown): number | null => {
  if (!value || typeof value !== 'object') {
    return null;
  }
  const record = value as Record<string, unknown>;
  const normal = record.normal;
  if (isNumber(normal)) {
    return Math.max(1, Math.round(normal));
  }
  const candidates = ['high', 'low']
    .map(key => record[key])
    .filter(isNumber) as number[];
  if (candidates.length === 0) {
    return null;
  }
  const sum = candidates.reduce((accumulator, current) => accumulator + current, 0);
  return Math.max(1, Math.round(sum / candidates.length));
};

export const DEFAULT_PRIORITY_VARIATIONS: PriorityVariations = {
  high: 1,
  normal: 0,
  low: -1
};

export const DEFAULT_CONFIG: ConfigSettings = {
  baseStudyDays: 4,
  minStudyTime: 2,
  priorityVariations: { ...DEFAULT_PRIORITY_VARIATIONS },
  openaiApiKey: ''
};

export const createDefaultConfig = (): ConfigSettings => ({
  baseStudyDays: DEFAULT_CONFIG.baseStudyDays,
  minStudyTime: DEFAULT_CONFIG.minStudyTime,
  priorityVariations: { ...DEFAULT_PRIORITY_VARIATIONS },
  openaiApiKey: DEFAULT_CONFIG.openaiApiKey
});

export const sanitizeConfig = (value: unknown): ConfigSettings => {
  const defaults = createDefaultConfig();
  if (!value || typeof value !== 'object') {
    return defaults;
  }

  const record = value as Record<string, unknown>;
  const baseStudyDays = normalizeInteger(
    record.baseStudyDays,
    extractLegacyBaseStudyDays(record.priorityBaseDays) ?? defaults.baseStudyDays
  );
  const minStudyTime = normalizeInteger(record.minStudyTime, defaults.minStudyTime);
  const priorityVariations = sanitizePriorityVariations(record.priorityVariations);

  const openaiApiKey = typeof record.openaiApiKey === 'string'
    ? record.openaiApiKey.trim()
    : defaults.openaiApiKey;

  return {
    baseStudyDays,
    minStudyTime,
    priorityVariations,
    openaiApiKey
  } satisfies ConfigSettings;
};

export const persistConfig = (config: ConfigSettings) => {
  localStorage.setItem('app-config', JSON.stringify(config));
};
