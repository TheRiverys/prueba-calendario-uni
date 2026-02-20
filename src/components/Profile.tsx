import { useAuthContext } from '@/contexts/auth/AuthContext';
import { usePreferencesContext } from '@/contexts/preferences/PreferencesContext';
import { gdprDataService } from '@/services/gdprDataService';

import { PrivacySettings } from './gdpr/PrivacySettings';
import { AccountDeletionSection } from './views/Profile/components/AccountDeletionSection';
import { DeleteAccountModal } from './views/Profile/components/DeleteAccountModal';
import { ProfileFeedback } from './views/Profile/components/ProfileFeedback';
import { ProfileHeader } from './views/Profile/components/ProfileHeader';
import { ProfileOverviewCard } from './views/Profile/components/ProfileOverviewCard';
import { ProfileSecuritySection } from './views/Profile/components/ProfileSecuritySection';
import { useProfileManager } from './views/Profile/hooks/useProfileManager';

import type { JSX } from 'react';

const Profile = (): JSX.Element => {
  const { user, updateProfile, deleteAccount, signOut } = useAuthContext();
  const { setCurrentPage } = usePreferencesContext();

  const {
    accountSummary,
    formState,
    status,
    isEditing,
    passwordVisibility,
    showDeleteModal,
    isOAuthAccount,
    canSubmitProfile,
    startEditing,
    cancelEditing,
    updateField,
    togglePasswordVisibility,
    saveProfile,
    requestAccountDeletion,
    confirmAccountDeletion,
    closeDeleteModal,
  } = useProfileManager({
    user,
    updateProfile,
    deleteAccount,
    signOut,
    onNavigateDashboard: () => setCurrentPage('dashboard'),
  });

  return (
    <section className='mx-auto w-full max-w-5xl px-4 pt-8 pb-12 lg:px-0'>
      <ProfileHeader onBack={() => setCurrentPage('dashboard')} />

      <ProfileFeedback status={status} />

      <div className='mt-8 grid gap-6 lg:grid-cols-[280px,1fr]'>
        <ProfileOverviewCard summary={accountSummary} />

        <div className='space-y-6'>
          {!isOAuthAccount ? (
            <div className='space-y-3'>
              <div>
                <h2 className='text-foreground text-lg font-semibold'>Acceso y seguridad</h2>
                <p className='text-muted-foreground text-sm'>
                  Cambia tu correo o contraseña cuando lo necesites.
                </p>
              </div>
              <ProfileSecuritySection
                formState={formState}
                passwordVisibility={passwordVisibility}
                isEditing={isEditing}
                loading={status.loading}
                canSubmit={canSubmitProfile}
                onFieldChange={updateField}
                onTogglePassword={togglePasswordVisibility}
                onStartEditing={startEditing}
                onCancelEditing={cancelEditing}
                onSave={saveProfile}
              />
            </div>
          ) : null}

          <div className='space-y-3'>
            <div>
              <h2 className='text-foreground text-lg font-semibold'>Privacidad y datos</h2>
              <p className='text-muted-foreground text-sm'>
                Configura cookies y ejerce tus derechos sobre los datos personales.
              </p>
            </div>
            <PrivacySettings
              onExportData={async () => {
                if (user?.id) {
                  await gdprDataService.downloadUserData(user.id);
                }
              }}
              onDeleteData={async () => {
                if (user?.id) {
                  await gdprDataService.deleteUserData(user.id);
                }
              }}
            />
          </div>

          <div className='space-y-3'>
            <div>
              <h2 className='text-destructive text-lg font-semibold'>Zona sensible</h2>
              <p className='text-muted-foreground text-sm'>
                Acciones irreversibles relacionadas con la cuenta.
              </p>
            </div>
            <AccountDeletionSection
              currentPassword={formState.currentPassword}
              passwordVisible={passwordVisibility.currentPassword}
              loading={status.loading}
              isOAuthAccount={isOAuthAccount}
              onFieldChange={updateField}
              onTogglePassword={() => togglePasswordVisibility('currentPassword')}
              onDelete={requestAccountDeletion}
            />
          </div>
        </div>
      </div>

      <DeleteAccountModal
        open={showDeleteModal}
        loading={status.loading}
        onCancel={closeDeleteModal}
        onConfirm={confirmAccountDeletion}
      />
    </section>
  );
};

export { Profile };
