import React, { useState, useCallback } from 'react';
import { Alert, Snackbar, Slide } from '@mui/material';

/**
 * Global notification context and hook
 */
const NotificationContext = React.createContext();

// Slide transition for notifications
function SlideTransition(props) {
    return <Slide {...props} direction="up" />;
}

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    const [open, setOpen] = useState(false);
    const [currentNotification, setCurrentNotification] = useState(null);

    const showNotification = useCallback((message, type = 'info', duration = 6000) => {
        const id = Date.now();
        const notification = {
            id,
            message,
            type,
            duration,
            timestamp: new Date().toISOString(),
        };

        setNotifications(prev => [...prev, notification]);
        
        // Show the notification immediately if none is currently shown
        if (!open) {
            setCurrentNotification(notification);
            setOpen(true);
        }

        // Auto-remove after duration
        setTimeout(() => {
            removeNotification(id);
        }, duration);

        return id;
    }, [open]);

    const removeNotification = useCallback((id) => {
        setNotifications(prev => prev.filter(notif => notif.id !== id));
    }, []);

    const handleClose = useCallback((event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setOpen(false);
        
        // Show next notification after current one closes
        setTimeout(() => {
            setNotifications(prev => {
                const remaining = prev.filter(notif => notif.id !== currentNotification?.id);
                if (remaining.length > 0) {
                    setCurrentNotification(remaining[0]);
                    setOpen(true);
                }
                return remaining;
            });
        }, 150);
    }, [currentNotification]);

    // Helper methods for different notification types
    const showSuccess = useCallback((message, duration) => 
        showNotification(message, 'success', duration), [showNotification]);
    
    const showError = useCallback((message, duration) => 
        showNotification(message, 'error', duration || 8000), [showNotification]);
    
    const showWarning = useCallback((message, duration) => 
        showNotification(message, 'warning', duration), [showNotification]);
    
    const showInfo = useCallback((message, duration) => 
        showNotification(message, 'info', duration), [showNotification]);

    const contextValue = {
        showNotification,
        showSuccess,
        showError,
        showWarning,
        showInfo,
        removeNotification,
    };

    return (
        <NotificationContext.Provider value={contextValue}>
            {children}
            <Snackbar
                open={open}
                autoHideDuration={currentNotification?.duration || 6000}
                onClose={handleClose}
                TransitionComponent={SlideTransition}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            >
                <Alert
                    onClose={handleClose}
                    severity={currentNotification?.type || 'info'}
                    variant="filled"
                    sx={{ width: '100%' }}
                >
                    {currentNotification?.message}
                </Alert>
            </Snackbar>
        </NotificationContext.Provider>
    );
};

// Custom hook to use notifications
export const useNotification = () => {
    const context = React.useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};

// HOC for error handling
export const withErrorHandling = (WrappedComponent) => {
    return function ErrorHandledComponent(props) {
        const { showError } = useNotification();
        
        const handleError = React.useCallback((error, customMessage) => {
            const errorMessage = customMessage || error?.userMessage || error?.message || 'An unexpected error occurred';
            showError(errorMessage);
            
            // Log error for debugging
            console.error('Component Error:', error);
        }, [showError]);

        return (
            <WrappedComponent
                {...props}
                onError={handleError}
            />
        );
    };
};

export default NotificationContext;
