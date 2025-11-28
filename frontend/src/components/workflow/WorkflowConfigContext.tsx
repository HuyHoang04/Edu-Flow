"use client";

import { createContext, useContext, ReactNode } from "react";
import { NodeDefinition } from "@/types/workflow";
import { NODE_REGISTRY } from "./nodeRegistry";

interface WorkflowConfigContextType {
    availableNodes: NodeDefinition[];
    getNodeDefinition: (type: string) => NodeDefinition | undefined;
}

const WorkflowConfigContext = createContext<WorkflowConfigContextType | undefined>(undefined);

export function WorkflowConfigProvider({
    children,
    availableNodes = []
}: {
    children: ReactNode;
    availableNodes?: NodeDefinition[]
}) {
    const getNodeDefinition = (type: string) => {
        // Priority: Server Config > Local Registry
        const serverNode = availableNodes.find(n => n.type === type);
        if (serverNode) return serverNode;
        return NODE_REGISTRY[type];
    };

    return (
        <WorkflowConfigContext.Provider value={{ availableNodes, getNodeDefinition }}>
            {children}
        </WorkflowConfigContext.Provider>
    );
}

export function useWorkflowConfig() {
    const context = useContext(WorkflowConfigContext);
    if (context === undefined) {
        throw new Error("useWorkflowConfig must be used within a WorkflowConfigProvider");
    }
    return context;
}
