"use client";

import { ClipboardList, Plus, Loader2, Calendar as CalendarIcon, Clock, ArrowLeft, CheckSquare, Trash2, Search, Link2, Save, AlertCircle, CheckCircle, BrainCircuit } from "lucide-react";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Exam, ExamService } from "@/services/exam.service";
import { Class, ClassService } from "@/services/class.service";
import { Question, QuestionService } from "@/services/question.service";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function ExamsPage() {
    const router = useRouter();
    const [exams, setExams] = useState<Exam[]>([]);
    const [classes, setClasses] = useState<Class[]>([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [creating, setCreating] = useState(false);

    // Detail View State
    const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
    const [availableQuestions, setAvailableQuestions] = useState<Question[]>([]);
    const [addQuestionOpen, setAddQuestionOpen] = useState(false);
    const [selectedQuestionsToAdd, setSelectedQuestionsToAdd] = useState<string[]>([]);
    const [questionSearchTerm, setQuestionSearchTerm] = useState("");

    // Create Question State
    const [createQuestionOpen, setCreateQuestionOpen] = useState(false);
    const [creatingQuestion, setCreatingQuestion] = useState(false);
    const [saveQuestionToBank, setSaveQuestionToBank] = useState(true);
    const [newQuestionData, setNewQuestionData] = useState<Partial<Question>>({
        content: "",
        type: "multiple_choice",
        subject: "Toán",
        topic: "",
        difficulty: "medium",
        correctAnswer: "",
        options: ""
    });

    // New Exam State
    const [newExam, setNewExam] = useState<Partial<Exam>>({
        title: "",
        description: "",
        durationMinutes: 60,

        totalPoints: 10,
        passingScore: 5,
        classId: "",
        questions: [],
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16)
    });

    useEffect(() => {
        fetchExams();
        fetchClasses();
    }, []);

    const fetchExams = async () => {
        try {
            const data = await ExamService.getAll();
            setExams(data);
        } catch (error) {
            console.error("Failed to fetch exams:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchClasses = async () => {
        try {
            const data = await ClassService.getAll();
            setClasses(data);
        } catch (error) {
            console.error("Failed to fetch classes:", error);
        }
    };

    const fetchQuestions = async () => {
        try {
            const data = await QuestionService.getAll();
            setAvailableQuestions(data);
        } catch (error) {
            console.error("Failed to fetch questions:", error);
        }
    };

    const handleCreateNewQuestion = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreatingQuestion(true);
        try {
            let questionData = { ...newQuestionData };

            // Parse options if needed
            if (typeof questionData.options === 'string' && questionData.options.trim() !== "") {
                try {
                    if (questionData.options.startsWith('[') || questionData.options.startsWith('{')) {
                        questionData.options = JSON.parse(questionData.options);
                    } else {
                        questionData.options = questionData.options.split(',').map((o: string) => o.trim());
                    }
                } catch (e) {
                    console.warn("Failed to parse options, using as string");
                }
            }

            // Create question
            const createdQuestion = saveQuestionToBank
                ? await QuestionService.create(questionData)
                : { id: `temp-${Date.now()}`, ...questionData }; // Temporary question for exam-only

            // Add to current exam
            if (selectedExam) {
                const currentQuestions = selectedExam.questions || [];
                const newQuestionToAdd = {
                    questionId: createdQuestion.id,
                    order: currentQuestions.length + 1,
                    points: 1
                };

                await ExamService.update(selectedExam.id, {
                    questions: [...currentQuestions, newQuestionToAdd] as any
                });

                // Refresh exam
                const updatedExam = await ExamService.getById(selectedExam.id);
                setSelectedExam(updatedExam);
                fetchQuestions(); // Refresh available questions if we saved to bank
            }

            toast.success("Câu hỏi đã được tạo và thêm vào đề thi!");
            setCreateQuestionOpen(false);
            setNewQuestionData({
                content: "",
                type: "multiple_choice",
                subject: "Toán",
                topic: "",
                difficulty: "medium",
                correctAnswer: "",
                options: ""
            });
        } catch (error) {
            console.error("Failed to create question:", error);
            toast.error("Tạo câu hỏi thất bại.");
        } finally {
            setCreatingQuestion(false);
        }
    };

    const handleCreateExam = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreating(true);
        try {
            await ExamService.create(newExam);
            toast.success("Tạo đề thi thành công!");
            setOpen(false);
            setNewExam({
                title: "",
                description: "",
                durationMinutes: 60,

                totalPoints: 10,
                passingScore: 5,
                classId: "",
                questions: [],
                deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16)
            });
            fetchExams();
        } catch (error) {
            console.error("Failed to create exam:", error);
            toast.error("Tạo đề thi thất bại.");
        } finally {
            setCreating(false);
        }
    };

    const handleSaveDraft = async () => {
        if (!newExam.title) {
            toast.error("Vui lòng nhập tiêu đề đề thi!");
            return;
        }
        setCreating(true);
        try {
            await ExamService.create({
                ...newExam,
                description: newExam.description || "(Nháp)",
                durationMinutes: newExam.durationMinutes || 60,

                totalPoints: newExam.totalPoints || 10,
                passingScore: newExam.passingScore || 5,
                questions: newExam.questions || [],
                deadline: newExam.deadline ? new Date(newExam.deadline).toISOString() : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
            });
            toast.success("Đã lưu nháp!");
            setOpen(false);
            setNewExam({
                title: "",
                description: "",
                durationMinutes: 60,

                totalPoints: 10,
                passingScore: 5,
                classId: "",
                questions: [],
                deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16)
            });
            fetchExams();
        } catch (error) {
            console.error("Failed to save draft:", error);
            toast.error("Lưu nháp thất bại.");
        } finally {
            setCreating(false);
        }
    };
    const handleAddQuestions = async () => {
        if (!selectedExam) return;
        try {
            const currentQuestions = selectedExam.questions || [];

            const newQuestionsToAdd = selectedQuestionsToAdd.map((qId, index) => ({
                questionId: qId,
                order: currentQuestions.length + index + 1,
                points: 1
            }));
            const updatedQuestions = [...currentQuestions, ...newQuestionsToAdd];

            await ExamService.update(selectedExam.id, {
                questions: updatedQuestions as any
            });

            const updatedExam = await ExamService.getById(selectedExam.id);
            setSelectedExam(updatedExam);
            setAddQuestionOpen(false);
            setSelectedQuestionsToAdd([]);
            fetchExams(); // Refresh exams list
            toast.success("Đã thêm câu hỏi thành công!");
        } catch (error) {
            console.error("Failed to add questions:", error);
            toast.error("Thêm câu hỏi thất bại.");
        }
    };


    const handleRemoveQuestion = async (questionId: string) => {
        if (!selectedExam || !confirm("Remove this question from the exam?")) return;
        try {
            const updatedQuestions = selectedExam.questions?.filter(q => q.id !== questionId && (q as any).questionId !== questionId) || [];

            await ExamService.update(selectedExam.id, {
                questions: updatedQuestions as any
            });

            const updatedExam = await ExamService.getById(selectedExam.id);
            setSelectedExam(updatedExam);
            fetchExams(); // Refresh exams list
        } catch (error) {
            console.error("Failed to remove question:", error);
            toast.error("Xóa câu hỏi thất bại.");
        }
    };

    // Helper to get class name
    const getClassName = (classId: string) => {
        return classes.find(c => c.id === classId)?.name || "Unknown Class";
    };

    // Helper to get question content (since exam.questions might only have ID if not populated, 
    // but typically we'd want the backend to populate it. 
    // For now, let's assume we might need to look it up from availableQuestions if not populated, 
    // but ideally backend sends populated data. 
    // If backend sends { questionId, order, points }, we can't show content unless we fetch it.
    // Let's assume for this step we rely on what's in exam.questions. 
    // If exam.questions is just the JSON structure, we need to map it to real questions.
    // Strategy: Fetch all questions once when entering detail view to map IDs to Content.

    useEffect(() => {
        fetchExams();
        fetchClasses();
        fetchQuestions();
    }, []);

    const getQuestionContent = (qId: string) => {
        const question = availableQuestions.find(q => q.id === qId);
        return question ? question.content : `Question not found (${qId})`;
    };

    if (selectedExam) {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => setSelectedExam(null)}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold">{selectedExam.title}</h1>
                        <p className="text-muted-foreground">
                            {getClassName(selectedExam.classId as string)} • {selectedExam.durationMinutes} phút • {selectedExam.totalPoints} điểm • Điểm đạt: {selectedExam.passingScore} • Hạn chót: {new Date(selectedExam.deadline).toLocaleString('vi-VN')}
                        </p>
                    </div>

                    <div className="flex gap-2 ml-auto">
                        <Button
                            variant="outline"
                            className="gap-2"
                            onClick={() => {
                                const link = `${window.location.origin}/exam-entry/${selectedExam.id}`;
                                navigator.clipboard.writeText(link);
                                toast.success("Đã sao chép link bài thi!");
                            }}
                        >
                            <Link2 className="h-4 w-4" />
                            Copy link làm bài
                        </Button>
                        <Button
                            className="gap-2"
                            onClick={async () => {
                                try {
                                    await ExamService.update(selectedExam.id, selectedExam);
                                    const updatedExam = await ExamService.getById(selectedExam.id);
                                    setSelectedExam(updatedExam);
                                    fetchExams(); // Refresh exams list
                                    toast.success("Đã lưu đề thi!");
                                } catch (error) {
                                    console.error("Failed to save exam:", error);
                                    toast.error("Lưu thất bại!");
                                }
                            }}
                        >
                            <Save className="h-4 w-4" />
                            Lưu
                        </Button>
                    </div>
                </div>

                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold">Danh sách câu hỏi ({selectedExam.questions?.length || 0})</h2>
                    <div className="flex gap-2">
                        {/* Create New Question Dialog */}
                        <Dialog open={createQuestionOpen} onOpenChange={setCreateQuestionOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline" className="gap-2">
                                    ``                     <Plus className="h-4 w-4" />
                                    Tạo câu hỏi mới
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[900px]">
                                <DialogHeader>


                                    <DialogTitle>Tạo câu hỏi mới</DialogTitle>
                                    <DialogDescription>
                                        Tạo câu hỏi và tự động thêm vào đề thi này.
                                    </DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleCreateNewQuestion}>
                                    <div className="grid gap-4 py-4">
                                        {/* Similar form fields as Questions page */}
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="newQ-content" className="text-right">Nội dung</Label>
                                            <Input
                                                id="newQ-content"
                                                value={newQuestionData.content}
                                                onChange={(e) => setNewQuestionData({ ...newQuestionData, content: e.target.value })}
                                                className="col-span-3"
                                                required
                                            />
                                        </div>
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label className="text-right">Loại</Label>
                                            <div className="col-span-3">
                                                <Select
                                                    value={newQuestionData.type}
                                                    onValueChange={(val: string) => setNewQuestionData({ ...newQuestionData, type: val as Question['type'], options: val === 'true_false' ? 'Đúng,Sai' : '' })}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Chọn loại" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="multiple_choice">Trắc nghiệm</SelectItem>
                                                        <SelectItem value="essay">Tự luận</SelectItem>
                                                        <SelectItem value="true_false">Đúng/Sai</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label className="text-right">Môn học</Label>
                                            <div className="col-span-3">
                                                <Select
                                                    value={newQuestionData.subject}
                                                    onValueChange={(val: string) => setNewQuestionData({ ...newQuestionData, subject: val })}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Chọn môn" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="Toán">Toán</SelectItem>
                                                        <SelectItem value="Văn">Văn</SelectItem>
                                                        <SelectItem value="Anh">Anh</SelectItem>
                                                        <SelectItem value="Lý">Lý</SelectItem>
                                                        <SelectItem value="Hóa">Hóa</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="newQ-topic" className="text-right">Chủ đề</Label>
                                            <Input
                                                id="newQ-topic"
                                                placeholder="VD: Đại số, Hình học..."
                                                value={newQuestionData.topic || ""}
                                                onChange={(e) => setNewQuestionData({ ...newQuestionData, topic: e.target.value })}
                                                className="col-span-3"
                                            />
                                        </div>
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label className="text-right">Độ khó</Label>
                                            <div className="col-span-3">
                                                <Select
                                                    value={newQuestionData.difficulty}
                                                    onValueChange={(val: string) => setNewQuestionData({ ...newQuestionData, difficulty: val as Question['difficulty'] })}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Chọn độ khó" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="easy">Dễ</SelectItem>
                                                        <SelectItem value="medium">Trung bình</SelectItem>
                                                        <SelectItem value="hard">Khó</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                        {/* Dynamic fields based on type */}
                                        {newQuestionData.type === 'true_false' && (
                                            <div className="grid grid-cols-4 items-center gap-4">
                                                <Label className="text-right">Đáp án đúng</Label>
                                                <div className="col-span-3">
                                                    <Select
                                                        value={newQuestionData.correctAnswer}
                                                        onValueChange={(val: string) => setNewQuestionData({ ...newQuestionData, correctAnswer: val })}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Chọn đáp án" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="Đúng">Đúng</SelectItem>
                                                            <SelectItem value="Sai">Sai</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                        )}
                                        {newQuestionData.type === 'multiple_choice' && (
                                            <>
                                                <div className="grid grid-cols-4 items-center gap-4">
                                                    <Label htmlFor="newQ-options" className="text-right">Các lựa chọn</Label>
                                                    <div className="col-span-3">
                                                        <Input
                                                            id="newQ-options"
                                                            placeholder="Hà Nội, Hồ Chí Minh, Đà Nẵng, Huế"
                                                            value={newQuestionData.options as string}
                                                            onChange={(e) => setNewQuestionData({ ...newQuestionData, options: e.target.value })}
                                                            className="w-full"
                                                            required
                                                        />
                                                        <p className="text-xs text-muted-foreground mt-1">
                                                            Nhập nội dung từng lựa chọn, phân cách bằng dấu phẩy
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-4 items-center gap-4">
                                                    <Label htmlFor="newQ-correctAnswer" className="text-right">Đáp án đúng</Label>
                                                    <div className="col-span-3">
                                                        <Input
                                                            id="newQ-correctAnswer"
                                                            placeholder="Hà Nội"
                                                            value={newQuestionData.correctAnswer}
                                                            onChange={(e) => setNewQuestionData({ ...newQuestionData, correctAnswer: e.target.value })}
                                                            className="w-full"
                                                            required
                                                        />
                                                        <p className="text-xs text-muted-foreground mt-1">
                                                            Nhập chính xác nội dung đáp án đúng (phải khớp với một trong các lựa chọn)
                                                        </p>
                                                    </div>
                                                </div>
                                            </>
                                        )}

                                        {newQuestionData.type === 'essay' && (
                                            <div className="grid grid-cols-4 items-center gap-4">
                                                <Label htmlFor="newQ-sampleAnswer" className="text-right">Gợi ý đáp án</Label>
                                                <Input
                                                    id="newQ-sampleAnswer"
                                                    placeholder="Đáp án mẫu hoặc tiêu chí chấm điểm"
                                                    value={newQuestionData.correctAnswer}
                                                    onChange={(e) => setNewQuestionData({ ...newQuestionData, correctAnswer: e.target.value })}
                                                    className="col-span-3"
                                                />
                                            </div>
                                        )}

                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label className="text-right"></Label>
                                            <div className="col-span-3 flex items-center space-x-2">
                                                <Checkbox
                                                    id="saveToBank"
                                                    checked={saveQuestionToBank}
                                                    onCheckedChange={(checked: boolean) => setSaveQuestionToBank(checked)}
                                                />
                                                <label
                                                    htmlFor="saveToBank"
                                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                                >
                                                    Lưu vào Ngân hàng câu hỏi để tái sử dụng
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button type="submit" disabled={creatingQuestion}>
                                            {creatingQuestion ? "Đang tạo..." : "Tạo câu hỏi"}
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>

                        {/* Add from Question Bank Dialog */}
                        <Dialog open={addQuestionOpen} onOpenChange={setAddQuestionOpen}>
                            <DialogTrigger asChild>
                                <Button className="gap-2">
                                    <Plus className="h-5 w-5" />
                                    Thêm từ ngân hàng
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[1000px] max-h-[80vh] flex flex-col">
                                <DialogHeader>
                                    <DialogTitle>Chọn câu hỏi từ ngân hàng</DialogTitle>
                                    <DialogDescription>
                                        Tìm kiếm và chọn các câu hỏi để thêm vào đề thi.
                                    </DialogDescription>
                                </DialogHeader>

                                <div className="relative my-2">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        placeholder="Tìm kiếm câu hỏi..."
                                        className="pl-9"
                                        value={questionSearchTerm}
                                        onChange={(e) => setQuestionSearchTerm(e.target.value)}
                                    />
                                </div>

                                <ScrollArea className="flex-1 border rounded-md p-4">
                                    <div className="space-y-4">
                                        {availableQuestions
                                            .filter(q =>
                                                !selectedExam.questions?.some((eq: any) => eq.questionId === q.id) &&
                                                (q.content.toLowerCase().includes(questionSearchTerm.toLowerCase()) ||
                                                    q.topic?.toLowerCase().includes(questionSearchTerm.toLowerCase()))
                                            )
                                            .map(q => (
                                                <div key={q.id} className="flex items-start gap-3 p-2 hover:bg-muted rounded-lg">
                                                    <Checkbox
                                                        id={`q-${q.id}`}
                                                        checked={selectedQuestionsToAdd.includes(q.id)}
                                                        onCheckedChange={(checked) => {
                                                            if (checked) {
                                                                setSelectedQuestionsToAdd([...selectedQuestionsToAdd, q.id]);
                                                            } else {
                                                                setSelectedQuestionsToAdd(selectedQuestionsToAdd.filter(id => id !== q.id));
                                                            }
                                                        }}
                                                    />
                                                    <div className="grid gap-1.5 leading-none">
                                                        <label
                                                            htmlFor={`q-${q.id}`}
                                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                                        >
                                                            {q.content}
                                                        </label>
                                                        <p className="text-xs text-muted-foreground">
                                                            {q.topic || "Chưa phân loại"} • {q.type} • {q.difficulty}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                </ScrollArea>

                                <DialogFooter className="mt-4">
                                    <Button onClick={handleAddQuestions} disabled={selectedQuestionsToAdd.length === 0}>
                                        Thêm {selectedQuestionsToAdd.length} câu hỏi
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>

                    <div className="space-y-4">
                        {selectedExam.questions && selectedExam.questions.length > 0 ? (
                            selectedExam.questions.map((q: any, index) => (
                                <Card key={index} className="hover:bg-muted/50">
                                    <CardContent className="p-4 flex items-start justify-between">
                                        <div className="space-y-1">
                                            <div className="font-medium">
                                                Câu {index + 1}: {getQuestionContent(q.questionId)}
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                Điểm: {q.points || 1}
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-destructive hover:text-destructive"
                                            onClick={() => handleRemoveQuestion(q.questionId)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))
                        ) : (
                            <div className="text-center p-8 text-muted-foreground border rounded-lg border-dashed">
                                Chưa có câu hỏi nào trong đề thi này.
                            </div>
                        )}
                    </div>
                </div >
            </div >
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Đề thi</h1>
                    <p className="text-muted-foreground">Quản lý đề thi và kết quả</p>
                </div>

                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2">
                            <Plus className="h-5 w-5" />
                            Tạo đề thi
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>Tạo đề thi mới</DialogTitle>
                            <DialogDescription>
                                Nhập thông tin cơ bản cho đề thi.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleCreateExam}>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="title" className="text-right">Tiêu đề</Label>
                                    <Input
                                        id="title"
                                        value={newExam.title}
                                        onChange={(e) => setNewExam({ ...newExam, title: e.target.value })}
                                        className="col-span-3"
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="class" className="text-right">Lớp học</Label>
                                    <div className="col-span-3">
                                        <Select
                                            value={newExam.classId}
                                            onValueChange={(val: string) => setNewExam({ ...newExam, classId: val })}
                                            required
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Chọn lớp học" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {classes.map((c) => (
                                                    <SelectItem key={c.id} value={c.id}>
                                                        {c.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="description" className="text-right">Mô tả</Label>
                                    <Input
                                        id="description"
                                        value={newExam.description}
                                        onChange={(e) => setNewExam({ ...newExam, description: e.target.value })}
                                        className="col-span-3"
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="duration" className="text-right">Thời gian (phút)</Label>
                                    <Input
                                        id="duration"
                                        type="number"
                                        value={newExam.durationMinutes}
                                        onChange={(e) => setNewExam({ ...newExam, durationMinutes: parseInt(e.target.value) })}
                                        className="col-span-3"
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="totalPoints" className="text-right">Tổng điểm</Label>
                                    <Input
                                        id="totalPoints"
                                        type="number"
                                        value={newExam.totalPoints}
                                        onChange={(e) => setNewExam({ ...newExam, totalPoints: parseInt(e.target.value) })}
                                        className="col-span-3"
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="passingScore" className="text-right">Điểm đạt</Label>
                                    <Input
                                        id="passingScore"
                                        type="number"
                                        value={newExam.passingScore}
                                        onChange={(e) => setNewExam({ ...newExam, passingScore: parseInt(e.target.value) })}
                                        className="col-span-3"
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="deadline" className="text-right">Hạn chót</Label>
                                    <div className="col-span-3 flex gap-2">
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant={"outline"}
                                                    className={cn(
                                                        "w-[240px] justify-start text-left font-normal",
                                                        !newExam.deadline && "text-muted-foreground"
                                                    )}
                                                >
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {newExam.deadline ? format(new Date(newExam.deadline), "PPP") : <span>Pick a date</span>}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={newExam.deadline ? new Date(newExam.deadline) : undefined}
                                                    onSelect={(date: Date | undefined) => {
                                                        if (date) {
                                                            const current = newExam.deadline ? new Date(newExam.deadline) : new Date();
                                                            date.setHours(current.getHours());
                                                            date.setMinutes(current.getMinutes());
                                                            setNewExam({ ...newExam, deadline: date.toISOString() });
                                                        }
                                                    }}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        <Input
                                            type="time"
                                            className="w-[120px]"
                                            value={newExam.deadline ? format(new Date(newExam.deadline), "HH:mm") : ""}
                                            onChange={(e) => {
                                                const [hours, minutes] = e.target.value.split(':').map(Number);
                                                const date = newExam.deadline ? new Date(newExam.deadline) : new Date();
                                                date.setHours(hours);
                                                date.setMinutes(minutes);
                                                setNewExam({ ...newExam, deadline: date.toISOString() });
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit" disabled={creating}>
                                    {creating ? "Đang tạo..." : "Tạo đề thi"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {loading ? (
                <div className="flex justify-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            ) : exams.length === 0 ? (
                <div className="text-center p-8 text-muted-foreground">
                    Chưa có đề thi nào.
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {exams.map((exam) => (
                        <Card
                            key={exam.id}
                            className="hover:shadow-md transition-shadow cursor-pointer"
                            onClick={async () => {
                                const freshExam = await ExamService.getById(exam.id);
                                setSelectedExam(freshExam);
                            }}
                        >
                            <CardHeader>
                                <CardTitle className="flex justify-between items-start">
                                    <span>{exam.title}</span>
                                    <ClipboardList className="h-5 w-5 text-muted-foreground" />
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                                    {exam.description || "Không có mô tả"}
                                </p>
                                <div className="space-y-2">
                                    <div className="flex items-center text-sm text-muted-foreground">
                                        <Clock className="mr-2 h-4 w-4" />
                                        {exam.durationMinutes} phút
                                    </div>
                                    <div className="flex items-center text-sm text-muted-foreground">
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        Tạo: {new Date(exam.createdAt).toLocaleDateString('vi-VN')}
                                    </div>
                                    <div className="flex items-center text-sm text-muted-foreground">
                                        <AlertCircle className="mr-2 h-4 w-4" />
                                        Hạn: {new Date(exam.deadline).toLocaleDateString('vi-VN')}
                                    </div>
                                    <div className="flex items-center text-sm text-muted-foreground">
                                        <CheckCircle className="mr-2 h-4 w-4" />
                                        {exam.totalPoints} điểm
                                    </div>
                                </div>
                                <div className="mt-4 pt-4 border-t flex justify-end">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="gap-2"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            router.push(`/dashboard/exams/${exam.id}/results`);
                                        }}
                                    >
                                        <BrainCircuit className="h-4 w-4" />
                                        Xem Kết Quả
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
