import { create } from 'zustand';
import { uuid } from '@/lib/uuid';
import { TOAST_AUTO_DISMISS_MS, TOAST_DEDUPE_WINDOW_MS, TOAST_MAX_VISIBLE } from './constants';
import type { Toast, ToastInput, ToastState } from './types';

export const useToastStore = create<ToastState>(() => ({ items: [] }));

export const showToast = (input: ToastInput): void => {
  const now = Date.now();
  const { items } = useToastStore.getState();
  const duplicate = items.find(
    (item) =>
      item.title === input.title &&
      item.description === input.description &&
      now - item.createdAt < TOAST_DEDUPE_WINDOW_MS,
  );
  if (duplicate) return;

  const toast: Toast = {
    id: uuid(),
    tone: input.tone ?? 'info',
    title: input.title,
    description: input.description,
    createdAt: now,
  };
  useToastStore.setState({ items: [...items, toast].slice(-TOAST_MAX_VISIBLE) });
  setTimeout(() => dismissToast(toast.id), TOAST_AUTO_DISMISS_MS);
};

export const dismissToast = (id: string): void => {
  useToastStore.setState((state) => ({ items: state.items.filter((item) => item.id !== id) }));
};
