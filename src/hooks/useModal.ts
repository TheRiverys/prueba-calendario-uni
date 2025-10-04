import { useEffect, useMemo, useState } from 'react';
import { format, parseISO } from 'date-fns';
import type { Delivery, FormData } from '../types';

const toIsoDate = (value: string): string => {
  const parsed = parseISO(value);
  if (!Number.isNaN(parsed.getTime())) {
    return format(parsed, 'yyyy-MM-dd');
  }
  const fallback = new Date(value);
  if (!Number.isNaN(fallback.getTime())) {
    return format(fallback, 'yyyy-MM-dd');
  }
  return format(new Date(), 'yyyy-MM-dd');
};

const buildEmptyForm = (defaultStart: string): FormData => ({
  subject: '',
  name: '',
  date: '',
  studyStart: defaultStart,
  priority: 'normal',
});

interface ModalState {
  modalOpen: boolean;
  editingDelivery: Delivery | null;
  formData: FormData;
  openModal: (delivery?: Delivery | null) => void;
  closeModal: () => void;
  handleInputChange: (field: keyof FormData, value: string) => void;
  setFormData: (data: FormData) => void;
}

export const useModal = (defaultStudyStart: string): ModalState => {
  const resolvedDefaultStart = useMemo(() => toIsoDate(defaultStudyStart), [defaultStudyStart]);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editingDelivery, setEditingDelivery] = useState<Delivery | null>(null);
  const [formData, setFormData] = useState<FormData>(() => buildEmptyForm(resolvedDefaultStart));

  useEffect(() => {
    if (!modalOpen && !editingDelivery) {
      setFormData(buildEmptyForm(resolvedDefaultStart));
    }
  }, [modalOpen, editingDelivery, resolvedDefaultStart]);

  const openModal = (delivery: Delivery | null = null) => {
    if (delivery) {
      setEditingDelivery(delivery);
      setFormData({
        subject: delivery.subject,
        name: delivery.name,
        date: toIsoDate(delivery.date),
        studyStart: delivery.studyStart ? toIsoDate(delivery.studyStart) : resolvedDefaultStart,
        priority: delivery.priority,
      });
    } else {
      setEditingDelivery(null);
      setFormData(buildEmptyForm(resolvedDefaultStart));
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingDelivery(null);
    setFormData(buildEmptyForm(resolvedDefaultStart));
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return {
    modalOpen,
    editingDelivery,
    formData,
    openModal,
    closeModal,
    handleInputChange,
    setFormData,
  };
};
