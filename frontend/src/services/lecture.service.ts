import { api } from "@/lib/api";

export interface Lecture {
    id: string;
    topic: string;
    title: string;
    outline: string[];
    slides: any[];
    pptxUrl?: string;
    docxUrl?: string;
    createdAt: string;
}

export const LectureService = {
    getAll: async () => {
        const response = await api.get<Lecture[]>('/lectures');
        return response.data;
    },

    getById: async (id: string) => {
        const response = await api.get<Lecture>(`/lectures/${id}`);
        return response.data;
    },

    generate: async (data: { topic: string; audience?: string; duration_minutes?: number; detail_level?: string }) => {
        const response = await api.post<Lecture>('/lectures/generate', data);
        return response.data;
    },

    exportPptx: async (id: string) => {
        // Trigger download
        const response = await api.post(`/lectures/${id}/export/pptx`, {}, { responseType: 'blob' });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `lecture_${id}.pptx`);
        document.body.appendChild(link);
        link.click();
        link.remove();
    }
};
