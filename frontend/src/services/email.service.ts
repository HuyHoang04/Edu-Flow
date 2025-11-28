import { api } from "@/lib/api";

export interface Email {
    id: string;
    recipients: string[];
    subject: string;
    body: string;
    sentBy: string;
    status: 'pending' | 'sent' | 'failed';
    errorMessage?: string;
    sentAt?: string;
    createdAt: string;
}

export const EmailService = {
    getAll: async (sentBy?: string) => {
        const response = await api.get<Email[]>("/emails", { params: { sentBy } });
        return response.data;
    },

    getStats: async (userId: string) => {
        const response = await api.get(`/emails/stats/${userId}`);
        return response.data;
    },

    send: async (data: { recipients: string[], subject: string, body: string, sentBy: string }) => {
        const response = await api.post("/emails/send", data);
        return response.data;
    },

    sendBulk: async (data: { recipients: string[], subject: string, body: string, sentBy: string }) => {
        const response = await api.post("/emails/send/bulk", data);
        return response.data;
    }
};
