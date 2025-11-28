import { api } from "@/lib/api";

export interface Report {
    id: string;
    title: string;
    type: 'attendance' | 'exam_results' | 'class_performance' | 'student_progress';
    data: any;
    filters: any;
    generatedBy: string;
    createdAt: string;
}

export const ReportService = {
    getAll: async (generatedBy?: string) => {
        const response = await api.get<Report[]>("/reports", { params: { generatedBy } });
        return response.data;
    },

    getById: async (id: string) => {
        const response = await api.get<Report>(`/reports/${id}`);
        return response.data;
    },

    generateAttendance: async (data: { classId: string, startDate: string, endDate: string, generatedBy: string }) => {
        const response = await api.post<Report>("/reports/attendance", data);
        return response.data;
    },

    generateExamResults: async (data: { examId: string, generatedBy: string }) => {
        const response = await api.post<Report>("/reports/exam-results", data);
        return response.data;
    },

    delete: async (id: string) => {
        await api.delete(`/reports/${id}`);
    }
};
