import { api } from "@/lib/api";

export interface Schedule {
    id: string;
    classId: string;
    dayOfWeek: number; // 0 = Sunday, 1 = Monday, etc.
    startTime: string;
    endTime: string;
    room?: string;
    createdAt: string;
    class?: {
        id: string;
        name: string;
        code: string;
    };
}

export const ScheduleService = {
    getAll: async (classId?: string) => {
        const params = classId ? { classId } : {};
        const response = await api.get<Schedule[]>("/schedules", { params });
        return response.data;
    },

    getByClass: async (classId: string) => {
        const response = await api.get<Schedule[]>(`/schedules/class/${classId}`);
        return response.data;
    },

    create: async (data: Partial<Schedule>) => {
        const response = await api.post<Schedule>("/schedules", data);
        return response.data;
    },

    update: async (id: string, data: Partial<Schedule>) => {
        const response = await api.put<Schedule>(`/schedules/${id}`, data);
        return response.data;
    },

    delete: async (id: string) => {
        await api.delete(`/schedules/${id}`);
    }
};
