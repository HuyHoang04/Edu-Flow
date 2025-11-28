import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { NodeExecutor, NodeExecutionResult } from './node-executor.interface';
import { ExamsService } from '../../exams/exams.service';

@Injectable()
export class AssignGradeNodeExecutor implements NodeExecutor {
  constructor(
    @Inject(forwardRef(() => ExamsService))
    private examsService: ExamsService,
  ) { }

  private replaceContextVariables(str: string | number, context: any): any {
    if (typeof str !== 'string') return str;

    // Replace {{variable}} with context values
    return str.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return context[key] !== undefined ? context[key] : match;
    });
  }

  async execute(
    node: any,
    context: any,
    execution: any,
    workflow?: any,
  ): Promise<NodeExecutionResult> {
    console.log(`[AssignGradeNode] Executing for node: ${node.id}`);
    console.log(`[AssignGradeNode] Context:`, JSON.stringify(context, null, 2));

    const { resultId, score, feedback } = node.data;

    // Replace context variables
    const targetResultId =
      this.replaceContextVariables(resultId, context) || context.resultId;
    const targetScore = this.replaceContextVariables(score, context);
    const targetFeedback = this.replaceContextVariables(feedback, context);

    console.log(`[AssignGradeNode] Resolved values:`, {
      targetResultId,
      targetScore,
      targetFeedback,
    });

    if (!targetResultId) {
      console.warn('[AssignGradeNode] No resultId found in data or context');
      return { success: false, error: 'No resultId provided' };
    }

    // Update the result
    const updatedResult = await this.examsService.updateResult(targetResultId, {
      score: Number(targetScore),
      feedback: targetFeedback,
      passed: Number(targetScore) >= 50, // Default logic, can be improved
    });

    console.log(
      `[AssignGradeNode] Updated result: ${updatedResult.id} with score ${targetScore}`,
    );

    context.updatedResult = updatedResult;

    return {
      success: true,
      output: {
        updatedResult,
      },
    };
  }
  getDefinition(): import('../node-definition.interface').NodeDefinition {
    return {
      type: 'assign-grade',
      label: 'Assign Grade',
      category: 'Action',
      description: 'Assigns a grade to a student.',
      fields: [
        { name: 'studentId', label: 'Student ID', type: 'text' },
        { name: 'score', label: 'Score', type: 'number' },
        { name: 'comments', label: 'Comments', type: 'textarea' },
      ],
      inputs: [{ id: 'in', type: 'target', label: 'In' }],
      outputs: [{ id: 'out', type: 'source', label: 'Assigned' }],
    };
  }
}
