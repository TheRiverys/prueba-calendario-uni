import { AlertTriangle, CheckCircle2 } from 'lucide-react';

import type { ProfileStatus } from '../profileTypes';
import type { FC } from 'react';

interface ProfileFeedbackProps {
  readonly status: ProfileStatus;
}

const ProfileFeedback: FC<ProfileFeedbackProps> = ({ status }) => {
  if (!status.error && !status.success) {
    return null;
  }

  return (
    <div className='space-y-4 pt-6'>
      {status.error ? (
        <div className='border-destructive/40 bg-destructive/10 text-destructive flex items-center gap-3 rounded-lg border px-4 py-3 text-sm'>
          <AlertTriangle className='h-5 w-5 flex-shrink-0' />
          <span>{status.error}</span>
        </div>
      ) : null}
      {status.success ? (
        <div className='flex items-center gap-3 rounded-lg border border-emerald-400/40 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-950/30 dark:text-emerald-300'>
          <CheckCircle2 className='h-5 w-5 flex-shrink-0' />
          <span>{status.success}</span>
        </div>
      ) : null}
    </div>
  );
};

export { ProfileFeedback };
