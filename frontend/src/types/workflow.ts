import { LucideIcon } from "lucide-react";
import { Node } from "@xyflow/react";

export type NodeCategory = "Trigger" | "Action" | "Logic" | "AI" | "Data";

export type FieldType = "text" | "number" | "select" | "boolean" | "textarea" | "date";

export interface NodeField {
    name: string;
    label: string;
    type: FieldType;
    placeholder?: string;
    options?: { label: string; value: string }[]; // For select type
    dynamicOptions?: "classes" | "exams" | "students"; // For dynamic select type
    required?: boolean;
    defaultValue?: any;
}

export interface HandleDefinition {
    id: string;
    type: "source" | "target";
    label?: string;
    style?: React.CSSProperties;
}

export interface NodeDefinition {
    type: string;
    label: string;
    icon: LucideIcon;
    category: NodeCategory;
    description?: string;
    fields: NodeField[];
    inputs: HandleDefinition[];
    outputs: HandleDefinition[];
    outputVariables?: { name: string; label: string; description?: string }[];
}

export interface NodeData extends Record<string, unknown> {
    label: string;
    category: NodeCategory;
    nodeType: string; // The specific type key from registry (e.g., 'send-email')
    [key: string]: any; // For dynamic field values
}

export type WorkflowNode = Node<NodeData>;
