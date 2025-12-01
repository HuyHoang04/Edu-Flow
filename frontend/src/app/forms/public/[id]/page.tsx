"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Form, FormService } from "@/services/form.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function PublicFormPage() {
    const params = useParams();
    const id = params.id as string;

    const [form, setForm] = useState<Form | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [answers, setAnswers] = useState<Record<string, any>>({});
    const [respondentEmail, setRespondentEmail] = useState("");
    const [respondentName, setRespondentName] = useState("");

    useEffect(() => {
        loadForm();
    }, [id]);

    const loadForm = async () => {
        try {
            setIsLoading(true);
            const data = await FormService.getPublic(id);
            setForm(data);
        } catch (error) {
            console.error("Failed to load form", error);
            setError("Biểu mẫu không tồn tại hoặc đã bị đóng.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleAnswerChange = (fieldId: string, value: any) => {
        setAnswers(prev => ({ ...prev, [fieldId]: value }));
    };

    const handleCheckboxChange = (fieldId: string, option: string, checked: boolean) => {
        setAnswers(prev => {
            const current = prev[fieldId] || [];
            if (checked) {
                return { ...prev, [fieldId]: [...current, option] };
            } else {
                return { ...prev, [fieldId]: current.filter((item: string) => item !== option) };
            }
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form) return;

        // Validate required fields
        const missingFields = form.fields.filter(f => f.required && !answers[f.id]);
        if (missingFields.length > 0) {
            toast.error(`Vui lòng điền đầy đủ các trường bắt buộc: ${missingFields.map(f => f.label).join(", ")}`);
            return;
        }

        if (!respondentEmail) {
            toast.error("Vui lòng nhập email của bạn");
            return;
        }

        setIsSubmitting(true);
        try {
            await FormService.submitPublic(id, {
                respondentEmail,
                respondentName,
                answers
            });
            setIsSubmitted(true);
            toast.success("Gửi câu trả lời thành công!");
        } catch (error) {
            console.error("Failed to submit form", error);
            toast.error("Gửi thất bại. Vui lòng thử lại.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-slate-50">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error || !form) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-slate-50 p-4">
                <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h1 className="text-xl font-bold mb-2">Không thể truy cập biểu mẫu</h1>
                    <p className="text-muted-foreground">{error || "Đã có lỗi xảy ra."}</p>
                </div>
            </div>
        );
    }

    if (isSubmitted) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-slate-50 p-4">
                <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md w-full">
                    <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold mb-2">Cảm ơn bạn!</h1>
                    <p className="text-muted-foreground mb-6">Câu trả lời của bạn đã được ghi nhận.</p>
                    <Button onClick={() => window.location.reload()} variant="outline">
                        Gửi câu trả lời khác
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto space-y-6">
                {/* Form Header */}
                <Card className="border-t-4 border-t-primary">
                    <CardHeader>
                        <CardTitle className="text-3xl">{form.title}</CardTitle>
                        {form.description && (
                            <CardDescription className="text-base mt-2">
                                {form.description}
                            </CardDescription>
                        )}
                    </CardHeader>
                </Card>

                {/* Respondent Info */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Thông tin người trả lời</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="name@example.com"
                                    value={respondentEmail}
                                    onChange={(e) => setRespondentEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="name">Họ và tên</Label>
                                <Input
                                    id="name"
                                    placeholder="Nguyễn Văn A"
                                    value={respondentName}
                                    onChange={(e) => setRespondentName(e.target.value)}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Form Fields */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {form.fields.map((field) => (
                        <Card key={field.id}>
                            <CardContent className="pt-6">
                                <div className="space-y-4">
                                    <Label className="text-base">
                                        {field.label}
                                        {field.required && <span className="text-red-500 ml-1">*</span>}
                                    </Label>

                                    {field.type === 'text' && (
                                        <Input
                                            value={answers[field.id] || ''}
                                            onChange={(e) => handleAnswerChange(field.id, e.target.value)}
                                            placeholder="Câu trả lời của bạn"
                                            required={field.required}
                                        />
                                    )}

                                    {field.type === 'textarea' && (
                                        <Textarea
                                            value={answers[field.id] || ''}
                                            onChange={(e) => handleAnswerChange(field.id, e.target.value)}
                                            placeholder="Câu trả lời của bạn"
                                            required={field.required}
                                        />
                                    )}

                                    {field.type === 'radio' && field.options && (
                                        <RadioGroup
                                            value={answers[field.id] || ''}
                                            onValueChange={(value) => handleAnswerChange(field.id, value)}
                                        >
                                            {field.options.map((option, index) => (
                                                <div key={index} className="flex items-center space-x-2">
                                                    <RadioGroupItem value={option} id={`${field.id}-${index}`} />
                                                    <Label htmlFor={`${field.id}-${index}`} className="font-normal">
                                                        {option}
                                                    </Label>
                                                </div>
                                            ))}
                                        </RadioGroup>
                                    )}

                                    {field.type === 'checkbox' && field.options && (
                                        <div className="space-y-2">
                                            {field.options.map((option, index) => (
                                                <div key={index} className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={`${field.id}-${index}`}
                                                        checked={(answers[field.id] || []).includes(option)}
                                                        onCheckedChange={(checked) =>
                                                            handleCheckboxChange(field.id, option, checked as boolean)
                                                        }
                                                    />
                                                    <Label htmlFor={`${field.id}-${index}`} className="font-normal">
                                                        {option}
                                                    </Label>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {field.type === 'select' && field.options && (
                                        <Select
                                            value={answers[field.id] || ''}
                                            onValueChange={(value: string) => handleAnswerChange(field.id, value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Chọn một tùy chọn" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {field.options.map((option, index) => (
                                                    <SelectItem key={index} value={option}>
                                                        {option}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}

                                    {field.type === 'date' && (
                                        <Input
                                            type="date"
                                            value={answers[field.id] || ''}
                                            onChange={(e) => handleAnswerChange(field.id, e.target.value)}
                                            required={field.required}
                                        />
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    <div className="flex justify-end pt-4 pb-12">
                        <Button type="submit" size="lg" disabled={isSubmitting}>
                            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Gửi câu trả lời
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
