// store/useNotificationStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface NotificationItem {
  messageId: string;
  title: string;
  body: string;
  sentTime: number;
  data: Record<string, any>;
}

interface NotificationState {
  notifications: NotificationItem[];
  addNotification: (item: NotificationItem) => void;
  clearNotifications: () => void;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: [],
      addNotification: (item) => {
        const exists = get().notifications.some(n => n.messageId === item.messageId);
        if (!exists) {
          set({ notifications: [item, ...get().notifications] });
        }
      },
      clearNotifications: () => set({ notifications: [] }),
    }),
    {
      name: 'notification-store',
    }
  )
);
