import { Edit3, Eye, EyeOff, Lock, Mail } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import type { ProfileFormField, ProfileFormState, PasswordVisibilityState } from '../profileTypes';
import type { FC } from 'react';

interface ProfileSecuritySectionProps {
  readonly formState: ProfileFormState;
  readonly passwordVisibility: PasswordVisibilityState;
  readonly isEditing: boolean;
  readonly loading: boolean;
  readonly canSubmit: boolean;
  readonly onFieldChange: (_field: ProfileFormField, _value: string) => void;
  readonly onTogglePassword: (_field: keyof PasswordVisibilityState) => void;
  readonly onStartEditing: () => void;
  readonly onCancelEditing: () => void;
  readonly onSave: () => void;
}

interface PasswordFieldProps {
  readonly field: ProfileFormField;
  readonly label: string;
  readonly value: string;
  readonly placeholder: string;
  readonly isVisible: boolean;
  readonly disabled: boolean;
  readonly helperText?: string;
  readonly leadingIcon?: 'lock';
  readonly onChange: (_value: string) => void;
  readonly onToggle: () => void;
}

const PasswordField: FC<PasswordFieldProps> = ({
  field,
  label,
  value,
  placeholder,
  isVisible,
  disabled,
  helperText,
  leadingIcon,
  onChange,
  onToggle,
}) => {
  const inputPadding = leadingIcon ? 'pl-10 pr-10' : 'pr-10';

  return (
    <div className='space-y-2'>
      <Label htmlFor={field}>{label}</Label>
      <div className='relative'>
        <Input
          id={field}
          type={isVisible ? 'text' : 'password'}
          value={value}
          onChange={event => onChange(event.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className={inputPadding}
        />
        <Button
          type='button'
          variant='ghost'
          size='icon'
          className='absolute inset-y-0 right-0 h-full px-3 hover:bg-transparent'
          onClick={onToggle}
          disabled={disabled}
        >
          {isVisible ? <EyeOff className='h-4 w-4' /> : <Eye className='h-4 w-4' />}
        </Button>
        {leadingIcon === 'lock' ? (
          <Lock className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 opacity-70' />
        ) : null}
      </div>
      {helperText ? <p className='text-muted-foreground text-xs'>{helperText}</p> : null}
    </div>
  );
};

const ProfileSecuritySection: FC<ProfileSecuritySectionProps> = ({
  formState,
  passwordVisibility,
  isEditing,
  loading,
  canSubmit,
  onFieldChange,
  onTogglePassword,
  onStartEditing,
  onCancelEditing,
  onSave,
}) => {
  return (
    <Card className='border-border/60 rounded-xl border shadow-sm backdrop-blur'>
      <CardHeader className='flex flex-col gap-1 pb-4'>
        <CardTitle className='text-foreground flex items-center gap-2 text-base'>
          <Edit3 className='h-4 w-4' /> Seguridad y credenciales
        </CardTitle>
        <p className='text-muted-foreground text-xs'>
          Actualiza tu correo y gestiona tu contraseña de forma segura.
        </p>
      </CardHeader>
      <CardContent className='space-y-6'>
        <div className='space-y-2'>
          <Label htmlFor='email'>Correo electrónico</Label>
          <div className='relative'>
            <Input
              id='email'
              type='email'
              value={formState.email}
              onChange={event => onFieldChange('email', event.target.value)}
              disabled={!isEditing || loading}
              className='pl-10'
            />
            <Mail className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 opacity-70' />
          </div>
        </div>

        <div className='grid gap-4 sm:grid-cols-2'>
          <PasswordField
            field='newPassword'
            label='Nueva contraseña'
            value={formState.newPassword}
            placeholder='••••••'
            isVisible={passwordVisibility.newPassword}
            disabled={!isEditing || loading}
            helperText='Mínimo 6 caracteres.'
            onChange={value => onFieldChange('newPassword', value)}
            onToggle={() => onTogglePassword('newPassword')}
          />
          <PasswordField
            field='confirmPassword'
            label='Confirmar contraseña'
            value={formState.confirmPassword}
            placeholder='••••••'
            isVisible={passwordVisibility.confirmPassword}
            disabled={!isEditing || loading}
            onChange={value => onFieldChange('confirmPassword', value)}
            onToggle={() => onTogglePassword('confirmPassword')}
          />
        </div>

        <PasswordField
          field='currentPassword'
          label='Contraseña actual'
          value={formState.currentPassword}
          placeholder='Necesaria para confirmar cambios sensibles'
          isVisible={passwordVisibility.currentPassword}
          disabled={!isEditing || loading}
          leadingIcon='lock'
          onChange={value => onFieldChange('currentPassword', value)}
          onToggle={() => onTogglePassword('currentPassword')}
        />

        {!isEditing ? (
          <Button
            type='button'
            variant='outline'
            className='w-full sm:w-auto'
            onClick={onStartEditing}
          >
            Editar credenciales
          </Button>
        ) : (
          <div className='flex flex-col-reverse gap-3 sm:flex-row sm:justify-end'>
            <Button
              type='button'
              variant='outline'
              className='w-full sm:w-auto'
              onClick={onCancelEditing}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type='button'
              className='w-full sm:w-auto'
              onClick={onSave}
              disabled={!canSubmit}
            >
              {loading ? 'Actualizando…' : 'Guardar cambios'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export { ProfileSecuritySection };
