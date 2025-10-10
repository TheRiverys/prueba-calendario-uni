import { ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';

import type { FC } from 'react';

interface ProfileHeaderProps {
  readonly onBack: () => void;
}

const ProfileHeader: FC<ProfileHeaderProps> = ({ onBack }) => {
  return (
    <header className='border-border border-b pb-6'>
      <div className='flex flex-col gap-4'>
        <Button
          type='button'
          variant='ghost'
          size='sm'
          onClick={onBack}
          className='group text-muted-foreground hover:text-foreground w-fit gap-2 text-sm font-medium'
        >
          <ArrowLeft className='h-4 w-4 transition-transform group-hover:-translate-x-1' />
          Volver al dashboard
        </Button>
        <div className='space-y-1.5'>
          <h1 className='text-foreground text-3xl font-semibold tracking-tight'>
            Perfil de usuario
          </h1>
          <p className='text-muted-foreground max-w-2xl text-sm'>
            Gestiona tus credenciales, tus preferencias y mantén segura tu cuenta.
          </p>
        </div>
      </div>
    </header>
  );
};

export { ProfileHeader };
