"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { useParams, useRouter } from "next/navigation";
import { ExamService, ExamAttempt, Exam } from "@/services/exam.service";
import { ExamTimer } from "@/components/exam/exam-timer";
import { QuestionRenderer } from "@/components/exam/question-renderer";
import { QuestionNavigator } from "@/components/exam/question-navigator";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, Send, Save } from "lucide-react";

export default function ExamTakingPage() {
    const params = useParams();
    const router = useRouter();
    const examId = params.id as string;

    const [attempt, setAttempt] = useState<ExamAttempt | null>(null);
    const [exam, setExam] = useState<Exam | null>(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Map<string, string>>(new Map());
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [showSubmitDialog, setShowSubmitDialog] = useState(false);

    // Load exam and attempt data
    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                // Start or resume exam
                const attemptData = await ExamService.startExam(examId);
                setAttempt(attemptData);

                // Get exam details (securely)
                const examData = await ExamService.getExamForTaking(examId);
                setExam(examData);

                // Load saved answers from localStorage (backup) or attempt data
                const savedAnswers = localStorage.getItem(`exam-${attemptData.id}`);
                if (savedAnswers) {
                    setAnswers(new Map(JSON.parse(savedAnswers)));
                } else if (attemptData.answers && attemptData.answers.length > 0) {
                    const answerMap = new Map(
                        attemptData.answers.map((a: any) => [a.questionId, a.answer])
                    );
                    setAnswers(answerMap);
                }
            } catch (error) {
                console.error("Failed to load exam:", error);
                toast.error("Không thể tải bài thi. Vui lòng đăng nhập lại.");
                router.push(`/exam-entry/${examId}`);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [examId, router]);

    // Auto-save answers to localStorage every 10 seconds
    useEffect(() => {
        if (answers.size === 0 || !attempt) return;

        const interval = setInterval(() => {
            localStorage.setItem(`exam-${attempt.id}`, JSON.stringify(Array.from(answers.entries())));
        }, 10000); // Save every 10 seconds

        return () => clearInterval(interval);
    }, [answers, attempt]);

    const handleAnswerChange = useCallback((questionId: string, answer: string) => {
        if (!attempt) return;
        setAnswers(prev => {
            const newAnswers = new Map(prev);
            newAnswers.set(questionId, answer);
            // Immediate save to localStorage
            localStorage.setItem(`exam-${attempt.id}`, JSON.stringify(Array.from(newAnswers.entries())));
            return newAnswers;
        });
    }, [attempt]);

    const handleSubmit = async () => {
        if (!attempt) return;
        try {
            setSubmitting(true);
            const answerArray = Array.from(answers.entries()).map(([questionId, answer]) => ({
                questionId,
                answer,
            }));

            await ExamService.submitExam(attempt.id, answerArray);

            // Clear localStorage
            localStorage.removeItem(`exam-${attempt.id}`);
            sessionStorage.removeItem("student_token"); // Clear token on submit? Maybe keep it for result page.

            // Redirect to results (we might need a public result page too)
            // For now, just show alert or redirect to entry page with success message
            toast.success("Nộp bài thành công!");
            router.push(`/exam-entry/${examId}`);
        } catch (error) {
            console.error("Failed to submit exam:", error);
            toast.error("Không thể nộp bài. Vui lòng thử lại.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleTimeExpired = useCallback(() => {
        toast.warning("Hết thời gian! Bài thi sẽ được nộp tự động.");
        handleSubmit();
    }, [handleSubmit]);

    if (loading || !exam || !attempt) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-lg">Đang tải bài thi...</div>
            </div>
        );
    }

    const questions = exam.questions || [];
    const currentQuestion = questions[currentQuestionIndex];
    const answeredQuestions = new Set(
        Array.from(answers.keys())
            .map(qId => questions.findIndex(q => q.id === qId))
            .filter(idx => idx !== -1)
    );

    const canGoPrevious = currentQuestionIndex > 0;
    const canGoNext = currentQuestionIndex < questions.length - 1;
    const unansweredCount = questions.length - answers.size;

    return (
        <div className="min-h-screen bg-background p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl font-bold">{exam.title}</h1>
                        <p className="text-muted-foreground">
                            Câu {currentQuestionIndex + 1} / {questions.length}
                        </p>
                    </div>
                    <ExamTimer
                        durationMinutes={exam.durationMinutes}
                        startedAt={attempt.startedAt}
                        onTimeExpired={handleTimeExpired}
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-3 space-y-6">
                        <Card>
                            <CardContent className="pt-6">
                                {currentQuestion && (
                                    <QuestionRenderer
                                        question={currentQuestion}
                                        answer={answers.get(currentQuestion.id) || ""}
                                        onAnswerChange={(answer) =>
                                            handleAnswerChange(currentQuestion.id, answer)
                                        }
                                        questionNumber={currentQuestionIndex + 1}
                                    />
                                )}
                            </CardContent>
                        </Card>

                        {/* Navigation Buttons */}
                        <div className="flex justify-between items-center">
                            <Button
                                variant="outline"
                                onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                                disabled={!canGoPrevious}
                            >
                                <ChevronLeft className="h-4 w-4 mr-2" />
                                Câu trước
                            </Button>

                            {canGoNext ? (
                                <Button onClick={() => setCurrentQuestionIndex(prev => prev + 1)}>
                                    Câu tiếp
                                    <ChevronRight className="h-4 w-4 ml-2" />
                                </Button>
                            ) : (
                                <Button onClick={() => setShowSubmitDialog(true)} className="gap-2">
                                    <Send className="h-4 w-4" />
                                    Nộp bài
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <Card className="sticky top-4">
                            <CardHeader>
                                <CardTitle className="text-base">Tiến độ</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="text-sm">
                                    <div className="flex justify-between mb-2">
                                        <span className="text-muted-foreground">Đã trả lời:</span>
                                        <span className="font-semibold">{answers.size}/{questions.length}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Chưa trả lời:</span>
                                        <span className="font-semibold text-amber-600">{unansweredCount}</span>
                                    </div>
                                </div>

                                <QuestionNavigator
                                    totalQuestions={questions.length}
                                    currentQuestion={currentQuestionIndex}
                                    answeredQuestions={answeredQuestions}
                                    onQuestionSelect={setCurrentQuestionIndex}
                                />

                                <Button
                                    variant="outline"
                                    className="w-full gap-2"
                                    onClick={() => {
                                        if (attempt) {
                                            localStorage.setItem(`exam-${attempt.id}`, JSON.stringify(Array.from(answers.entries())));
                                            toast.success("Đã lưu nháp!");
                                        }
                                    }}
                                >
                                    <Save className="h-4 w-4" />
                                    Lưu nháp
                                </Button>

                                <Button
                                    variant="default"
                                    className="w-full gap-2"
                                    onClick={() => setShowSubmitDialog(true)}
                                >
                                    <Send className="h-4 w-4" />
                                    Nộp bài
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Submit Confirmation Dialog */}
            <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Xác nhận nộp bài</DialogTitle>
                        <DialogDescription>
                            Bạn có chắc chắn muốn nộp bài không?
                            {unansweredCount > 0 && (
                                <p className="mt-2 text-amber-600">
                                    Bạn còn {unansweredCount} câu chưa trả lời.
                                </p>
                            )}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowSubmitDialog(false)}>
                            Hủy
                        </Button>
                        <Button onClick={handleSubmit} disabled={submitting}>
                            {submitting ? "Đang nộp..." : "Nộp bài"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
