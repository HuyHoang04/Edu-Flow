import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Question, QuestionType, QuestionDifficulty } from './question.entity';

@Injectable()
export class QuestionsService {
    constructor(
        @InjectRepository(Question)
        private questionsRepository: Repository<Question>,
    ) { }

    async findAll(filters?: {
        subject?: string;
        difficulty?: QuestionDifficulty;
        type?: QuestionType;
        createdBy?: string;
    }): Promise<Question[]> {
        const where: any = {};
        if (filters?.subject) where.subject = filters.subject;
        if (filters?.difficulty) where.difficulty = filters.difficulty;
        if (filters?.type) where.type = filters.type;
        if (filters?.createdBy) where.createdBy = filters.createdBy;

        return this.questionsRepository.find({ where });
    }

    async findById(id: string): Promise<Question | null> {
        return this.questionsRepository.findOne({ where: { id } });
    }

    async findByIds(ids: string[]): Promise<Question[]> {
        return this.questionsRepository.findByIds(ids);
    }

    async create(questionData: Partial<Question>): Promise<Question> {
        const question = this.questionsRepository.create(questionData);
        return this.questionsRepository.save(question);
    }

    async bulkCreate(questionsData: Partial<Question>[]): Promise<Question[]> {
        const questions = this.questionsRepository.create(questionsData);
        return this.questionsRepository.save(questions);
    }

    async update(id: string, questionData: Partial<Question>): Promise<Question> {
        await this.questionsRepository.update(id, questionData);
        const question = await this.findById(id);
        if (!question) {
            throw new Error('Question not found');
        }
        return question;
    }

    async delete(id: string): Promise<void> {
        await this.questionsRepository.delete(id);
    }

    async searchByTags(tags: string[]): Promise<Question[]> {
        const questions = await this.questionsRepository
            .createQueryBuilder('question')
            .where('question.tags && :tags', { tags })
            .getMany();
        return questions;
    }
}
