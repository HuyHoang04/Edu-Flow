import { Injectable } from '@nestjs/common';
import { BaseNodeExecutor } from './base-node.executor';
import { NodeExecutionResult } from './node-executor.interface';
import { WorkflowExecution } from '../workflow-execution.entity';
import { EmailsService } from '../../emails/emails.service';

@Injectable()
export class SendEmailNodeExecutor extends BaseNodeExecutor {
  constructor(private emailsService: EmailsService) {
    super();
  }

  async execute(
    node: any,
    context: Record<string, any>,
    execution: WorkflowExecution,
    workflow?: any,
  ): Promise<NodeExecutionResult> {
    const to = this.getInputValue(node, 'to', context);
    const subject = this.getInputValue(node, 'subject', context);
    const body = this.getInputValue(node, 'body', context);

    if (!to || !subject || !body) {
      return {
        success: false,
        error: 'Missing required fields: to, subject, or body',
      };
    }

    try {
      await this.emailsService.sendEmail({
        recipients: [to], // Assuming single recipient for now, or split by comma
        subject: subject,
        body: body,
        sentBy: execution.triggeredBy || 'system',
      });

      return {
        success: true,
        output: { sentTo: to },
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
  getDefinition(): import('../node-definition.interface').NodeDefinition {
    return {
      type: 'send-email',
      label: 'Send Email',
      category: 'Action',
      description: 'Sends an email to a recipient.',
      fields: [
        { name: 'to', label: 'To', type: 'text', placeholder: 'email@example.com' },
        { name: 'subject', label: 'Subject', type: 'text', placeholder: 'Email Subject' },
        { name: 'body', label: 'Body', type: 'textarea', placeholder: 'Email content...' },
      ],
      inputs: [{ id: 'in', type: 'target', label: 'In' }],
      outputs: [{ id: 'out', type: 'source', label: 'Sent' }],
    };
  }
}
