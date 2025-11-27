import { api } from "@/lib/api";

export interface Notification {
    id: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    isRead: boolean;
    createdAt: string;
}

export const NotificationService = {
    getAll: async (): Promise<Notification[]> => {
        const response = await api.get('/notifications');
        return response.data;
    },
    markAsRead: async (id: string) => {
        await api.post(`/notifications/${id}/read`);
    }
};
