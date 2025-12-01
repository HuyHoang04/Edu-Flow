import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './notification.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationsRepository: Repository<Notification>,
  ) { }

  async create(data: Partial<Notification>): Promise<Notification> {
    const notification = this.notificationsRepository.create(data);
    return this.notificationsRepository.save(notification);
  }

  async findAll(recipientId: string): Promise<Notification[]> {
    return this.notificationsRepository.find({
      where: { recipientId },
      order: { createdAt: 'DESC' },
    });
  }

  async markAsRead(id: string, userId: string): Promise<void> {
    await this.notificationsRepository.update(
      { id, recipientId: userId },
      { isRead: true },
    );
  }
}
