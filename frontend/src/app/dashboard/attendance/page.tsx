"use client";

import { useEffect, useState } from "react";
import { Class, ClassService } from "@/services/class.service";
import { Attendance, AttendanceSession, AttendanceService } from "@/services/attendance.service";
import { Student, StudentService } from "@/services/student.service";
import { Loader2, Save, Search, UserCheck, UserX, Clock, FileText, Filter, CheckCircle2, Plus, Share2, RefreshCw, Calendar } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";

export default function AttendancePage() {
    // State
    const [classes, setClasses] = useState<Class[]>([]);
    const [selectedClassId, setSelectedClassId] = useState<string>("");
    const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

    const [students, setStudents] = useState<Student[]>([]);
    const [attendanceMap, setAttendanceMap] = useState<Record<string, Attendance>>({});

    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Session State
    const [sessions, setSessions] = useState<AttendanceSession[]>([]);
    const [selectedSessionId, setSelectedSessionId] = useState<string>("all");
    const [showSessionModal, setShowSessionModal] = useState(false);
    const [activeSession, setActiveSession] = useState<any>(null);
    const [creatingSession, setCreatingSession] = useState(false);

    // Load Classes on Mount
    useEffect(() => {
        loadClasses();
    }, []);

    // Load Data when Class or Date changes
    useEffect(() => {
        if (selectedClassId) {
            loadSessions();
        }
        if (selectedClassId && selectedDate) {
            loadAttendanceData();
        }
    }, [selectedClassId, selectedDate]);

    const loadClasses = async () => {
        try {
            const data = await ClassService.getAll();
            setClasses(data);
            if (data.length > 0) {
                setSelectedClassId(data[0].id);
            }
        } catch (error) {
            console.error("Failed to load classes", error);
            toast.error("Không thể tải danh sách lớp");
        }
    };

    const loadSessions = async () => {
        if (!selectedClassId) return;
        try {
            const data = await AttendanceService.getSessionsByClass(selectedClassId);
            setSessions(data);
        } catch (error) {
            console.error("Failed to load sessions", error);
        }
    };

    const loadAttendanceData = async () => {
        setIsLoading(true);
        try {
            // 1. Get Students in Class
            const studentsData = await StudentService.getByClass(selectedClassId);
            setStudents(studentsData);

            // 2. Get Existing Attendance Records
            const attendanceData = await AttendanceService.getByClassAndDate(selectedClassId, selectedDate);

            // Map records by studentId for easy lookup
            const map: Record<string, Attendance> = {};
            attendanceData.forEach(record => {
                map[record.studentId] = record;
            });
            setAttendanceMap(map);


        } finally {
            setIsLoading(false);
        }
    };

    const handleStatusChange = (studentId: string, status: Attendance['status']) => {
        setAttendanceMap(prev => ({
            ...prev,
            [studentId]: {
                ...prev[studentId],
                studentId,
                classId: selectedClassId,
                date: selectedDate,
                status,
                id: prev[studentId]?.id || ""
            }
        }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const recordsToSave = Object.values(attendanceMap).map(record => ({
                studentId: record.studentId,
                classId: selectedClassId,
                date: selectedDate,
                status: record.status,
                note: record.note
            }));

            if (recordsToSave.length === 0) {
                toast.info("Chưa có dữ liệu để lưu");
                return;
            }

            await AttendanceService.bulkUpdate(recordsToSave);
            toast.success("Đã lưu điểm danh thành công!");
            loadAttendanceData();
        } catch (error) {
            console.error("Save failed", error);
            toast.error("Lưu thất bại");
        } finally {
            setIsSaving(false);
        }
    };

    const handleCreateSession = async (duration: number = 10) => {
        if (!selectedClassId) {
            toast.error("Vui lòng chọn lớp học");
            return;
        }

        setCreatingSession(true);
        try {
            const session = await AttendanceService.createSession(selectedClassId, duration);
            setActiveSession(session);
            loadSessions(); // Reload sessions list
            // Modal is already open
        } catch (error) {
            console.error(error);
            toast.error("Không thể tạo phiên điểm danh");
        } finally {
            setCreatingSession(false);
        }
    };

    // Report State
    const [showReportDialog, setShowReportDialog] = useState(false);
    const [reportEmail, setReportEmail] = useState("");
    const [sendingReport, setSendingReport] = useState(false);

    const handleSendReport = async () => {
        if (!reportEmail) {
            toast.error("Vui lòng nhập email nhận báo cáo");
            return;
        }

        setSendingReport(true);
        try {
            await AttendanceService.sendReport({
                classId: selectedClassId,
                startDate: selectedDate, // For now just daily report, can expand to range later
                endDate: selectedDate,
                email: reportEmail,
                generatedBy: "Teacher" // Should get from auth context
            });
            toast.success("Đã gửi báo cáo thành công!");
            setShowReportDialog(false);
        } catch (error) {
            console.error("Send report failed", error);
            toast.error("Gửi báo cáo thất bại");
        } finally {
            setSendingReport(false);
        }
    };

    // Stats Calculation
    const stats = {
        total: students.length,
        present: Object.values(attendanceMap).filter(r => r.status === 'present').length,
        absent: Object.values(attendanceMap).filter(r => r.status === 'absent').length,
        late: Object.values(attendanceMap).filter(r => r.status === 'late').length,
        excused: Object.values(attendanceMap).filter(r => r.status === 'excused').length,
    };

    return (
        <div className="space-y-6 h-full flex flex-col">
            {/* Header & Filters */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card p-4 rounded-lg border shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <CheckCircle2 className="h-6 w-6 text-primary" />
                        Điểm Danh
                    </h1>
                    <p className="text-sm text-muted-foreground">Quản lý chuyên cần sinh viên</p>
                </div>

                <div className="flex flex-wrap gap-3 items-center">
                    <div className="flex items-center gap-2 bg-background border rounded-md px-3 py-2">
                        <Filter className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">Lớp:</span>
                        <select
                            className="bg-transparent border-none text-sm focus:outline-none w-[150px] text-foreground"
                            value={selectedClassId}
                            onChange={(e) => setSelectedClassId(e.target.value)}
                        >
                            {classes.map(c => (
                                <option key={c.id} value={c.id} className="bg-background text-foreground">{c.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center gap-2 bg-background border rounded-md px-3 py-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">Ngày:</span>
                        <input
                            type="date"
                            className="bg-transparent border-none text-sm focus:outline-none text-foreground"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center gap-2 bg-background border rounded-md px-3 py-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">Phiên:</span>
                        <select
                            className="bg-transparent border-none text-sm focus:outline-none w-[150px] text-foreground"
                            value={selectedSessionId}
                            onChange={(e) => setSelectedSessionId(e.target.value)}
                        >
                            <option value="all" className="bg-background text-foreground">Tất cả trong ngày</option>
                            {sessions
                                .filter(s => new Date(s.createdAt).toISOString().split('T')[0] === selectedDate)
                                .map(s => (
                                    <option key={s.id} value={s.id} className="bg-background text-foreground">
                                        {new Date(s.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {s.code}
                                    </option>
                                ))
                            }
                        </select>
                    </div>

                    <Button
                        variant="outline"
                        size="icon"
                        onClick={loadAttendanceData}
                        disabled={isLoading}
                        title="Làm mới dữ liệu"
                    >
                        <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
                    </Button>

                    <Button
                        variant="outline"
                        onClick={() => setShowSessionModal(true)}
                        disabled={!selectedClassId}
                        className="flex items-center gap-2"
                    >
                        <Clock className="h-4 w-4" />
                        Quản lý Phiên
                    </Button>

                    <Button
                        variant="outline"
                        onClick={() => {
                            const newMap = { ...attendanceMap };
                            students.forEach(s => {
                                if (!newMap[s.id]) {
                                    newMap[s.id] = {
                                        id: "",
                                        studentId: s.id,
                                        classId: selectedClassId,
                                        date: selectedDate,
                                        status: 'present',
                                        note: '',
                                        createdAt: new Date().toISOString(),
                                        scheduleId: ""
                                    };
                                } else {
                                    newMap[s.id] = { ...newMap[s.id], status: 'present' };
                                }
                            });
                            setAttendanceMap(newMap);
                        }}
                        disabled={students.length === 0}
                        className="flex items-center gap-2"
                        title="Đánh dấu tất cả có mặt"
                    >
                        <UserCheck className="h-4 w-4" />
                        Tất cả
                    </Button>

                    <Button
                        onClick={handleSave}
                        disabled={isSaving || students.length === 0}
                        className="flex items-center gap-2"
                    >
                        {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        Lưu Thay Đổi
                    </Button>

                    <Button
                        variant="secondary"
                        onClick={() => setShowReportDialog(true)}
                        disabled={students.length === 0}
                        className="flex items-center gap-2"
                        title="Gửi báo cáo qua email"
                    >
                        <FileText className="h-4 w-4" />
                        Báo Cáo
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-green-50 border border-green-100 p-4 rounded-lg">
                    <div className="text-green-600 text-sm font-medium flex items-center gap-2">
                        <UserCheck className="h-4 w-4" /> Có mặt
                    </div>
                    <div className="text-2xl font-bold text-green-700">{stats.present}</div>
                </div>
                <div className="bg-red-50 border border-red-100 p-4 rounded-lg">
                    <div className="text-red-600 text-sm font-medium flex items-center gap-2">
                        <UserX className="h-4 w-4" /> Vắng
                    </div>
                    <div className="text-2xl font-bold text-red-700">{stats.absent}</div>
                </div>
                <div className="bg-yellow-50 border border-yellow-100 p-4 rounded-lg">
                    <div className="text-yellow-600 text-sm font-medium flex items-center gap-2">
                        <Clock className="h-4 w-4" /> Đi muộn
                    </div>
                    <div className="text-2xl font-bold text-yellow-700">{stats.late}</div>
                </div>
                <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg">
                    <div className="text-blue-600 text-sm font-medium flex items-center gap-2">
                        <FileText className="h-4 w-4" /> Có phép
                    </div>
                    <div className="text-2xl font-bold text-blue-700">{stats.excused}</div>
                </div>
            </div>

            {/* Main List */}
            <div className="flex-1 bg-card border rounded-lg shadow-sm overflow-hidden flex flex-col">
                {isLoading ? (
                    <div className="flex-1 flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : students.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
                        <UserX className="h-12 w-12 mb-2 opacity-20" />
                        <p>Không có sinh viên nào trong lớp này</p>
                    </div>
                ) : (
                    <div className="overflow-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/50 sticky top-0 z-10">
                                <tr>
                                    <th className="p-4 text-left font-medium w-[50px]">#</th>
                                    <th className="p-4 text-left font-medium">Sinh Viên</th>
                                    <th className="p-4 text-left font-medium">MSSV</th>
                                    <th className="p-4 text-center font-medium">Trạng Thái</th>
                                    <th className="p-4 text-left font-medium">Ghi Chú</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {students.map((student, index) => {
                                    let record = attendanceMap[student.id];
                                    let status: Attendance['status'] | undefined = record?.status;

                                    // Filter by Session Time Window if a specific session is selected
                                    if (selectedSessionId !== 'all' && record?.createdAt) {
                                        const session = sessions.find(s => s.id === selectedSessionId);
                                        if (session) {
                                            const recordTime = new Date(record.createdAt).getTime();
                                            const sessionStart = new Date(session.createdAt).getTime();
                                            const sessionEnd = new Date(session.expiryTime).getTime();

                                            // If record was created outside this session's window (with some buffer, e.g. 5 mins before/after)
                                            // Then for THIS session view, consider them absent (or just don't show the status)
                                            // However, since we only have one record per day, this is a visual filter only.
                                            if (recordTime < sessionStart - 5 * 60000 || recordTime > sessionEnd + 30 * 60000) {
                                                // If the record is not from this session, we treat it as if they haven't checked in FOR THIS SESSION
                                                // But we should be careful not to hide "Excused" or manual entries.
                                                // For now, let's just show the status but maybe dim it or add a note?
                                                // Or strictly: if selectedSessionId is active, only show 'present' if it matches.

                                                // Let's go with: If record exists but is outside window, treat as 'absent' for this view
                                                // UNLESS it was manually marked (we can't distinguish manual vs auto easily without 'note')
                                                if (record.note === 'Checked in via code') {
                                                    status = undefined; // Reset status for this view
                                                    record = { ...record, status: 'absent' } as any; // Dummy to show absent
                                                }
                                            }
                                        }
                                    }

                                    return (
                                        <tr key={student.id} className={cn(
                                            "hover:bg-muted/30 transition-colors",
                                            status === 'absent' || !status ? "bg-red-50/30" : ""
                                        )}>
                                            <td className="p-4 text-muted-foreground">{index + 1}</td>
                                            <td className="p-4 font-medium">{student.name}</td>
                                            <td className="p-4 text-muted-foreground">{student.code}</td>
                                            <td className="p-4">
                                                <div className="flex justify-center gap-1">
                                                    <StatusButton
                                                        active={status === 'present'}
                                                        type="present"
                                                        onClick={() => handleStatusChange(student.id, 'present')}
                                                    />
                                                    <StatusButton
                                                        active={status === 'absent'}
                                                        type="absent"
                                                        onClick={() => handleStatusChange(student.id, 'absent')}
                                                    />
                                                    <StatusButton
                                                        active={status === 'late'}
                                                        type="late"
                                                        onClick={() => handleStatusChange(student.id, 'late')}
                                                    />
                                                    <StatusButton
                                                        active={status === 'excused'}
                                                        type="excused"
                                                        onClick={() => handleStatusChange(student.id, 'excused')}
                                                    />
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <input
                                                    type="text"
                                                    placeholder="Ghi chú..."
                                                    className="w-full bg-transparent border-b border-transparent focus:border-primary focus:outline-none text-xs py-1"
                                                    value={record?.note || ""}
                                                    onChange={(e) => setAttendanceMap(prev => ({
                                                        ...prev,
                                                        [student.id]: { ...prev[student.id], note: e.target.value }
                                                    }))}
                                                />
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Session Modal */}
            <Dialog open={showSessionModal} onOpenChange={setShowSessionModal}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Quản lý Phiên Điểm Danh</DialogTitle>
                        <DialogDescription>
                            Tạo phiên mới hoặc xem các phiên đang hoạt động
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6 py-4">
                        {/* Create New Session */}
                        <div className="space-y-4 border rounded-lg p-4 bg-muted/30">
                            <h3 className="font-medium text-sm flex items-center gap-2">
                                <Plus className="h-4 w-4" /> Tạo phiên mới
                            </h3>
                            <div className="flex gap-3 items-end">
                                <div className="flex-1 space-y-2">
                                    <label className="text-xs font-medium text-muted-foreground">Thời gian (phút)</label>
                                    <input
                                        type="number"
                                        min="1"
                                        defaultValue="10"
                                        id="session-duration"
                                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                    />
                                </div>
                                <Button
                                    onClick={() => {
                                        const durationInput = document.getElementById('session-duration') as HTMLInputElement;
                                        const duration = parseInt(durationInput.value) || 10;
                                        handleCreateSession(duration);
                                    }}
                                    disabled={creatingSession}
                                >
                                    {creatingSession ? <Loader2 className="h-4 w-4 animate-spin" /> : "Tạo ngay"}
                                </Button>
                            </div>
                        </div>

                        {/* Active Session Display */}
                        {activeSession && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-medium text-sm text-green-600 flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4" /> Phiên đang hoạt động
                                    </h3>
                                    <span className="text-xs text-muted-foreground">
                                        Hết hạn: {new Date(activeSession.expiryTime).toLocaleTimeString()}
                                    </span>
                                </div>

                                <div className="flex flex-col items-center justify-center space-y-4">
                                    <div className="bg-primary/10 p-6 rounded-xl border-2 border-dashed border-primary/50 w-full text-center">
                                        <span className="text-5xl font-mono font-bold tracking-[0.2em] text-primary">
                                            {activeSession.code}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2 justify-center p-2 bg-muted rounded text-xs text-muted-foreground w-full">
                                        <Share2 className="h-3 w-3" />
                                        <span className="truncate">
                                            {typeof window !== 'undefined' ? `${window.location.origin}/attendance/join/${activeSession.code}` : ''}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <DialogFooter className="sm:justify-between">
                        <p className="text-xs text-muted-foreground self-center">
                            * Sinh viên dùng mã này để điểm danh
                        </p>
                        <Button type="button" variant="secondary" onClick={() => setShowSessionModal(false)}>
                            Đóng
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Report Dialog */}
            <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Gửi Báo Cáo Điểm Danh</DialogTitle>
                        <DialogDescription>
                            Báo cáo sẽ được gửi đến email của bạn.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Email nhận báo cáo</label>
                            <input
                                type="email"
                                placeholder="example@email.com"
                                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                value={reportEmail}
                                onChange={(e) => setReportEmail(e.target.value)}
                            />
                        </div>
                        <div className="text-xs text-muted-foreground">
                            * Báo cáo bao gồm thống kê chuyên cần và danh sách chi tiết của ngày {new Date(selectedDate).toLocaleDateString('vi-VN')}.
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowReportDialog(false)}>Hủy</Button>
                        <Button onClick={handleSendReport} disabled={sendingReport}>
                            {sendingReport ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Gửi Báo Cáo
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

function StatusButton({ active, type, onClick }: { active: boolean, type: string, onClick: () => void }) {
    const config = {
        present: {
            label: "Có mặt",
            color: "bg-green-100 text-green-700 hover:bg-green-200 border-green-200",
            activeColor: "bg-green-600 text-white shadow-md ring-2 ring-green-600 ring-offset-1 hover:bg-green-700 border-transparent",
            icon: <UserCheck className="h-3 w-3 mr-1" />
        },
        absent: {
            label: "Vắng",
            color: "bg-red-100 text-red-700 hover:bg-red-200 border-red-200",
            activeColor: "bg-red-600 text-white shadow-md ring-2 ring-red-600 ring-offset-1 hover:bg-red-700 border-transparent",
            icon: <UserX className="h-3 w-3 mr-1" />
        },
        late: {
            label: "Muộn",
            color: "bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border-yellow-200",
            activeColor: "bg-yellow-500 text-white shadow-md ring-2 ring-yellow-500 ring-offset-1 hover:bg-yellow-600 border-transparent",
            icon: <Clock className="h-3 w-3 mr-1" />
        },
        excused: {
            label: "Phép",
            color: "bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200",
            activeColor: "bg-blue-600 text-white shadow-md ring-2 ring-blue-600 ring-offset-1 hover:bg-blue-700 border-transparent",
            icon: <FileText className="h-3 w-3 mr-1" />
        },
    };

    const style = config[type as keyof typeof config];

    return (
        <button
            onClick={onClick}
            className={cn(
                "px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 min-w-[80px] flex items-center justify-center border",
                active ? style.activeColor : style.color
            )}
        >
            {active && style.icon}
            {style.label}
        </button>
    );
}
