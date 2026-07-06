import React from 'react';
import { useFinance } from '../context/FinanceContext';
import { AlertTriangle, Info, CheckCircle2, X } from 'lucide-react';

export const NotificationCenter: React.FC = () => {
  const { notifications, markNotificationAsRead } = useFinance();
  const unreadNotifications = notifications.filter(n => !n.read);

  if (unreadNotifications.length === 0) return null;

  return (
    <div className="notification-center-container animate-fade-in">
      <div className="notification-header">
        <span className="notification-title">Proactive Alerts ({unreadNotifications.length})</span>
      </div>
      
      <div className="notifications-list">
        {unreadNotifications.slice(0, 3).map(notification => {
          let Icon = Info;
          let iconColor = 'var(--info)';
          let cardBorder = 'rgba(59, 130, 246, 0.2)';

          if (notification.type === 'alert') {
            Icon = AlertTriangle;
            iconColor = 'var(--danger)';
            cardBorder = 'rgba(239, 68, 68, 0.3)';
          } else if (notification.type === 'warning') {
            Icon = AlertTriangle;
            iconColor = 'var(--warning)';
            cardBorder = 'rgba(245, 158, 11, 0.3)';
          } else if (notification.type === 'success') {
            Icon = CheckCircle2;
            iconColor = 'var(--success)';
            cardBorder = 'rgba(16, 185, 129, 0.3)';
          }

          return (
            <div 
              key={notification.id} 
              className="notification-item glass-panel"
              style={{ borderColor: cardBorder }}
            >
              <div className="notification-item-content">
                <Icon size={18} style={{ color: iconColor }} className="notification-icon-svg" />
                <span className="notification-message">{notification.message}</span>
              </div>
              <button 
                onClick={() => markNotificationAsRead(notification.id)}
                className="notification-close-btn"
                title="Dismiss"
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>

      <style>{`
        .notification-center-container {
          margin-bottom: 1.5rem;
          width: 100%;
        }

        .notification-header {
          display: flex;
          align-items: center;
          margin-bottom: 0.5rem;
          padding-left: 0.25rem;
        }

        .notification-title {
          font-size: 0.8rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-muted);
        }

        .notifications-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .notification-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.75rem 1rem;
          border-radius: 12px;
          background: rgba(24, 28, 41, 0.4);
          animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .notification-item-content {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .notification-icon-svg {
          flex-shrink: 0;
        }

        .notification-message {
          font-size: 0.85rem;
          font-weight: 550;
          color: var(--text-main);
        }

        .notification-close-btn {
          background: transparent;
          border: none;
          color: var(--text-dim);
          cursor: pointer;
          padding: 0.25rem;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
          transition: var(--transition-smooth);
        }

        .notification-close-btn:hover {
          color: var(--text-main);
          background: rgba(255, 255, 255, 0.08);
        }
      `}</style>
    </div>
  );
};
