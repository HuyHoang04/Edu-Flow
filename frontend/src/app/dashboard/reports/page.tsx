import { BarChart3, Download } from "lucide-react";

export default function ReportsPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Báo cáo</h1>
                    <p className="text-muted-foreground">Tạo và xem các báo cáo</p>
                </div>
                <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-primary-foreground hover:opacity-90">
                    <BarChart3 className="h-5 w-5" />
                    Tạo báo cáo
                </button>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {["Báo cáo điểm danh", "Báo cáo điểm thi", "Báo cáo tiến độ", "Báo cáo tổng hợp"].map((title, i) => (
                    <div key={title} className="rounded-lg border bg-card p-6">
                        <h3 className="text-lg font-semibold">{title}</h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Cập nhật: {i + 1} ngày trước
                        </p>
                        <div className="mt-4 flex gap-2">
                            <button className="flex-1 rounded-lg border px-4 py-2 hover:bg-muted">
                                Xem
                            </button>
                            <button className="flex items-center gap-2 rounded-lg border px-4 py-2 hover:bg-muted">
                                <Download className="h-4 w-4" />
                                Tải
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
