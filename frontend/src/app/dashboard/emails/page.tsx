import { Mail, Send } from "lucide-react";

export default function EmailsPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Email</h1>
                    <p className="text-muted-foreground">Gửi email cho sinh viên</p>
                </div>
                <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-primary-foreground hover:opacity-90">
                    <Send className="h-5 w-5" />
                    Soạn email
                </button>
            </div>

            <div className="grid gap-6 md:grid-cols-4">
                <div className="rounded-lg border bg-card p-4">
                    <div className="text-2xl font-bold">248</div>
                    <div className="text-sm text-muted-foreground">Đã gửi</div>
                </div>
                <div className="rounded-lg border bg-card p-4">
                    <div className="text-2xl font-bold">12</div>
                    <div className="text-sm text-muted-foreground">Nháp</div>
                </div>
                <div className="rounded-lg border bg-card p-4">
                    <div className="text-2xl font-bold">98%</div>
                    <div className="text-sm text-muted-foreground">Tỷ lệ mở</div>
                </div>
                <div className="rounded-lg border bg-card p-4">
                    <div className="text-2xl font-bold">3</div>
                    <div className="text-sm text-muted-foreground">Thất bại</div>
                </div>
            </div>

            <div className="rounded-lg border bg-card">
                <div className="border-b p-4">
                    <h3 className="font-semibold">Email gần đây</h3>
                </div>
                <div className="divide-y">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center gap-4 p-4">
                            <Mail className="h-5 w-5 text-muted-foreground" />
                            <div className="flex-1">
                                <h4 className="font-medium">Thông báo điểm thi {i}</h4>
                                <p className="text-sm text-muted-foreground">
                                    Gửi đến: Lớp 10A{i} • {i} ngày trước
                                </p>
                            </div>
                            <span className="text-sm text-green-600">Đã gửi</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
