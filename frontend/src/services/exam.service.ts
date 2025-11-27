import { api } from "@/lib/api";
import { Question } from "./question.service";

export interface Exam {
    id: string;
    title: string;
    description?: string;
    durationMinutes: number; // in minutes
    totalPoints: number;
    passingScore: number;
    classId?: string;
    questions?: Question[];
    deadline: string; // ISO date string
    createdAt: string;
    updatedAt: string;
    createdBy?: string;
}

export interface ExamAttempt {
    id: string;
    examId: string;
    studentId: string;
    startedAt: string;
    submittedAt?: string;
    answers: Array<{ questionId: string; answer: string }>;
    autoGradeScore?: number;
    manualGradeScore?: number;
    totalScore?: number;
    isGraded: boolean;
    gradedBy?: string;
    gradedAt?: string;
}

export interface ExamResult extends ExamAttempt {
    exam?: Exam;
    passed?: boolean;
}

export const ExamService = {
    getAll: async () => {
        const response = await api.get<Exam[]>('/exams');
        return response.data;
    },

    getById: async (id: string) => {
        const response = await api.get<Exam>(`/exams/${id}`);
        return response.data;
    },

    create: async (data: Partial<Exam>) => {
        const response = await api.post<Exam>('/exams', data);
        return response.data;
    },

    update: async (id: string, data: Partial<Exam>) => {
        const response = await api.put<Exam>(`/exams/${id}`, data);
        return response.data;
    },

    delete: async (id: string) => {
        await api.delete(`/exams/${id}`);
    },

    // Student exam methods
    getAvailableExams: async () => {
        const response = await api.get<Exam[]>('/exams');
        return response.data;
    },

    startExam: async (examId: string) => {
        const response = await api.post<ExamAttempt>(`/exams/${examId}/start`, {});
        return response.data;
    },

    submitExam: async (attemptId: string, answers: Array<{ questionId: string; answer: string }>) => {
        const response = await api.post<ExamResult>(`/exams/attempts/${attemptId}/submit`, { answers });
        return response.data;
    },

    getAttempt: async (attemptId: string) => {
        const response = await api.get<ExamAttempt>(`/exams/attempts/${attemptId}`);
        return response.data;
    },

    getExamResult: async (attemptId: string) => {
        const response = await api.get<ExamResult>(`/exams/attempts/${attemptId}/result`);
        return response.data;
    },
};
