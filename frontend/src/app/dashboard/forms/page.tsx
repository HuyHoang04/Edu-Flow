import { FileText, Plus } from "lucide-react";

export default function FormsPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Biểu mẫu</h1>
                    <p className="text-muted-foreground">Tạo khảo sát và thu thập phản hồi</p>
                </div>
                <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-primary-foreground hover:opacity-90">
                    <Plus className="h-5 w-5" />
                    Tạo biểu mẫu
                </button>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="rounded-lg border bg-card p-6">
                        <FileText className="h-8 w-8 text-primary" />
                        <h3 className="mt-4 text-lg font-semibold">Khảo sát {i}</h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                            {10 + i} câu hỏi • {30 + i} phản hồi
                        </p>
                        <button className="mt-4 w-full rounded-lg border px-4 py-2 hover:bg-muted">
                            Xem phản hồi
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
