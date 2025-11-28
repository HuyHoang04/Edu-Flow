export type NodeCategory = 'Trigger' | 'Action' | 'Logic' | 'AI' | 'Data';

export type FieldType = 'text' | 'number' | 'select' | 'boolean' | 'textarea' | 'date' | 'json';

export interface NodeField {
    name: string;
    label: string;
    type: FieldType;
    placeholder?: string;
    options?: { label: string; value: string }[];
    dynamicOptions?: 'classes' | 'exams' | 'students';
    required?: boolean;
    defaultValue?: any;
}

export interface HandleDefinition {
    id: string;
    type: 'source' | 'target';
    label?: string;
}

export interface NodeDefinition {
    type: string;
    label: string;
    icon?: string; // Icon name (string) instead of component
    category: NodeCategory;
    description?: string;
    fields: NodeField[];
    inputs: HandleDefinition[];
    outputs: HandleDefinition[];
    outputVariables?: { name: string; label: string; description?: string }[];
}
