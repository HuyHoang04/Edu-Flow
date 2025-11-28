"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { CheckCircle2, Clock, MapPin, User, AlertCircle, Loader2, School } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { ClassService } from "@/services/class.service";

export default function StudentCheckInPage() {
    const params = useParams();
    const code = params.code as string;

    const [session, setSession] = useState<any>(null);
    const [classInfo, setClassInfo] = useState<any>(null);
    const [studentId, setStudentId] = useState("");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (code) {
            loadSession();
        }
    }, [code]);

    const loadSession = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/attendance/session/${code}`);
            const sessionData = res.data;

            if (!sessionData) {
                setError("Mã điểm danh không tồn tại hoặc đã hết hạn");
                return;
            }

            setSession(sessionData);

            // Check expiry
            if (new Date(sessionData.expiryTime) < new Date()) {
                setError("Phiên điểm danh đã kết thúc");
                return;
            }

            // Load class info
            if (sessionData.classId) {
                try {
                    const classData = await ClassService.getById(sessionData.classId);
                    setClassInfo(classData);
                } catch (e) {
                    console.error("Failed to load class info");
                }
            }

        } catch (err) {
            console.error(err);
            setError("Không thể tải thông tin phiên điểm danh");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!studentId.trim()) {
            toast.error("Vui lòng nhập Mã số sinh viên");
            return;
        }

        try {
            setSubmitting(true);
            await api.post('/attendance/check-in', {
                code,
                studentId: studentId.trim()
            });

            setSuccess(true);
            toast.success("Điểm danh thành công!");
        } catch (err: any) {
            console.error(err);
            toast.error(err.response?.data?.message || "Điểm danh thất bại");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-100">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-100 p-4">
                <Card className="w-full max-w-md border-red-200 shadow-lg">
                    <CardHeader className="text-center">
                        <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                            <AlertCircle className="h-8 w-8 text-red-600" />
                        </div>
                        <CardTitle className="text-red-700">Không Thể Truy Cập</CardTitle>
                        <CardDescription>{error}</CardDescription>
                    </CardHeader>
                    <CardFooter className="justify-center">
                        <Button variant="outline" onClick={() => window.location.reload()}>Thử lại</Button>
                    </CardFooter>
                </Card>
            </div>
        );
    }

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 p-4">
                <Card className="w-full max-w-md border-green-200 shadow-lg">
                    <CardHeader className="text-center">
                        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                            <CheckCircle2 className="h-8 w-8 text-green-600" />
                        </div>
                        <CardTitle className="text-green-700">Điểm Danh Thành Công!</CardTitle>
                        <CardDescription>
                            Bạn đã được ghi nhận có mặt.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="bg-slate-50 p-4 rounded-lg space-y-2 border border-slate-100">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-600 font-medium">Sinh viên:</span>
                                <span className="font-bold text-slate-900">{studentId}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-600 font-medium">Lớp:</span>
                                <span className="font-bold text-slate-900">{classInfo?.name || 'Unknown Class'}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-600 font-medium">Thời gian:</span>
                                <span className="font-bold text-slate-900">{new Date().toLocaleTimeString()}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-100 p-4">
            <Card className="w-full max-w-md shadow-xl border-t-4 border-t-primary">
                <CardHeader className="text-center pb-2">
                    <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                        <School className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-2xl">Điểm Danh</CardTitle>
                    <CardDescription>Nhập mã số sinh viên để xác nhận tham gia</CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                    {/* Session Info */}
                    <div className="bg-muted/30 p-4 rounded-lg space-y-3 border">
                        <div className="flex items-center gap-3">
                            <School className="h-5 w-5 text-primary" />
                            <div>
                                <p className="text-sm font-medium text-foreground">{classInfo?.name || 'Đang tải...'}</p>
                                <p className="text-xs text-muted-foreground">Lớp học</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <Clock className="h-5 w-5 text-orange-500" />
                            <div>
                                <p className="text-sm font-medium text-foreground">
                                    {new Date(session.expiryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                                <p className="text-xs text-muted-foreground">Hết hạn lúc</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="h-5 w-5 flex items-center justify-center font-mono font-bold text-xs bg-gray-200 rounded">#</div>
                            <div>
                                <p className="text-sm font-medium text-foreground tracking-widest">{code}</p>
                                <p className="text-xs text-muted-foreground">Mã phiên</p>
                            </div>
                        </div>
                    </div>

                    {/* Input Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium flex items-center gap-2">
                                <User className="h-4 w-4" /> Mã Số Sinh Viên
                            </label>
                            <Input
                                placeholder="VD: 2021001"
                                value={studentId}
                                onChange={(e) => setStudentId(e.target.value)}
                                className="text-lg h-12"
                                autoFocus
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-12 text-lg font-medium"
                            disabled={submitting}
                        >
                            {submitting ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Đang xử lý...
                                </>
                            ) : (
                                "Xác Nhận Có Mặt"
                            )}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="justify-center border-t pt-4">
                    <p className="text-xs text-muted-foreground text-center">
                        Hệ thống sẽ tự động đóng phiên điểm danh khi hết giờ.
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}
