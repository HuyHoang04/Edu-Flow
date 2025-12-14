"use client";

import { useEffect, useState } from "react";
import { FileText, Plus, Loader2, Trash2, ExternalLink, BarChart3, Edit, Copy } from "lucide-react";

// ... (inside component)

const handleCopyLink = (id: string) => {
    const url = `${window.location.origin}/forms/public/${id}`;
    navigator.clipboard.writeText(url);
    toast.success("Đã sao chép liên kết vào bộ nhớ tạm");
};

// ... (inside return)

import { Form, FormService } from "@/services/form.service";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function FormsPage() {
    const [forms, setForms] = useState<Form[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);

    // Create State
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        loadForms();
    }, []);

    const loadForms = async () => {
        try {
            setIsLoading(true);
            const data = await FormService.getAll();
            setForms(data);
        } catch (error) {
            console.error("Failed to load forms", error);
            toast.error("Không thể tải danh sách biểu mẫu");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreate = async () => {
        if (!title) {
            toast.error("Vui lòng nhập tiêu đề biểu mẫu");
            return;
        }

        setCreating(true);
        try {
            await FormService.create({
                title,
                description,
                fields: [], // Empty fields initially
                createdBy: "Teacher",
                isActive: true
            });
            toast.success("Đã tạo biểu mẫu thành công");
            setShowCreate(false);
            setTitle("");
            setDescription("");
            loadForms();
        } catch (error) {
            console.error("Failed to create form", error);
            toast.error("Tạo biểu mẫu thất bại");
        } finally {
            setCreating(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Bạn có chắc chắn muốn xóa biểu mẫu này?")) return;
        try {
            await FormService.delete(id);
            toast.success("Đã xóa biểu mẫu");
            loadForms();
        } catch (error) {
            console.error("Failed to delete form", error);
            toast.error("Xóa thất bại");
        }
    };

    const handleCopyLink = (id: string) => {
        const url = `${window.location.origin}/forms/public/${id}`;
        navigator.clipboard.writeText(url);
        toast.success("Đã sao chép liên kết vào bộ nhớ tạm");
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Biểu mẫu</h1>
                    <p className="text-muted-foreground">Tạo khảo sát và thu thập phản hồi</p>
                </div>
                <Button onClick={() => setShowCreate(true)} className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Tạo biểu mẫu
                </Button>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center h-60">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : forms.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-60 text-muted-foreground border rounded-lg bg-muted/10 border-dashed">
                    <FileText className="h-12 w-12 mb-2 opacity-20" />
                    <p>Chưa có biểu mẫu nào</p>
                    <Button variant="link" onClick={() => setShowCreate(true)}>Tạo ngay</Button>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-3">
                    {forms.map((form) => (
                        <div key={form.id} className="group relative rounded-lg border bg-card p-6 hover:shadow-md transition-all">
                            <div className="flex items-start justify-between mb-4">
                                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                    <FileText className="h-5 w-5" />
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => handleDelete(form.id)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            <h3 className="text-lg font-semibold mb-1 truncate" title={form.title}>{form.title}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-2 h-10 mb-4">
                                {form.description || "Không có mô tả"}
                            </p>

                            <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                                <span>{new Date(form.createdAt).toLocaleDateString()}</span>
                                <span className={cn(
                                    "px-2 py-0.5 rounded-full",
                                    form.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                                )}>
                                    {form.isActive ? "Đang mở" : "Đã đóng"}
                                </span>
                            </div>

                            <div className="grid grid-cols-4 gap-2">
                                <Button variant="outline" size="sm" className="w-full p-0" asChild title="Chỉnh sửa">
                                    <Link href={`/dashboard/forms/${form.id}/edit`}>
                                        <Edit className="h-4 w-4" />
                                    </Link>
                                </Button>
                                <Button variant="outline" size="sm" className="w-full p-0" asChild title="Xem trước">
                                    <Link href={`/forms/public/${form.id}`} target="_blank">
                                        <ExternalLink className="h-4 w-4" />
                                    </Link>
                                </Button>
                                <Button variant="outline" size="sm" className="w-full p-0" onClick={() => handleCopyLink(form.id)} title="Sao chép liên kết">
                                    <Copy className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="sm" className="w-full p-0" asChild title="Xem kết quả">
                                    <Link href={`/dashboard/forms/${form.id}/results`}>
                                        <BarChart3 className="h-4 w-4" />
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create Dialog */}
            <Dialog open={showCreate} onOpenChange={setShowCreate}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Tạo Biểu Mẫu Mới</DialogTitle>
                        <DialogDescription>Tạo khảo sát mới để thu thập ý kiến</DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Tiêu đề</label>
                            <input
                                placeholder="Nhập tiêu đề biểu mẫu..."
                                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Mô tả</label>
                            <textarea
                                placeholder="Mô tả ngắn về biểu mẫu..."
                                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowCreate(false)}>Hủy</Button>
                        <Button onClick={handleCreate} disabled={creating}>
                            {creating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                            Tạo Mới
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
