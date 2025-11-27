import { Injectable } from '@nestjs/common';
import { BaseNodeExecutor } from './base-node.executor';
import { NodeExecutionResult } from './node-executor.interface';
import { WorkflowExecution } from '../workflow-execution.entity';

@Injectable()
export class ManualTriggerExecutor extends BaseNodeExecutor {
    async execute(
        node: any,
        context: Record<string, any>,
        execution: WorkflowExecution,
        workflow?: any,
    ): Promise<NodeExecutionResult> {
        return {
            success: true,
            output: {
                triggeredBy: execution.triggeredBy,
                timestamp: new Date().toISOString(),
            },
        };
    }
}
