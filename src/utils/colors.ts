import type { Delivery, StudySchedule } from '../types';

const SUBJECT_COLORS = [
  'bg-chart-1', 'bg-chart-2', 'bg-chart-3', 'bg-chart-4', 'bg-chart-5', 'bg-chart-6',
  'bg-chart-7', 'bg-chart-8', 'bg-chart-9', 'bg-chart-10', 'bg-chart-11', 'bg-chart-12'
];

const hashSubject = (subject: string): number => {
  const normalized = subject.toLowerCase().trim();
  let hash = 0;
  for (let index = 0; index < normalized.length; index += 1) {
    hash = (hash * 31 + normalized.charCodeAt(index)) & 0xffffffff;
  }
  return Math.abs(hash);
};

export const pickColorForSubject = (subject: string, deliveries: Delivery[]): string => {
  const existing = deliveries.find(delivery => delivery.subject === subject)?.color;
  if (existing) {
    return existing;
  }
  if (!subject) {
    return SUBJECT_COLORS[0];
  }
  const paletteIndex = hashSubject(subject) % SUBJECT_COLORS.length;
  return SUBJECT_COLORS[paletteIndex];
};

export const buildColorLegend = (schedule: StudySchedule[]): Array<{ subject: string; color: string }> => {
  const legend = new Map<string, string>();
  schedule.forEach(item => {
    if (!legend.has(item.subject)) {
      legend.set(item.subject, item.color);
    }
  });
  return Array.from(legend.entries()).map(([subject, color]) => ({ subject, color }));
};

export const SUBJECT_COLOR_PALETTE = SUBJECT_COLORS;
