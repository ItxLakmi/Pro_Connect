import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(EmailService.name);

  constructor() {
    // Basic config for development (using Ethereal or logging for now)
    // In production, these should come from ConfigService
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.ethereal.email',
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER || 'ethereal.user@ethereal.email', // Replace with ethereal user
        pass: process.env.SMTP_PASS || 'ethereal.pass', // Replace with ethereal pass
      },
    });

    // We don't throw error if connection fails in dev, just log it.
    this.transporter.verify().catch((err) => {
      this.logger.warn(`Email service configuration might be incomplete: ${err.message}`);
    });
  }

  async sendMail(to: string, subject: string, text: string, html?: string) {
    try {
      const info = await this.transporter.sendMail({
        from: `"Pro Connect" <${process.env.SMTP_FROM || 'noreply@proconnect.com'}>`,
        to,
        subject,
        text,
        html: html || text, // Fallback to text if html is not provided
      });
      
      this.logger.log(`Email sent: ${info.messageId}`);
      
      // Useful for testing with ethereal:
      if (process.env.NODE_ENV !== 'production' && info.messageId) {
        this.logger.log(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
      }
      return info;
    } catch (error: any) {
      this.logger.error(`Failed to send email to ${to}: ${error.message}`);
      // Don't throw the error so it doesn't break the flow (e.g. creating a message shouldn't fail just because the email failed)
      return null;
    }
  }

  async sendNewMessageNotification(to: string, senderName: string, messagePreview: string) {
    const subject = `New message from ${senderName}`;
    const text = `You have received a new message from ${senderName} on Pro Connect.\n\n"${messagePreview}"\n\nLog in to reply.`;
    const html = `
      <h3>New message from ${senderName}</h3>
      <p>You have received a new message on Pro Connect.</p>
      <blockquote style="border-left: 4px solid #ccc; padding-left: 10px; color: #555;">
        ${messagePreview}
      </blockquote>
      <p><a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/messages">Click here to reply</a></p>
    `;
    return this.sendMail(to, subject, text, html);
  }

  async sendVerificationEmail(to: string, token: string) {
    const url = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${token}`;
    const subject = `Verify your email address for Pro Connect`;
    const text = `Please verify your email address by clicking the following link: ${url}`;
    const html = `
      <h3>Welcome to Pro Connect!</h3>
      <p>Please click the button below to verify your email address:</p>
      <a href="${url}" style="padding: 10px 20px; background-color: #0070f3; color: white; text-decoration: none; border-radius: 5px;">Verify Email</a>
      <p>Or click this link: <a href="${url}">${url}</a></p>
    `;
    return this.sendMail(to, subject, text, html);
  }

  async sendPasswordResetEmail(to: string, token: string) {
    const url = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
    const subject = `Reset your password for Pro Connect`;
    const text = `You requested a password reset. Please click the following link to reset your password: ${url}`;
    const html = `
      <h3>Password Reset Request</h3>
      <p>We received a request to reset your password for your Pro Connect account. Click the button below to reset it:</p>
      <a href="${url}" style="padding: 10px 20px; background-color: #0070f3; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
      <p>If you didn't request this, you can safely ignore this email.</p>
    `;
    return this.sendMail(to, subject, text, html);
  }
}
