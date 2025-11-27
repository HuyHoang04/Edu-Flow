import { Injectable } from '@nestjs/common';
import { NodeExecutor, NodeExecutionResult } from './node-executor.interface';
import { NotificationsService } from '../../notifications/notifications.service';

@Injectable()
export class SendNotificationExecutor implements NodeExecutor {
  constructor(private readonly notificationsService: NotificationsService) {}

  async execute(node: any, context: any): Promise<NodeExecutionResult> {
    const { recipientId, title, message, type } = node.data;

    // Replace variables in message (e.g. {{code}})
    const finalMessage = this.replaceVariables(message, context);
    const finalRecipientId = this.replaceVariables(recipientId, context);
    const finalTitle = this.replaceVariables(title, context);

    await this.notificationsService.create({
      recipientId: finalRecipientId,
      title: finalTitle,
      message: finalMessage,
      type: type || 'info',
    });

    return {
      success: true,
      output: { sent: true },
    };
  }

  private replaceVariables(text: string, context: any): string {
    if (!text) return '';
    return text.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
      return context[key.trim()] || match;
    });
  }
}
