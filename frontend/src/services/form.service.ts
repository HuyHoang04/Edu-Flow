import { api } from "@/lib/api";

export interface Form {
    id: string;
    title: string;
    description?: string;
    fields: any[]; // JSON structure for form fields
    createdBy: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface FormResponse {
    id: string;
    formId: string;
    respondentId?: string;
    data: any;
    submittedAt: string;
}

export const FormService = {
    getAll: async (createdBy?: string) => {
        const response = await api.get<Form[]>("/forms", { params: { createdBy } });
        return response.data;
    },

    getById: async (id: string) => {
        const response = await api.get<Form>(`/forms/${id}`);
        return response.data;
    },

    create: async (data: Partial<Form>) => {
        const response = await api.post<Form>("/forms", data);
        return response.data;
    },

    update: async (id: string, data: Partial<Form>) => {
        const response = await api.put<Form>(`/forms/${id}`, data);
        return response.data;
    },

    delete: async (id: string) => {
        await api.delete(`/forms/${id}`);
    },

    getResponses: async (id: string) => {
        const response = await api.get<FormResponse[]>(`/forms/${id}/responses`);
        return response.data;
    },

    getStats: async (id: string) => {
        const response = await api.get(`/forms/${id}/stats`);
        return response.data;
    }
};
