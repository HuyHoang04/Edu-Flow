"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Users,
    GraduationCap,
    CheckSquare,
    Calendar,
    FileQuestion,
    ClipboardList,
    PenTool,
    Mail,
    FileText,
    BarChart3,
    Workflow,
} from "lucide-react";

const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
    { icon: GraduationCap, label: "Lớp học", href: "/dashboard/classes" },
    { icon: Users, label: "Sinh viên", href: "/dashboard/students" },
    { icon: CheckSquare, label: "Điểm danh", href: "/dashboard/attendance" },
    { icon: Calendar, label: "Lịch học", href: "/dashboard/schedules" },
    { icon: FileQuestion, label: "Ngân hàng câu hỏi", href: "/dashboard/questions" },
    { icon: ClipboardList, label: "Đề thi", href: "/dashboard/exams" },
    { icon: PenTool, label: "Làm bài thi", href: "/dashboard/student-exams" },
    { icon: FileText, label: "Biểu mẫu", href: "/dashboard/forms" },
    { icon: Mail, label: "Email", href: "/dashboard/emails" },
    { icon: BarChart3, label: "Báo cáo", href: "/dashboard/reports" },
    { icon: Workflow, label: "Workflow", href: "/dashboard/workflows" },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 border-r bg-card">
            <div className="flex h-16 items-center border-b px-6">
                <h1 className="text-xl font-bold">Teacher Automation</h1>
            </div>

            <nav className="space-y-1 p-4">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                                isActive
                                    ? "bg-primary text-primary-foreground"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                        >
                            <Icon className="h-5 w-5" />
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </nav>
        </aside>
    );
}
