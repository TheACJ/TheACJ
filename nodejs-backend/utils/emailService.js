const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  async sendContactEmail(contactData) {
    try {
      const mailOptions = {
        from: `"${contactData.name}" <${process.env.EMAIL_FROM}>`,
        to: process.env.EMAIL_FROM, // Send to yourself
        subject: `New Contact Form: ${contactData.subject}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">New Contact Form Submission</h2>
            <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px;">
              <p><strong>Name:</strong> ${contactData.name}</p>
              <p><strong>Email:</strong> ${contactData.email}</p>
              <p><strong>Subject:</strong> ${contactData.subject}</p>
              <p><strong>Message:</strong></p>
              <div style="background-color: white; padding: 15px; border-radius: 3px; border-left: 4px solid #007bff;">
                ${contactData.message.replace(/\n/g, '<br>')}
              </div>
              <p style="margin-top: 20px; color: #666; font-size: 12px;">
                Received on: ${new Date().toLocaleString()}
              </p>
            </div>
          </div>
        `,
        replyTo: contactData.email
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Email sending failed:', error);
      throw new Error('Failed to send email');
    }
  }

  async sendConfirmationEmail(contactData) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: contactData.email,
        subject: 'Thank you for contacting us!',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Thank you for reaching out!</h2>
            <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px;">
              <p>Dear ${contactData.name},</p>
              <p>Thank you for your message. We have received your inquiry and will get back to you as soon as possible.</p>
              <p><strong>Your message details:</strong></p>
              <ul>
                <li><strong>Subject:</strong> ${contactData.subject}</li>
                <li><strong>Message:</strong> ${contactData.message}</li>
              </ul>
              <p>Best regards,<br>The ACJ Team</p>
            </div>
          </div>
        `
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Confirmation email sent:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Confirmation email failed:', error);
      // Don't throw error for confirmation email failure
      return { success: false, error: error.message };
    }
  }
}

module.exports = new EmailService();