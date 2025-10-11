import React from 'react';

import { Input } from './ui/input';

interface ControlsProps {
  readonly semesterStart: string;
  readonly onSemesterStartChange: (_value: string) => void;
}

// Sin controles de vista aquí; se gestionan desde `DeliveryList` y encabezados de cada vista

export const Controls: React.FC<ControlsProps> = ({ semesterStart, onSemesterStartChange }) => {
  return (
    <section className='w-full'>
      {/* Contenido alineado a la izquierda */}
      <div className='flex justify-start'>
        <div
          id='semester-start-control'
          className='flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6'
        >
          <div className='text-muted-foreground flex items-center gap-3 text-sm'>
            <span className='text-xs font-medium tracking-wide uppercase'>Inicio del semestre</span>
            <Input
              type='date'
              value={semesterStart}
              onChange={event => onSemesterStartChange(event.target.value)}
              className='w-[180px]'
            />
          </div>
        </div>
      </div>
    </section>
  );
};
