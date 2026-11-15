import { create } from 'zustand';

let timer;

export const useToastStore = create((set) => ({
  message: '',
  show: (message, ms = 2500) => {
    clearTimeout(timer);
    set({ message });
    timer = setTimeout(() => set({ message: '' }), ms);
  },
}));
