import { format, addDays } from 'date-fns';
import type { StudySchedule } from '../types';

const escapeText = (value: string): string => {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;');
};

const toUtc = (date: Date): Date => new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
const formatDate = (date: Date): string => format(date, 'yyyyMMdd');
const formatTimestamp = (date: Date): string => format(toUtc(date), "yyyyMMdd'T'HHmmss'Z'");

export const createIcsCalendar = (schedule: StudySchedule[]): string => {
  const generatedAt = new Date();
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Calendario de Entregas//ES'];

  schedule.forEach((item) => {
    const eventStart = formatDate(item.endDate);
    const eventEnd = formatDate(addDays(item.endDate, 1));
    const description = escapeText(
      `Entrega el ${format(item.endDate, "d 'de' MMM yyyy")}\nPeriodo de estudio: ${format(item.startDate, "d 'de' MMM")} - ${format(item.endDate, "d 'de' MMM")}`
    );

    lines.push(
      'BEGIN:VEVENT',
      `UID:${item.id}@calendario-entregas`,
      `DTSTAMP:${formatTimestamp(generatedAt)}`,
      `DTSTART;VALUE=DATE:${eventStart}`,
      `DTEND;VALUE=DATE:${eventEnd}`,
      `SUMMARY:${escapeText(`${item.subject} - ${item.name}`)}`,
      `DESCRIPTION:${description}`,
      'END:VEVENT'
    );
  });

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
};
