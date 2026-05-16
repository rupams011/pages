"use client";

import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { notificationStore, Notification } from '../../store/NotificationStore';
import { colorStore } from '../../store/ColorStore';
import Toast from './Toast';

export default function NotificationContainer() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [accentColor, setAccentColor] = useState(colorStore.getColor());

  useEffect(() => {
    const unsubNotify = notificationStore.subscribe((list) => {
      setNotifications([...list]);
    });

    const unsubColor = colorStore.subscribe((state) => {
        setAccentColor(state.color); // or state.color directly if using old listener type, but we updated it
    });

    return () => {
      unsubNotify();
      unsubColor();
    };
  }, []);

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none" style={{ zIndex: 10000 }}>
      <AnimatePresence mode="popLayout">
        {notifications.map((notification) => (
          <motion.div 
            key={notification.id} 
            layout
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className="pointer-events-auto"
          >
             <Toast 
                notification={notification} 
                onDismiss={(id) => notificationStore.remove(id)} 
                styleColor={accentColor} 
             />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
