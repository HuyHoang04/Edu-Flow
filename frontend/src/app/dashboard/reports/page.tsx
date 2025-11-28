"use client";

import { useEffect, useState } from "react";
import { BarChart3, Download, Loader2, Plus, FileText, Trash2, Calendar, GraduationCap, Users, TrendingUp } from "lucide-react";
import { Report, ReportService } from "@/services/report.service";
import { Class, ClassService } from "@/services/class.service";
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

export default function ReportsPage() {
    const [reports, setReports] = useState<Report[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);

    // Create State
    const [reportType, setReportType] = useState<'attendance' | 'exam_results' | 'class_performance'>('attendance');
    const [classes, setClasses] = useState<Class[]>([]);
    const [selectedClassId, setSelectedClassId] = useState("");
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
    const [generating, setGenerating] = useState(false);

    useEffect(() => {
        loadReports();
        loadClasses();
    }, []);

    const loadReports = async () => {
        try {
            setIsLoading(true);
            const data = await ReportService.getAll();
            setReports(data);
        } catch (error) {
            console.error("Failed to load reports", error);
            toast.error("Không thể tải danh sách báo cáo");
        } finally {
            setIsLoading(false);
        }
    };

    const loadClasses = async () => {
        try {
            const data = await ClassService.getAll();
            setClasses(data);
            if (data.length > 0) setSelectedClassId(data[0].id);
        } catch (error) {
            console.error("Failed to load classes", error);
        }
    };

    const handleCreate = async () => {
        if (!selectedClassId) {
            toast.error("Vui lòng chọn lớp học");
            return;
        }

        setGenerating(true);
        try {
            if (reportType === 'attendance') {
                await ReportService.generateAttendance({
                    classId: selectedClassId,
                    startDate,
                    endDate,
                    generatedBy: "Teacher"
                });
            } else if (reportType === 'class_performance') {
                // Assuming endpoint exists or using placeholder
                toast.info("Tính năng đang phát triển");
                setGenerating(false);
                return;
            }

            toast.success("Đã tạo báo cáo thành công");
            setShowCreate(false);
            loadReports();
        } catch (error) {
            console.error("Failed to generate report", error);
            toast.error("Tạo báo cáo thất bại");
        } finally {
            setGenerating(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Bạn có chắc chắn muốn xóa báo cáo này?")) return;
        try {
            await ReportService.delete(id);
            toast.success("Đã xóa báo cáo");
            loadReports();
        } catch (error) {
            console.error("Failed to delete report", error);
            toast.error("Xóa thất bại");
        }
    };

    const getReportIcon = (type: string) => {
        switch (type) {
            case 'attendance': return <Calendar className="h-5 w-5 text-blue-500" />;
            case 'exam_results': return <GraduationCap className="h-5 w-5 text-green-500" />;
            case 'class_performance': return <Users className="h-5 w-5 text-purple-500" />;
            case 'student_progress': return <TrendingUp className="h-5 w-5 text-orange-500" />;
            default: return <FileText className="h-5 w-5 text-gray-500" />;
        }
    };

    const getReportLabel = (type: string) => {
        switch (type) {
            case 'attendance': return "Báo cáo điểm danh";
            case 'exam_results': return "Kết quả thi";
            case 'class_performance': return "Hiệu suất lớp học";
            case 'student_progress': return "Tiến độ sinh viên";
            default: return "Báo cáo";
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Báo cáo</h1>
                    <p className="text-muted-foreground">Tạo và quản lý các báo cáo thống kê</p>
                </div>
                <Button onClick={() => setShowCreate(true)} className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Tạo báo cáo
                </Button>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center h-60">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : reports.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-60 text-muted-foreground border rounded-lg bg-muted/10 border-dashed">
                    <BarChart3 className="h-12 w-12 mb-2 opacity-20" />
                    <p>Chưa có báo cáo nào được tạo</p>
                    <Button variant="link" onClick={() => setShowCreate(true)}>Tạo ngay</Button>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {reports.map((report) => (
                        <div key={report.id} className="group relative rounded-lg border bg-card p-6 hover:shadow-md transition-all">
                            <div className="flex items-start justify-between mb-4">
                                <div className="h-10 w-10 rounded-lg bg-muted/50 flex items-center justify-center">
                                    {getReportIcon(report.type)}
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => handleDelete(report.id)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            <div className="mb-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                {getReportLabel(report.type)}
                            </div>
                            <h3 className="text-lg font-semibold mb-4 truncate" title={report.title}>{report.title}</h3>

                            <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                                <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                                <span>{report.generatedBy}</span>
                            </div>

                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" className="w-full">
                                    Xem chi tiết
                                </Button>
                                <Button variant="outline" size="sm" className="w-full">
                                    <Download className="h-3 w-3 mr-1" /> Tải về
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
                        <DialogTitle>Tạo Báo Cáo Mới</DialogTitle>
                        <DialogDescription>Chọn loại báo cáo và tham số</DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Loại báo cáo</label>
                            <select
                                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                value={reportType}
                                onChange={(e) => setReportType(e.target.value as any)}
                            >
                                <option value="attendance">Báo cáo điểm danh</option>
                                <option value="class_performance">Hiệu suất lớp học</option>
                                <option value="exam_results">Kết quả thi</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Lớp học</label>
                            <select
                                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                value={selectedClassId}
                                onChange={(e) => setSelectedClassId(e.target.value)}
                            >
                                {classes.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>

                        {reportType === 'attendance' && (
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Từ ngày</label>
                                    <input
                                        type="date"
                                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Đến ngày</label>
                                    <input
                                        type="date"
                                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowCreate(false)}>Hủy</Button>
                        <Button onClick={handleCreate} disabled={generating}>
                            {generating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <BarChart3 className="mr-2 h-4 w-4" />}
                            Tạo Báo Cáo
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
