import { api } from "@/lib/api";

export interface Template {
    id: string;
    name: string;
    description?: string;
    category?: string;
    nodes: any[];
    edges: any[];
    createdAt: string;
    updatedAt: string;
}

export const TemplateService = {
    getAll: async (): Promise<Template[]> => {
        const response = await api.get<Template[]>("/workflows/templates/all");
        return response.data;
    },

    saveAsTemplate: async (
        workflowId: string,
        data: { name?: string; description?: string; category?: string }
    ): Promise<Template> => {
        const response = await api.post<Template>(
            `/workflows/${workflowId}/save-as-template`,
            data
        );
        return response.data;
    },

    useTemplate: async (
        templateId: string,
        data: { name?: string }
    ): Promise<any> => {
        const response = await api.post(
            `/workflows/templates/${templateId}/use`,
            data
        );
        return response.data;
    },
};
