"use client";

import { Workflow as WorkflowIcon, Plus, Play, Loader2, Edit, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { WorkflowService, Workflow } from "@/services/workflow.service";
import Link from "next/link";

export default function WorkflowsPage() {
    const [workflows, setWorkflows] = useState<Workflow[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchWorkflows();
    }, []);

    const fetchWorkflows = async () => {
        try {
            const data = await WorkflowService.getAll();
            setWorkflows(data);
        } catch (error) {
            console.error("Failed to fetch workflows:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Bạn có chắc muốn xóa workflow này?")) return;
        try {
            await WorkflowService.delete(id);
            fetchWorkflows();
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

            {!loading && workflows.length > 0 && (
                <div className="rounded-lg border border-dashed bg-muted/50 p-8 text-center">
                    <h3 className="text-lg font-semibold">
                        Xây dựng workflow với drag & drop
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Kéo thả các node để tạo workflow tự động
                    </p>
                    <Link
                        href="/dashboard/workflows/builder"
                        className="mt-4 inline-block rounded-lg bg-primary px-4 py-2 text-primary-foreground hover:opacity-90"
                    >
                        Tạo workflow mới
                    </Link>
                </div>
            )}
        </div>
    );
}
