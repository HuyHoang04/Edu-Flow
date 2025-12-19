"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ExamService, ExamResult, Exam } from "@/services/exam.service";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, XCircle, BrainCircuit, FileText, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function ExamResultsPage() {
    const params = useParams();
    const id = params.id as string;
    const [results, setResults] = useState<ExamResult[]>([]);
    const [exam, setExam] = useState<Exam | null>(null);
    const [selectedResult, setSelectedResult] = useState<ExamResult | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (id) {
            loadData();
        }
    }, [id]);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [examData, resultsData] = await Promise.all([
                ExamService.getById(id),
                ExamService.getExamResults(id)
            ]);
            setExam(examData);
            setResults(resultsData);
        } catch (error) {
            console.error("Failed to load results", error);
            toast.error("Không thể tải kết quả bài kiểm tra");
        } finally {
            setIsLoading(false);
        }
    };

    const getScoreColor = (score: number, total: number) => {
        const percentage = (score / total) * 100;
        if (percentage >= 80) return "text-green-600";
        if (percentage >= 50) return "text-yellow-600";
        return "text-red-600";
    };

    if (isLoading) {
        return <div className="flex items-center justify-center h-full"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    }

    return (
        <div className="space-y-6 p-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <FileText className="h-6 w-6 text-primary" />
                        Kết quả: {exam?.title}
                    </h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        Tổng số bài nộp: {results.length}
                    </p>
                </div>
            </div>

            <div className="bg-card border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                        <tr>
                            <th className="p-4 text-left font-medium">Sinh Viên</th>
                            <th className="p-4 text-left font-medium">Thời gian nộp</th>
                            <th className="p-4 text-center font-medium">Điểm số</th>
                            <th className="p-4 text-center font-medium">Trạng thái</th>
                            <th className="p-4 text-right font-medium">Hành động</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {results.map((result) => (
                            <tr key={result.id} className="hover:bg-muted/30 transition-colors">
                                <td className="p-4 font-medium flex items-center gap-2">
                                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                        <User className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="font-semibold">{result.student?.name || "Unknown Student"}</p>
                                        <p className="text-xs text-muted-foreground">{result.student?.code || result.studentId}</p>
                                    </div>
                                </td>
                                <td className="p-4 text-muted-foreground">
                                    {result.submittedAt ? new Date(result.submittedAt).toLocaleString() : '-'}
                                </td>
                                <td className="p-4 text-center font-bold">
                                    <span className={getScoreColor(result.totalScore || 0, exam?.totalPoints || 100)}>
                                        {result.totalScore ?? '-'}
                                    </span>
                                    <span className="text-muted-foreground font-normal"> / {exam?.totalPoints}</span>
                                </td>
                                <td className="p-4 text-center">
                                    {result.isGraded ? (
                                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                                            <CheckCircle className="h-3 w-3" /> Đã chấm
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs font-medium">
                                            <Loader2 className="h-3 w-3 animate-spin" /> Đang chấm
                                        </span>
                                    )}
                                </td>
                                <td className="p-4 text-right">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setSelectedResult(result)}
                                    >
                                        Chi tiết
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Detail Dialog with AI Feedback */}
            <Dialog open={!!selectedResult} onOpenChange={(open) => !open && setSelectedResult(null)}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-primary" />
                            Chi tiết kết quả
                        </DialogTitle>
                        <DialogDescription>
                            Kết quả bài làm chi tiết
                        </DialogDescription>
                    </DialogHeader>

                    {selectedResult && (
                        <div className="space-y-6 py-4">
                            {/* Score Card */}
                            <div className="flex items-center justify-between bg-muted/30 p-4 rounded-lg border">
                                <div>
                                    <p className="text-sm text-muted-foreground">Tổng điểm</p>
                                    <p className="text-3xl font-bold text-primary">
                                        {selectedResult.totalScore ?? 0} <span className="text-base text-muted-foreground font-normal">/ {exam?.totalPoints}</span>
                                    </p>
                                </div>
                                <div className={cn(
                                    "px-3 py-1 rounded text-sm font-medium",
                                    (selectedResult.totalScore || 0) >= (exam?.passingScore || 0)
                                        ? "bg-green-100 text-green-700"
                                        : "bg-red-100 text-red-700"
                                )}>
                                    {(selectedResult.totalScore || 0) >= (exam?.passingScore || 0) ? "ĐẠT" : "KHÔNG ĐẠT"}
                                </div>
                            </div>

                            {(selectedResult as any).feedback && (
                                <div className="space-y-2">
                                    <h3 className="font-semibold text-sm">Nhận xét</h3>
                                    <div className="p-4 bg-blue-50 text-blue-900 rounded-lg text-sm leading-relaxed">
                                        {(selectedResult as any).feedback}
                                    </div>
                                </div>
                            )}

                            {((selectedResult as any).strengths?.length > 0 || (selectedResult as any).improvements?.length > 0) && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {(selectedResult as any).strengths?.length > 0 && (
                                        <div className="space-y-2">
                                            <h3 className="font-semibold text-sm text-green-700">Điểm mạnh</h3>
                                            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                                                {(selectedResult as any).strengths.map((item: string, i: number) => (
                                                    <li key={i}>{item}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                    {(selectedResult as any).improvements?.length > 0 && (
                                        <div className="space-y-2">
                                            <h3 className="font-semibold text-sm text-orange-700">Cần cải thiện</h3>
                                            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                                                {(selectedResult as any).improvements.map((item: string, i: number) => (
                                                    <li key={i}>{item}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
