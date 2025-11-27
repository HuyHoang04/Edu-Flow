"use client";

import { useEffect, useState } from "react";
import { WorkflowCanvas } from "@/components/workflow/WorkflowCanvas";
import { NodePalette } from "@/components/workflow/NodePalette";
import { Save, Play, Settings, Loader2, Copy, Wand2, ArrowLeft, LayoutTemplate } from "lucide-react";
import { ReactFlowProvider, useNodesState, useEdgesState, Edge } from "@xyflow/react";
import { WorkflowService } from "@/services/workflow.service";
import { useSearchParams, useRouter } from "next/navigation";
import { WorkflowNode } from "@/types/workflow";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

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
            toast.error("Failed to load workflow");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveWorkflow = async () => {
        if (!workflowName.trim()) {
            toast.error("Please enter a workflow name");
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
                toast.success("Workflow updated successfully!");
            } else {
                const newWorkflow = await WorkflowService.create(workflowData);
                toast.success("Workflow created successfully!");
                router.push(`/dashboard/workflows/builder?id=${newWorkflow.id}`);
            }
        } catch (error) {
            console.error("Failed to save workflow", error);
            toast.error("Failed to save workflow");
        } finally {
            setIsSaving(false);
        }
    };

    const handleExecute = async () => {
        if (!workflowId) {
            toast.error("Please save the workflow first.");
            return;
        }
        try {
            await WorkflowService.execute(workflowId);
            toast.success("Workflow execution started!");
        } catch (error) {
            console.error("Failed to execute workflow", error);
            toast.error("Failed to execute workflow");
        }
    };

    // Template State
    const [isTemplateOpen, setIsTemplateOpen] = useState(false);
    const [templates, setTemplates] = useState<any[]>([]);
    const [loadingTemplates, setLoadingTemplates] = useState(false);

    const fetchTemplates = async () => {
        setLoadingTemplates(true);
        try {
            const data = await WorkflowService.getAllTemplates();
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
            toast.success("Template imported successfully!");
        } catch (error) {
            console.error("Failed to import template:", error);
            toast.error("Failed to import template");
        }
    };

    // Save as Template State
    const [isSaveTemplateOpen, setIsSaveTemplateOpen] = useState(false);
    const [newTemplateName, setNewTemplateName] = useState("");
    const [newTemplateDescription, setNewTemplateDescription] = useState("");
    const [newTemplateCategory, setNewTemplateCategory] = useState("education");
    const [isSavingTemplate, setIsSavingTemplate] = useState(false);

    const handleSaveAsTemplate = async () => {
        if (!workflowId) {
            toast.error("Please save the workflow first before saving as template.");
            return;
        }
        setIsSavingTemplate(true);
        try {
            await WorkflowService.saveAsTemplate(workflowId, {
                name: newTemplateName,
                description: newTemplateDescription,
                category: newTemplateCategory
            });
            toast.success("Template saved successfully!");
            setIsSaveTemplateOpen(false);
            setNewTemplateName("");
            setNewTemplateDescription("");
        } catch (error) {
            console.error("Failed to save template:", error);
            toast.error("Failed to save template");
        } finally {
            setIsSavingTemplate(false);
        }
    };

    // AI Assistant State
    const [showAiAssistant, setShowAiAssistant] = useState(false);
    const [aiPrompt, setAiPrompt] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);

    const handleAiGenerate = async () => {
        if (!aiPrompt.trim()) return;
        setIsGenerating(true);
        try {
            const result = await WorkflowService.generateAi(aiPrompt);
            if (result && result.nodes && result.edges) {
                setNodes(result.nodes);
                setEdges(result.edges);
                toast.success("Workflow generated successfully!");
                setShowAiAssistant(false);
            }
        } catch (error) {
            toast.error("Failed to generate workflow");
            console.error(error);
        } finally {
            setIsGenerating(false);
        }
    };

    if (isLoading) {
        return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    return (
        <div className="space-y-4 h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between border-b pb-4 px-4 pt-4 bg-background">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <input
                            type="text"
                            value={workflowName}
                            onChange={(e) => setWorkflowName(e.target.value)}
                            className="text-lg font-bold bg-transparent border-none focus:outline-none focus:ring-0 p-0"
                        />
                        <p className="text-xs text-muted-foreground">
                            {isSaving ? "Saving..." : "All changes saved"}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setShowAiAssistant(true)}>
                        <Wand2 className="mr-2 h-4 w-4" />
                        AI Assistant
                    </Button>

                    {/* Import Template Dialog */}
                    <Dialog open={isTemplateOpen} onOpenChange={(open) => {
                        setIsTemplateOpen(open);
                        if (open) fetchTemplates();
                    }}>
                        <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                                <Copy className="mr-2 h-4 w-4" />
                                Import Template
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Select Template</DialogTitle>
                                <DialogDescription>
                                    Choose a template to add to your current workflow.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                {loadingTemplates ? (
                                    <div className="flex justify-center p-4">
                                        <Loader2 className="h-6 w-6 animate-spin" />
                                    </div>
                                ) : templates.length === 0 ? (
                                    <p className="text-center text-muted-foreground">No templates available.</p>
                                ) : (
                                    <div className="grid gap-4">
                                        {templates.map((template) => (
                                            <div key={template.id} className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted/50">
                                                <div>
                                                    <h4 className="font-semibold">{template.name}</h4>
                                                    <p className="text-sm text-muted-foreground">{template.description || "No description"}</p>
                                                    <div className="text-xs text-muted-foreground mt-1">
                                                        {template.nodes?.length || 0} nodes • {template.category || "Uncategorized"}
                                                    </div>
                                                </div>
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleImportTemplate(template.id)}
                                                >
                                                    Add
                                                </Button>
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
                            <Button variant="outline" size="sm">
                                <LayoutTemplate className="mr-2 h-4 w-4" />
                                Save as Template
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Save as Template</DialogTitle>
                                <DialogDescription>
                                    Save this workflow as a reusable template.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="template-name">Template Name</Label>
                                    <Input
                                        id="template-name"
                                        value={newTemplateName}
                                        onChange={(e) => setNewTemplateName(e.target.value)}
                                        placeholder="e.g., Exam Approval Process"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="template-description">Description</Label>
                                    <Textarea
                                        id="template-description"
                                        value={newTemplateDescription}
                                        onChange={(e) => setNewTemplateDescription(e.target.value)}
                                        placeholder="Describe your template..."
                                        className="min-h-[100px]"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="template-category">Category</Label>
                                    <Input
                                        id="template-category"
                                        value={newTemplateCategory}
                                        onChange={(e) => setNewTemplateCategory(e.target.value)}
                                        placeholder="e.g., Education"
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsSaveTemplateOpen(false)}>Cancel</Button>
                                <Button
                                    onClick={handleSaveAsTemplate}
                                    disabled={isSavingTemplate || !newTemplateName.trim()}
                                >
                                    {isSavingTemplate && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Save Template
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    <Button onClick={handleSaveWorkflow} disabled={isSaving} size="sm">
                        {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        Save
                    </Button>
                    <Button variant="outline" onClick={handleExecute} size="sm">
                        <Play className="mr-2 h-4 w-4" />
                        Execute
                    </Button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex gap-4 flex-1 overflow-hidden px-4 pb-4">
                <div className="w-64 shrink-0">
                    <NodePalette />
                </div>
                <div className="flex-1 border rounded-lg overflow-hidden bg-background">
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

            {/* AI Assistant Dialog */}
            <Dialog open={showAiAssistant} onOpenChange={setShowAiAssistant}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>AI Workflow Assistant</DialogTitle>
                        <DialogDescription>
                            Describe the workflow you want to build, and AI will create it for you.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Prompt</Label>
                            <Textarea
                                value={aiPrompt}
                                onChange={(e) => setAiPrompt(e.target.value)}
                                placeholder="e.g., Send an email to the student when they submit an exam, then wait 2 days and send a follow-up."
                                className="min-h-[100px]"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowAiAssistant(false)}>Cancel</Button>
                        <Button onClick={handleAiGenerate} disabled={isGenerating}>
                            {isGenerating ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <Wand2 className="mr-2 h-4 w-4" />
                                    Generate
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
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
