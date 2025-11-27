import { api } from "@/lib/api";
import { WorkflowNode } from "@/types/workflow";
import { Edge } from "@xyflow/react";

export interface CreateWorkflowDto {
    name: string;
    description?: string;
    nodes: WorkflowNode[];
    edges: Edge[];
    trigger?: {
        type: 'manual' | 'schedule' | 'webhook';
        config?: any;
    };
}

export interface Workflow {
    id: string;
    name: string;
    description?: string;
    nodes: WorkflowNode[];
    edges: Edge[];
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    createdBy: string;
}

export const WorkflowService = {
    getAll: async () => {
        const response = await api.get<Workflow[]>("/workflows");
        return response.data;
    },

    getById: async (id: string) => {
        const response = await api.get<Workflow>(`/workflows/${id}`);
        return response.data;
    },

    create: async (data: CreateWorkflowDto) => {
        const response = await api.post<Workflow>("/workflows", data);
        return response.data;
    },

    update: async (id: string, data: Partial<CreateWorkflowDto>) => {
        const response = await api.put<Workflow>(`/workflows/${id}`, data);
        return response.data;
    },

    delete: async (id: string) => {
        await api.delete(`/workflows/${id}`);
    },

    execute: async (id: string, triggerData: { triggeredBy: string; context?: any } = { triggeredBy: 'manual' }) => {
        const response = await api.post(`/workflows/${id}/execute`, triggerData);
        return response.data;
    },

    getExecutions: async (id: string) => {
        const response = await api.get(`/workflows/${id}/executions`);
        return response.data;
    }
};
