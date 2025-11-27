import { api } from "@/lib/api";

export interface Question {
    id: string;
    content: string;
    type: 'multiple_choice' | 'essay' | 'true_false' | 'short_answer';
    options?: any; // JSON string or object
    correctAnswer?: string;
    subject?: string;
    topic?: string;
    difficulty?: 'easy' | 'medium' | 'hard';
    createdAt: string;
    updatedAt: string;
}

export const QuestionService = {
    getAll: async () => {
        const response = await api.get<Question[]>('/questions');
        return response.data;
    },

    getById: async (id: string) => {
        const response = await api.get<Question>(`/questions/${id}`);
        return response.data;
    },

    create: async (data: Partial<Question>) => {
        const response = await api.post<Question>('/questions', data);
        return response.data;
    },

    update: async (id: string, data: Partial<Question>) => {
        const response = await api.put<Question>(`/questions/${id}`, data);
        return response.data;
    },

    delete: async (id: string) => {
        await api.delete(`/questions/${id}`);
    }
};
