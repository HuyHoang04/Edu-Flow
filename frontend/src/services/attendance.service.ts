import { api } from "@/lib/api";

export interface Attendance {
    id: string;
    studentId: string;
    classId: string;
    scheduleId?: string;
    date: string; // ISO Date string
    status: 'present' | 'absent' | 'late' | 'excused';
    note?: string;
    student?: {
        id: string;
        name: string;
        studentId: string; // MSSV
    };
    createdAt?: string;
}

export interface AttendanceSession {
    id: string;
    classId: string;
    code: string;
    expiryTime: string; // ISO string
    isActive: boolean;
    createdAt: string; // ISO string
}

export const AttendanceService = {
    // Tạo phiên điểm danh
    createSession: async (classId: string, timeoutMinutes: number = 5) => {
        const response = await api.post<AttendanceSession>('/attendance/session', { classId, timeoutMinutes });
        return response.data;
    },

    // Lấy danh sách phiên điểm danh
    getSessionsByClass: async (classId: string) => {
        const response = await api.get<AttendanceSession[]>(`/attendance/sessions/${classId}`);
        return response.data;
    },

    // Lấy danh sách điểm danh theo lớp và ngày
    getByClassAndDate: async (classId: string, date: string): Promise<Attendance[]> => {
        const response = await api.get(`/attendance?classId=${classId}&date=${date}`);
        return response.data;
    },

    // Lưu điểm danh (Bulk update/create)
    bulkUpdate: async (records: Partial<Attendance>[]): Promise<Attendance[]> => {
        const response = await api.post('/attendance/bulk', records);
        return response.data;
    },

    // Thống kê (Optional)
    getStats: async (classId: string) => {
        const response = await api.get(`/attendance/stats/${classId}`);
        return response.data;
    },

    // Gửi báo cáo qua email
    sendReport: async (data: { classId: string, startDate: string, endDate: string, email: string, generatedBy: string }) => {
        const response = await api.post('/reports/attendance/email', data);
        return response.data;
    }
};
