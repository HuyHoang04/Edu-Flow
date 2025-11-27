"use client";

import { useEffect, useState } from "react";
import { WorkflowCanvas } from "@/components/workflow/WorkflowCanvas";
import { NodePalette } from "@/components/workflow/NodePalette";
import { Save, Play, Settings, Loader2, Copy } from "lucide-react";
import { ReactFlowProvider, useNodesState, useEdgesState, Edge } from "@xyflow/react";
import { WorkflowService } from "@/services/workflow.service";
import { TemplateService } from "@/services/template.service";
import { useSearchParams, useRouter } from "next/navigation";
import { WorkflowNode } from "@/types/workflow";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

const initialNodes: WorkflowNode[] = [
    {
        id: "1",
        type: "custom",
        data: {
            label: "Manual Trigger",
            category: "Trigger",
            nodeType: "manual-trigger"
        },
        position: { x: 250, y: 50 },
    },
];

function WorkflowBuilderContent() {
    const [nodes, setNodes, onNodesChange] = useNodesState<WorkflowNode>(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [workflowName, setWorkflowName] = useState("New Workflow");

    const searchParams = useSearchParams();
    const router = useRouter();
    const workflowId = searchParams.get("id");

    useEffect(() => {
        if (workflowId) {
            loadWorkflow(workflowId);
        }
    }, [workflowId]);

    const loadWorkflow = async (id: string) => {
        setIsLoading(true);
        try {
            const workflow = await WorkflowService.getById(id);
            setNodes(workflow.nodes);
            setEdges(workflow.edges);
            setWorkflowName(workflow.name);
        } catch (error) {
            console.error("Failed to load workflow", error);
            alert("Failed to load workflow");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveWorkflow = async () => {
        if (!workflowName.trim()) {
            alert("Please enter a workflow name");
            return;
        }
        setIsSaving(true);
        try {
            // Auto-detect start node: find first node with no incoming edges
            const nodesWithIncomingEdges = new Set(edges.map(e => e.target));
            const startNode = nodes.find(n => !nodesWithIncomingEdges.has(n.id));

            const workflowData = {
                name: workflowName,
                nodes,
                edges,
                trigger: { type: 'manual' as const },
                startNodeId: startNode?.id || (nodes.length > 0 ? nodes[0].id : undefined)
            };

            if (workflowId) {
                await WorkflowService.update(workflowId, workflowData);
                alert("Workflow updated successfully!");
            } else {
                const newWorkflow = await WorkflowService.create(workflowData);
                alert("Workflow created successfully!");
                router.push(`/dashboard/workflows/builder?id=${newWorkflow.id}`);
            }
        } catch (error) {
            console.error("Failed to save workflow", error);
            alert("Failed to save workflow");
        } finally {
            setIsSaving(false);
        }
    };

    const handleExecute = async () => {
        if (!workflowId) {
            alert("Please save the workflow first.");
            return;
        }
        try {
            await WorkflowService.execute(workflowId);
            alert("Workflow execution started!");
        } catch (error) {
            console.error("Failed to execute workflow", error);
            alert("Failed to execute workflow");
        }
    };

    const [isTemplateOpen, setIsTemplateOpen] = useState(false);
    const [templates, setTemplates] = useState<any[]>([]);
    const [loadingTemplates, setLoadingTemplates] = useState(false);

    const fetchTemplates = async () => {
        setLoadingTemplates(true);
        try {
            const data = await TemplateService.getAll();
            setTemplates(data);
        } catch (error) {
            console.error("Failed to fetch templates:", error);
        } finally {
            setLoadingTemplates(false);
        }
    };

    const handleImportTemplate = async (templateId: string) => {
        try {
            const template = templates.find(t => t.id === templateId);
            if (!template) return;

            const prefix = `imported_${Date.now()}_`;

            const newNodes = template.nodes.map((node: any) => ({
                ...node,
                id: `${prefix}${node.id}`,
                position: {
                    x: node.position.x + 50,
                    y: node.position.y + 50
                },
                selected: false
            }));

            const newEdges = template.edges.map((edge: any) => ({
                ...edge,
                id: `${prefix}${edge.id}`,
                source: `${prefix}${edge.source}`,
                target: `${prefix}${edge.target}`,
                selected: false
            }));

            setNodes((nds) => [...nds, ...newNodes]);
            setEdges((eds) => [...eds, ...newEdges]);

            setIsTemplateOpen(false);
            alert("Template imported successfully!");
        } catch (error) {
            console.error("Failed to import template:", error);
            alert("Failed to import template");
        }
    };

    const [isSaveTemplateOpen, setIsSaveTemplateOpen] = useState(false);
    const [newTemplateName, setNewTemplateName] = useState("");
    const [newTemplateDescription, setNewTemplateDescription] = useState("");
    const [newTemplateCategory, setNewTemplateCategory] = useState("education");
    const [isSavingTemplate, setIsSavingTemplate] = useState(false);

    const handleSaveAsTemplate = async () => {
        if (!workflowId) {
            alert("Please save the workflow first before saving as template.");
            return;
        }
        setIsSavingTemplate(true);
        try {
            await TemplateService.saveAsTemplate(workflowId, {
                name: newTemplateName,
                description: newTemplateDescription,
                category: newTemplateCategory
            });
            alert("Template saved successfully!");
            setIsSaveTemplateOpen(false);
            setNewTemplateName("");
            setNewTemplateDescription("");
        } catch (error) {
            console.error("Failed to save template:", error);
            alert("Failed to save template");
        } finally {
            setIsSavingTemplate(false);
        }
    };

    if (isLoading) {
        return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    return (
        <div className="space-y-4 h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between border-b pb-4">
                <div>
                    <input
                        type="text"
                        value={workflowName}
                        onChange={(e) => setWorkflowName(e.target.value)}
                        className="text-2xl font-bold bg-transparent border-none focus:outline-none focus:ring-0"
                    />
                    <p className="text-sm text-muted-foreground">
                        Tạo workflow tự động với drag & drop
                    </p>
                </div>
                <div className="flex gap-2">
                    {/* Import Template Dialog */}
                    <Dialog open={isTemplateOpen} onOpenChange={(open) => {
                        setIsTemplateOpen(open);
                        if (open) fetchTemplates();
                    }}>
                        <DialogTrigger asChild>
                            <button className="flex items-center gap-2 rounded-lg border px-4 py-2 hover:bg-muted">
                                <Copy className="h-4 w-4" />
                                Import Template
                            </button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Chọn Template</DialogTitle>
                                <DialogDescription>
                                    Chọn một template để thêm vào workflow hiện tại.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                {loadingTemplates ? (
                                    <div className="flex justify-center p-4">
                                        <Loader2 className="h-6 w-6 animate-spin" />
                                    </div>
                                ) : templates.length === 0 ? (
                                    <p className="text-center text-muted-foreground">Chưa có template nào.</p>
                                ) : (
                                    <div className="grid gap-4">
                                        {templates.map((template) => (
                                            <div key={template.id} className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted/50">
                                                <div>
                                                    <h4 className="font-semibold">{template.name}</h4>
                                                    <p className="text-sm text-muted-foreground">{template.description || "Không có mô tả"}</p>
                                                    <div className="text-xs text-muted-foreground mt-1">
                                                        {template.nodes?.length || 0} nodes • {template.category || "Uncategorized"}
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleImportTemplate(template.id)}
                                                    className="rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground hover:opacity-90"
                                                >
                                                    Thêm
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </DialogContent>
                    </Dialog>

                    {/* Save as Template Dialog */}
                    <Dialog open={isSaveTemplateOpen} onOpenChange={setIsSaveTemplateOpen}>
                        <DialogTrigger asChild>
                            <button className="flex items-center gap-2 rounded-lg border px-4 py-2 hover:bg-muted">
                                <Copy className="h-4 w-4" />
                                Save as Template
                            </button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Lưu làm Template</DialogTitle>
                                <DialogDescription>
                                    Lưu workflow hiện tại thành một template mới.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <label htmlFor="template-name" className="text-sm font-medium">Tên Template</label>
                                    <input
                                        id="template-name"
                                        type="text"
                                        value={newTemplateName}
                                        onChange={(e) => setNewTemplateName(e.target.value)}
                                        placeholder="VD: Email Notification Flow"
                                        className="rounded-md border px-3 py-2"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <label htmlFor="template-description" className="text-sm font-medium">Mô tả</label>
                                    <textarea
                                        id="template-description"
                                        value={newTemplateDescription}
                                        onChange={(e) => setNewTemplateDescription(e.target.value)}
                                        placeholder="Describe your template..."
                                        className="rounded-md border px-3 py-2 min-h-[100px]"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <label htmlFor="template-category" className="text-sm font-medium">Danh mục</label>
                                    <select
                                        id="template-category"
                                        value={newTemplateCategory}
                                        onChange={(e) => setNewTemplateCategory(e.target.value)}
                                        className="rounded-md border px-3 py-2"
                                    >
                                        <option value="education">Education</option>
                                        <option value="communication">Communication</option>
                                        <option value="automation">Automation</option>
                                        <option value="reporting">Reporting</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex justify-end gap-2">
                                <button
                                    onClick={() => setIsSaveTemplateOpen(false)}
                                    className="rounded-md border px-4 py-2 hover:bg-muted"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={handleSaveAsTemplate}
                                    disabled={isSavingTemplate || !newTemplateName.trim()}
                                    className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-primary-foreground hover:opacity-90 disabled:opacity-50"
                                >
                                    {isSavingTemplate && <Loader2 className="h-4 w-4 animate-spin" />}
                                    Lưu Template
                                </button>
                            </div>
                        </DialogContent>
                    </Dialog>

                    <button
                        onClick={handleSaveWorkflow}
                        disabled={isSaving}
                        className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-primary-foreground hover:opacity-90 disabled:opacity-50"
                    >
                        {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        Save
                    </button>
                    <button
                        onClick={handleExecute}
                        className="flex items-center gap-2 rounded-lg border px-4 py-2 hover:bg-muted"
                    >
                        <Play className="h-4 w-4" />
                        Execute
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex gap-4 flex-1 overflow-hidden">
                <div className="w-64 shrink-0">
                    <NodePalette />
                </div>
                <div className="flex-1">
                    <WorkflowCanvas
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        setNodes={setNodes}
                        setEdges={setEdges}
                    />
                </div>
            </div>
        </div>
    );
}

export default function WorkflowBuilderPage() {
    return (
        <ReactFlowProvider>
            <WorkflowBuilderContent />
        </ReactFlowProvider>
    );
}
