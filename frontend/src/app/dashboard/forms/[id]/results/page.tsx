"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { FormService } from "@/services/form.service";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, ArrowLeft, Download, FileText } from "lucide-react";
import { toast } from "sonner";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from "recharts";
import { saveAs } from "file-saver";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"];

export default function FormResultsPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const [stats, setStats] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, [id]);

    const loadStats = async () => {
        try {
            setIsLoading(true);
            const data = await FormService.getStats(id);
            setStats(data);
        } catch (error) {
            console.error("Failed to load stats", error);
            toast.error("Không thể tải thống kê");
        } finally {
            setIsLoading(false);
        }
    };

    const handleExport = async () => {
        try {
            const data = await FormService.getResponses(id);

            // Convert to CSV
            if (data.length === 0) {
                toast.warning("Chưa có dữ liệu để xuất");
                return;
            }

            // Get all unique keys (headers)
            const headers = ["ID", "Email", "Tên", "Thời gian nộp"];
            // We assume all responses follow the form structure, but let's just dump the answers JSON for now or try to flatten it if possible.
            // A simple approach: JSON export
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
            saveAs(blob, `form-results-${id}.json`);
            toast.success("Đã xuất dữ liệu thành công");
        } catch (error) {
            console.error("Export failed", error);
            toast.error("Xuất dữ liệu thất bại");
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!stats) return null;

    return (
        <div className="max-w-6xl mx-auto space-y-6 pb-20">
            {/* Header */}
            <div className="flex items-center justify-between sticky top-0 bg-background/95 backdrop-blur z-10 py-4 border-b">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/forms")}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-xl font-bold">Kết quả: {stats.title}</h1>
                        <p className="text-sm text-muted-foreground">{stats.totalResponses} câu trả lời</p>
                    </div>
                </div>
                <Button onClick={handleExport} variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Xuất dữ liệu (JSON)
                </Button>
            </div>

            <div className="grid gap-6">
                {Object.entries(stats.fieldStats).map(([fieldId, fieldStat]: [string, any]) => (
                    <Card key={fieldId}>
                        <CardHeader>
                            <CardTitle className="text-lg font-medium">{fieldStat.fieldLabel}</CardTitle>
                            <CardDescription>
                                {fieldStat.totalAnswers} câu trả lời ({fieldStat.responseRate.toFixed(1)}%)
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {/* Charts for Choice Questions */}
                            {["radio", "select", "checkbox"].includes(fieldStat.fieldType) && fieldStat.distribution && (
                                <div className="h-[300px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart
                                            data={Object.entries(fieldStat.distribution).map(([name, value]) => ({ name, value }))}
                                            layout="vertical"
                                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis type="number" allowDecimals={false} />
                                            <YAxis dataKey="name" type="category" width={150} />
                                            <Tooltip />
                                            <Legend />
                                            <Bar dataKey="value" name="Số lượng" fill="#8884d8">
                                                {Object.entries(fieldStat.distribution).map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            )}

                            {/* Text Responses Preview */}
                            {["text", "textarea", "date"].includes(fieldStat.fieldType) && (
                                <div className="bg-muted/30 rounded-md p-4 max-h-[200px] overflow-y-auto">
                                    <div className="flex items-center text-sm text-muted-foreground mb-2">
                                        <FileText className="h-4 w-4 mr-2" />
                                        Dữ liệu dạng văn bản (Xem chi tiết trong file xuất)
                                    </div>
                                    <p className="text-sm italic text-muted-foreground">
                                        Biểu đồ không khả dụng cho loại câu hỏi này.
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
