import { useCallback, useRef, useMemo } from "react";
import {
    ReactFlow,
    Background,
    Controls,
    MiniMap,
    addEdge,
    type Connection,
    useReactFlow,
    NodeTypes,
    Node,
    Edge,
    OnNodesChange,
    OnEdgesChange,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import CustomNode from "./CustomNode";
import { NODE_REGISTRY } from "./nodeRegistry";
import { NodeData, WorkflowNode } from "@/types/workflow";

let id = 0;
const getId = () => `dndnode_${id++}`;

interface WorkflowCanvasProps {
    nodes: WorkflowNode[];
    edges: Edge[];
    onNodesChange: OnNodesChange<WorkflowNode>;
    onEdgesChange: OnEdgesChange;
    setNodes: (nodes: any) => void;
    setEdges: (edges: any) => void;
}

export function WorkflowCanvas({
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    setNodes,
    setEdges,
}: WorkflowCanvasProps) {
    const reactFlowWrapper = useRef<HTMLDivElement>(null);
    const { screenToFlowPosition } = useReactFlow();

    const nodeTypes = useMemo<NodeTypes>(() => ({
        custom: CustomNode,
    }), []);

    const onConnect = useCallback(
        (params: Connection) => setEdges((eds: Edge[]) => addEdge(params, eds)),
        [setEdges]
    );

    const onDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback(
        (event: React.DragEvent) => {
            event.preventDefault();

            const type = event.dataTransfer.getData('application/reactflow');

            // check if the dropped element is valid
            if (typeof type === 'undefined' || !type) {
                return;
            }

            const definition = NODE_REGISTRY[type];
            if (!definition) return;

            const position = screenToFlowPosition({
                x: event.clientX,
                y: event.clientY,
            });

            const newNode: WorkflowNode = {
                id: getId(),
                type: 'custom',
                position,
                data: {
                    label: definition.label,
                    category: definition.category,
                    nodeType: type,
                },
            };

            setNodes((nds: WorkflowNode[]) => nds.concat(newNode));
        },
        [screenToFlowPosition, setNodes],
    );

    return (
        <div className="h-[calc(100vh-8rem)] rounded-lg border bg-background" ref={reactFlowWrapper}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onDrop={onDrop}
                onDragOver={onDragOver}
                nodeTypes={nodeTypes}
                fitView
            >
                <Background />
                <Controls />
                <MiniMap />
            </ReactFlow>
        </div>
    );
}
