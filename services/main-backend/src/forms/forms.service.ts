import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Form, FormFieldType } from './form.entity';
import { FormResponse } from './form-response.entity';

export interface CreateFormDto {
  title: string;
  description?: string;
  fields: Array<{
    id: string;
    type: FormFieldType;
    label: string;
    required: boolean;
    options?: string[];
  }>;
  createdBy: string;
  deadline?: Date;
}

export interface SubmitResponseDto {
  formId: string;
  respondentEmail: string;
  respondentName?: string;
  answers: Record<string, any>;
}

@Injectable()
export class FormsService {
  constructor(
    @InjectRepository(Form)
    private formsRepository: Repository<Form>,
    @InjectRepository(FormResponse)
    private responsesRepository: Repository<FormResponse>,
  ) {}

  // Forms CRUD
  async findAll(createdBy?: string): Promise<Form[]> {
    if (createdBy) {
      return this.formsRepository.find({ where: { createdBy } });
    }
    return this.formsRepository.find({ order: { createdAt: 'DESC' } });
  }

  async findById(id: string): Promise<Form | null> {
    return this.formsRepository.findOne({ where: { id } });
  }

  async create(formData: CreateFormDto): Promise<Form> {
    const form = this.formsRepository.create(formData);
    return this.formsRepository.save(form);
  }

  async update(id: string, formData: Partial<CreateFormDto>): Promise<Form> {
    await this.formsRepository.update(id, formData as any);
    const form = await this.findById(id);
    if (!form) {
      throw new Error('Form not found');
    }
    return form;
  }

  async delete(id: string): Promise<void> {
    await this.formsRepository.delete(id);
  }

  // Responses
  async submitResponse(responseData: SubmitResponseDto): Promise<FormResponse> {
    const response = this.responsesRepository.create(responseData);
    return this.responsesRepository.save(response);
  }

  async getFormResponses(formId: string): Promise<FormResponse[]> {
    return this.responsesRepository.find({
      where: { formId },
      order: { submittedAt: 'DESC' },
    });
  }

  async getResponseById(id: string): Promise<FormResponse | null> {
    return this.responsesRepository.findOne({ where: { id } });
  }

  async getFormStats(formId: string) {
    const form = await this.findById(formId);
    if (!form) {
      throw new Error('Form not found');
    }

    const responses = await this.getFormResponses(formId);
    const totalResponses = responses.length;

    // Calculate stats for each field
    const fieldStats: Record<string, any> = {};

    form.fields.forEach((field) => {
      const answers = responses
        .map((r) => r.answers[field.id])
        .filter((a) => a !== undefined && a !== null && a !== '');

      fieldStats[field.id] = {
        fieldLabel: field.label,
        fieldType: field.type,
        totalAnswers: answers.length,
        responseRate:
          totalResponses > 0 ? (answers.length / totalResponses) * 100 : 0,
      };

      // Stats for choice-based questions
      if (['radio', 'select', 'checkbox'].includes(field.type)) {
        const distribution: Record<string, number> = {};
        answers.forEach((answer) => {
          if (Array.isArray(answer)) {
            // For checkboxes
            answer.forEach((item) => {
              distribution[item] = (distribution[item] || 0) + 1;
            });
          } else {
            distribution[answer] = (distribution[answer] || 0) + 1;
          }
        });
        fieldStats[field.id].distribution = distribution;
      }
    });

    return {
      formId,
      title: form.title,
      totalResponses,
      fieldStats,
    };
  }

  async exportResponses(formId: string): Promise<any[]> {
    const form = await this.findById(formId);
    if (!form) {
      throw new Error('Form not found');
    }

    const responses = await this.getFormResponses(formId);

    return responses.map((response) => ({
      respondentEmail: response.respondentEmail,
      respondentName: response.respondentName,
      submittedAt: response.submittedAt,
      ...response.answers,
    }));
  }
}
