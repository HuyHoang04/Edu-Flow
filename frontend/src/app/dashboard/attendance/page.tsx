"use client";

import { useEffect, useState } from "react";
import { Class, ClassService } from "@/services/class.service";
import { Attendance, AttendanceService } from "@/services/attendance.service";
import { Student, StudentService } from "@/services/student.service";
import { Loader2, Save, Search, UserCheck, UserX, Clock, FileText, Filter, CheckCircle2, Plus, Share2 } from "lucide-react";
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
    const [showSessionModal, setShowSessionModal] = useState(false);
    const [activeSession, setActiveSession] = useState<any>(null);
    const [creatingSession, setCreatingSession] = useState(false);

    // Load Classes on Mount
    useEffect(() => {
        loadClasses();
    }, []);

    // Load Data when Class or Date changes
    useEffect(() => {
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

        } catch (error) {
            console.error("Failed to load data", error);
            toast.error("Lỗi tải dữ liệu điểm danh");
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

    const handleCreateSession = async () => {
        if (!selectedClassId) {
            toast.error("Vui lòng chọn lớp học");
            return;
        }

        setCreatingSession(true);
        try {
            const session = await AttendanceService.createSession(selectedClassId, 10); // 10 minutes default
            setActiveSession(session);
            setShowSessionModal(true);
        } catch (error) {
            console.error(error);
            toast.error("Không thể tạo phiên điểm danh");
        } finally {
            setCreatingSession(false);
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
                        <select
                            className="bg-transparent border-none text-sm focus:outline-none w-[150px]"
                            value={selectedClassId}
                            onChange={(e) => setSelectedClassId(e.target.value)}
                        >
                            {classes.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center gap-2 bg-background border rounded-md px-3 py-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <input
                            type="date"
                            className="bg-transparent border-none text-sm focus:outline-none"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                        />
                    </div>

                    <Button
                        variant="outline"
                        onClick={handleCreateSession}
                        disabled={creatingSession || !selectedClassId}
                        className="flex items-center gap-2"
                    >
                        {creatingSession ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                        Tạo Phiên
                    </Button>

                    <Button
                        onClick={handleSave}
                        disabled={isSaving || students.length === 0}
                        className="flex items-center gap-2"
                    >
                        {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        Lưu Thay Đổi
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
                                    const record = attendanceMap[student.id];
                                    const status = record?.status;

                                    return (
                                        <tr key={student.id} className={cn(
                                            "hover:bg-muted/30 transition-colors",
                                            status === 'absent' ? "bg-red-50/30" : ""
                                        )}>
                                            <td className="p-4 text-muted-foreground">{index + 1}</td>
                                            <td className="p-4 font-medium">{student.name}</td>
                                            <td className="p-4 text-muted-foreground">{student.studentId}</td>
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
                        <DialogTitle className="text-center">Mã Điểm Danh</DialogTitle>
                        <DialogDescription className="text-center">
                            Cung cấp mã này cho sinh viên để điểm danh
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col items-center justify-center py-6 space-y-4">
                        <div className="bg-muted p-8 rounded-xl border-2 border-dashed border-primary/50">
                            <span className="text-6xl font-mono font-bold tracking-[0.2em] text-primary">
                                {activeSession?.code}
                            </span>
                        </div>

                        <div className="text-center space-y-1">
                            <p className="text-sm text-muted-foreground">
                                Hết hạn lúc: <span className="font-medium text-foreground">{activeSession && new Date(activeSession.expiryTime).toLocaleTimeString()}</span>
                            </p>
                            <div className="flex items-center gap-2 justify-center p-2 bg-muted/50 rounded text-xs text-muted-foreground">
                                <Share2 className="h-3 w-3" />
                                {typeof window !== 'undefined' ? `${window.location.origin}/attendance/join/${activeSession?.code}` : ''}
                            </div>
                        </div>
                    </div>
                    <DialogFooter className="sm:justify-center">
                        <Button type="button" variant="secondary" onClick={() => setShowSessionModal(false)}>
                            Đóng
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

function StatusButton({ active, type, onClick }: { active: boolean, type: string, onClick: () => void }) {
    const config = {
        present: { label: "Có mặt", color: "bg-green-100 text-green-700 hover:bg-green-200", activeColor: "bg-green-600 text-white shadow-md ring-2 ring-green-600 ring-offset-1" },
        absent: { label: "Vắng", color: "bg-red-100 text-red-700 hover:bg-red-200", activeColor: "bg-red-600 text-white shadow-md ring-2 ring-red-600 ring-offset-1" },
        late: { label: "Muộn", color: "bg-yellow-100 text-yellow-700 hover:bg-yellow-200", activeColor: "bg-yellow-500 text-white shadow-md ring-2 ring-yellow-500 ring-offset-1" },
        excused: { label: "Phép", color: "bg-blue-100 text-blue-700 hover:bg-blue-200", activeColor: "bg-blue-600 text-white shadow-md ring-2 ring-blue-600 ring-offset-1" },
    };

    const style = config[type as keyof typeof config];

    return (
        <button
            onClick={onClick}
            className={cn(
                "px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 min-w-[70px]",
                active ? style.activeColor : style.color
            )}
        >
            {style.label}
        </button>
    );
}
