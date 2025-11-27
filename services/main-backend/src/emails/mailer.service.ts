import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

export interface EmailOptions {
  to: string[];
  subject: string;
  html: string;
  text?: string;
}

@Injectable()
export class MailerService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.configService.get('GMAIL_USER'),
        pass: this.configService.get('GMAIL_APP_PASSWORD'),
      },
    });
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      const mailOptions = {
        from: this.configService.get('GMAIL_USER'),
        to: options.to.join(', '),
        subject: options.subject,
        html: options.html,
        text: options.text || '',
      };

      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('Email send error:', error);
      return false;
    }
  }

  async sendBulkEmails(
    recipients: string[],
    subject: string,
    html: string,
  ): Promise<{ sent: number; failed: number }> {
    let sent = 0;
    let failed = 0;

    // Send in batches to avoid rate limiting
    const batchSize = 10;
    for (let i = 0; i < recipients.length; i += batchSize) {
      const batch = recipients.slice(i, i + batchSize);
      const promises = batch.map((email) =>
        this.sendEmail({ to: [email], subject, html }),
      );

      const results = await Promise.all(promises);
      sent += results.filter((r) => r).length;
      failed += results.filter((r) => !r).length;

      // Rate limiting delay
      if (i + batchSize < recipients.length) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    return { sent, failed };
  }

  async sendTemplateEmail(
    to: string[],
    template: string,
    variables: Record<string, any>,
  ): Promise<boolean> {
    // Simple template replacement
    let html = template;
    Object.keys(variables).forEach((key) => {
      html = html.replace(new RegExp(`{{${key}}}`, 'g'), variables[key]);
    });

    return this.sendEmail({ to, subject: variables.subject || 'Email', html });
  }
}
