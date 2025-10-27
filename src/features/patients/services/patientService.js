/**
 * Patient Service
 * ==============
 * 
 * Professional service for handling all patient-related API operations.
 * Manages patient data, medical records, and integration with reports.
 * 
 * Features:
 * - CRUD operations for patients
 * - Patient search and filtering
 * - Medical history management
 * - Integration with report system
 * 
 * Author: PathologyLab Development Team
 * Created: July 31, 2025
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class PatientService {
  /**
   * Get all patients
   */
  async getAllPatients() {
    try {
      const response = await fetch(`${API_BASE_URL}/patients`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return { success: true, data: data.patients || data };
    } catch (error) {
      console.error('Error fetching patients:', error);
      return { success: false, error: error.message, data: [] };
    }
  }

  /**
   * Create a new patient
   */
  async createPatient(patientData) {
    try {
      const response = await fetch(`${API_BASE_URL}/patients`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(patientData)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Error creating patient:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get a specific patient by ID
   */
  async getPatientById(patientId) {
    try {
      const response = await fetch(`${API_BASE_URL}/patients/${patientId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Error fetching patient:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Update a patient
   */
  async updatePatient(patientId, patientData) {
    try {
      const response = await fetch(`${API_BASE_URL}/patients/${patientId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(patientData)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Error updating patient:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete a patient
   */
  async deletePatient(patientId) {
    try {
      const response = await fetch(`${API_BASE_URL}/patients/${patientId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error deleting patient:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Search patients by criteria
   */
  async searchPatients(searchCriteria) {
    try {
      const queryParams = new URLSearchParams(searchCriteria).toString();
      const response = await fetch(`${API_BASE_URL}/patients/search?${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return { success: true, data: data.patients || data };
    } catch (error) {
      console.error('Error searching patients:', error);
      return { success: false, error: error.message, data: [] };
    }
  }

  /**
   * Get patient's medical history
   */
  async getPatientHistory(patientId) {
    try {
      const response = await fetch(`${API_BASE_URL}/patients/${patientId}/history`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Error fetching patient history:', error);
      return { success: false, error: error.message, data: [] };
    }
  }

  /**
   * Add medical record to patient
   */
  async addMedicalRecord(patientId, recordData) {
    try {
      const response = await fetch(`${API_BASE_URL}/patients/${patientId}/records`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(recordData)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Error adding medical record:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get patients with pagination
   */
  async getPatientsPaginated(page = 1, limit = 10) {
    try {
      const response = await fetch(`${API_BASE_URL}/patients?page=${page}&limit=${limit}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Error fetching paginated patients:', error);
      return { success: false, error: error.message, data: { patients: [], total: 0 } };
    }
  }
}

// Create and export a singleton instance
const patientService = new PatientService();
export default patientService;
