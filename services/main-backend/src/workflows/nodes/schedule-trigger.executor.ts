import { Injectable } from '@nestjs/common';
import { BaseNodeExecutor } from './base-node.executor';
import { NodeExecutionResult } from './node-executor.interface';
import { WorkflowExecution } from '../workflow-execution.entity';

@Injectable()
export class ScheduleTriggerExecutor extends BaseNodeExecutor {
    async execute(
        node: any,
        context: Record<string, any>,
        execution: WorkflowExecution,
        workflow?: any,
    ): Promise<NodeExecutionResult> {
        return {
            success: true,
            output: {
                timestamp: new Date().toISOString(),
            },
        };
    }

    getDefinition(): import('../node-definition.interface').NodeDefinition {
        return {
            type: 'schedule-trigger',
            label: 'Schedule',
            category: 'Trigger',
            description: 'Triggers at a specific time or interval.',
            fields: [
                {
                    name: 'cron',
                    label: 'Cron Expression',
                    type: 'text',
                    placeholder: '0 8 * * * (Every day at 8am)',
                },
                {
                    name: 'timezone',
                    label: 'Timezone',
                    type: 'select',
                    options: [
                        { label: 'UTC', value: 'UTC' },
                        { label: 'Vietnam (GMT+7)', value: 'Asia/Ho_Chi_Minh' }
                    ],
                    defaultValue: 'Asia/Ho_Chi_Minh'
                }
            ],
            inputs: [],
            outputs: [
                { id: 'out', type: 'source', label: 'Time' },
            ],
        };
    }
}
