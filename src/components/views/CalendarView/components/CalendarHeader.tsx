import { ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import React from 'react';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface CalendarHeaderProps {
  readonly onPrevMonth: () => void;
  readonly onNextMonth: () => void;
  readonly selectedSubject: string;
  readonly subjects: string[];
  readonly onSubjectChange: (_subject: string) => void;
  readonly monthLabel: string;
}

export const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  onPrevMonth,
  onNextMonth,
  selectedSubject,
  subjects,
  onSubjectChange,
  monthLabel,
}) => {
  return (
    <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
      <div className='flex items-center justify-center gap-2'>
        <button
          type='button'
          onClick={onPrevMonth}
          className='hover:bg-muted flex h-10 w-10 items-center justify-center rounded-lg transition-colors'
          aria-label='Mes anterior'
        >
          <ChevronLeft className='h-5 w-5' />
        </button>
        <div className='bg-muted/50 rounded-lg px-4 py-2'>
          <h3 className='text-foreground min-w-[200px] text-center text-lg font-semibold'>
            {monthLabel}
          </h3>
        </div>
        <button
          type='button'
          onClick={onNextMonth}
          className='hover:bg-muted flex h-10 w-10 items-center justify-center rounded-lg transition-colors'
          aria-label='Mes siguiente'
        >
          <ChevronRight className='h-5 w-5' />
        </button>
      </div>

      <div className='flex items-center gap-3'>
        {subjects.length > 0 && (
          <div className='flex items-center gap-2'>
            <Filter className='text-muted-foreground h-4 w-4' />
            <Select value={selectedSubject} onValueChange={onSubjectChange}>
              <SelectTrigger className='w-[140px]'>
                <SelectValue placeholder='Todas' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>Todas</SelectItem>
                {subjects.map(subject => (
                  <SelectItem key={subject} value={subject}>
                    {subject}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
    </div>
  );
};
