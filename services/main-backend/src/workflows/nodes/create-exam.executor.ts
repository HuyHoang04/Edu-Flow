import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { NodeExecutor } from './node-executor.interface';
import { ExamsService } from '../../exams/exams.service';
import { QuestionsService } from '../../questions/questions.service';

@Injectable()
export class CreateExamNodeExecutor implements NodeExecutor {
  constructor(
    @Inject(forwardRef(() => ExamsService))
    private examsService: ExamsService,
    private questionsService: QuestionsService,
  ) { }

  async execute(
    node: any,
    context: any,
    execution: any,
    workflow?: any,
  ): Promise<any> {
    console.log(`[CreateExamNode] Executing for node: ${node.id}`);

    const {
      title,
      description,
      duration,
      passingScore,
      totalPoints,
      classId,
      topic,
      difficulty,
      questionCount = 10,
    } = node.data;

    // Fetch questions based on criteria
    let questions = await this.questionsService.findAll({
      topic: topic,
      difficulty: difficulty,
    });

    // Randomize and limit questions
    if (questions.length > 0) {
      questions = questions
        .sort(() => 0.5 - Math.random())
        .slice(0, Number(questionCount));
    }

    const examQuestions = questions.map((q, index) => ({
      questionId: q.id,
      order: index + 1,
      points: Number(totalPoints) / questions.length, // Distribute points evenly
    }));

    // Create the exam
    const exam = await this.examsService.create({
      title: title || 'New Exam',
      description: description || '',
      durationMinutes: Number(duration) || 60,
      passingScore: Number(passingScore) || 50,
      totalPoints: Number(totalPoints) || 100,
      classId: classId || context.classId, // Fallback to context if not in node data
      questions: examQuestions,
      deadline: new Date(
        Date.now() + (Number(duration) || 60) * 60000 * 24 * 7,
      ), // Default deadline 1 week from now
      createdBy: context.userId || node.data.createdBy, // Ensure createdBy is present
    });

    console.log(
      `[CreateExamNode] Created exam: ${exam.id} with ${examQuestions.length} questions`,
    );

    // Store in context for subsequent nodes
    context.createdExamId = exam.id;
    context.exam = exam;

    return {
      success: true,
      output: {
        createdExamId: exam.id,
        exam: exam,
        questionCount: examQuestions.length,
      },
    };
  }
  getDefinition(): import('../node-definition.interface').NodeDefinition {
    return {
      type: 'create-exam',
      label: 'Create Exam',
      category: 'Action',
      description: 'Creates a new exam.',
      fields: [
        { name: 'title', label: 'Exam Title', type: 'text' },
        { name: 'duration', label: 'Duration (mins)', type: 'number', defaultValue: 60 },
        { name: 'questionBankId', label: 'Question Bank ID', type: 'text' },
      ],
      inputs: [{ id: 'in', type: 'target', label: 'In' }],
      outputs: [{ id: 'out', type: 'source', label: 'Created' }],
      outputVariables: [
        { name: 'createdExamId', label: 'Exam ID', description: 'The ID of the created exam' },
        { name: 'questionCount', label: 'Question Count', description: 'Number of questions in the exam' }
      ]
    };
  }
}
