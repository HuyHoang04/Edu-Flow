import { Users, GraduationCap, CheckSquare, TrendingUp } from "lucide-react";

const stats = [
    {
        title: "Tổng sinh viên",
        value: "248",
        change: "+12%",
        icon: Users,
        color: "text-blue-600",
        bgColor: "bg-blue-50",
    },
    {
        title: "Lớp học",
        value: "12",
        change: "+2",
        icon: GraduationCap,
        color: "text-green-600",
        bgColor: "bg-green-50",
    },
    {
        title: "Điểm danh hôm nay",
        value: "89%",
        change: "+5%",
        icon: CheckSquare,
        color: "text-purple-600",
        bgColor: "bg-purple-50",
    },
    {
        title: "Hoàn thành bài tập",
        value: "75%",
        change: "+8%",
        icon: TrendingUp,
        color: "text-orange-600",
        bgColor: "bg-orange-50",
    },
];

export default function DashboardPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Dashboard</h1>
                <p className="text-muted-foreground">
                    Tổng quan hoạt động giảng dạy
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <div
                            key={stat.title}
                            className="rounded-lg border bg-card p-6 shadow-sm"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">
                                        {stat.title}
                                    </p>
                                    <h3 className="mt-2 text-3xl font-bold">{stat.value}</h3>
                                    <p className="mt-1 text-sm text-green-600">{stat.change}</p>
                                </div>
                                <div className={`rounded-full p-3 ${stat.bgColor}`}>
                                    <Icon className={`h-6 w-6 ${stat.color}`} />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Action Cards */}
            <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-lg border bg-card p-6">
                    <h3 className="text-lg font-semibold mb-4">Hoạt động gần đây</h3>
                    <div className="space-y-3">
                        <div className="flex items-center gap-3 rounded-lg bg-muted p-3">
                            <div className="h-2 w-2 rounded-full bg-green-500" />
                            <div className="flex-1">
                                <p className="text-sm font-medium">Lớp 10A1 - Điểm danh hoàn tất</p>
                                <p className="text-xs text-muted-foreground">2 giờ trước</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 rounded-lg bg-muted p-3">
                            <div className="h-2 w-2 rounded-full bg-blue-500" />
                            <div className="flex-1">
                                <p className="text-sm font-medium">Đề thi Toán học - Đã phát hành</p>
                                <p className="text-xs text-muted-foreground">5 giờ trước</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 rounded-lg bg-muted p-3">
                            <div className="h-2 w-2 rounded-full bg-purple-500" />
                            <div className="flex-1">
                                <p className="text-sm font-medium">Báo cáo tuần - Đã tạo</p>
                                <p className="text-xs text-muted-foreground">1 ngày trước</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="rounded-lg border bg-card p-6">
                    <h3 className="text-lg font-semibold mb-4">Hành động nhanh</h3>
                    <div className="grid gap-3">
                        <button className="rounded-lg border border-primary bg-primary text-primary-foreground p-3 text-left hover:opacity-90 transition">
                            <p className="font-medium">Tạo đề thi mới</p>
                            <p className="text-sm opacity-90">Sử dụng AI hoặc ngân hàng câu hỏi</p>
                        </button>
                        <button className="rounded-lg border p-3 text-left hover:bg-muted transition">
                            <p className="font-medium">Điểm danh lớp học</p>
                            <p className="text-sm text-muted-foreground">Chọn lớp và bắt đầu điểm danh</p>
                        </button>
                        <button className="rounded-lg border p-3 text-left hover:bg-muted transition">
                            <p className="font-medium">Tạo workflow tự động</p>
                            <p className="text-sm text-muted-foreground">Tự động hóa công việc lặp lại</p>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
