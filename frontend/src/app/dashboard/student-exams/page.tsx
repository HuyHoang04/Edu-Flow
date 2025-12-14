"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ExamService, Exam } from "@/services/exam.service";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, FileText, Target, Play } from "lucide-react";

export default function StudentExamsPage() {
    const router = useRouter();
    const [exams, setExams] = useState<Exam[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchExams();
    }, []);

    const fetchExams = async () => {
        try {
            setLoading(true);
            const data = await ExamService.getAvailableExams();
            setExams(data);
        } catch (error) {
            console.error("Failed to fetch exams:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleStartExam = async (examId: string) => {
        try {
            const attempt = await ExamService.startExam(examId);
            router.push(`/dashboard/student-exams/${attempt.id}`);
        } catch (error) {
            console.error("Failed to start exam:", error);
            toast.error("Không thể bắt đầu bài thi. Vui lòng thử lại.");
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-lg">Đang tải...</div>
            </div>
        );
    }

    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold">Bài thi của tôi</h1>
                <p className="text-muted-foreground mt-2">
                    Danh sách các bài thi có sẵn cho bạn
                </p>
            </div>

            {exams.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">Chưa có bài thi nào</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {exams.map((exam) => (
                        <Card key={exam.id} className="hover:shadow-lg transition-shadow">
                            <CardHeader>
                                <CardTitle className="flex items-start justify-between">
                                    <span className="line-clamp-2">{exam.title}</span>
                                </CardTitle>
                                {exam.description && (
                                    <CardDescription className="line-clamp-2">
                                        {exam.description}
                                    </CardDescription>
                                )}
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex items-center text-sm">
                                        <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                                        <span>Thời gian: {exam.durationMinutes} phút</span>
                                    </div>
                                    <div className="flex items-center text-sm">
                                        <Target className="h-4 w-4 mr-2 text-muted-foreground" />
                                        <span>Điểm đạt: {exam.passingScore}%</span>
                                    </div>
                                    <div className="flex items-center text-sm">
                                        <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                                        <span>Số câu hỏi: {exam.questions?.length || 0}</span>
                                    </div>
                                </div>
                                <Button
                                    className="w-full gap-2"
                                    onClick={() => handleStartExam(exam.id)}
                                >
                                    <Play className="h-4 w-4" />
                                    Bắt đầu làm bài
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
