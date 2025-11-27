import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExamAttempt } from './exam-attempt.entity';
import { Question, QuestionType } from '../questions/question.entity';
import { QuestionsService } from '../questions/questions.service';

interface GradingResult {
  questionId: string;
  score: number;
  maxScore: number;
  isCorrect: boolean;
  needsManualReview: boolean;
  feedback?: string;
}

@Injectable()
export class GradingService {
  constructor(private questionsService: QuestionsService) {}

  async autoGrade(
    examAttempt: ExamAttempt,
    questions: Question[],
  ): Promise<{
    autoGradeScore: number;
    results: GradingResult[];
    needsManualGrading: boolean;
  }> {
    let totalScore = 0;
    const results: GradingResult[] = [];

    for (const answer of examAttempt.answers) {
      const question = questions.find((q) => q.id === answer.questionId);
      if (!question) continue;

      let score = 0;
      let needsManualReview = false;
      const feedback = '';

      switch (question.type) {
        case QuestionType.MULTIPLE_CHOICE:
        case QuestionType.TRUE_FALSE:
          // Exact match
          score =
            answer.answer.toLowerCase().trim() ===
            question.correctAnswer.toLowerCase().trim()
              ? Number(question.points)
              : 0;
          break;

        case QuestionType.SHORT_ANSWER:
          // Simple string similarity
          const similarity = this.calculateSimilarity(
            answer.answer,
            question.correctAnswer,
          );
          if (similarity > 0.8) {
            score = Number(question.points);
          } else if (similarity > 0.5) {
            score = Number(question.points) * 0.5;
          }
          break;

        case QuestionType.ESSAY:
          // Requires manual grading (or AI via workflow)
          needsManualReview = true;
          break;
      }

      results.push({
        questionId: answer.questionId,
        score,
        maxScore: Number(question.points),
        isCorrect: score === Number(question.points),
        needsManualReview,
        feedback,
      });

      if (!needsManualReview) {
        totalScore += score;
      }
    }

    return {
      autoGradeScore: totalScore,
      results,
      needsManualGrading: results.some((r) => r.needsManualReview),
    };
  }

  private calculateSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;

    if (longer.length === 0) {
      return 1.0;
    }

    const editDistance = this.levenshteinDistance(
      longer.toLowerCase(),
      shorter.toLowerCase(),
    );
    return (longer.length - editDistance) / longer.length;
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix: number[][] = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1,
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }
}
