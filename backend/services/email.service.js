/**
 * Email Service using Nodemailer
 * Handles reliable sending of emails (with Ethereal fallback preview for development)
 */

const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = null;
    // Attempt initialization immediately
    this.initTransporter();
  }

  async initTransporter() {
    if (this.transporter) return;

    if (process.env.SMTP_HOST) {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT || 587,
        secure: process.env.SMTP_SECURE === 'true' || process.env.SMTP_PORT == 465,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
      console.log('SMTP transporter initialized with custom configuration.');
    } else {
      // Create a test account on Ethereal for out-of-the-box local testing/preview
      try {
        const testAccount = await nodemailer.createTestAccount();
        this.transporter = nodemailer.createTransport({
          host: 'smtp.ethereal.email',
          port: 587,
          secure: false,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass,
          },
        });
        console.log('Ethereal email test account created for reliable password reset fallback previews.');
      } catch (err) {
        console.error('Failed to create Ethereal test account:', err);
      }
    }
  }

  async sendPasswordResetEmail(to, firstName, resetToken, userType) {
    if (!this.transporter) {
      await this.initTransporter();
    }

    if (!this.transporter) {
      console.warn('No email transporter available to send mail.');
      return { success: false, error: 'Transporter not available' };
    }

    const htmlContent = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #eaeaea; border-radius: 16px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h2 style="color: #006633; margin: 0; font-size: 24px;">CUI Vehari</h2>
          <p style="color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; margin-top: 4px;">Clearance System Protocol</p>
        </div>
        <p style="color: #333; font-size: 16px;">Dear <strong>${firstName}</strong>,</p>
        <p style="color: #555; font-size: 15px; line-height: 1.6;">A password reset request has been initiated for your <strong>${userType}</strong> access credential. To verify your identity and define a new access secret, use the authorization token below:</p>
        
        <div style="background-color: #f8fafc; border: 2px dashed #cbd5e1; padding: 20px; text-align: center; font-size: 28px; font-weight: 900; letter-spacing: 6px; border-radius: 12px; margin: 30px 0; color: #0f172a;">
          ${resetToken}
        </div>
        
        <p style="color: #555; font-size: 15px; line-height: 1.6;">Please return to the login interface, input this secret token along with your new password to successfully regain terminal control.</p>
        <p style="color: #94a3b8; font-size: 13px; margin-top: 30px;">If you did not authorize this action, please ignore this communication immediately. The token remains active for exactly 60 minutes.</p>
        
        <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 30px 0;" />
        <div style="text-align: center; color: #cbd5e1; font-size: 11px;">
          Institutional Matrix Node &copy; ${new Date().getFullYear()}
        </div>
      </div>
    `;

    try {
      const info = await this.transporter.sendMail({
        from: '"CUI Vehari Clearance" <noreply@cuivehari.edu.pk>',
        to: to,
        subject: 'Secure Access Recovery - Clearance System',
        html: htmlContent,
      });

      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        console.log('\n=================================================================');
        console.log('⚡ PASSWORD RESET EMAIL DISPATCHED (PREVIEW URL AVAILABLE):');
        console.log(previewUrl);
        console.log('=================================================================\n');
      }

      return {
        success: true,
        messageId: info.messageId,
        previewUrl: previewUrl || null
      };
    } catch (error) {
      console.error('Error sending password reset email via Nodemailer:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new EmailService();
