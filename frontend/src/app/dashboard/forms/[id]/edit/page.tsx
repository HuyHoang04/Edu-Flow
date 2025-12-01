"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Form, FormService, FormField, FormFieldType } from "@/services/form.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Loader2, Plus, Trash2, Save, ArrowLeft, GripVertical } from "lucide-react";
import { toast } from "sonner";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

export default function FormBuilderPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const [form, setForm] = useState<Form | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        loadForm();
    }, [id]);

    const loadForm = async () => {
        try {
            setIsLoading(true);
            const data = await FormService.getById(id);
            setForm(data);
        } catch (error) {
            console.error("Failed to load form", error);
            toast.error("Không thể tải biểu mẫu");
            router.push("/dashboard/forms");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        if (!form) return;
        setIsSaving(true);
        try {
            await FormService.update(id, {
                title: form.title,
                description: form.description,
                fields: form.fields,
                isActive: form.isActive
            });
            toast.success("Đã lưu biểu mẫu");
        } catch (error) {
            console.error("Failed to save form", error);
            toast.error("Lưu thất bại");
        } finally {
            setIsSaving(false);
        }
    };

    const addField = () => {
        if (!form) return;
        const newField: FormField = {
            id: crypto.randomUUID(),
            type: "text",
            label: "Câu hỏi mới",
            required: false,
            options: []
        };
        setForm({ ...form, fields: [...form.fields, newField] });
    };

    const removeField = (fieldId: string) => {
        if (!form) return;
        setForm({ ...form, fields: form.fields.filter(f => f.id !== fieldId) });
    };

    const updateField = (fieldId: string, updates: Partial<FormField>) => {
        if (!form) return;
        setForm({
            ...form,
            fields: form.fields.map(f => f.id === fieldId ? { ...f, ...updates } : f)
        });
    };

    const onDragEnd = (result: any) => {
        if (!result.destination || !form) return;

        const items = Array.from(form.fields);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        setForm({ ...form, fields: items });
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!form) return null;

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-20">
            {/* Header */}
            <div className="flex items-center justify-between sticky top-0 bg-background/95 backdrop-blur z-10 py-4 border-b">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/forms")}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-xl font-bold">Chỉnh sửa biểu mẫu</h1>
                        <p className="text-sm text-muted-foreground">Thiết kế nội dung khảo sát</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 mr-4">
                        <Switch
                            checked={form.isActive}

                        />
                        <Label>Đang mở</Label>
                    </div>
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        Lưu thay đổi
                    </Button>
                </div>
            </div>

            {/* Form Info */}
            <Card>
                <CardHeader>
                    <CardTitle>Thông tin chung</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Tiêu đề biểu mẫu</Label>
                        <Input
                            value={form.title}
                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                            className="text-lg font-semibold"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Mô tả</Label>
                        <Textarea
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            placeholder="Mô tả mục đích của biểu mẫu này..."
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Fields Builder */}
            <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="form-fields">
                    {(provided) => (
                        <div
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            className="space-y-4"
                        >
                            {form.fields.map((field, index) => (
                                <Draggable key={field.id} draggableId={field.id} index={index}>
                                    {(provided) => (
                                        <Card
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            className="relative group border-l-4 border-l-transparent hover:border-l-primary transition-all"
                                        >
                                            <CardContent className="p-6 space-y-4">
                                                <div className="flex items-start gap-4">
                                                    <div
                                                        {...provided.dragHandleProps}
                                                        className="mt-2 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
                                                    >
                                                        <GripVertical className="h-5 w-5" />
                                                    </div>

                                                    <div className="flex-1 space-y-4">
                                                        <div className="flex gap-4">
                                                            <div className="flex-1 space-y-2">
                                                                <Label>Câu hỏi</Label>
                                                                <Input
                                                                    value={field.label}
                                                                    onChange={(e) => updateField(field.id, { label: e.target.value })}
                                                                    placeholder="Nhập nội dung câu hỏi..."
                                                                />
                                                            </div>
                                                            <div className="w-[200px] space-y-2">
                                                                <Label>Loại câu hỏi</Label>
                                                                <Select
                                                                    value={field.type}
                                                                    onValueChange={(value: FormFieldType) => updateField(field.id, { type: value })}
                                                                >
                                                                    <SelectTrigger>
                                                                        <SelectValue />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        <SelectItem value="text">Văn bản ngắn</SelectItem>
                                                                        <SelectItem value="textarea">Đoạn văn</SelectItem>
                                                                        <SelectItem value="radio">Trắc nghiệm (1 đáp án)</SelectItem>
                                                                        <SelectItem value="checkbox">Hộp kiểm (Nhiều đáp án)</SelectItem>
                                                                        <SelectItem value="select">Menu thả xuống</SelectItem>
                                                                        <SelectItem value="date">Ngày tháng</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>
                                                        </div>

                                                        {/* Options Editor for Choice Types */}
                                                        {["radio", "checkbox", "select"].includes(field.type) && (
                                                            <div className="pl-4 border-l-2 border-muted space-y-2">
                                                                <Label className="text-xs uppercase text-muted-foreground">Các lựa chọn</Label>
                                                                {field.options?.map((option, optIndex) => (
                                                                    <div key={optIndex} className="flex gap-2">
                                                                        <Input
                                                                            value={option}
                                                                            onChange={(e) => {
                                                                                const newOptions = [...(field.options || [])];
                                                                                newOptions[optIndex] = e.target.value;
                                                                                updateField(field.id, { options: newOptions });
                                                                            }}
                                                                            placeholder={`Lựa chọn ${optIndex + 1}`}
                                                                            className="h-8 text-sm"
                                                                        />
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="icon"
                                                                            className="h-8 w-8 text-muted-foreground hover:text-red-500"
                                                                            onClick={() => {
                                                                                const newOptions = field.options?.filter((_, i) => i !== optIndex);
                                                                                updateField(field.id, { options: newOptions });
                                                                            }}
                                                                        >
                                                                            <Trash2 className="h-3 w-3" />
                                                                        </Button>
                                                                    </div>
                                                                ))}
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="h-8 text-xs"
                                                                    onClick={() => updateField(field.id, { options: [...(field.options || []), ""] })}
                                                                >
                                                                    <Plus className="h-3 w-3 mr-1" /> Thêm lựa chọn
                                                                </Button>
                                                            </div>
                                                        )}

                                                        <div className="flex items-center justify-between pt-2">
                                                            <div className="flex items-center gap-2">
                                                                <Switch
                                                                    checked={field.required}
                                                                    onCheckedChange={(checked) => updateField(field.id, { required: checked })}
                                                                />
                                                                <Label className="text-sm text-muted-foreground">Bắt buộc trả lời</Label>
                                                            </div>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                                                onClick={() => removeField(field.id)}
                                                            >
                                                                <Trash2 className="h-4 w-4 mr-2" />
                                                                Xóa câu hỏi
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )}
                                </Draggable>
                            ))}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
            </DragDropContext>

            <Button
                variant="outline"
                className="w-full py-8 border-dashed"
                onClick={addField}
            >
                <Plus className="h-6 w-6 mr-2" />
                Thêm câu hỏi mới
            </Button>
        </div>
    );
}
