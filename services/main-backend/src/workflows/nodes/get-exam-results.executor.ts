import { Injectable } from '@nestjs/common';
import { NodeExecutor } from './node-executor.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExamResult } from '../../exams/exam-result.entity';

@Injectable()
export class GetExamResultsNodeExecutor implements NodeExecutor {
  constructor(
    @InjectRepository(ExamResult)
    private examResultRepository: Repository<ExamResult>,
  ) { }

  async execute(node: any, context: any): Promise<any> {
    const { examId, outputKey = 'examResults' } = node.data;

    if (!examId) {
      console.error('[GetExamResultsExecutor] examId is required');
      return {
        success: false,
        error: 'examId is required',
        nextNodes: [],
        context,
      };
    }

    console.log(
      `[GetExamResultsExecutor] Fetching results for exam: ${examId}`,
    );

    try {
      const results = await this.examResultRepository.find({
        where: { examId },
        relations: ['student'],
      });

      context[outputKey] = results;
      context[`${outputKey}_count`] = results.length;

      // Calculate statistics
      if (results.length > 0) {
        const scores = results.map((r) => r.score);
        context[`${outputKey}_avgScore`] =
          scores.reduce((a, b) => a + b, 0) / scores.length;
        context[`${outputKey}_maxScore`] = Math.max(...scores);
        context[`${outputKey}_minScore`] = Math.min(...scores);
      }

      console.log(`[GetExamResultsExecutor] Found ${results.length} results`);

      return {
        success: true,
        nextNodes: node.data.nextNodes || [],
        context,
      };
    } catch (error: any) {
      console.error('[GetExamResultsExecutor] Error:', error.message);
      return {
        success: false,
        error: error.message,
        nextNodes: [],
        context,
      };
    }
  }
  getDefinition(): import('../node-definition.interface').NodeDefinition {
    return {
      type: 'get-exam-results',
      label: 'Get Exam Results',
      category: 'Data',
      description: 'Fetches results for an exam.',
      fields: [
        { name: 'examId', label: 'Exam', type: 'select', dynamicOptions: 'exams' },
      ],
      inputs: [{ id: 'in', type: 'target', label: 'In' }],
      outputs: [{ id: 'out', type: 'source', label: 'Results' }],
    };
  }
}
