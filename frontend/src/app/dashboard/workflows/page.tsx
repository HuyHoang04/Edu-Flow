"use client";

import { Workflow as WorkflowIcon, Plus, Play, Loader2, Edit, Trash2, Copy, LayoutTemplate } from "lucide-react";
import { useEffect, useState } from "react";
import { WorkflowService, Workflow } from "@/services/workflow.service";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function WorkflowsPage() {
    const [workflows, setWorkflows] = useState<Workflow[]>([]);
    const [templates, setTemplates] = useState<Workflow[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("my-workflows");
    const router = useRouter();

    // Use Template State
    const [selectedTemplate, setSelectedTemplate] = useState<Workflow | null>(null);
    const [newWorkflowName, setNewWorkflowName] = useState("");
    const [isCreatingFromTemplate, setIsCreatingFromTemplate] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [workflowsData, templatesData] = await Promise.all([
                WorkflowService.getAll(),
                WorkflowService.getAllTemplates()
            ]);
            setWorkflows(workflowsData);
            setTemplates(templatesData);
        } catch (error) {
            console.error("Failed to fetch data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Bạn có chắc muốn xóa workflow này?")) return;
        try {
            await WorkflowService.delete(id);
            fetchData(); // Refresh list
        } catch (error) {
            console.error("Failed to delete workflow:", error);
            alert("Failed to delete workflow.");
        }
    };

    const handleExecute = async (id: string) => {
        try {
            await WorkflowService.execute(id);
            alert("Workflow executed successfully!");
        } catch (error) {
            console.error("Failed to execute workflow:", error);
            alert("Failed to execute workflow.");
        }
    };

    const handleUseTemplate = async () => {
        if (!selectedTemplate || !newWorkflowName.trim()) return;

        setIsCreatingFromTemplate(true);
        try {
            const newWorkflow = await WorkflowService.useTemplate(selectedTemplate.id, {
                name: newWorkflowName
            });
            router.push(`/dashboard/workflows/builder?id=${newWorkflow.id}`);
        } catch (error) {
            console.error("Failed to create workflow from template:", error);
            alert("Failed to create workflow from template");
            setIsCreatingFromTemplate(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Workflow</h1>
                    <p className="text-muted-foreground">
                        Tự động hóa công việc với workflow
                    </p>
                </div>
                <Link
                    href="/dashboard/workflows/builder"
                    className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-primary-foreground hover:opacity-90"
                >
                    <Plus className="h-5 w-5" />
                    Tạo workflow
                </Link>
            </div>

            <Tabs defaultValue="my-workflows" className="w-full" onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
                    <TabsTrigger value="my-workflows">My Workflows</TabsTrigger>
                    <TabsTrigger value="templates">Templates</TabsTrigger>
                </TabsList>

                <TabsContent value="my-workflows" className="mt-6">
                    {loading ? (
                        <div className="flex justify-center p-12">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : workflows.length === 0 ? (
                        <div className="rounded-lg border border-dashed bg-muted/50 p-12 text-center">
                            <WorkflowIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                            <h3 className="mt-4 text-lg font-semibold">
                                Chưa có workflow nào
                            </h3>
                            <p className="mt-2 text-sm text-muted-foreground">
                                Kéo thả các node để tạo workflow tự động
                            </p>
                            <Link
                                href="/dashboard/workflows/builder"
                                className="mt-4 inline-block rounded-lg bg-primary px-4 py-2 text-primary-foreground hover:opacity-90"
                            >
                                Bắt đầu ngay
                            </Link>
                        </div>
                    ) : (
                        <div className="grid gap-6">
                            {workflows.map((workflow) => (
                                <div key={workflow.id} className="rounded-lg border bg-card p-6 hover:shadow-md transition-shadow">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3 flex-1">
                                            <div className="rounded-full bg-primary/10 p-2">
                                                <WorkflowIcon className="h-5 w-5 text-primary" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold">{workflow.name}</h3>
                                                <p className="text-sm text-muted-foreground">
                                                    {workflow.description || "Không có mô tả"}
                                                </p>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    {workflow.nodes?.length || 0} nodes • Tạo {new Date(workflow.createdAt).toLocaleDateString('vi-VN')}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleExecute(workflow.id)}
                                                className="flex items-center gap-2 rounded-lg border px-3 py-2 hover:bg-muted"
                                                title="Chạy workflow"
                                            >
                                                <Play className="h-4 w-4" />
                                                Chạy
                                            </button>
                                            <Link
                                                href={`/dashboard/workflows/builder?id=${workflow.id}`}
                                                className="flex items-center gap-2 rounded-lg border px-3 py-2 hover:bg-muted"
                                                title="Sửa workflow"
                                            >
                                                <Edit className="h-4 w-4" />
                                                Sửa
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(workflow.id)}
                                                className="rounded-lg border px-3 py-2 hover:bg-destructive hover:text-destructive-foreground"
                                                title="Xóa workflow"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="templates" className="mt-6">
                    {loading ? (
                        <div className="flex justify-center p-12">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : templates.length === 0 ? (
                        <div className="rounded-lg border border-dashed bg-muted/50 p-12 text-center">
                            <LayoutTemplate className="mx-auto h-12 w-12 text-muted-foreground" />
                            <h3 className="mt-4 text-lg font-semibold">
                                Chưa có template nào
                            </h3>
                            <p className="mt-2 text-sm text-muted-foreground">
                                Lưu workflow của bạn thành template để tái sử dụng
                            </p>
                        </div>
                    ) : (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {templates.map((template) => (
                                <div key={template.id} className="rounded-lg border bg-card p-6 hover:shadow-md transition-shadow flex flex-col justify-between">
                                    <div>
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="rounded-full bg-blue-100 p-2 text-blue-600">
                                                <LayoutTemplate className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold line-clamp-1">{template.name}</h3>
                                                <span className="text-xs text-muted-foreground capitalize bg-muted px-2 py-0.5 rounded-full">
                                                    {template.category || "General"}
                                                </span>
                                            </div>
                                        </div>
                                        <p className="text-sm text-muted-foreground line-clamp-3 mb-4 h-[60px]">
                                            {template.description || "Không có mô tả"}
                                        </p>
                                        <div className="text-xs text-muted-foreground mb-4">
                                            {template.nodes?.length || 0} nodes
                                        </div>
                                    </div>
                                    <Button
                                        className="w-full gap-2"
                                        variant="outline"
                                        onClick={() => {
                                            setSelectedTemplate(template);
                                            setNewWorkflowName(`Copy of ${template.name}`);
                                        }}
                                    >
                                        <Copy className="h-4 w-4" />
                                        Sử dụng Template
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>

            {/* Use Template Dialog */}
            <Dialog open={!!selectedTemplate} onOpenChange={(open) => !open && setSelectedTemplate(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Tạo Workflow từ Template</DialogTitle>
                        <DialogDescription>
                            Nhập tên cho workflow mới của bạn dựa trên template này.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Tên Workflow</Label>
                            <Input
                                id="name"
                                value={newWorkflowName}
                                onChange={(e) => setNewWorkflowName(e.target.value)}
                                placeholder="Nhập tên workflow..."
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setSelectedTemplate(null)}>
                            Hủy
                        </Button>
                        <Button onClick={handleUseTemplate} disabled={isCreatingFromTemplate || !newWorkflowName.trim()}>
                            {isCreatingFromTemplate && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Tạo Workflow
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
