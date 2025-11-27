"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ExamService, ExamResult } from "@/services/exam.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Clock, Target, Home } from "lucide-react";

export default function ExamResultPage() {
    const params = useParams();
    const router = useRouter();
    const attemptId = params.id as string;

    const [result, setResult] = useState<ExamResult | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadResult = async () => {
            try {
                setLoading(true);
                const data = await ExamService.getExamResult(attemptId);
                setResult(data);
            } catch (error) {
                console.error("Failed to load result:", error);
                alert("Không thể tải kết quả. Vui lòng thử lại.");
                router.push("/dashboard/student-exams");
            } finally {
                setLoading(false);
            }
        };

        loadResult();
    }, [attemptId, router]);

    if (loading || !result) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-lg">Đang tải kết quả...</div>
            </div>
        );
    }

    const score = result.totalScore || 0;
    const passed = result.passed || false;
    const exam = result.exam;

    return (
        <div className="min-h-screen bg-background p-4 md:p-8">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-2xl">Kết quả bài thi</CardTitle>
                            <Badge variant={passed ? "default" : "destructive"} className="text-lg px-4 py-1">
                                {passed ? (
                                    <>
                                        <CheckCircle2 className="h-5 w-5 mr-2" />
                                        Đạt
                                    </>
                                ) : (
                                    <>
                                        <XCircle className="h-5 w-5 mr-2" />
                                        Không đạt
                                    </>
                                )}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {exam && (
                            <div>
                                <h3 className="text-lg font-semibold">{exam.title}</h3>
                                {exam.description && (
                                    <p className="text-muted-foreground">{exam.description}</p>
                                )}
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                                <Target className="h-8 w-8 text-primary" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Điểm số</p>
                                    <p className="text-2xl font-bold">{score.toFixed(1)}</p>
                                </div>
                            </div>

                            {exam && (
                                <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                                    <Target className="h-8 w-8 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Điểm đạt</p>
                                        <p className="text-2xl font-bold">{exam.passingScore}%</p>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                                <Clock className="h-8 w-8 text-muted-foreground" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Hoàn thành lúc</p>
                                    <p className="text-sm font-medium">
                                        {result.submittedAt
                                            ? new Date(result.submittedAt).toLocaleString('vi-VN')
                                            : 'N/A'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {result.isGraded && (
                            <div className="text-sm text-muted-foreground">
                                <p>Chấm điểm tự động: {result.autoGradeScore?.toFixed(1) || 'N/A'}</p>
                                {result.manualGradeScore !== null && result.manualGradeScore !== undefined && (
                                    <p>Chấm điểm thủ công: {result.manualGradeScore.toFixed(1)}</p>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Answers Review */}
                <Card>
                    <CardHeader>
                        <CardTitle>Chi tiết câu trả lời</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {result.answers && result.answers.length > 0 ? (
                            result.answers.map((answer, index) => (
                                <div
                                    key={index}
                                    className="p-4 border rounded-lg"
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <span className="font-semibold">Câu {index + 1}</span>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground mb-1">Câu trả lời của bạn:</p>
                                        <p className="font-medium">{answer.answer || <em className="text-muted-foreground">Chưa trả lời</em>}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-muted-foreground text-center py-8">
                                Không có câu trả lời nào được ghi nhận
                            </p>
                        )}
                    </CardContent>
                </Card>

                {/* Actions */}
                <div className="flex justify-center gap-4">
                    <Button
                        variant="outline"
                        onClick={() => router.push("/dashboard/student-exams")}
                        className="gap-2"
                    >
                        <Home className="h-4 w-4" />
                        Về trang chủ
                    </Button>
                    {exam && (
                        <Button
                            onClick={() => router.push(`/dashboard/student-exams`)}
                            className="gap-2"
                        >
                            Làm bài khác
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
