"use client";

import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle } from "lucide-react";

interface QuestionNavigatorProps {
    totalQuestions: number;
    currentQuestion: number;
    answeredQuestions: Set<number>;
    onQuestionSelect: (index: number) => void;
}

export function QuestionNavigator({
    totalQuestions,
    currentQuestion,
    answeredQuestions,
    onQuestionSelect,
}: QuestionNavigatorProps) {
    return (
        <div className="space-y-4">
            <h3 className="font-semibold text-sm">Danh sách câu hỏi</h3>
            <div className="grid grid-cols-5 gap-2">
                {Array.from({ length: totalQuestions }, (_, i) => i).map((index) => {
                    const isAnswered = answeredQuestions.has(index);
                    const isCurrent = index === currentQuestion;

                    return (
                        <Button
                            key={index}
                            variant={isCurrent ? "default" : isAnswered ? "secondary" : "outline"}
                            size="sm"
                            onClick={() => onQuestionSelect(index)}
                            className="relative"
                        >
                            {index + 1}
                            {isAnswered && !isCurrent && (
                                <CheckCircle2 className="h-3 w-3 absolute -top-1 -right-1 text-green-500" />
                            )}
                        </Button>
                    );
                })}
            </div>
            <div className="text-xs text-muted-foreground space-y-1">
                <div className="flex items-center gap-2">
                    <Circle className="h-3 w-3 fill-primary text-primary" />
                    <span>Câu hiện tại</span>
                </div>
                <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                    <span>Đã trả lời</span>
                </div>
                <div className="flex items-center gap-2">
                    <Circle className="h-3 w-3" />
                    <span>Chưa trả lời</span>
                </div>
            </div>
        </div>
    );
}
