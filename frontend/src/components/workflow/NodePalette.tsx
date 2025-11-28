"use client";

import { NODE_REGISTRY, NODE_CATEGORIES } from "./nodeRegistry";
import { NodeDefinition } from "@/types/workflow";
import {
    Play, Mail, GitBranch, Clock, Users, BookOpen, GraduationCap,
    FileText, Bell, Settings, Database, MessageSquare, Calendar
} from "lucide-react";

interface NodePaletteProps {
    availableNodes?: NodeDefinition[];
}

const ICON_MAP: Record<string, any> = {
    "manual-trigger": Play,
    "send-email": Mail,
    "condition": GitBranch,
    "delay": Clock,
    "get-students": Users,
    "get-classes": BookOpen,
    "get-exam-results": FileText,
    "create-exam": FileText,
    "assign-grade": GraduationCap,
    "update-student": Users,
    "create-attendance-session": Calendar,
    "send-notification": Bell,
    "ai-generate": MessageSquare,
    "loop": Settings, // Default or specific
};

const CATEGORY_ICONS: Record<string, any> = {
    "Trigger": Play,
    "Action": Settings,
    "Logic": GitBranch,
    "Data": Database,
    "AI": MessageSquare,
};

export function NodePalette({ availableNodes }: NodePaletteProps) {
    const onDragStart = (event: React.DragEvent, nodeType: string) => {
        event.dataTransfer.setData("application/reactflow", nodeType);
        event.dataTransfer.effectAllowed = "move";
    };

    // Use availableNodes if provided, otherwise fallback to NODE_REGISTRY values
    const nodesToRender = availableNodes || Object.values(NODE_REGISTRY);

    // Group nodes by category
    const nodesByCategory = nodesToRender.reduce((acc, node) => {
        const category = node.category || "Other";
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(node);
        return acc;
    }, {} as Record<string, NodeDefinition[]>);

    // Get all unique categories from the nodes
    const categories = Object.keys(nodesByCategory);

    return (
        <div className="w-64 space-y-6 rounded-lg border bg-card p-4 overflow-y-auto h-[calc(100vh-8rem)]">
            <div>
                <h3 className="font-semibold">Node Palette</h3>
                <p className="text-xs text-muted-foreground">
                    Kéo thả để thêm node
                </p>
            </div>

            <div className="space-y-6">
                {categories.map((category) => {
                    const nodes = nodesByCategory[category] || [];
                    const CategoryIcon = CATEGORY_ICONS[category] || Settings;

                    if (nodes.length === 0) return null;

                    return (
                        <div key={category}>
                            <div className="mb-3 flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                <CategoryIcon className="h-4 w-4" />
                                <span className="capitalize">{category}</span>
                            </div>
                            <div className="grid gap-2">
                                {nodes.map((node) => {
                                    // Resolve icon: Prop > Map > Category Default
                                    let NodeIcon = node.icon;
                                    if (!NodeIcon || typeof NodeIcon === 'string') {
                                        NodeIcon = ICON_MAP[node.type] || CATEGORY_ICONS[node.category] || Settings;
                                    }

                                    return (
                                        <div
                                            key={node.type}
                                            draggable
                                            onDragStart={(e) => onDragStart(e, node.type)}
                                            className="flex cursor-move items-center gap-3 rounded-lg border bg-background p-3 hover:border-primary hover:shadow-sm transition-all"
                                        >
                                            <div className="rounded-md bg-muted p-1.5">
                                                <NodeIcon className="h-4 w-4" />
                                            </div>
                                            <span className="text-sm font-medium">{node.label}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
