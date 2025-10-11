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
    oauthInfo,
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

      <div className='mt-8 grid gap-6 lg:grid-cols-[280px,1fr]'>
        <ProfileOverviewCard summary={accountSummary} />

        <div className='space-y-6'>
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

          <AccountDeletionSection
            currentPassword={formState.currentPassword}
            passwordVisible={passwordVisibility.currentPassword}
            loading={status.loading}
            isOAuthAccount={isOAuthAccount}
            oauthInfo={oauthInfo}
            onFieldChange={updateField}
            onTogglePassword={() => togglePasswordVisibility('currentPassword')}
            onDelete={requestAccountDeletion}
          />
        </div>
      </div>

      <div className='mt-8'>
        <h2 className='mb-4 text-2xl font-bold text-gray-900 dark:text-white'>
          Configuración de Privacidad (GDPR)
        </h2>
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

      <ProfileFeedback status={status} />

      <DeleteAccountModal
        open={showDeleteModal}
        oauthInfo={oauthInfo}
        loading={status.loading}
        onCancel={closeDeleteModal}
        onConfirm={confirmAccountDeletion}
      />
    </section>
  );
};

export { Profile };
