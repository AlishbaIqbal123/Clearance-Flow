/**
 * Google Apps Script Integration Service
 * Handles communication with the university's Google Workspace automation script
 */

const APPS_SCRIPT_URL = process.env.APPS_SCRIPT_URL;

class AppsScriptService {
  /**
   * Send a request to the Google Apps Script web app
   * @param {string} action - The action to perform (e.g., 'sendNotification')
   * @param {Object} payload - The data for the action
   * @returns {Promise<Object>} The script response
   */
  async _sendRequest(action, payload) {
    if (!APPS_SCRIPT_URL) {
      console.warn('APPS_SCRIPT_URL is not configured in .env. Skipping external request.');
      return { success: false, error: 'Apps Script not configured' };
    }

    try {
      const response = await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          ...payload
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error calling Google Apps Script:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Create a university email for a student
   */
  async createStudentEmail(studentData) {
    return this._sendRequest('createStudentEmail', studentData);
  }

  /**
   * Send a clearance status notification
   */
  async sendClearanceNotification(notificationData) {
    return this._sendRequest('sendNotification', {
      type: 'clearance_status',
      ...notificationData
    });
  }

  /**
   * Send a certificate issuance notification
   */
  async sendCertificateNotification(notificationData) {
    return this._sendRequest('sendNotification', {
      type: 'certificate_issued',
      ...notificationData
    });
  }

  /**
   * Reset student password in Google Workspace
   */
  async resetPassword(email) {
    return this._sendRequest('resetPassword', { email });
  }

  /**
   * Send a password reset link to a user
   */
  async sendPasswordResetLink(notificationData) {
    return this._sendRequest('sendNotification', {
      type: 'password_reset',
      ...notificationData
    });
  }
}

module.exports = new AppsScriptService();
