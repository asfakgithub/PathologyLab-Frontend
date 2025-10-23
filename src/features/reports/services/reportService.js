/**
 * Report Service
 * =============
 * 
 * Professional service for handling all report-related API operations.
 * Integrates with the backend report management system.
 * 
 * Features:
 * - CRUD operations for reports
 * - PDF generation and download
 * - Email functionality
 * - Organization branding integration
 * 
 * Author: PathologyLab Development Team
 * Created: July 31, 2025
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class ReportService {
  /**
   * Get all reports
   */
  async getAllReports() {
    try {
      const response = await fetch(`${API_BASE_URL}/reports`, {
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
      return { success: true, data: data.reports || data };
    } catch (error) {
      console.error('Error fetching reports:', error);
      return { success: false, error: error.message, data: [] };
    }
  }

  /**
   * Create a new report with organization branding
   */
  async createReport(reportData) {
    try {
      const response = await fetch(`${API_BASE_URL}/reports`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(reportData)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Error creating report:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get a specific report by ID
   */
  async getReportById(reportId) {
    try {
      const response = await fetch(`${API_BASE_URL}/reports/${reportId}`, {
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
      console.error('Error fetching report:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Update a report
   */
  async updateReport(reportId, reportData) {
    try {
      const response = await fetch(`${API_BASE_URL}/reports/${reportId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(reportData)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Error updating report:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete a report
   */
  async deleteReport(reportId) {
    try {
      const response = await fetch(`${API_BASE_URL}/reports/${reportId}`, {
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
      console.error('Error deleting report:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Generate and download PDF for a report
   */
  async generateReportPDF(reportId) {
    try {
      const response = await fetch(`${API_BASE_URL}/reports/${reportId}/pdf`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Handle PDF download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `report-${reportId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      return { success: true };
    } catch (error) {
      console.error('Error generating PDF:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send report via email
   */
  async sendReportEmail(reportId, emailData = {}) {
    try {
      const response = await fetch(`${API_BASE_URL}/reports/${reportId}/email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(emailData)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Error sending email:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Check if patient has existing report
   */
  async checkPatientReport(patientId) {
    try {
      const response = await fetch(`${API_BASE_URL}/reports/patient/${patientId}`, {
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
      console.error('Error checking patient report:', error);
      return { success: false, error: error.message, data: null };
    }
  }

  /**
   * Get reports by patient ID
   */
  async getReportsByPatient(patientId) {
    try {
      const response = await fetch(`${API_BASE_URL}/reports/patient/${patientId}/all`, {
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
      return { success: true, data: data.reports || data };
    } catch (error) {
      console.error('Error fetching patient reports:', error);
      return { success: false, error: error.message, data: [] };
    }
  }
}

// Create and export a singleton instance
const reportService = new ReportService();
export default reportService;
