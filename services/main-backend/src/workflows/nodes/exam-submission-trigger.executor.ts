import { Injectable } from '@nestjs/common';
import { BaseNodeExecutor } from './base-node.executor';
import { NodeExecutionResult } from './node-executor.interface';
import { WorkflowExecution } from '../workflow-execution.entity';

@Injectable()
export class ExamSubmissionTriggerExecutor extends BaseNodeExecutor {
    async execute(
        node: any,
        context: Record<string, any>,
        execution: WorkflowExecution,
        workflow?: any,
    ): Promise<NodeExecutionResult> {
        // In a real implementation, this would be triggered by an event listener
        // For now, we just pass through the context provided by the trigger event
        return {
            success: true,
            output: {
                studentId: context.studentId,
                examId: context.examId,
                submissionId: context.submissionId,
                timestamp: new Date().toISOString(),
            },
        };
    }

    getDefinition(): import('../node-definition.interface').NodeDefinition {
        return {
            type: 'exam-submission-trigger',
            label: 'Exam Submitted',
            category: 'Trigger',
            description: 'Triggers when a student submits an exam.',
            fields: [
                {
                    name: 'examId',
                    label: 'Exam',
                    type: 'select',
                    dynamicOptions: 'exams',
                    placeholder: 'Any Exam (or select specific)',
                },
            ],
            inputs: [],
            outputs: [
                { id: 'out', type: 'source', label: 'On Submit' },
            ],
            outputVariables: [
                { name: 'studentId', label: 'Student ID', description: 'ID of the student who submitted' },
                { name: 'examId', label: 'Exam ID', description: 'ID of the exam' },
                { name: 'submissionId', label: 'Submission ID', description: 'ID of the submission' },
            ],
        };
    }
}
