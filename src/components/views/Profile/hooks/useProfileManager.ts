import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type SetStateAction,
} from 'react';

import { toast } from '@/components/ui/sonner';
import { getOAuthProviderInfo, type OAuthProviderInfo } from '@/lib/oauthUtils';
import { clearLocalUserData } from '@/utils/storage';

import type {
  PasswordVisibilityState,
  ProfileAccountSummary,
  ProfileFormField,
  ProfileFormState,
  ProfileStatus,
} from '../profileTypes';

interface UseProfileManagerParams {
  user: ProfileAccountSummary['user'];
  updateProfile: (_email?: string, _password?: string) => Promise<string | null>;
  deleteAccount: (_password: string) => Promise<string | null>;
  signOut: () => Promise<string | null>;
  onNavigateDashboard: () => void;
}

export interface UseProfileManagerResult {
  accountSummary: ProfileAccountSummary;
  formState: ProfileFormState;
  status: ProfileStatus;
  isEditing: boolean;
  passwordVisibility: PasswordVisibilityState;
  showDeleteModal: boolean;
  isOAuthAccount: boolean;
  oauthInfo: OAuthProviderInfo;
  canSubmitProfile: boolean;
  startEditing: () => void;
  cancelEditing: () => void;
  updateField: (_field: ProfileFormField, _value: string) => void;
  togglePasswordVisibility: (_field: keyof PasswordVisibilityState) => void;
  saveProfile: () => Promise<void>;
  requestAccountDeletion: () => void;
  confirmAccountDeletion: () => Promise<void>;
  closeDeleteModal: () => void;
}

const INITIAL_FORM_STATE: ProfileFormState = {
  email: '',
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
};

const SUCCESS_UPDATE_MESSAGE = 'Perfil actualizado exitosamente';
const SUCCESS_DELETE_MESSAGE = 'Cuenta eliminada exitosamente';
const PASSWORD_MIN_LENGTH = 6;

type StatusSetter = Dispatch<SetStateAction<ProfileStatus>>;
type EditingSetter = Dispatch<SetStateAction<boolean>>;

type ProfileFormStateParams = Pick<UseProfileManagerParams, 'user' | 'updateProfile'>;

type AccountDeletionParams = Pick<
  UseProfileManagerParams,
  'deleteAccount' | 'signOut' | 'onNavigateDashboard'
> & {
  formState: ProfileFormState;
  setStatus: StatusSetter;
  setIsEditing: EditingSetter;
  resetForm: () => void;
  isOAuthAccount: boolean;
};

interface ProfileFormStateController {
  formState: ProfileFormState;
  status: ProfileStatus;
  isEditing: boolean;
  passwordVisibility: PasswordVisibilityState;
  canSubmitProfile: boolean;
  startEditing: () => void;
  cancelEditing: () => void;
  updateField: (_field: ProfileFormField, _value: string) => void;
  togglePasswordVisibility: (_field: keyof PasswordVisibilityState) => void;
  saveProfile: () => Promise<void>;
  resetForm: () => void;
  setStatus: StatusSetter;
  setIsEditing: EditingSetter;
}

