import { useCallback, useContext } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { SettingsContext } from '../../context/SettingsContext';

/**
 * useSystemNotification
 * Sends a system notification message to the backend Messages API.
 * This hook builds a message payload (sender info + text) and posts it to `/messages`.
 * Note: the backend decides the recipient; do not rely on the sender `email` being used
 * as the recipient.
 *
 * Params (object): { firstName, lastName, email, phone, message, sentAt }
 * Returns: sendSystemNotification(payload) -> Promise
 */
const useSystemNotification = () => {
  const { user } = useAuth();
  const { settings } = useContext(SettingsContext);

  const sendSystemNotification = useCallback(async (payload = {}) => {
    if (!settings.notifications?.notificationsEnabled) {
      console.log('Notifications are disabled by global setting. Skipping.');
      return Promise.resolve();
    }
    
    const {
      firstName = 'System',
      lastName = 'Notification',
      email = user?.email || 'sohel@pathologylab.com',
      phone = '9609436103',
      message = 'Message content is required',
      sentAt = new Date(),
      type // 'email', 'sms', 'system'
    } = payload;

    if (type === 'email' && !settings.notifications?.channels?.email) {
      console.log('Email notifications are disabled. Skipping.');
      return Promise.resolve();
    }
    
    if (type === 'sms' && !settings.notifications?.channels?.sms) {
      console.log('SMS notifications are disabled. Skipping.');
      return Promise.resolve();
    }

    // Basic validation
    if (!message || String(message).trim().length < 3) {
      throw new Error('Message content is required');
    }

    const body = { firstName, lastName, email, phone, message, sentAt };

    // Send to backend. The backend endpoint expects /messages (see frontend api base)
    // api.post returns the response data because of the interceptor.
    return api.post('/messages', body);
  }, [user, settings]);

  return { sendSystemNotification };
};

export default useSystemNotification;