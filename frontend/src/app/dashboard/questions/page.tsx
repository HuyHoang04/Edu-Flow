"use client";

import { FileQuestion, Plus, Search, Loader2, Trash2, Edit, Folder, ArrowLeft, BookOpen } from "lucide-react";
import { useEffect, useState } from "react";
import { Question, QuestionService } from "@/services/question.service";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function QuestionsPage() {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [open, setOpen] = useState(false);
    const [creating, setCreating] = useState(false);
    const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

    // New Question State
    const [newQuestion, setNewQuestion] = useState<Partial<Question>>({
        content: "",
        type: "multiple_choice",
        subject: "Toán",
        topic: "",
        difficulty: "medium",
        correctAnswer: "",
        options: ""
    });

    const [createTopicOpen, setCreateTopicOpen] = useState(false);
    const [newTopicName, setNewTopicName] = useState("");

    useEffect(() => {
        fetchQuestions();
    }, []);

    const fetchQuestions = async () => {
        try {
            const data = await QuestionService.getAll();
            setQuestions(data);
        } catch (error) {
            console.error("Failed to fetch questions:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateQuestion = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreating(true);
        try {
            let questionData = { ...newQuestion };

            // Auto-assign topic if inside a topic view
            if (selectedTopic) {
                questionData.topic = selectedTopic;
            }

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

            await QuestionService.create(questionData);
            alert("Question created successfully!");
            setOpen(false);
            setNewQuestion({
                content: "",
                type: "multiple_choice",
                subject: "Toán",
                topic: selectedTopic || "", // Keep topic if selected
                difficulty: "medium",
                correctAnswer: "",
                options: ""
            });
            fetchQuestions();
        } catch (error) {
            console.error("Failed to create question:", error);
            alert("Failed to create question.");
        } finally {
            setCreating(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this question?")) return;
        try {
            await QuestionService.delete(id);
            fetchQuestions();
        } catch (error) {
            console.error("Failed to delete question:", error);
            alert("Failed to delete question.");
        }
    };

    const handleCreateTopic = (e: React.FormEvent) => {
        e.preventDefault();
        if (newTopicName.trim()) {
            setSelectedTopic(newTopicName.trim());
            setCreateTopicOpen(false);
            setNewTopicName("");
        }
    };

    // Get unique topics
    const topics = Array.from(new Set(questions.map(q => q.topic || "Chưa phân loại"))).sort();

    // Filter questions based on view and search
    const filteredQuestions = questions.filter(q => {
        const matchesSearch =
            q.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (q.subject && q.subject.toLowerCase().includes(searchTerm.toLowerCase()));

        if (selectedTopic) {
            const topicMatch = selectedTopic === "Chưa phân loại"
                ? !q.topic
                : q.topic === selectedTopic;
            return matchesSearch && topicMatch;
        }

        return matchesSearch;
    });

    // Count questions per topic
    const getTopicCount = (topic: string) => {
        return questions.filter(q => (topic === "Chưa phân loại" ? !q.topic : q.topic === topic)).length;
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    {selectedTopic && (
                        <Button variant="ghost" size="icon" onClick={() => setSelectedTopic(null)}>
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    )}
                    <div>
                        <h1 className="text-3xl font-bold">
                            {selectedTopic ? `Chủ đề: ${selectedTopic}` : "Ngân hàng câu hỏi"}
                        </h1>
                        <p className="text-muted-foreground">
                            {selectedTopic ? "Danh sách câu hỏi trong chủ đề" : "Quản lý kho câu hỏi theo chủ đề"}
                        </p>
                    </div>
                </div>

                <div className="flex gap-2">
                    {!selectedTopic && (
                        <Dialog open={createTopicOpen} onOpenChange={setCreateTopicOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline" className="gap-2">
                                    <Folder className="h-5 w-5" />
                                    Tạo chủ đề
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Tạo chủ đề mới</DialogTitle>
                                    <DialogDescription>
                                        Nhập tên chủ đề để bắt đầu thêm câu hỏi.
                                    </DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleCreateTopic}>
                                    <div className="grid gap-4 py-4">
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="topicName" className="text-right">Tên chủ đề</Label>
                                            <Input
                                                id="topicName"
                                                value={newTopicName}
                                                onChange={(e) => setNewTopicName(e.target.value)}
                                                className="col-span-3"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button type="submit">Tạo chủ đề</Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    )}

                    <Dialog open={open} onOpenChange={(val) => {
                        setOpen(val);
                        if (val && selectedTopic) {
                            setNewQuestion(prev => ({ ...prev, topic: selectedTopic === "Chưa phân loại" ? "" : selectedTopic }));
                        }
                    }}>
                        <DialogTrigger asChild>
                            <Button className="gap-2">
                                <Plus className="h-5 w-5" />
                                {selectedTopic ? "Thêm câu hỏi vào chủ đề" : "Tạo câu hỏi mới"}
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[600px]">
                            <DialogHeader>
                                <DialogTitle>Tạo câu hỏi mới</DialogTitle>
                                <DialogDescription>
                                    Nhập nội dung câu hỏi và đáp án.
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleCreateQuestion}>
                                <div className="grid gap-4 py-4">
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="content" className="text-right">Nội dung</Label>
                                        <Input
                                            id="content"
                                            value={newQuestion.content}
                                            onChange={(e) => setNewQuestion({ ...newQuestion, content: e.target.value })}
                                            className="col-span-3"
                                            required
                                        />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label className="text-right">Loại</Label>
                                        <div className="col-span-3">
                                            <Select
                                                value={newQuestion.type}
                                                onValueChange={(val: string) => setNewQuestion({ ...newQuestion, type: val as Question['type'], options: val === 'true_false' ? 'Đúng,Sai' : '' })}
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
                                                defaultValue={newQuestion.subject}
                                                onValueChange={(val: any) => setNewQuestion({ ...newQuestion, subject: val })}
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
                                        <Label htmlFor="topic" className="text-right">Chủ đề</Label>
                                        <Input
                                            id="topic"
                                            placeholder="VD: Đại số, Hình học..."
                                            value={newQuestion.topic || ""}
                                            onChange={(e) => setNewQuestion({ ...newQuestion, topic: e.target.value })}
                                            className="col-span-3"
                                            disabled={!!selectedTopic && selectedTopic !== "Chưa phân loại"}
                                        />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label className="text-right">Độ khó</Label>
                                        <div className="col-span-3">
                                            <Select
                                                defaultValue={newQuestion.difficulty}
                                                onValueChange={(val: any) => setNewQuestion({ ...newQuestion, difficulty: val })}
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
                                    {/* Dynamic fields based on question type */}
                                    {newQuestion.type === 'true_false' && (
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label className="text-right">Đáp án đúng</Label>
                                            <div className="col-span-3">
                                                <Select
                                                    value={newQuestion.correctAnswer}
                                                    onValueChange={(val: string) => setNewQuestion({ ...newQuestion, correctAnswer: val })}
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

                                    {newQuestion.type === 'multiple_choice' && (
                                        <>
                                            <div className="grid grid-cols-4 items-center gap-4">
                                                <Label htmlFor="options" className="text-right">Các lựa chọn</Label>
                                                <div className="col-span-3">
                                                    <Input
                                                        id="options"
                                                        placeholder="Hà Nội, Hồ Chí Minh, Đà Nẵng, Huế"
                                                        value={newQuestion.options as string}
                                                        onChange={(e) => setNewQuestion({ ...newQuestion, options: e.target.value })}
                                                        className="w-full"
                                                        required
                                                    />
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        Nhập nội dung từng lựa chọn, phân cách bằng dấu phẩy
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-4 items-center gap-4">
                                                <Label htmlFor="correctAnswer" className="text-right">Đáp án đúng</Label>
                                                <div className="col-span-3">
                                                    <Input
                                                        id="correctAnswer"
                                                        placeholder="Hà Nội"
                                                        value={newQuestion.correctAnswer}
                                                        onChange={(e) => setNewQuestion({ ...newQuestion, correctAnswer: e.target.value })}
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

                                    {newQuestion.type === 'essay' && (
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="sampleAnswer" className="text-right">Gợi ý đáp án</Label>
                                            <Input
                                                id="sampleAnswer"
                                                placeholder="Đáp án mẫu hoặc tiêu chí chấm điểm"
                                                value={newQuestion.correctAnswer}
                                                onChange={(e) => setNewQuestion({ ...newQuestion, correctAnswer: e.target.value })}
                                                className="col-span-3"
                                            />
                                        </div>
                                    )}
                                </div>
                                <DialogFooter>
                                    <Button type="submit" disabled={creating}>
                                        {creating ? "Đang tạo..." : "Tạo câu hỏi"}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Topic Grid View */}
            {!selectedTopic && (
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {topics.map(topic => (
                        <Card
                            key={topic}
                            className="hover:bg-muted/50 transition-colors cursor-pointer border-l-4 border-l-primary"
                            onClick={() => setSelectedTopic(topic)}
                        >
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    {topic}
                                </CardTitle>
                                <Folder className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{getTopicCount(topic)}</div>
                                <p className="text-xs text-muted-foreground">
                                    câu hỏi
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                    {topics.length === 0 && !loading && (
                        <div className="col-span-full text-center p-8 text-muted-foreground">
                            Chưa có chủ đề nào. Hãy tạo câu hỏi đầu tiên!
                        </div>
                    )}
                </div>
            )}

            {/* Question List View */}
            {selectedTopic && (
                <div className="space-y-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            type="text"
                            placeholder="Tìm câu hỏi..."
                            className="pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="space-y-3">
                        {loading ? (
                            <div className="flex justify-center p-8">
                                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                            </div>
                        ) : filteredQuestions.length === 0 ? (
                            <div className="text-center p-8 text-muted-foreground">
                                <p>Chưa có câu hỏi nào trong chủ đề này.</p>
                                <p className="text-sm mt-2">Hãy thêm câu hỏi để lưu chủ đề này lại nhé!</p>
                            </div>
                        ) : (
                            filteredQuestions.map((q) => (
                                <div key={q.id} className="rounded-lg border bg-card p-4 hover:bg-muted/50 transition-colors">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h4 className="font-medium">{q.content}</h4>
                                            </div>
                                            <div className="flex gap-2 text-sm text-muted-foreground">
                                                <span className="rounded bg-secondary px-2 py-0.5 text-xs">{q.type}</span>
                                                <span className="rounded bg-secondary px-2 py-0.5 text-xs">{q.subject}</span>
                                                <span className={`rounded px-2 py-0.5 text-xs ${q.difficulty === 'hard' ? 'bg-red-100 text-red-700' :
                                                    q.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                                        'bg-green-100 text-green-700'
                                                    }`}>
                                                    {q.difficulty}
                                                </span>
                                            </div>
                                            {q.correctAnswer && (
                                                <p className="mt-2 text-sm text-green-600">Đáp án: {q.correctAnswer}</p>
                                            )}
                                        </div>
                                        <div className="flex gap-2">
                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-destructive hover:text-destructive"
                                                onClick={() => handleDelete(q.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
