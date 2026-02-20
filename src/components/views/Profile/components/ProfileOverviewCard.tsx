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
            <span className='text-muted-foreground text-xs'>Cuenta personal</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className='text-muted-foreground text-sm'>
        <p>{summary.description}</p>
      </CardContent>
    </Card>
  );
};

export { ProfileOverviewCard };
