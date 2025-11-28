import { Injectable } from '@nestjs/common';
import { NodeExecutor } from './node-executor.interface';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AIGradeExecutor implements NodeExecutor {
  constructor(private configService: ConfigService) { }

  async execute(node: any, context: any): Promise<any> {
    const aiServiceUrl =
      this.configService.get('AI_SERVICE_URL') || 'http://localhost:8001';
    const {
      submissionKey,
      rubric,
      maxScore,
      outputKey = 'aiGradeResult',
    } = node.data;

    try {
      // Get submission from context
      const submission = context[submissionKey];
      if (!submission) {
        throw new Error(
          `Submission not found in context with key: ${submissionKey}`,
        );
      }

      // Replace context variables in rubric
      const processedRubric = this.replaceContextVariables(rubric, context);

      console.log(
        `[AIGradeExecutor] Calling AI service at ${aiServiceUrl}/grade`,
      );

      const response = await axios.post(`${aiServiceUrl}/grade`, {
        submission: submission,
        rubric: processedRubric,
        max_score: Number(maxScore),
      });

      // Store result in context
      context[outputKey] = response.data;
      context[`${outputKey}_score`] = response.data.score;
      context[`${outputKey}_feedback`] = response.data.feedback;

      console.log(
        `[AIGradeExecutor] Graded submission: ${response.data.score}/${maxScore}`,
      );

      return {
        success: true,
        nextNodes: node.data.nextNodes || [],
        context,
      };
    } catch (error: any) {
      console.error('[AIGradeExecutor] Error:', error.message);
      return {
        success: false,
        error: error.message,
        nextNodes: [],
        context,
      };
    }
  }

  private replaceContextVariables(text: string, context: any): string {
    if (!text) return '';
    return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return context[key] !== undefined ? context[key] : match;
    });
  }
  getDefinition(): import('../node-definition.interface').NodeDefinition {
    return {
      type: 'ai-grade',
      label: 'AI Grade',
      category: 'AI',
      description: 'AI grades a submission.',
      fields: [
        { name: 'submission', label: 'Submission Text', type: 'textarea' },
        { name: 'rubric', label: 'Rubric', type: 'textarea' },
      ],
      inputs: [{ id: 'in', type: 'target', label: 'In' }],
      outputs: [{ id: 'score', type: 'source', label: 'Score' }, { id: 'feedback', type: 'source', label: 'Feedback' }],
      outputVariables: [
        { name: 'gradeScore', label: 'Score', description: 'The grade score (0-100)' },
        { name: 'gradeFeedback', label: 'Feedback', description: 'Detailed feedback from AI' }
      ]
    };
  }
}
