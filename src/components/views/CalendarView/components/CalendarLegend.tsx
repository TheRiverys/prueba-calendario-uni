import React from 'react';

interface CalendarLegendProps {
  readonly items: Array<{ subject: string; color: string }>;
}

export const CalendarLegend: React.FC<CalendarLegendProps> = ({ items }) => {
  if (items.length === 0) {
    return null;
  }

  return (
    <div className='bg-muted/30 flex flex-wrap gap-4 rounded-lg px-4 py-3 text-sm'>
      {items.map(item => (
        <div key={item.subject} className='flex items-center space-x-2'>
          <div className={`h-4 w-4 rounded ${item.color}`} />
          <span className='text-muted-foreground font-medium'>{item.subject}</span>
        </div>
      ))}
      <div className='border-border ml-4 flex items-center space-x-2 border-l pl-4'>
        <div className='bg-muted-foreground/30 h-1 w-8 rounded' />
        <span className='text-muted-foreground font-medium'>Período de estudio</span>
      </div>
    </div>
  );
};
