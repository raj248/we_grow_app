import { create } from 'zustand';

interface SnackbarState {
  visible: boolean;
  message: string;
  duration?: number;
  showSnackbar: (message: string, duration?: number) => void;
  hideSnackbar: () => void;
}

export const useSnackbarStore = create<SnackbarState>((set) => ({
  visible: false,
  message: '',
  duration: 3000,
  showSnackbar: (message, duration = 3000) => set({ visible: true, message, duration }),
  hideSnackbar: () => set({ visible: false }),
}));
