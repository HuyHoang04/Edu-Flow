"use client";

import { NODE_REGISTRY, NODE_CATEGORIES } from "./nodeRegistry";
import { NodeDefinition } from "@/types/workflow";

export function NodePalette() {
    const onDragStart = (event: React.DragEvent, nodeType: string) => {
        event.dataTransfer.setData("application/reactflow", nodeType);
        event.dataTransfer.effectAllowed = "move";
    };

    // Group nodes by category
    const nodesByCategory = Object.values(NODE_REGISTRY).reduce((acc, node) => {
        if (!acc[node.category]) {
            acc[node.category] = [];
        }
        acc[node.category].push(node);
        return acc;
    }, {} as Record<string, NodeDefinition[]>);

    return (
        <div className="w-64 space-y-6 rounded-lg border bg-card p-4 overflow-y-auto h-[calc(100vh-8rem)]">
            <div>
                <h3 className="font-semibold">Node Palette</h3>
                <p className="text-xs text-muted-foreground">
                    Kéo thả để thêm node
                </p>
            </div>

            <div className="space-y-6">
                {NODE_CATEGORIES.map((category) => {
                    const CategoryIcon = category.icon;
                    const nodes = nodesByCategory[category.value] || [];

                    if (nodes.length === 0) return null;

                    return (
                        <div key={category.value}>
                            <div className="mb-3 flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                <CategoryIcon className="h-4 w-4" />
                                <span>{category.label}</span>
                            </div>
                            <div className="grid gap-2">
                                {nodes.map((node) => {
                                    const NodeIcon = node.icon;
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