const useProfileFormState = ({
  user,
  updateProfile,
}: ProfileFormStateParams): ProfileFormStateController => {
  const [formState, setFormState] = useState<ProfileFormState>({
    ...INITIAL_FORM_STATE,
    email: user?.email ?? '',
  });
  const [status, setStatus] = useState<ProfileStatus>({
    loading: false,
    error: null,
    success: null,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [passwordVisibility, setPasswordVisibility] = useState<PasswordVisibilityState>({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  useEffect(() => {
    setFormState(previous => ({
      ...previous,
      email: user?.email ?? '',
    }));
  }, [user?.email]);

  const resetSensitiveFields = useCallback(() => {
    setFormState(previous => ({
      ...previous,
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    }));
  }, []);

  const resetForm = useCallback(() => {
    setFormState({ ...INITIAL_FORM_STATE });
    setPasswordVisibility({ currentPassword: false, newPassword: false, confirmPassword: false });
  }, []);

  const updateField = useCallback((field: ProfileFormField, value: string) => {
    setFormState(previous => ({ ...previous, [field]: value }));
    setStatus(previous => ({ ...previous, error: null, success: null }));
  }, []);

  const togglePasswordVisibility = useCallback((field: keyof PasswordVisibilityState) => {
    setPasswordVisibility(previous => ({ ...previous, [field]: !previous[field] }));
  }, []);

  const startEditing = useCallback(() => {
    setIsEditing(true);
    setStatus(previous => ({ ...previous, success: null }));
  }, []);

  const cancelEditing = useCallback(() => {
    setIsEditing(false);
    resetSensitiveFields();
    setStatus(previous => ({ ...previous, error: null }));
  }, [resetSensitiveFields]);

  const validateForm = useCallback((state: ProfileFormState): string | null => {
    if (!state.email.trim()) {
      return 'El correo electrónico es obligatorio';
    }

    if (state.newPassword && state.newPassword.length < PASSWORD_MIN_LENGTH) {
      return 'La contraseña debe tener al menos 6 caracteres';
    }

    if (state.newPassword !== state.confirmPassword) {
      return 'Las contraseñas no coinciden';
    }

    return null;
  }, []);

  const saveProfile = useCallback(async () => {
    const validationMessage = validateForm(formState);
    if (validationMessage) {
      setStatus({ loading: false, error: validationMessage, success: null });
      return;
    }

    setStatus({ loading: true, error: null, success: null });

    try {
      const message = await updateProfile(
        formState.email.trim(),
        formState.newPassword || undefined
      );
      if (message) {
        setStatus({ loading: false, error: message, success: null });
        return;
      }

      setStatus({ loading: false, error: null, success: SUCCESS_UPDATE_MESSAGE });
      setIsEditing(false);
      resetSensitiveFields();
    } catch {
      setStatus({
        loading: false,
        error: 'Error inesperado al actualizar el perfil',
        success: null,
      });
    }
  }, [formState, resetSensitiveFields, updateProfile, validateForm]);

  const canSubmitProfile = useMemo(() => {
    if (status.loading) {
      return false;
    }

    if (!formState.email.trim()) {
      return false;
    }

    if (!formState.newPassword) {
      return true;
    }

    return formState.newPassword === formState.confirmPassword;
  }, [formState.confirmPassword, formState.email, formState.newPassword, status.loading]);

  return {
    formState,
    status,
    isEditing,
    passwordVisibility,
    canSubmitProfile,
    startEditing,
    cancelEditing,
    updateField,
    togglePasswordVisibility,
    saveProfile,
    resetForm,
    setStatus,
    setIsEditing,
  };
};

const useAccountDeletionManager = ({
  formState,
  setStatus,
  setIsEditing,
  resetForm,
  isOAuthAccount,
  deleteAccount,
  signOut,
  onNavigateDashboard,
}: AccountDeletionParams) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const performAccountDeletion = useCallback(async () => {
    setStatus({ loading: true, error: null, success: null });

    try {
      const password = isOAuthAccount ? '' : formState.currentPassword.trim();
      const message = await deleteAccount(password);
      if (message) {
        setStatus({ loading: false, error: message, success: null });
        return;
      }

      toast.success(SUCCESS_DELETE_MESSAGE);

      resetForm();
      setIsEditing(false);

      const signOutError = await signOut();
      if (signOutError) {
        setStatus({ loading: false, error: signOutError, success: null });
        return;
      }

      try {
        clearLocalUserData();
      } catch (storageError) {
        const messageText =
          storageError instanceof Error ? storageError.message : 'Error al limpiar datos locales';
        setStatus({ loading: false, error: messageText, success: null });
        return;
      }

      onNavigateDashboard();
      setStatus({ loading: false, error: null, success: SUCCESS_DELETE_MESSAGE });
    } catch (error) {
      const messageText = error instanceof Error ? error.message : 'Error desconocido';
      setStatus({
        loading: false,
        error: 'Error inesperado al eliminar la cuenta: ' + messageText,
        success: null,
      });
    }
  }, [
    deleteAccount,
    formState.currentPassword,
    isOAuthAccount,
    onNavigateDashboard,
    resetForm,
    setIsEditing,
    setStatus,
    signOut,
  ]);

  const requestAccountDeletion = useCallback(() => {
    if (!isOAuthAccount && !formState.currentPassword.trim()) {
      setStatus({
        loading: false,
        error: 'Debes ingresar tu contraseña actual para confirmar la eliminación',
        success: null,
      });
      return;
    }

    if (isOAuthAccount) {
      setShowDeleteModal(true);
      return;
    }

    void performAccountDeletion();
  }, [formState.currentPassword, isOAuthAccount, performAccountDeletion, setStatus]);

  const confirmAccountDeletion = useCallback(async () => {
    setShowDeleteModal(false);
    await performAccountDeletion();
  }, [performAccountDeletion]);

  const closeDeleteModal = useCallback(() => {
    setShowDeleteModal(false);
  }, []);

  return {
    showDeleteModal,
    requestAccountDeletion,
    confirmAccountDeletion,
    closeDeleteModal,
  };
};

export const useProfileManager = ({
  user,
  updateProfile,
  deleteAccount,
  signOut,
  onNavigateDashboard,
}: UseProfileManagerParams): UseProfileManagerResult => {
  const oauthInfo = useMemo(() => getOAuthProviderInfo(user), [user]);
  const isOAuthAccount = oauthInfo.isGoogle || Boolean(oauthInfo.provider);
  const accountDescription = useMemo(() => {
    if (isOAuthAccount) {
      return 'Cuenta conectada con inicio de sesión externo. Tus datos están sincronizados.';
    }
    return 'Gestiona tu acceso y privacidad desde este panel.';
  }, [isOAuthAccount]);

  const accountSummary = useMemo<ProfileAccountSummary>(
    () => ({
      user: user ?? null,
      description: accountDescription,
    }),
    [user, accountDescription]
  );

  const {
    formState,
    status,
    isEditing,
    passwordVisibility,
    canSubmitProfile,
    startEditing,
    cancelEditing,
    updateField,
    togglePasswordVisibility,
    saveProfile,
    resetForm,
    setStatus,
    setIsEditing,
  } = useProfileFormState({ user, updateProfile });

  const { showDeleteModal, requestAccountDeletion, confirmAccountDeletion, closeDeleteModal } =
    useAccountDeletionManager({
      formState,
      setStatus,
      setIsEditing,
      resetForm,
      isOAuthAccount,
      deleteAccount,
      signOut,
      onNavigateDashboard,
    });

  return {
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
  };
};
