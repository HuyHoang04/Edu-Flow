import { api } from "@/lib/api";

export interface Student {
    id: string;
    name: string;
    email: string;
    phone?: string;
    avatarUrl?: string;
    classId?: string;
    code?: string;
    createdAt: string;
    updatedAt: string;
}

export const StudentService = {
    getAll: async () => {
        const response = await api.get<Student[]>("/students");
        return response.data;
    },

    getById: async (id: string) => {
        const response = await api.get<Student>(`/students/${id}`);
        return response.data;
    },

    create: async (data: Partial<Student>) => {
        const response = await api.post<Student>("/students", data);
        return response.data;
    },

    update: async (id: string, data: Partial<Student>) => {
        const response = await api.put<Student>(`/students/${id}`, data);
        return response.data;
    },

    delete: async (id: string) => {
        await api.delete(`/students/${id}`);
    },

    importStudents: async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await api.post('/students/import', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    }
};
