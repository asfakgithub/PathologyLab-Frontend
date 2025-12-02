import React, { createContext, useState, useEffect, useCallback } from 'react';
import { getSettings, updateSettings as updateSettingsAPI } from '../services/settingsService';

const initialState = {
  dashboard: [
    { widgetKey: 'patient_stats', isVisible: true },
    { widgetKey: 'tests_conducted_stats', isVisible: true },
    { widgetKey: 'invoices_stats', isVisible: true },
    { widgetKey: 'revenue_chart', isVisible: true },
    { widgetKey: 'recent_reports', isVisible: true },
    { widgetKey: 'test_status_chart', isVisible: true },
  ],
  theme: { themeName: 'Light' },
  invoice: {
    defaultGST: 0,
    discountPercent: 0,
    additionalCharges: 0,
    allowEdit: true,
    allowDelete: true,
    billingEnabled: true,
  },
  notifications: {
    notificationsEnabled: true,
    channels: {
      email: true,
      sms: false,
    },
  },
  organization: {
    name: '',
    address: '',
    license: '',
    headerImage: '',
    footerImage: '',
  },
};

export const SettingsContext = createContext({
  settings: initialState,
  loading: true,
  updateSettings: async () => {},
});

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(initialState);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await getSettings();
        const settingsData = response.data;
        if (settingsData) {
          // Merge dashboard widgets to ensure new widgets are included
          const serverDashboardKeys = new Set((settingsData.dashboard || []).map(w => w.widgetKey));
          const clientOnlyWidgets = initialState.dashboard.filter(w => !serverDashboardKeys.has(w.widgetKey));
          const mergedDashboard = [...(settingsData.dashboard || []), ...clientOnlyWidgets];

          setSettings(prev => ({
            ...prev,
            ...settingsData,
            dashboard: mergedDashboard,
            theme: { ...prev.theme, ...(settingsData.theme || {}) },
            invoice: { ...prev.invoice, ...(settingsData.invoice || {}) },
            notifications: {
              ...prev.notifications,
              ...(settingsData.notifications || {}),
              channels: {
                ...prev.notifications.channels,
                ...((settingsData.notifications && settingsData.notifications.channels) || {})
              }
            },
            organization: { ...prev.organization, ...(settingsData.organization || {}) },
          }));
        }
      } catch (error) {
        console.error('Failed to fetch settings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const updateSettings = useCallback(async (newSettings) => {
    try {
      const response = await updateSettingsAPI(newSettings);
      const updatedData = response.data;
      // After updating, re-merge with initial state to ensure data integrity
      const serverDashboardKeys = new Set((updatedData.dashboard || []).map(w => w.widgetKey));
      const clientOnlyWidgets = initialState.dashboard.filter(w => !serverDashboardKeys.has(w.widgetKey));
      const mergedDashboard = [...(updatedData.dashboard || []), ...clientOnlyWidgets];
      
      const mergedSettings = {
        ...initialState,
        ...updatedData,
        dashboard: mergedDashboard,
        theme: { ...initialState.theme, ...(updatedData.theme || {}) },
        invoice: { ...initialState.invoice, ...(updatedData.invoice || {}) },
        notifications: {
          ...initialState.notifications,
          ...(updatedData.notifications || {}),
          channels: {
            ...initialState.notifications.channels,
            ...((updatedData.notifications && updatedData.notifications.channels) || {})
          }
        },
        organization: { ...initialState.organization, ...(updatedData.organization || {}) },
      };

      setSettings(mergedSettings);
      return mergedSettings;
    } catch (error) {
      console.error('Failed to update settings:', error);
      throw error;
    }
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, loading, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};