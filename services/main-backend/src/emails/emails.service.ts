import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Email } from './email.entity';
import { MailerService } from './mailer.service';

export interface SendEmailDto {
    recipients: string[];
    subject: string;
    body: string;
    sentBy: string;
    metadata?: Record<string, any>;
}

@Injectable()
export class EmailsService {
    constructor(
        @InjectRepository(Email)
        private emailsRepository: Repository<Email>,
        private mailerService: MailerService,
    ) { }

    async findAll(sentBy?: string): Promise<Email[]> {
        if (sentBy) {
            return this.emailsRepository.find({ where: { sentBy } });
        }
        return this.emailsRepository.find({ order: { createdAt: 'DESC' } });
    }

    async findById(id: string): Promise<Email | null> {
        return this.emailsRepository.findOne({ where: { id } });
    }

    async sendEmail(emailData: SendEmailDto): Promise<Email> {
        // Create email record
        const email = this.emailsRepository.create({
            ...emailData,
            status: 'pending',
        });
        await this.emailsRepository.save(email);

        // Send email
        try {
            const success = await this.mailerService.sendEmail({
                to: emailData.recipients,
                subject: emailData.subject,
                html: emailData.body,
            });

            if (success) {
                email.status = 'sent';
                email.sentAt = new Date();
            } else {
                email.status = 'failed';
                email.errorMessage = 'Failed to send email';
            }
        } catch (error) {
            email.status = 'failed';
            email.errorMessage = error.message;
        }

        return this.emailsRepository.save(email);
    }

    async sendBulkEmail(emailData: SendEmailDto): Promise<Email> {
        const email = this.emailsRepository.create({
            ...emailData,
            status: 'pending',
        });
        await this.emailsRepository.save(email);

        try {
            const { sent, failed } = await this.mailerService.sendBulkEmails(
                emailData.recipients,
                emailData.subject,
                emailData.body,
            );

            if (failed === 0) {
                email.status = 'sent';
                email.sentAt = new Date();
            } else if (sent > 0) {
                email.status = 'sent';
                email.sentAt = new Date();
                email.errorMessage = `Partially sent: ${sent} succeeded, ${failed} failed`;
            } else {
                email.status = 'failed';
                email.errorMessage = 'All emails failed to send';
            }
        } catch (error) {
            email.status = 'failed';
            email.errorMessage = error.message;
        }

        return this.emailsRepository.save(email);
    }

    async sendToClass(
        classId: string,
        subject: string,
        body: string,
        sentBy: string,
    ): Promise<Email> {
        // This would need to fetch students from class
        // For now, returning a placeholder
        // In real implementation, fetch students from ClassesService
        return this.sendEmail({
            recipients: [], // Would fetch from students in class
            subject,
            body,
            sentBy,
            metadata: { classId },
        });
    }

    async getEmailStats(sentBy: string) {
        const emails = await this.emailsRepository.find({ where: { sentBy } });
        const total = emails.length;
        const sent = emails.filter((e) => e.status === 'sent').length;
        const failed = emails.filter((e) => e.status === 'failed').length;
        const pending = emails.filter((e) => e.status === 'pending').length;

        return {
            total,
            sent,
            failed,
            pending,
            successRate: total > 0 ? (sent / total) * 100 : 0,
        };
    }
}
