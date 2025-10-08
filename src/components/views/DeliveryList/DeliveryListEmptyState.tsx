import { Edit2 } from 'lucide-react';
import React from 'react';

import { Button } from '@/components/ui/button';

interface DeliveryListEmptyStateProps {
  readonly onAdd: () => void;
}

export const DeliveryListEmptyState: React.FC<DeliveryListEmptyStateProps> = ({ onAdd }) => {
  return (
    <div className='border-border bg-muted/20 text-muted-foreground rounded-xl border border-dashed p-10 text-center'>
      <div className='space-y-4'>
        <p>No hay entregas registradas.</p>
        <p className='text-sm'>Añade la primera para comenzar a planificar tu calendario.</p>
        <Button onClick={onAdd} className='mx-auto flex items-center gap-2'>
          <Edit2 className='h-4 w-4' />
          <span className='hidden sm:inline'>Nueva entrega</span>
          <span className='sm:hidden'>Nueva</span>
        </Button>
      </div>
    </div>
  );
};
