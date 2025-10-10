import * as React from 'react';

import { cn } from '@/lib/utils';

const Textarea = React.forwardRef<React.ElementRef<'textarea'>, React.ComponentProps<'textarea'>>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        data-slot='textarea'
        className={cn(
          'border-input bg-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[80px] w-full rounded-md border px-3 py-2 text-base shadow-xs focus-visible:ring-1 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
          'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
          'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
          className
        )}
        {...props}
      />
    );
  }
);
Textarea.displayName = 'Textarea';

export { Textarea };
