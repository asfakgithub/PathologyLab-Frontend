import axios from 'axios';

/**
 * API Configuration and Error Handling
 */

// Create axios instance with default configuration
const apiClient = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000',
    timeout: 15000, // 15 seconds timeout
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor for logging and authentication
apiClient.interceptors.request.use(
    (config) => {
        // Log request in development
        if (process.env.NODE_ENV === 'development') {
            console.log('🚀 API Request:', {
                method: config.method?.toUpperCase(),
                url: config.url,
                data: config.data,
                headers: config.headers,
            });
        }
        
        // Add authentication token if available
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        
        return config;
    },
    (error) => {
        console.error('❌ Request Error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor for consistent error handling
apiClient.interceptors.response.use(
    (response) => {
        // Log successful response in development
        if (process.env.NODE_ENV === 'development') {
            console.log('✅ API Response:', {
                status: response.status,
                data: response.data,
                url: response.config.url,
            });
        }
        return response;
    },
    (error) => {
        // Enhanced error handling
        const errorResponse = {
            message: 'An unexpected error occurred',
            statusCode: 500,
            errorCode: 'UNKNOWN_ERROR',
            details: null,
        };

        if (error.response) {
            // Server responded with error status
            const { status, data } = error.response;
            errorResponse.statusCode = status;
            errorResponse.message = data?.message || `Server Error: ${status}`;
            errorResponse.errorCode = data?.errorCode || `HTTP_${status}`;
            errorResponse.details = data?.details || null;
        } else if (error.request) {
            // Request made but no response received
            errorResponse.message = 'Network error - please check your connection';
            errorResponse.errorCode = 'NETWORK_ERROR';
            errorResponse.statusCode = 0;
        } else {
            // Something else happened
            errorResponse.message = error.message || 'Request setup error';
            errorResponse.errorCode = 'REQUEST_ERROR';
        }

        // Log error in development
        if (process.env.NODE_ENV === 'development') {
            console.error('❌ API Error:', errorResponse);
        }

        return Promise.reject(errorResponse);
    }
);

/**
 * API Service Methods
 */
export const apiService = {
    // Patient APIs
    patients: {
        create: (patientData) => apiClient.post('/api/v1/patient', patientData),
        getById: (id) => apiClient.get(`/api/v1/patient/${id}`),
        getByStatus: (status, params = {}) => apiClient.get(`/api/v1/patient/status/${status}`, { params }),
        update: (id, patientData) => apiClient.put(`/api/v1/patient/${id}`, patientData),
        delete: (id) => apiClient.delete(`/api/v1/patient/${id}`),
        getTestDetails: (id) => apiClient.get(`/api/v1/patient/test-details/${id}`),
    },

    // Test APIs
    tests: {
        getAll: (params = {}) => apiClient.get('/api/v1/test/get', { params }),
        getById: (id) => apiClient.get(`/api/v1/test/${id}`),
        create: (testData) => apiClient.post('/api/v1/test', testData),
        update: (id, testData) => apiClient.put(`/api/v1/test/${id}`, testData),
        delete: (id) => apiClient.delete(`/api/v1/test/${id}`),
        
        // Subtest APIs
        subtests: {
            add: (testId, subtestData) => apiClient.post(`/api/v1/test/subtest/${testId}`, subtestData),
            update: (testId, subtestId, subtestData) => apiClient.put(`/api/v1/test/subtest/${testId}/${subtestId}`, subtestData),
            delete: (testId, subtestId) => apiClient.delete(`/api/v1/test/subtest/${testId}/${subtestId}`),
        },
    },

    // Health check
    health: () => apiClient.get('/health'),
};

/**
 * Error Handler Utility
 */
export const handleApiError = (error, customMessage = null) => {
    let userMessage = customMessage || error.message;
    
    // Customize messages based on error codes
    switch (error.errorCode) {
        case 'NETWORK_ERROR':
            userMessage = 'Unable to connect to server. Please check your internet connection.';
            break;
        case 'VALIDATION_ERROR':
            userMessage = `Validation failed: ${error.details?.join(', ') || error.message}`;
            break;
        case 'PATIENT_NOT_FOUND':
            userMessage = 'Patient not found. Please check the patient ID.';
            break;
        case 'DUPLICATE_PATIENT':
            userMessage = 'A patient with this mobile number already exists.';
            break;
        case 'INVALID_ID':
            userMessage = 'Invalid ID format. Please check and try again.';
            break;
        default:
            if (error.statusCode >= 500) {
                userMessage = 'Server error occurred. Please try again later.';
            }
    }
    
    return {
        ...error,
        userMessage,
    };
};

/**
 * Retry utility for failed requests
 */
export const retryRequest = async (apiCall, maxRetries = 3, delay = 1000) => {
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await apiCall();
        } catch (error) {
            if (i === maxRetries - 1 || error.statusCode < 500) {
                throw error;
            }
            
            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
        }
    }
};

export default apiClient;
