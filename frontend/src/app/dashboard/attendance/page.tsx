import { CheckSquare, Calendar } from "lucide-react";

export default function AttendancePage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Điểm danh</h1>
                <p className="text-muted-foreground">Quản lý điểm danh sinh viên</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-lg border bg-card p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <CheckSquare className="h-6 w-6 text-primary" />
                        <h3 className="text-xl font-semibold">Điểm danh hôm nay</h3>
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <span>Có mặt</span>
                            <span className="font-bold text-green-600">45</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Vắng</span>
                            <span className="font-bold text-red-600">3</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Tỷ lệ</span>
                            <span className="font-bold">93.7%</span>
                        </div>
                    </div>
                    <button className="mt-4 w-full rounded-lg bg-primary px-4 py-2 text-primary-foreground hover:opacity-90">
                        Bắt đầu điểm danh
                    </button>
                </div>

                <div className="rounded-lg border bg-card p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <Calendar className="h-6 w-6 text-primary" />
                        <h3 className="text-xl font-semibold">Lịch sử</h3>
                    </div>
                    <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="rounded-lg bg-muted p-3">
                                <div className="flex justify-between">
                                    <span className="font-medium">Lớp 10A{i}</span>
                                    <span className="text-sm text-muted-foreground">
                                        {i} ngày trước
                                    </span>
                                </div>
                                <div className="mt-1 text-sm text-green-600">
                                    Tỷ lệ: {90 + i}%
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
