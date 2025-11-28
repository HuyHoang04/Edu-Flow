"use client";

import { useEffect, useState } from "react";
import { Users, GraduationCap, CheckSquare, TrendingUp } from "lucide-react";
import { StudentService } from "@/services/student.service";
import { ClassService } from "@/services/class.service";
import { AttendanceService } from "@/services/attendance.service";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { OverviewChart } from "@/components/dashboard/OverviewChart";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
    const [stats, setStats] = useState([
        {
            title: "Tổng sinh viên",
            value: "...",
            change: "Đang tải...",
            icon: Users,
            color: "text-blue-600",
            bgColor: "bg-blue-50",
        },
        {
            title: "Lớp học",
            value: "...",
            change: "Đang tải...",
            icon: GraduationCap,
            color: "text-green-600",
            bgColor: "bg-green-50",
        },
        {
            title: "Điểm danh hôm nay",
            value: "...",
            change: "...",
            icon: CheckSquare,
            color: "text-purple-600",
            bgColor: "bg-purple-50",
        },
        {
            title: "Hoàn thành bài tập",
            value: "75%",
            change: "+8% so với tuần trước",
            icon: TrendingUp,
            color: "text-orange-600",
            bgColor: "bg-orange-50",
        },
    ]);
    const [weeklyStats, setWeeklyStats] = useState<any[]>([]);
    const [activities, setActivities] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            const [students, classes, weeklyData] = await Promise.all([
                StudentService.getAll(),
                ClassService.getAll(),
                AttendanceService.getWeeklyStats()
            ]);

            setWeeklyStats(weeklyData);

            // Mock activities for now, but in a real app this would come from an ActivityLogService
            // We can try to make it slightly dynamic based on loaded data
            setActivities([
                {
                    id: "1",
                    user: { name: "Hệ thống", initials: "SYS" },
                    action: `Đã tải ${students.length} sinh viên và ${classes.length} lớp học`,
                    time: "Vừa xong"
                },
                {
                    id: "2",
                    user: { name: "Giáo viên", initials: "GV" },
                    action: "Đã truy cập Dashboard",
                    time: "1 phút trước"
                }
            ]);

            // Try to get attendance stats for the first class as a sample
            let attendanceRate = "N/A";
            if (classes.length > 0) {
                try {
                    const attStats = await AttendanceService.getStats(classes[0].id);
                    if (attStats) {
                        attendanceRate = `${Math.round(attStats.presentRate || 0)}%`;
                    }
                } catch (e) {
                    console.error("Failed to load attendance stats");
                }
            }

            setStats([
                {
                    title: "Tổng sinh viên",
                    value: students.length.toString(),
                    change: "Cập nhật mới nhất",
                    icon: Users,
                    color: "text-blue-600",
                    bgColor: "bg-blue-50",
                },
                {
                    title: "Lớp học",
                    value: classes.length.toString(),
                    change: "Đang hoạt động",
                    icon: GraduationCap,
                    color: "text-green-600",
                    bgColor: "bg-green-50",
                },
                {
                    title: "Điểm danh (Lớp mẫu)",
                    value: attendanceRate,
                    change: classes.length > 0 ? classes[0].name : "Không có lớp",
                    icon: CheckSquare,
                    color: "text-purple-600",
                    bgColor: "bg-purple-50",
                },
                {
                    title: "Hoàn thành bài tập",
                    value: "75%",
                    change: "Mục tiêu tuần",
                    icon: TrendingUp,
                    color: "text-orange-600",
                    bgColor: "bg-orange-50",
                },
            ]);
        } catch (error) {
            console.error("Failed to load dashboard data", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                <div className="flex items-center space-x-2">
                </div>
            </div>

            <StatsCards stats={stats} isLoading={isLoading} />

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <OverviewChart data={weeklyStats} />
                <RecentActivity activities={activities} />
            </div>
        </div>
    );
}
