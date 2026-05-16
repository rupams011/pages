import React from 'react';
import { colord } from 'colord';
import { Notification } from '../../store/NotificationStore';

interface ToastProps {
  notification: Notification;
  onDismiss: (id: string) => void;
  styleColor: string;
}

export default function Toast({ notification, onDismiss, styleColor }: ToastProps) {
  const isDark = colord(styleColor).isDark();
  const textColor = isDark ? '#ffffff' : '#000000';
  const [active, setActive] = React.useState(false);

  React.useEffect(() => {
    // Small delay to ensure browser registers initial state before transitioning
    const timer = setTimeout(() => {
        setActive(true);
    }, 50);
    return () => clearTimeout(timer);
  }, [notification.id]);

  return (
    <div
      className="relative overflow-hidden w-[400px] min-h-[60px] p-4 pr-8 rounded-xl shadow-xl backdrop-blur-md border border-white/10 flex items-start gap-3 cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-transform bg-black text-white"
      onClick={() => onDismiss(notification.id)}
    >
      <div className="flex-1 text-sm font-medium leading-relaxed break-words text-left">
          {notification.message}
      </div>
      
      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 h-1.5 w-full bg-white/20">
          <style jsx>{`
            @keyframes shrink {
              from { transform: scaleX(1); }
              to { transform: scaleX(0); }
            }
          `}</style>
          <div 
             id={`progress-${notification.id}`}
             className="h-full bg-current origin-left"
             style={{ 
                 width: '100%',
                 animation: `shrink ${notification.duration || 3000}ms linear forwards`
             }}
          />
      </div>
    </div>
  );
}
