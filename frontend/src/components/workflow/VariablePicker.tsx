
import React, { useMemo } from 'react';
import { useReactFlow, useNodes, useEdges, Node } from '@xyflow/react';
import { Button } from '../ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Braces, Database, FileText, GraduationCap, Brain, Zap } from 'lucide-react';
import { NODE_REGISTRY } from './nodeRegistry';
import { NodeData } from '@/types/workflow';

interface VariablePickerProps {
    currentNodeId: string;
    onSelect: (variable: string) => void;
}

export const VariablePicker: React.FC<VariablePickerProps> = ({ currentNodeId, onSelect }) => {
    const nodes = useNodes();
    const edges = useEdges();

    const availableVariables = useMemo(() => {
        const currentNode = nodes.find((n) => n.id === currentNodeId);

        if (!currentNode) return [];

        // Find all upstream nodes (ancestors)
        // Simple BFS/DFS to find all reachable nodes leading TO the current node
        // Or simpler: just use getIncomers recursively

        const ancestors = new Set<string>();
        const queue = [currentNode];
        const visited = new Set<string>([currentNode.id]);

        // Note: getIncomers only gets immediate parents. We need full traversal.
        // Actually, for a simple UI, getting all nodes *before* this one in the flow is tricky 
        // without a proper graph traversal.
        // Let's do a reverse traversal from current node.

        const allNodesMap = new Map(nodes.map(n => [n.id, n]));
        const incomingEdgesMap = new Map<string, string[]>(); // target -> sources

        edges.forEach(e => {
            if (!incomingEdgesMap.has(e.target)) {
                incomingEdgesMap.set(e.target, []);
            }
            incomingEdgesMap.get(e.target)?.push(e.source);
        });

        const findAncestors = (nodeId: string) => {
            const parents = incomingEdgesMap.get(nodeId) || [];
            for (const parentId of parents) {
                if (!visited.has(parentId)) {
                    visited.add(parentId);
                    ancestors.add(parentId);
                    findAncestors(parentId);
                }
            }
        };

        findAncestors(currentNodeId);

        const variables: { nodeId: string; nodeLabel: string; nodeIcon: any; vars: any[] }[] = [];

        ancestors.forEach(ancestorId => {
            const node = allNodesMap.get(ancestorId);
            if (node) {
                const nodeData = node.data as NodeData;
                const definition = NODE_REGISTRY[nodeData.nodeType];
                if (definition && definition.outputVariables && definition.outputVariables.length > 0) {
                    variables.push({
                        nodeId: node.id,
                        nodeLabel: nodeData.label || definition.label,
                        nodeIcon: definition.icon,
                        vars: definition.outputVariables
                    });
                }
            }
        });

        return variables;
        return variables;
    }, [nodes, edges, currentNodeId]);

    if (availableVariables.length === 0) {
        return null;
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6 ml-1 text-muted-foreground hover:text-primary" title="Insert Variable">
                    <Braces className="h-3 w-3" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 max-h-[300px] overflow-y-auto">
                <DropdownMenuLabel>Insert Variable</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {availableVariables.map((group) => (
                    <DropdownMenuGroup key={group.nodeId}>
                        <div className="flex items-center px-2 py-1.5 text-xs font-semibold text-muted-foreground bg-muted/50">
                            <group.nodeIcon className="mr-2 h-3 w-3" />
                            <span className="truncate max-w-[150px]">{group.nodeLabel}</span>
                        </div>
                        {group.vars.map((v) => (
                            <DropdownMenuItem
                                key={v.name}
                                className="text-xs pl-6 cursor-pointer"
                                onClick={() => onSelect(`{{${v.name}}}`)}
                            >
                                <span className="font-medium text-primary mr-1">{v.name}</span>
                                <span className="text-muted-foreground truncate">- {v.description}</span>
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuGroup>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
