import React, { createContext, useContext, useReducer, useEffect } from 'react';
import authService from '../services/authService';

// Initial state
const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null
};

// Action types
const actionTypes = {
  AUTH_START: 'AUTH_START',
  AUTH_SUCCESS: 'AUTH_SUCCESS',
  AUTH_FAILURE: 'AUTH_FAILURE',
  AUTH_LOGOUT: 'AUTH_LOGOUT',
  CLEAR_ERROR: 'CLEAR_ERROR',
  UPDATE_USER: 'UPDATE_USER'
};

// Auth reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case actionTypes.AUTH_START:
      return {
        ...state,
        isLoading: true,
        error: null
      };
      
    case actionTypes.AUTH_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null
      };
      
    case actionTypes.AUTH_FAILURE:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload.error
      };
      
    case actionTypes.AUTH_LOGOUT:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      };
      
    case actionTypes.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };
      
    case actionTypes.UPDATE_USER:
      return {
        ...state,
        user: { ...state.user, ...action.payload.user }
      };
      
    default:
      return state;
  }
};

// Create context
const AuthContext = createContext();

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check authentication on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    dispatch({ type: actionTypes.AUTH_START });
    
    try {
      if (authService.isAuthenticated()) {
        const result = await authService.verifyToken();
        
        if (result.success) {
          dispatch({
            type: actionTypes.AUTH_SUCCESS,
            payload: {
              user: result.user,
              token: authService.getToken()
            }
          });
        } else {
          dispatch({
            type: actionTypes.AUTH_FAILURE,
            payload: { error: 'Token verification failed' }
          });
        }
      } else {
        dispatch({
          type: actionTypes.AUTH_FAILURE,
          payload: { error: null }
        });
      }
    } catch (error) {
      dispatch({
        type: actionTypes.AUTH_FAILURE,
        payload: { error: error.message }
      });
    }
  };

  const login = async (credentials) => {
    dispatch({ type: actionTypes.AUTH_START });
    
    try {
      const result = await authService.login(credentials);
      
      if (result.success) {
        dispatch({
          type: actionTypes.AUTH_SUCCESS,
          payload: {
            user: result.user,
            token: result.token
          }
        });
        return { success: true };
      } else {
        dispatch({
          type: actionTypes.AUTH_FAILURE,
          payload: { error: result.message }
        });
        return { success: false, message: result.message };
      }
    } catch (error) {
      dispatch({
        type: actionTypes.AUTH_FAILURE,
        payload: { error: error.message }
      });
      return { success: false, message: error.message };
    }
  };

  const register = async (userData) => {
    dispatch({ type: actionTypes.AUTH_START });
    
    try {
      const result = await authService.register(userData);
      
      if (result.success) {
        dispatch({
          type: actionTypes.AUTH_SUCCESS,
          payload: {
            user: result.user,
            token: result.token
          }
        });
        return { success: true };
      } else {
        dispatch({
          type: actionTypes.AUTH_FAILURE,
          payload: { error: result.message }
        });
        return { success: false, message: result.message };
      }
    } catch (error) {
      dispatch({
        type: actionTypes.AUTH_FAILURE,
        payload: { error: error.message }
      });
      return { success: false, message: error.message };
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      dispatch({ type: actionTypes.AUTH_LOGOUT });
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const result = await authService.updateProfile(profileData);
      
      if (result.success) {
        dispatch({
          type: actionTypes.UPDATE_USER,
          payload: { user: result.user }
        });
        return { success: true };
      }
      
      return { success: false, message: result.message };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const changePassword = async (passwordData) => {
    try {
      const result = await authService.changePassword(passwordData);
      return result;
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const forgotPassword = async (email) => {
    try {
      const result = await authService.forgotPassword(email);
      return result;
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const resetPassword = async (token, passwordData) => {
    try {
      const result = await authService.resetPassword(token, passwordData);
      
      if (result.success) {
        dispatch({
          type: actionTypes.AUTH_SUCCESS,
          payload: {
            user: authService.getCurrentUser(),
            token: result.token
          }
        });
      }
      
      return result;
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const clearError = () => {
    dispatch({ type: actionTypes.CLEAR_ERROR });
  };

  // Helper functions
  const hasRole = (role) => {
    return state.user?.role === role;
  };

  const hasAnyRole = (roles) => {
    return roles.includes(state.user?.role);
  };

  const isAdminOrHigher = () => {
    return hasAnyRole(['master', 'admin']);
  };

  const isStaffOrHigher = () => {
    return hasAnyRole(['master', 'admin', 'doctor', 'technician', 'receptionist']);
  };

  const value = {
    // State
    ...state,
    
    // Actions
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    forgotPassword,
    resetPassword,
    clearError,
    checkAuth,
    
    // Helpers
    hasRole,
    hasAnyRole,
    isAdminOrHigher,
    isStaffOrHigher
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

export default AuthContext;
