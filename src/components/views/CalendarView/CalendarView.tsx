import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import React, { useMemo, useState } from 'react';

import { buildColorLegend } from '@/utils/colors';

import {
  buildCalendarMetadata,
  goToNextMonth,
  goToPreviousMonth,
  populateCalendarDays,
} from './calendarMath';
import { CalendarDay } from './components/CalendarDay';
import { CalendarHeader } from './components/CalendarHeader';
import { CalendarLegend } from './components/CalendarLegend';

import type { CalendarViewProps } from './types';

const CalendarView: React.FC<CalendarViewProps> = ({
  schedule,
  onEdit,
  onDelete,
  onToggleComplete,
  selectedSubject = 'all',
  subjects = [],
  onSubjectChange = () => {},
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const metadata = useMemo(() => {
    const baseMetadata = buildCalendarMetadata(currentMonth);
    return populateCalendarDays(baseMetadata, schedule, selectedSubject);
  }, [currentMonth, schedule, selectedSubject]);

  const legendItems = useMemo(() => {
    const filteredSchedule =
      selectedSubject === 'all'
        ? schedule
        : schedule.filter(item => item.subject === selectedSubject);
    return buildColorLegend(filteredSchedule);
  }, [schedule, selectedSubject]);

  const monthLabel = useMemo(
    () => format(metadata.currentMonth, 'MMMM yyyy', { locale: es }),
    [metadata.currentMonth]
  );

  return (
    <div className='space-y-6'>
      <CalendarHeader
        monthLabel={monthLabel}
        onNextMonth={() => setCurrentMonth(previous => goToNextMonth(previous))}
        onPrevMonth={() => setCurrentMonth(previous => goToPreviousMonth(previous))}
        selectedSubject={selectedSubject}
        subjects={subjects}
        onSubjectChange={onSubjectChange}
      />

      <CalendarLegend items={legendItems} />

      <div className='border-border overflow-hidden rounded-lg border'>
        <div className='bg-muted/50 grid grid-cols-7'>
          {metadata.weekDayLabels.map(label => (
            <div
              key={label}
              className='text-muted-foreground py-2 text-center text-xs font-medium tracking-wider uppercase'
            >
              {label}
            </div>
          ))}
        </div>

        {metadata.weeks.map((week, weekIndex) => (
          <div className='grid grid-cols-7' key={weekIndex}>
            {week.map(day => (
              <CalendarDay
                key={day.date.toISOString()}
                day={day.date}
                deliveries={day.deliveries}
                studyPeriods={day.studyPeriods}
                isCurrentMonth={day.isCurrentMonth}
                isToday={day.isToday}
                onEdit={onEdit}
                onDelete={onDelete}
                onToggleComplete={onToggleComplete}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CalendarView;
