import { api } from "@/lib/api";
import axios from "axios";

export type FormFieldType = 'text' | 'textarea' | 'radio' | 'checkbox' | 'select' | 'date';

export interface FormField {
    id: string;
    type: FormFieldType;
    label: string;
    required: boolean;
    options?: string[];
}

export interface Form {
    id: string;
    title: string;
    description?: string;
    fields: FormField[];
    createdBy: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface FormResponse {
    id: string;
    formId: string;
    respondentEmail: string;
    respondentName?: string;
    answers: Record<string, any>;
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

    getPublic: async (id: string) => {
        // Public endpoint might not use the same axios instance if it requires auth header removal
        // But here we assume api instance handles it or we use raw axios if needed.
        // Since api instance likely adds token, we might need a separate call or backend allows token on public route.
        // Let's use raw axios for public to avoid sending unnecessary tokens or handling interceptors issues.
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const response = await axios.get<Form>(`${apiUrl}/forms/public/${id}`);
        return response.data;
    },

    submitPublic: async (id: string, data: any) => {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const response = await axios.post(`${apiUrl}/forms/public/${id}/submit`, data);
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
