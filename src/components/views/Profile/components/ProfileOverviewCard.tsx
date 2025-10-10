import { UserAvatar } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import type { ProfileAccountSummary } from '../profileTypes';
import type { FC } from 'react';

interface ProfileOverviewCardProps {
  readonly summary: ProfileAccountSummary;
}

const ProfileOverviewCard: FC<ProfileOverviewCardProps> = ({ summary }) => {
  const email = summary.user?.email ?? 'Sin correo electrónico';

  return (
    <Card className='border-border/60 rounded-xl border shadow-sm backdrop-blur'>
      <CardHeader className='flex flex-col gap-4 pb-4'>
        <CardTitle className='text-foreground flex items-center gap-3 text-base'>
          <UserAvatar user={summary.user} size='lg' className='bg-primary/10 text-primary' />
          <div className='flex flex-col'>
            <span className='text-base font-semibold'>{email}</span>
            <span className='text-muted-foreground text-xs'>Cuenta sincronizada con Supabase</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className='text-muted-foreground space-y-4 text-sm'>
        <div className='flex items-center justify-between'>
          <span>Estado</span>
          <span className='flex items-center gap-2 font-medium text-emerald-600 dark:text-emerald-400'>
            <span className='h-2 w-2 rounded-full bg-emerald-500' /> Activa
          </span>
        </div>
        <div className='flex items-center justify-between'>
          <span>Proveedor</span>
          <span className={'font-medium ' + summary.providerColor}>{summary.providerName}</span>
        </div>
        <div className='flex items-center justify-between'>
          <span>Email confirmado</span>
          <span className='text-foreground font-medium'>
            {summary.emailConfirmed ? 'Sí' : 'No'}
          </span>
        </div>
        <div className='flex items-center justify-between'>
          <span>Última actualización</span>
          <span className='text-foreground font-medium'>Sesión actual</span>
        </div>
      </CardContent>
    </Card>
  );
};

export { ProfileOverviewCard };
