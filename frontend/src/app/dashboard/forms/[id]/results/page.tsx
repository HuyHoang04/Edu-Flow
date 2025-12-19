"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { FormService } from "@/services/form.service";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ArrowLeft, Download, BarChart3, Users, Calendar } from "lucide-react";
import { toast } from "sonner";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";

export default function FormResultsPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const [stats, setStats] = useState<any>(null);
    const [responses, setResponses] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedResponse, setSelectedResponse] = useState<any>(null);
    const [showDetail, setShowDetail] = useState(false);

    useEffect(() => {
        loadData();
    }, [id]);

    const loadData = async () => {
        try {
            setIsLoading(true);
            const [statsData, responsesData] = await Promise.all([
                FormService.getStats(id),
                FormService.getResponses(id)
            ]);
            setStats(statsData);
            setResponses(responsesData);
        } catch (error) {
            console.error("Failed to load results", error);
            toast.error("Không thể tải kết quả biểu mẫu");
        } finally {
            setIsLoading(false);
        }
    };

    const handleExport = () => {
        // Simple CSV export
        if (responses.length === 0) return;

        // Get all unique headers (questions)
        const headers = ["Email", "Tên", "Thời gian nộp"];
        const fieldIds = Object.keys(stats.fieldStats);
        fieldIds.forEach(fid => {
            headers.push(stats.fieldStats[fid].fieldLabel);
        });

        // Create CSV content
        let csvContent = headers.join(",") + "\n";

        responses.forEach(r => {
            const row = [
                `"${r.respondentEmail}"`,
                `"${r.respondentName || ''}"`,
                `"${new Date(r.submittedAt).toLocaleString('vi-VN')}"`
            ];

            fieldIds.forEach(fid => {
                let answer = r.answers[fid];
                if (Array.isArray(answer)) answer = answer.join("; ");
                if (answer === undefined || answer === null) answer = "";
                // Escape quotes
                answer = String(answer).replace(/"/g, '""');
                row.push(`"${answer}"`);
            });

            csvContent += row.join(",") + "\n";
        });

        // Download
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `ket-qua-${stats.title}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleViewDetail = (response: any) => {
        setSelectedResponse(response);
        setShowDetail(true);
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
        <div className="space-y-6 pb-20">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/forms")}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">Kết quả: {stats.title}</h1>
                        <p className="text-muted-foreground">Tổng hợp phản hồi từ người dùng</p>
                    </div>
                </div>
                <Button onClick={handleExport} disabled={responses.length === 0}>
                    <Download className="mr-2 h-4 w-4" />
                    Xuất Excel (CSV)
                </Button>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Tổng phản hồi</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalResponses}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Phản hồi mới nhất</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {responses.length > 0
                                ? new Date(responses[0].submittedAt).toLocaleDateString('vi-VN')
                                : "--/--"}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Tỷ lệ hoàn thành</CardTitle>
                        <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">100%</div>
                    </CardContent>
                </Card>
            </div>

            {/* Field Stats */}
            <div className="grid gap-6 md:grid-cols-2">
                {Object.entries(stats.fieldStats).map(([fieldId, stat]: [string, any]) => (
                    <Card key={fieldId} className="flex flex-col">
                        <CardHeader>
                            <CardTitle className="text-base font-medium leading-relaxed">
                                {stat.fieldLabel}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1">
                            {stat.distribution ? (
                                <div className="space-y-2">
                                    {Object.entries(stat.distribution).map(([option, count]: [string, any]) => (
                                        <div key={option} className="space-y-1">
                                            <div className="flex justify-between text-sm">
                                                <span>{option}</span>
                                                <span className="font-medium">
                                                    {count} ({Math.round((count / stat.totalAnswers) * 100)}%)
                                                </span>
                                            </div>
                                            <div className="h-2 bg-secondary rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-primary"
                                                    style={{ width: `${(count / stat.totalAnswers) * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-sm text-muted-foreground">
                                    {stat.totalAnswers} câu trả lời văn bản
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Detailed Responses Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Danh sách chi tiết</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Thời gian</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Tên</TableHead>
                                    <TableHead className="text-right">Hành động</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {responses.map((response) => (
                                    <TableRow key={response.id}>
                                        <TableCell>
                                            {new Date(response.submittedAt).toLocaleString('vi-VN')}
                                        </TableCell>
                                        <TableCell>{response.respondentEmail}</TableCell>
                                        <TableCell>{response.respondentName || "Ẩn danh"}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="sm" onClick={() => handleViewDetail(response)}>Xem chi tiết</Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {responses.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                            Chưa có phản hồi nào
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Response Detail Dialog */}
            <Dialog open={showDetail} onOpenChange={setShowDetail}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Chi tiết phản hồi</DialogTitle>
                        <DialogDescription>
                            Người gửi: {selectedResponse?.respondentName || selectedResponse?.respondentEmail} <br />
                            Thời gian: {selectedResponse?.submittedAt && new Date(selectedResponse.submittedAt).toLocaleString('vi-VN')}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6 py-4">
                        {stats && selectedResponse && Object.entries(stats.fieldStats).map(([fieldId, stat]: [string, any]) => {
                            let answer = selectedResponse.answers[fieldId];
                            if (Array.isArray(answer)) answer = answer.join(", ");
                            if (answer === undefined || answer === null) answer = "(Không trả lời)";

                            return (
                                <div key={fieldId} className="space-y-2 pb-4 border-b last:border-0 last:pb-0">
                                    <h4 className="font-medium text-sm text-muted-foreground">{stat.fieldLabel}</h4>
                                    <p className="text-base whitespace-pre-wrap">{String(answer)}</p>
                                </div>
                            );
                        })}
                    </div>

                    <DialogFooter>
                        <Button onClick={() => setShowDetail(false)}>Đóng</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
