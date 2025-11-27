"use client";

import { GraduationCap, Plus, Loader2, Users, Edit, Trash, Save, Calendar, Clock, MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import { Class, ClassService } from "@/services/class.service";
import { Schedule, ScheduleService } from "@/services/schedule.service";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export default function ClassesPage() {
    const [classes, setClasses] = useState<Class[]>([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [creating, setCreating] = useState(false);
    const [newClass, setNewClass] = useState({
        name: "",
        code: "",
        semester: "",
        year: new Date().getFullYear()
    });

    // View Class State
    const [selectedClass, setSelectedClass] = useState<Class | null>(null);
    const [viewOpen, setViewOpen] = useState(false);
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [newSchedule, setNewSchedule] = useState({
        dayOfWeek: 1,
        startTime: "07:00",
        endTime: "09:00",
        room: ""
    });

    // Edit/Delete State
    const [editOpen, setEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [editForm, setEditForm] = useState<any>({});

    useEffect(() => {
        fetchClasses();
    }, []);

    const fetchClasses = async () => {
        try {
            const data = await ClassService.getAll();
            setClasses(data);
        } catch (error) {
            console.error("Failed to fetch classes:", error);
            toast.error("Không thể tải danh sách lớp");
        } finally {
            setLoading(false);
        }
    };

    const fetchSchedules = async (classId: string) => {
        try {
            const data = await ScheduleService.getByClass(classId);
            setSchedules(data);
        } catch (error) {
            console.error("Failed to fetch schedules:", error);
            toast.error("Không thể tải lịch học");
        }
    };

    const handleCreateClass = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreating(true);
        try {
            await ClassService.create(newClass);
            toast.success("Tạo lớp học thành công");
            setOpen(false);
            setNewClass({
                name: "",
                code: "",
                semester: "",
                year: new Date().getFullYear()
            });
            fetchClasses();
        } catch (error) {
            console.error("Failed to create class:", error);
            toast.error("Tạo lớp học thất bại");
        } finally {
            setCreating(false);
        }
    };

    const handleViewClass = async (cls: Class) => {
        try {
            // Fetch full details including students
            const fullClass = await ClassService.getById(cls.id);
            setSelectedClass(fullClass);
            fetchSchedules(cls.id);
            setViewOpen(true);
        } catch (error) {
            console.error("Failed to fetch class details:", error);
        }
    };

    const handleAddSchedule = async () => {
        if (!selectedClass) return;
        try {
            await ScheduleService.create({
                classId: selectedClass.id,
                ...newSchedule
            });
            toast.success("Thêm lịch học thành công");
            fetchSchedules(selectedClass.id);
            setNewSchedule({
                dayOfWeek: 1,
                startTime: "07:00",
                endTime: "09:00",
                room: ""
            });
        } catch (error) {
            console.error("Failed to add schedule:", error);
            toast.error("Thêm lịch học thất bại");
        }
    };

    const handleDeleteSchedule = async (scheduleId: string) => {
        try {
            await ScheduleService.delete(scheduleId);
            toast.success("Xóa lịch học thành công");
            if (selectedClass) {
                fetchSchedules(selectedClass.id);
            }
        } catch (error) {
            console.error("Failed to delete schedule:", error);
            toast.error("Xóa lịch học thất bại");
        }
    };

    const handleEditClick = (e: React.MouseEvent, cls: Class) => {
        e.stopPropagation();
        setSelectedClass(cls);
        setEditForm({
            name: cls.name,
            code: cls.code,
            semester: cls.semester,
            year: cls.year
        });
        setEditOpen(true);
    };

    const handleDeleteClick = (e: React.MouseEvent, cls: Class) => {
        e.stopPropagation();
        setSelectedClass(cls);
        setDeleteOpen(true);
    };

    const handleSaveEdit = async () => {
        if (!selectedClass) return;
        try {
            await ClassService.update(selectedClass.id, editForm);
            toast.success("Cập nhật lớp học thành công");
            setEditOpen(false);
            fetchClasses();
        } catch (error) {
            console.error("Failed to update class:", error);
            toast.error("Cập nhật thất bại");
        }
    };

    const handleConfirmDelete = async () => {
        if (!selectedClass) return;
        try {
            await ClassService.delete(selectedClass.id);
            toast.success("Xóa lớp học thành công");
            setDeleteOpen(false);
            fetchClasses();
        } catch (error) {
            console.error("Failed to delete class:", error);
            toast.error("Xóa thất bại");
        }
    };

    const getDayName = (day: number) => {
        const days = ["Chủ nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];
        return days[day];
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Lớp học</h1>
                    <p className="text-muted-foreground">Quản lý các lớp học của bạn</p>
                </div>

                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2">
                            <Plus className="h-5 w-5" />
                            Thêm lớp học
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>Tạo lớp học mới</DialogTitle>
                            <DialogDescription>
                                Nhập thông tin lớp học.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleCreateClass}>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="name" className="text-right">Tên lớp</Label>
                                    <Input
                                        id="name"
                                        placeholder="Toán cao cấp 1"
                                        value={newClass.name}
                                        onChange={(e) => setNewClass({ ...newClass, name: e.target.value })}
                                        className="col-span-3"
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="code" className="text-right">Mã lớp</Label>
                                    <Input
                                        id="code"
                                        placeholder="MATH101"
                                        value={newClass.code}
                                        onChange={(e) => setNewClass({ ...newClass, code: e.target.value })}
                                        className="col-span-3"
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="semester" className="text-right">Học kỳ</Label>
                                    <Input
                                        id="semester"
                                        placeholder="HK1"
                                        value={newClass.semester}
                                        onChange={(e) => setNewClass({ ...newClass, semester: e.target.value })}
                                        className="col-span-3"
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="year" className="text-right">Năm học</Label>
                                    <Input
                                        id="year"
                                        type="number"
                                        value={newClass.year}
                                        onChange={(e) => setNewClass({ ...newClass, year: parseInt(e.target.value) })}
                                        className="col-span-3"
                                        required
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit" disabled={creating}>
                                    {creating ? "Đang tạo..." : "Tạo lớp học"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* View Class Dialog */}
            <Dialog open={viewOpen} onOpenChange={setViewOpen}>
                <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Chi tiết lớp học</DialogTitle>
                    </DialogHeader>
                    {selectedClass && (
                        <Tabs defaultValue="info" className="w-full">
                            <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="info">Thông tin</TabsTrigger>
                                <TabsTrigger value="students">Sinh viên ({selectedClass.students?.length || 0})</TabsTrigger>
                                <TabsTrigger value="schedule">Lịch học</TabsTrigger>
                            </TabsList>

                            <TabsContent value="info" className="space-y-4 py-4">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-muted-foreground">Tên lớp:</span>
                                        <p className="font-medium text-lg">{selectedClass.name}</p>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">Mã lớp:</span>
                                        <p className="font-medium text-lg">{selectedClass.code}</p>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">Học kỳ:</span>
                                        <p className="font-medium">{selectedClass.semester}</p>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">Năm học:</span>
                                        <p className="font-medium">{selectedClass.year}</p>
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="students" className="space-y-4 py-4">
                                <div className="border rounded-lg overflow-hidden">
                                    <table className="w-full text-sm">
                                        <thead className="bg-muted/50">
                                            <tr>
                                                <th className="px-4 py-2 text-left font-medium">Mã SV</th>
                                                <th className="px-4 py-2 text-left font-medium">Họ tên</th>
                                                <th className="px-4 py-2 text-left font-medium">Email</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {selectedClass.students?.map((student: any) => (
                                                <tr key={student.id} className="hover:bg-muted/20">
                                                    <td className="px-4 py-2">{student.code}</td>
                                                    <td className="px-4 py-2 font-medium">{student.name}</td>
                                                    <td className="px-4 py-2 text-muted-foreground">{student.email}</td>
                                                </tr>
                                            ))}
                                            {(!selectedClass.students || selectedClass.students.length === 0) && (
                                                <tr>
                                                    <td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">
                                                        Chưa có sinh viên nào trong lớp này.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </TabsContent>

                            <TabsContent value="schedule" className="space-y-4 py-4">
                                <div className="flex gap-2 items-end border p-4 rounded-lg bg-muted/20">
                                    <div className="grid gap-2 flex-1">
                                        <Label>Thứ</Label>
                                        <Select
                                            value={newSchedule.dayOfWeek.toString()}
                                            onValueChange={(v: string) => setNewSchedule({ ...newSchedule, dayOfWeek: parseInt(v) })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Chọn thứ" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="1">Thứ 2</SelectItem>
                                                <SelectItem value="2">Thứ 3</SelectItem>
                                                <SelectItem value="3">Thứ 4</SelectItem>
                                                <SelectItem value="4">Thứ 5</SelectItem>
                                                <SelectItem value="5">Thứ 6</SelectItem>
                                                <SelectItem value="6">Thứ 7</SelectItem>
                                                <SelectItem value="0">Chủ nhật</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid gap-2 w-24">
                                        <Label>Bắt đầu</Label>
                                        <Input
                                            type="time"
                                            value={newSchedule.startTime}
                                            onChange={(e) => setNewSchedule({ ...newSchedule, startTime: e.target.value })}
                                        />
                                    </div>
                                    <div className="grid gap-2 w-24">
                                        <Label>Kết thúc</Label>
                                        <Input
                                            type="time"
                                            value={newSchedule.endTime}
                                            onChange={(e) => setNewSchedule({ ...newSchedule, endTime: e.target.value })}
                                        />
                                    </div>
                                    <div className="grid gap-2 flex-1">
                                        <Label>Phòng</Label>
                                        <Input
                                            placeholder="P.101"
                                            value={newSchedule.room}
                                            onChange={(e) => setNewSchedule({ ...newSchedule, room: e.target.value })}
                                        />
                                    </div>
                                    <Button onClick={handleAddSchedule}>
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>

                                <div className="space-y-2">
                                    {schedules.map((schedule) => (
                                        <div key={schedule.id} className="flex items-center justify-between p-3 border rounded-lg bg-card">
                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center gap-2 text-primary font-medium w-24">
                                                    <Calendar className="h-4 w-4" />
                                                    {getDayName(schedule.dayOfWeek)}
                                                </div>
                                                <div className="flex items-center gap-2 text-muted-foreground w-32">
                                                    <Clock className="h-4 w-4" />
                                                    {schedule.startTime.slice(0, 5)} - {schedule.endTime.slice(0, 5)}
                                                </div>
                                                <div className="flex items-center gap-2 text-muted-foreground">
                                                    <MapPin className="h-4 w-4" />
                                                    {schedule.room || "Chưa có phòng"}
                                                </div>
                                            </div>
                                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDeleteSchedule(schedule.id)}>
                                                <Trash className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                    {schedules.length === 0 && (
                                        <div className="text-center py-8 text-muted-foreground">
                                            Chưa có lịch học nào.
                                        </div>
                                    )}
                                </div>
                            </TabsContent>
                        </Tabs>
                    )}
                </DialogContent>
            </Dialog>

            {/* Edit Class Dialog */}
            <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Chỉnh sửa lớp học</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-name" className="text-right">Tên lớp</Label>
                            <Input
                                id="edit-name"
                                value={editForm.name || ""}
                                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-code" className="text-right">Mã lớp</Label>
                            <Input
                                id="edit-code"
                                value={editForm.code || ""}
                                onChange={(e) => setEditForm({ ...editForm, code: e.target.value })}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-semester" className="text-right">Học kỳ</Label>
                            <Input
                                id="edit-semester"
                                value={editForm.semester || ""}
                                onChange={(e) => setEditForm({ ...editForm, semester: e.target.value })}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-year" className="text-right">Năm học</Label>
                            <Input
                                id="edit-year"
                                type="number"
                                value={editForm.year || ""}
                                onChange={(e) => setEditForm({ ...editForm, year: parseInt(e.target.value) })}
                                className="col-span-3"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditOpen(false)}>Hủy</Button>
                        <Button onClick={handleSaveEdit}>
                            <Save className="mr-2 h-4 w-4" />
                            Lưu thay đổi
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Class Dialog */}
            <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Xác nhận xóa</DialogTitle>
                        <DialogDescription>
                            Bạn có chắc chắn muốn xóa lớp <strong>{selectedClass?.name}</strong>?
                            <br />
                            Hành động này không thể hoàn tác và có thể ảnh hưởng đến sinh viên trong lớp.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteOpen(false)}>Hủy</Button>
                        <Button variant="destructive" onClick={handleConfirmDelete}>Xóa</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {loading ? (
                <div className="flex justify-center p-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : classes.length === 0 ? (
                <div className="text-center p-12 text-muted-foreground border rounded-lg bg-card">
                    Chưa có lớp học nào. Hãy tạo lớp học mới!
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {classes.map((cls) => (
                        <div
                            key={cls.id}
                            className="rounded-lg border bg-card p-6 hover:shadow-md transition-shadow cursor-pointer group relative"
                            onClick={() => handleViewClass(cls)}
                        >
                            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => handleEditClick(e, cls)}>
                                    <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={(e) => handleDeleteClick(e, cls)}>
                                    <Trash className="h-4 w-4" />
                                </Button>
                            </div>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="rounded-full bg-primary/10 p-3 group-hover:bg-primary/20 transition-colors">
                                    <GraduationCap className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg">{cls.name}</h3>
                                    <p className="text-sm text-muted-foreground">{cls.code}</p>
                                </div>
                            </div>
                            <div className="space-y-2 text-sm">
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Học kỳ:</span>
                                    <span className="font-medium">{cls.semester}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Năm học:</span>
                                    <span className="font-medium">{cls.year}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground flex items-center gap-1">
                                        <Users className="h-4 w-4" />
                                        Sinh viên:
                                    </span>
                                    <span className="font-medium">{cls.studentCount || 0}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
