"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ExamService } from "@/services/exam.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

export default function ExamEntryPage() {
    const params = useParams();
    const router = useRouter();
    const examId = params.id as string;
    const [studentCode, setStudentCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleEnterExam = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const result = await ExamService.enterExam(examId, studentCode);

            // Store token in sessionStorage to avoid conflict with teacher's login
            sessionStorage.setItem("student_token", result.access_token);

            // Redirect to exam taking page
            router.push(`/exam-taking/${examId}`);

        } catch (err: any) {
            setError(err.response?.data?.message || "Không thể vào thi. Vui lòng kiểm tra lại mã số sinh viên.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Vào thi</CardTitle>
                    <CardDescription>Nhập mã số sinh viên để bắt đầu làm bài</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleEnterExam} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="code">Mã số sinh viên</Label>
                            <Input
                                id="code"
                                placeholder="Ví dụ: SV001"
                                value={studentCode}
                                onChange={(e) => setStudentCode(e.target.value)}
                                required
                            />
                        </div>
                        {error && <p className="text-sm text-red-500">{error}</p>}
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Vào thi"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
