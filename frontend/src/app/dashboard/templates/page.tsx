"use client";

import { Workflow as WorkflowIcon, Plus, Loader2, Copy } from "lucide-react";
import { useEffect, useState } from "react";
import { Template, TemplateService } from "@/services/template.service";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function TemplatesPage() {
    const [templates, setTemplates] = useState<Template[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<string>("all");
    const router = useRouter();

    useEffect(() => {
        fetchTemplates();
    }, []);

    const fetchTemplates = async () => {
        try {
            const data = await TemplateService.getAll();
            setTemplates(data);
        } catch (error) {
            console.error("Failed to fetch templates:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleUseTemplate = async (templateId: string, templateName: string) => {
        try {
            const workflow = await TemplateService.useTemplate(templateId, {
                name: `${templateName} - Copy`
            });
            alert("Template created as new workflow!");
            router.push(`/dashboard/workflows/builder?id=${workflow.id}`);
        } catch (error) {
            console.error("Failed to use template:", error);
            alert("Failed to create workflow from template.");
        }
    };

    const categories = ["all", "education", "automation", "notification", "grading"];
    const filteredTemplates = selectedCategory === "all"
        ? templates
        : templates.filter(t => t.category === selectedCategory);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Workflow Templates</h1>
                    <p className="text-muted-foreground">
                        Bắt đầu nhanh với các template có sẵn
                    </p>
                </div>
                <Link
                    href="/dashboard/workflows"
                    className="flex items-center gap-2 rounded-lg border px-4 py-2 hover:bg-muted"
                >
                    Workflows của tôi
                </Link>
            </div>

            {/* Category Filter */}
            <div className="flex gap-2">
                {categories.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`rounded-lg px-4 py-2 text-sm ${selectedCategory === cat
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted hover:bg-muted/80'
                            }`}
                    >
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="flex justify-center p-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : filteredTemplates.length === 0 ? (
                <div className="rounded-lg border border-dashed bg-muted/50 p-12 text-center">
                    <WorkflowIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-semibold">
                        {selectedCategory === "all" ? "Chưa có template nào" : `Không có template trong category "${selectedCategory}"`}
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Tạo workflows của bạn và lưu làm template để tái sử dụng
                    </p>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredTemplates.map((template) => (
                        <div
                            key={template.id}
                            className="rounded-lg border bg-card p-6 hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-full bg-primary/10 p-2">
                                        <WorkflowIcon className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold">{template.name}</h3>
                                        {template.category && (
                                            <span className="inline-block mt-1 rounded bg-secondary px-2 py-0.5 text-xs">
                                                {template.category}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <p className="text-sm text-muted-foreground mb-4">
                                {template.description || "Không có mô tả"}
                            </p>
                            <div className="text-xs text-muted-foreground mb-4">
                                {template.nodes?.length || 0} nodes • {template.edges?.length || 0} connections
                            </div>
                            <button
                                onClick={() => handleUseTemplate(template.id, template.name)}
                                className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-primary-foreground hover:opacity-90"
                            >
                                <Copy className="h-4 w-4" />
                                Sử dụng template
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
