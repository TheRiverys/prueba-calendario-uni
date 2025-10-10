import * as AvatarPrimitive from '@radix-ui/react-avatar';
import * as React from 'react';

import { getOAuthProviderInfo } from '@/lib/oauthUtils';
import { cn } from '@/lib/utils';

import type { User } from '@supabase/supabase-js';

const Avatar = React.forwardRef<
  React.ComponentRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={cn('relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full', className)}
    {...props}
  />
));
Avatar.displayName = AvatarPrimitive.Root.displayName;

const AvatarImage = React.forwardRef<
  React.ComponentRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn('aspect-square h-full w-full', className)}
    {...props}
  />
));
AvatarImage.displayName = AvatarPrimitive.Image.displayName;

const AvatarFallback = React.forwardRef<
  React.ComponentRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      'bg-muted flex h-full w-full items-center justify-center rounded-full',
      className
    )}
    {...props}
  />
));
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;

interface UserAvatarProps {
  readonly user: User | null;
  readonly className?: string;
  readonly size?: 'sm' | 'md' | 'lg' | 'xl';
}

const UserAvatar = React.forwardRef<HTMLDivElement, UserAvatarProps>(
  ({ user, className, size = 'md', ...props }, ref) => {
    const sizeClasses = {
      sm: 'h-8 w-8',
      md: 'h-10 w-10',
      lg: 'h-12 w-12',
      xl: 'h-16 w-16',
    };

    const getUserInitials = (email?: string | null): string => {
      if (!email) {
        return '??';
      }
      return email.substring(0, 2).toUpperCase();
    };

    const getAvatarUrl = (): string | null => {
      if (!user?.user_metadata) {
        return null;
      }

      // Usar la utilidad para obtener información del proveedor OAuth
      const providerInfo = getOAuthProviderInfo(user);
      return providerInfo.avatarUrl;
    };

    const avatarUrl = getAvatarUrl();

    return (
      <Avatar ref={ref} className={cn(sizeClasses[size], className)} {...props}>
        {avatarUrl ? (
          <AvatarImage src={avatarUrl} alt={user?.email || 'Avatar del usuario'} />
        ) : null}
        <AvatarFallback className='text-xs font-medium'>
          {getUserInitials(user?.email)}
        </AvatarFallback>
      </Avatar>
    );
  }
);

UserAvatar.displayName = 'UserAvatar';

export { Avatar, AvatarImage, AvatarFallback, UserAvatar };
