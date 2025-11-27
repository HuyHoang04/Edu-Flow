"use client";

import { Question } from "@/services/question.service";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";

interface QuestionRendererProps {
    question: Question;
    answer: string;
    onAnswerChange: (answer: string) => void;
    questionNumber: number;
}

export function QuestionRenderer({
    question,
    answer,
    onAnswerChange,
    questionNumber,
}: QuestionRendererProps) {
    const renderMultipleChoice = () => {
        const options = Array.isArray(question.options)
            ? question.options
            : typeof question.options === 'string'
                ? question.options.split(',').map(o => o.trim())
                : [];

        return (
            <RadioGroup value={answer} onValueChange={onAnswerChange}>
                <div className="space-y-3">
                    {options.map((option, index) => (
                        <div key={index} className="flex items-center space-x-2">
                            <RadioGroupItem value={option} id={`q${questionNumber}-opt${index}`} />
                            <Label
                                htmlFor={`q${questionNumber}-opt${index}`}
                                className="font-normal cursor-pointer"
                            >
                                {option}
                            </Label>
                        </div>
                    ))}
                </div>
            </RadioGroup>
        );
    };

    const renderTrueFalse = () => {
        return (
            <RadioGroup value={answer} onValueChange={onAnswerChange}>
                <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Đúng" id={`q${questionNumber}-true`} />
                        <Label htmlFor={`q${questionNumber}-true`} className="font-normal cursor-pointer">
                            Đúng
                        </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Sai" id={`q${questionNumber}-false`} />
                        <Label htmlFor={`q${questionNumber}-false`} className="font-normal cursor-pointer">
                            Sai
                        </Label>
                    </div>
                </div>
            </RadioGroup>
        );
    };

    const renderEssay = () => {
        return (
            <Textarea
                value={answer}
                onChange={(e) => onAnswerChange(e.target.value)}
                placeholder="Nhập câu trả lời của bạn..."
                className="min-h-[200px]"
            />
        );
    };

    return (
        <div className="space-y-4">
            <div className="flex items-start gap-3">
                <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-semibold text-sm">
                    {questionNumber}
                </span>
                <div className="flex-1">
                    <p className="text-lg font-medium mb-4">{question.content}</p>
                    {question.type === 'multiple_choice' && renderMultipleChoice()}
                    {question.type === 'true_false' && renderTrueFalse()}
                    {question.type === 'essay' && renderEssay()}
                </div>
            </div>
        </div>
    );
}
