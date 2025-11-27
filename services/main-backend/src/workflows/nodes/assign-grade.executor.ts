import { Injectable } from '@nestjs/common';
import { NodeExecutor, NodeExecutionResult } from './node-executor.interface';
import { ExamsService } from '../../exams/exams.service';

@Injectable()
export class AssignGradeNodeExecutor implements NodeExecutor {
    constructor(private examsService: ExamsService) { }

    async execute(node: any, context: any, execution: any, workflow?: any): Promise<NodeExecutionResult> {
        console.log(`[AssignGradeNode] Executing for node: ${node.id}`);

        const { resultId, score, feedback } = node.data;
        const targetResultId = resultId || context.resultId;

        if (!targetResultId) {
            console.warn('[AssignGradeNode] No resultId found in data or context');
            return { success: false, error: 'No resultId provided' };
        }

        // Update the result
        const updatedResult = await this.examsService.updateResult(targetResultId, {
            score: Number(score),
            feedback: feedback,
            passed: Number(score) >= 50 // Default logic, can be improved
        });

        console.log(`[AssignGradeNode] Updated result: ${updatedResult.id} with score ${score}`);

        context.updatedResult = updatedResult;

        return {
            success: true,
            output: {
                updatedResult
            }
        };
    }
}
