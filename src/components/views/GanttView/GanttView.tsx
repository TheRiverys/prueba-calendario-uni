import React from 'react';

import { GanttSummary } from './GanttSummary';
import { GanttTimeline } from './GanttTimeline';
import { useGanttTimeline } from './useGanttTimeline';

import type { GanttViewProps } from './types';

const GanttView: React.FC<GanttViewProps> = ({ schedule }) => {
  const timeline = useGanttTimeline(schedule);

  return (
    <div className='space-y-6'>
      <div className='p-6'>
        <GanttTimeline timeline={timeline} />

        {timeline.rows.length === 0 && (
          <div className='text-muted-foreground pt-2 text-center text-sm'>
            No hay entregas programadas para el periodo visible.
          </div>
        )}

        <GanttSummary schedule={schedule} />
      </div>
    </div>
  );
};

export default GanttView;
