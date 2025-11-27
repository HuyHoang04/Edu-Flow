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
}

export const AttendanceService = {
    // Tạo phiên điểm danh
    createSession: async (classId: string, timeoutMinutes: number = 5) => {
        const response = await api.post('/attendance/session', { classId, timeoutMinutes });
        return response.data;
    },

    // Lấy danh sách điểm danh theo lớp và ngày
    getByClassAndDate: async (classId: string, date: string): Promise<Attendance[]> => {
        // Backend cần endpoint này: GET /attendance?classId=...&date=...
        // Nếu chưa có record, backend nên trả về danh sách sinh viên với status mặc định (hoặc null)
        const response = await api.get(`/attendance?classId=${classId}&date=${date}`);
        return response.data;
    },

    // Lưu điểm danh (Bulk update/create)
    bulkUpdate: async (records: Partial<Attendance>[]): Promise<Attendance[]> => {
        const response = await api.post('/attendance/bulk', { records });
        return response.data;
    },

    // Thống kê (Optional)
    getStats: async (classId: string) => {
        const response = await api.get(`/attendance/stats/${classId}`);
        return response.data;
    }
};
