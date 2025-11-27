"use client";

import { useEffect, useState } from "react";
import { Schedule, ScheduleService } from "@/services/schedule.service";
import { Class, ClassService } from "@/services/class.service";
import { Calendar, Clock, MapPin, Loader2, Plus, Trash, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SchedulePage() {
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [classes, setClasses] = useState<Class[]>([]);
    const [loading, setLoading] = useState(true);

    // Create State
    const [createOpen, setCreateOpen] = useState(false);
    const [newSchedule, setNewSchedule] = useState<Partial<Schedule>>({
        classId: "",
        dayOfWeek: 1,
        startTime: "07:00",
        endTime: "09:00",
        room: ""
    });

    // Edit/Delete State
    const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
    const [editOpen, setEditOpen] = useState(false);
    const [editForm, setEditForm] = useState<Partial<Schedule>>({});

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [schedulesData, classesData] = await Promise.all([
                ScheduleService.getAll(),
                ClassService.getAll()
            ]);
            setSchedules(schedulesData);
            setClasses(classesData);
        } catch (error) {
            console.error("Failed to fetch data:", error);
            toast.error("Không thể tải dữ liệu");
        } finally {
            setLoading(false);
        }
    };

    const fetchSchedules = async () => {
        try {
            const data = await ScheduleService.getAll();
            setSchedules(data);
        } catch (error) {
            console.error("Failed to fetch schedules:", error);
        }
    };

    const handleSlotClick = (dayIndex: number, hour: number) => {
        setNewSchedule({
            classId: "",
            dayOfWeek: dayIndex,
            startTime: `${hour.toString().padStart(2, '0')}:00`,
            endTime: `${(hour + 1).toString().padStart(2, '0')}:00`,
            room: ""
        });
        setCreateOpen(true);
    };

    const handleScheduleClick = (e: React.MouseEvent, schedule: Schedule) => {
        e.stopPropagation();
        setSelectedSchedule(schedule);
        setEditForm({
            classId: schedule.classId,
            dayOfWeek: schedule.dayOfWeek,
            startTime: schedule.startTime,
            endTime: schedule.endTime,
            room: schedule.room
        });
        setEditOpen(true);
    };

    const handleCreate = async () => {
        if (!newSchedule.classId) {
            toast.error("Vui lòng chọn lớp học");
            return;
        }
        try {
            await ScheduleService.create(newSchedule);
            toast.success("Thêm lịch học thành công");
            setCreateOpen(false);
            fetchSchedules();
        } catch (error) {
            console.error("Failed to create schedule:", error);
            toast.error("Thêm lịch học thất bại");
        }
    };

    const handleUpdate = async () => {
        if (!selectedSchedule) return;
        try {
            await ScheduleService.update(selectedSchedule.id, editForm);
            toast.success("Cập nhật lịch học thành công");
            setEditOpen(false);
            fetchSchedules();
        } catch (error) {
            console.error("Failed to update schedule:", error);
            toast.error("Cập nhật thất bại");
        }
    };

    const handleDelete = async () => {
        if (!selectedSchedule) return;
        if (!confirm("Bạn có chắc chắn muốn xóa lịch học này?")) return;
        try {
            await ScheduleService.delete(selectedSchedule.id);
            toast.success("Xóa lịch học thành công");
            setEditOpen(false);
            fetchSchedules();
        } catch (error) {
            console.error("Failed to delete schedule:", error);
            toast.error("Xóa thất bại");
        }
    };

    const days = ["Chủ nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];
    const timeSlots = Array.from({ length: 14 }, (_, i) => i + 7); // 7:00 to 20:00

    const getSchedulesForDay = (dayIndex: number) => {
        return schedules.filter(s => s.dayOfWeek === dayIndex).sort((a, b) => a.startTime.localeCompare(b.startTime));
    };

    const getDayName = (dayIndex: number) => days[dayIndex];

    return (
        <div className="space-y-6 h-[calc(100vh-100px)] flex flex-col">
            <div className="flex items-center justify-between flex-none">
                <div>
                    <h1 className="text-3xl font-bold">Lịch học</h1>
                    <p className="text-muted-foreground">Quản lý toàn bộ lịch học trong tuần</p>
                </div>
                <Button onClick={() => setCreateOpen(true)} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Thêm lịch học
                </Button>
            </div>

            {loading ? (
                <div className="flex justify-center p-12 flex-1">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : (
                <div className="border rounded-lg bg-card flex-1 overflow-auto relative">
                    <div className="grid grid-cols-8 divide-x min-w-[1000px]">
                        {/* Time Column */}
                        <div className="bg-muted/30">
                            <div className="h-12 border-b flex items-center justify-center font-medium bg-muted/50 sticky top-0 z-10">
                                Giờ
                            </div>
                            {timeSlots.map(hour => (
                                <div key={hour} className="h-24 border-b flex items-center justify-center text-sm text-muted-foreground">
                                    {hour}:00
                                </div>
                            ))}
                        </div>

                        {/* Days Columns */}
                        {[1, 2, 3, 4, 5, 6, 0].map(dayIndex => (
                            <div key={dayIndex} className="relative group">
                                <div className="h-12 border-b flex items-center justify-center font-medium bg-muted/50 sticky top-0 z-10">
                                    {getDayName(dayIndex)}
                                </div>
                                <div className="relative h-[calc(24*3.5rem)]">
                                    {/* Grid lines & Click areas */}
                                    {timeSlots.map(hour => (
                                        <div
                                            key={hour}
                                            className="h-24 border-b hover:bg-muted/50 transition-colors cursor-pointer"
                                            onClick={() => handleSlotClick(dayIndex, hour)}
                                            title="Nhấn để thêm lịch học"
                                        />
                                    ))}

                                    {/* Schedule Items */}
                                    {getSchedulesForDay(dayIndex).map(schedule => {
                                        const startHour = parseInt(schedule.startTime.split(':')[0]);
                                        const startMinute = parseInt(schedule.startTime.split(':')[1]);
                                        const endHour = parseInt(schedule.endTime.split(':')[0]);
                                        const endMinute = parseInt(schedule.endTime.split(':')[1]);

                                        const startOffset = (startHour - 7) * 6 + (startMinute / 60) * 6;
                                        const duration = ((endHour - startHour) * 60 + (endMinute - startMinute)) / 60 * 6;

                                        return (
                                            <div
                                                key={schedule.id}
                                                className="absolute left-1 right-1 rounded-md bg-primary/15 border border-primary/30 p-2 text-xs hover:bg-primary/25 transition-all cursor-pointer shadow-sm hover:shadow-md z-20"
                                                style={{
                                                    top: `${startOffset}rem`,
                                                    height: `${duration}rem`
                                                }}
                                                onClick={(e) => handleScheduleClick(e, schedule)}
                                            >
                                                <div className="font-bold text-primary truncate text-sm">
                                                    {schedule.class?.name || "Lớp học"}
                                                </div>
                                                <div className="text-muted-foreground truncate font-medium">
                                                    {schedule.class?.code}
                                                </div>
                                                <div className="mt-1 flex items-center gap-1 text-muted-foreground">
                                                    <Clock className="h-3 w-3" />
                                                    {schedule.startTime.slice(0, 5)} - {schedule.endTime.slice(0, 5)}
                                                </div>
                                                {schedule.room && (
                                                    <div className="flex items-center gap-1 text-muted-foreground font-medium">
                                                        <MapPin className="h-3 w-3" />
                                                        {schedule.room}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Create Dialog */}
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Thêm lịch học mới</DialogTitle>
                        <DialogDescription>Chọn lớp và thời gian học.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Lớp học</Label>
                            <div className="col-span-3">
                                <Select
                                    value={newSchedule.classId}
                                    onValueChange={(v: string) => setNewSchedule({ ...newSchedule, classId: v })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Chọn lớp học" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {classes.map(cls => (
                                            <SelectItem key={cls.id} value={cls.id}>
                                                {cls.name} ({cls.code})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Thứ</Label>
                            <div className="col-span-3">
                                <Select
                                    value={newSchedule.dayOfWeek?.toString() ?? "1"}
                                    onValueChange={(v: string) => setNewSchedule({ ...newSchedule, dayOfWeek: parseInt(v) })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {days.map((day, index) => (
                                            <SelectItem key={index} value={index.toString()}>{day}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Bắt đầu</Label>
                            <Input
                                type="time"
                                className="col-span-3"
                                value={newSchedule.startTime}
                                onChange={(e) => setNewSchedule({ ...newSchedule, startTime: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Kết thúc</Label>
                            <Input
                                type="time"
                                className="col-span-3"
                                value={newSchedule.endTime}
                                onChange={(e) => setNewSchedule({ ...newSchedule, endTime: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Phòng</Label>
                            <Input
                                className="col-span-3"
                                placeholder="VD: P.101"
                                value={newSchedule.room}
                                onChange={(e) => setNewSchedule({ ...newSchedule, room: e.target.value })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setCreateOpen(false)}>Hủy</Button>
                        <Button onClick={handleCreate}>Thêm lịch học</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Chỉnh sửa lịch học</DialogTitle>
                        <DialogDescription>
                            {selectedSchedule?.class?.name} ({selectedSchedule?.class?.code})
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Thứ</Label>
                            <div className="col-span-3">
                                <Select
                                    value={editForm.dayOfWeek?.toString()}
                                    onValueChange={(v: string) => setEditForm({ ...editForm, dayOfWeek: parseInt(v) })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {days.map((day, index) => (
                                            <SelectItem key={index} value={index.toString()}>{day}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Bắt đầu</Label>
                            <Input
                                type="time"
                                className="col-span-3"
                                value={editForm.startTime || ""}
                                onChange={(e) => setEditForm({ ...editForm, startTime: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Kết thúc</Label>
                            <Input
                                type="time"
                                className="col-span-3"
                                value={editForm.endTime || ""}
                                onChange={(e) => setEditForm({ ...editForm, endTime: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Phòng</Label>
                            <Input
                                className="col-span-3"
                                value={editForm.room || ""}
                                onChange={(e) => setEditForm({ ...editForm, room: e.target.value })}
                            />
                        </div>
                    </div>
                    <DialogFooter className="gap-2 sm:justify-between">
                        <Button variant="destructive" onClick={handleDelete} className="gap-2">
                            <Trash className="h-4 w-4" />
                            Xóa lịch
                        </Button>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={() => setEditOpen(false)}>Hủy</Button>
                            <Button onClick={handleUpdate} className="gap-2">
                                <Save className="h-4 w-4" />
                                Lưu thay đổi
                            </Button>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
