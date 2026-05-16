
export interface Notification {
  id: string;
  message: string;
  duration?: number;
}

type NotificationListener = (notifications: Notification[]) => void;

class NotificationStore {
  private notifications: Notification[] = [];
  private listeners: Set<NotificationListener> = new Set();

  constructor() {}

  add(message: string, duration: number = 3000) {
    const id = Math.random().toString(36).substr(2, 9);
    const notification = { id, message, duration };
    this.notifications.push(notification);
    this.notify();

    if (duration > 0) {
      setTimeout(() => {
        this.remove(id);
      }, duration);
    }
  }

  remove(id: string) {
    this.notifications = this.notifications.filter(n => n.id !== id);
    this.notify();
  }

  subscribe(listener: NotificationListener): () => void {
    this.listeners.add(listener);
    listener(this.notifications); // Initial call
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach(listener => listener(this.notifications));
  }
}

export const notificationStore = new NotificationStore();
