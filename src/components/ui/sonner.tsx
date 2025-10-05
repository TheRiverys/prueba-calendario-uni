import React from 'react';
import { Toaster as SonnerToaster, toast, type ToasterProps } from 'sonner';

import { cn } from '@/lib/utils';

const Toaster: React.FC<ToasterProps> = ({
  className,
  expand = true,
  position = 'top-right',
  richColors = true,
  theme = 'system',
  toastOptions,
  ...props
}) => {
  return (
    <SonnerToaster
      className={cn(
        '[&_[data-sonner-toast]]:shadow-soft',
        '[&_[data-sonner-toast]]:border',
        '[&_[data-sonner-toast]]:border-border',
        '[&_[data-sonner-toast]]:bg-card',
        '[&_[data-sonner-toast]]:text-card-foreground',
        className
      )}
      expand={expand}
      position={position}
      richColors={richColors}
      theme={theme}
      toastOptions={{
        ...toastOptions,
        classNames: {
          ...toastOptions?.classNames,
          toast: cn(
            'bg-card text-card-foreground border border-border shadow-soft gap-3 px-4 py-3 rounded-lg',
            'data-[theme=dark]:bg-card data-[theme=dark]:text-card-foreground',
            toastOptions?.classNames?.toast
          ),
          title: cn('text-sm font-semibold tracking-tight', toastOptions?.classNames?.title),
          description: cn('text-sm text-muted-foreground', toastOptions?.classNames?.description),
          actionButton: cn(
            'rounded-md bg-primary text-primary-foreground px-3 py-2 text-sm font-semibold shadow-soft transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary',
            toastOptions?.classNames?.actionButton
          ),
          cancelButton: cn(
            'rounded-md bg-muted text-muted-foreground px-3 py-2 text-sm font-semibold shadow-soft transition-colors hover:bg-muted/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-muted-foreground/30',
            toastOptions?.classNames?.cancelButton
          ),
        },
      }}
      {...props}
    />
  );
};

Toaster.displayName = 'Toaster';

export { Toaster, toast };
