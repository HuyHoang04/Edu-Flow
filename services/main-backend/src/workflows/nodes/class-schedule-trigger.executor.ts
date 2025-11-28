import { Injectable } from '@nestjs/common';
import { BaseNodeExecutor } from './base-node.executor';
import { NodeExecutionResult } from './node-executor.interface';
import { WorkflowExecution } from '../workflow-execution.entity';

@Injectable()
export class ClassScheduleTriggerExecutor extends BaseNodeExecutor {
    async execute(
        node: any,
        context: Record<string, any>,
        execution: WorkflowExecution,
        workflow?: any,
    ): Promise<NodeExecutionResult> {
        // This would be triggered by the scheduler checking class times
        return {
            success: true,
            output: {
                classId: context.classId,
                className: context.className,
                startTime: context.startTime,
                endTime: context.endTime,
                triggerPoint: context.triggerPoint, // e.g., 'before_start'
                timestamp: new Date().toISOString(),
            },
        };
    }

    getDefinition(): import('../node-definition.interface').NodeDefinition {
        return {
            type: 'class-schedule-trigger',
            label: 'Class Schedule',
            category: 'Trigger',
            description: 'Triggers based on class sessions (e.g., 15 mins before start).',
            fields: [
                {
                    name: 'classId',
                    label: 'Class',
                    type: 'select',
                    dynamicOptions: 'classes',
                    placeholder: 'Select Class (or All)',
                },
                {
                    name: 'triggerPoint',
                    label: 'Trigger Point',
                    type: 'select',
                    options: [
                        { label: 'Before Start', value: 'before_start' },
                        { label: 'After Start', value: 'after_start' },
                        { label: 'Before End', value: 'before_end' },
                        { label: 'After End', value: 'after_end' }
                    ],
                    defaultValue: 'before_start'
                },
                {
                    name: 'offsetMinutes',
                    label: 'Offset (Minutes)',
                    type: 'number',
                    defaultValue: 15,
                    placeholder: 'e.g., 15'
                }
            ],
            inputs: [],
            outputs: [
                { id: 'out', type: 'source', label: 'Time' },
            ],
            outputVariables: [
                { name: 'classId', label: 'Class ID', description: 'ID of the class' },
                { name: 'className', label: 'Class Name', description: 'Name of the class' },
                { name: 'startTime', label: 'Start Time', description: 'Start time of the session' },
            ],
        };
    }
}
