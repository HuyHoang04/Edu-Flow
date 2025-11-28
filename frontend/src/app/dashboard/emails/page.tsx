"use client";

import { useEffect, useState } from "react";
import { Mail, Send, Loader2, Plus, Search } from "lucide-react";
import { Email, EmailService } from "@/services/email.service";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export default function EmailsPage() {
    const [emails, setEmails] = useState<Email[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showCompose, setShowCompose] = useState(false);

    // Compose State
    const [recipient, setRecipient] = useState("");
    const [subject, setSubject] = useState("");
    const [body, setBody] = useState("");
    const [sending, setSending] = useState(false);

    useEffect(() => {
        loadEmails();
    }, []);

    const loadEmails = async () => {
        try {
            setIsLoading(true);
            const data = await EmailService.getAll();
            setEmails(data);
        } catch (error) {
            console.error("Failed to load emails", error);
            toast.error("Không thể tải danh sách email");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSend = async () => {
        if (!recipient || !subject || !body) {
            toast.error("Vui lòng điền đầy đủ thông tin");
            return;
        }

        setSending(true);
        try {
            await EmailService.send({
                recipients: [recipient],
                subject,
                body,
                sentBy: "Teacher" // Should get from auth
            });
            toast.success("Đã gửi email thành công");
            setShowCompose(false);
            setRecipient("");
            setSubject("");
            setBody("");
            loadEmails();
        } catch (error) {
            console.error("Failed to send email", error);
            toast.error("Gửi email thất bại");
        } finally {
            setSending(false);
        }
    };

    const stats = {
        total: emails.length,
        sent: emails.filter(e => e.status === 'sent').length,
        failed: emails.filter(e => e.status === 'failed').length,
        pending: emails.filter(e => e.status === 'pending').length,
    };

    return (
        <div className="space-y-6 h-full flex flex-col">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Email</h1>
                    <p className="text-muted-foreground">Quản lý và gửi email thông báo</p>
                </div>
                <Button onClick={() => setShowCompose(true)} className="flex items-center gap-2">
                    <Send className="h-4 w-4" />
                    Soạn Email
                </Button>
            </div>

            {/* Stats */}
            <div className="grid gap-6 md:grid-cols-4">
                <div className="rounded-lg border bg-card p-4">
                    <div className="text-2xl font-bold">{stats.total}</div>
                    <div className="text-sm text-muted-foreground">Tổng số email</div>
                </div>
                <div className="rounded-lg border bg-green-50 p-4">
                    <div className="text-2xl font-bold text-green-700">{stats.sent}</div>
                    <div className="text-sm text-green-600">Đã gửi thành công</div>
                </div>
                <div className="rounded-lg border bg-yellow-50 p-4">
                    <div className="text-2xl font-bold text-yellow-700">{stats.pending}</div>
                    <div className="text-sm text-yellow-600">Đang chờ xử lý</div>
                </div>
                <div className="rounded-lg border bg-red-50 p-4">
                    <div className="text-2xl font-bold text-red-700">{stats.failed}</div>
                    <div className="text-sm text-red-600">Gửi thất bại</div>
                </div>
            </div>

            {/* Email List */}
            <div className="flex-1 rounded-lg border bg-card flex flex-col overflow-hidden">
                <div className="border-b p-4 flex items-center justify-between bg-muted/30">
                    <h3 className="font-semibold flex items-center gap-2">
                        <Mail className="h-4 w-4" /> Lịch sử gửi
                    </h3>
                    <Button variant="ghost" size="sm" onClick={loadEmails} disabled={isLoading}>
                        <div className={cn(isLoading && "animate-spin")}>↻</div>
                    </Button>
                </div>

                <div className="flex-1 overflow-auto">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-40">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : emails.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                            <Mail className="h-12 w-12 mb-2 opacity-20" />
                            <p>Chưa có email nào được gửi</p>
                        </div>
                    ) : (
                        <div className="divide-y">
                            {emails.map((email) => (
                                <div key={email.id} className="flex items-start gap-4 p-4 hover:bg-muted/50 transition-colors">
                                    <div className={cn(
                                        "h-10 w-10 rounded-full flex items-center justify-center shrink-0",
                                        email.status === 'sent' ? "bg-green-100 text-green-600" :
                                            email.status === 'failed' ? "bg-red-100 text-red-600" : "bg-yellow-100 text-yellow-600"
                                    )}>
                                        <Mail className="h-5 w-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <h4 className="font-medium truncate pr-4">{email.subject}</h4>
                                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                                                {new Date(email.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="text-sm text-muted-foreground truncate mb-1">
                                            Đến: {email.recipients.join(", ")}
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <span className={cn(
                                                "text-xs px-2 py-0.5 rounded-full font-medium",
                                                email.status === 'sent' ? "bg-green-100 text-green-700" :
                                                    email.status === 'failed' ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"
                                            )}>
                                                {email.status === 'sent' ? 'Đã gửi' : email.status === 'failed' ? 'Thất bại' : 'Đang gửi'}
                                            </span>
                                            {email.errorMessage && (
                                                <span className="text-xs text-red-500 truncate max-w-[300px]">
                                                    Lỗi: {email.errorMessage}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Compose Dialog */}
            <Dialog open={showCompose} onOpenChange={setShowCompose}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Soạn Email Mới</DialogTitle>
                        <DialogDescription>Gửi thông báo đến sinh viên hoặc lớp học</DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Người nhận</label>
                            <input
                                placeholder="nhập email người nhận..."
                                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                value={recipient}
                                onChange={(e) => setRecipient(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Chủ đề</label>
                            <input
                                placeholder="Tiêu đề email..."
                                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Nội dung</label>
                            <textarea
                                placeholder="Nội dung email..."
                                className="flex min-h-[150px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                value={body}
                                onChange={(e) => setBody(e.target.value)}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowCompose(false)}>Hủy</Button>
                        <Button onClick={handleSend} disabled={sending}>
                            {sending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                            Gửi Ngay
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
