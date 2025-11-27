import { api } from "@/lib/api";

export interface Class {
    id: string;
    name: string;
    description?: string;
    code?: string;
    semester?: string;
    year?: number;
    createdAt: string;
    updatedAt: string;
    studentCount?: number;
    students?: any[]; // We can define Student interface later if needed
}

export const ClassService = {
    getAll: async () => {
        const response = await api.get<Class[]>("/classes");
        return response.data;
    },

    getById: async (id: string) => {
        const response = await api.get<Class>(`/classes/${id}`);
        return response.data;
    },

    create: async (data: Partial<Class>) => {
        const response = await api.post<Class>("/classes", data);
        return response.data;
    },

    update: async (id: string, data: Partial<Class>) => {
        const response = await api.put<Class>(`/classes/${id}`, data);
        return response.data;
    },

    delete: async (id: string) => {
        await api.delete(`/classes/${id}`);
    }
};
