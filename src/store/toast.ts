import { create } from "zustand";

export interface Toast {
  id: string;
  message: string;
  type: "info" | "success" | "error" | "warning";
  action?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
  duration?: number;
}

interface ToastState {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => string;
  removeToast: (id: string) => void;
}

let idCounter = 0;

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  addToast: (toast) => {
    const id = `toast-${++idCounter}`;
    set((state) => ({ toasts: [...state.toasts, { id, ...toast }] }));
    if (toast.duration !== 0) {
      setTimeout(() => {
        set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
      }, toast.duration || 4000);
    }
    return id;
  },
  removeToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));
