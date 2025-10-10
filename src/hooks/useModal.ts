import { format, parseISO } from 'date-fns';
import { useEffect, useState } from 'react';

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

const buildEmptyForm = (): FormData => ({
  subject: '',
  name: '',
  date: '',
  priority: 'normal',
});

interface ModalState {
  modalOpen: boolean;
  editingDelivery: Delivery | null;
  formData: FormData;
  openModal: (_deliveryItem?: Delivery | null) => void;
  closeModal: () => void;
  handleInputChange: (_fieldName: keyof FormData, _inputValue: string) => void;
  setFormData: (_formData: FormData) => void;
}

export const useModal = (): ModalState => {
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editingDelivery, setEditingDelivery] = useState<Delivery | null>(null);
  const [formData, setFormData] = useState<FormData>(() => buildEmptyForm());

  useEffect(() => {
    if (!modalOpen && !editingDelivery) {
      setFormData(buildEmptyForm());
    }
  }, [modalOpen, editingDelivery]);

  const openModal = (deliveryItem: Delivery | null = null) => {
    if (deliveryItem) {
      setEditingDelivery(deliveryItem);
      setFormData({
        subject: deliveryItem.subject,
        name: deliveryItem.name,
        date: toIsoDate(deliveryItem.date),
        priority: deliveryItem.priority,
      });
    } else {
      setEditingDelivery(null);
      setFormData(buildEmptyForm());
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingDelivery(null);
    setFormData(buildEmptyForm());
  };

  const handleInputChange = (fieldName: keyof FormData, inputValue: string) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: inputValue,
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
