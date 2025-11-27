"use client";

import { useEffect, useState } from "react";
import { StudentService } from "@/services/student.service";
import { ClassService } from "@/services/class.service";
import { Loader2, Search, User, Eye, Edit, Save } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export default function StudentsPage() {
    const [students, setStudents] = useState<any[]>([]);
    const [classes, setClasses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // View/Edit State
    const [viewOpen, setViewOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<any>(null);
    const [editForm, setEditForm] = useState<any>({});

    const [createOpen, setCreateOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [studentsData, classesData] = await Promise.all([
                StudentService.getAll(),
                ClassService.getAll()
            ]);
            setStudents(studentsData);
            setClasses(classesData);
        } catch (error) {
            console.error("Failed to fetch data:", error);
            toast.error("Không thể tải dữ liệu");
        } finally {
            setLoading(false);
        }
    };

    const handleView = (student: any) => {
        setSelectedStudent(student);
        setViewOpen(true);
    };

    const handleCreate = () => {
        setEditForm({
            name: "",
            code: "",
            email: "",
            classId: "none"
        });
        setCreateOpen(true);
    };

    const handleEdit = (student: any) => {
        setSelectedStudent(student);
        setEditForm({
            name: student.name,
            code: student.code,
            email: student.email,
            classId: student.class?.id || "none"
        });
        setEditOpen(true);
    };

    const handleDeleteClick = (student: any) => {
        setSelectedStudent(student);
        setDeleteOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!selectedStudent) return;
        try {
            await StudentService.delete(selectedStudent.id);
            toast.success("Xóa sinh viên thành công");
            setDeleteOpen(false);
            fetchData();
        } catch (error) {
            console.error("Failed to delete student:", error);
            toast.error("Xóa thất bại");
        }
    };

    const handleSaveCreate = async () => {
        try {
            const createData = {
                ...editForm,
                classId: editForm.classId === "none" ? null : editForm.classId
            };
            await StudentService.create(createData);
            toast.success("Tạo sinh viên thành công");
            setCreateOpen(false);
            fetchData();
        } catch (error) {
            console.error("Failed to create student:", error);
            toast.error("Tạo thất bại");
        }
    };

    const handleSaveEdit = async () => {
        if (!selectedStudent) return;

        try {
            const updateData = {
                ...editForm,
                classId: editForm.classId === "none" ? null : editForm.classId
            };

            await StudentService.update(selectedStudent.id, updateData);

            toast.success("Cập nhật sinh viên thành công");
            setEditOpen(false);
            fetchData(); // Refresh list
        } catch (error) {
            console.error("Failed to update student:", error);
            toast.error("Cập nhật thất bại");
        }
    };

    const filteredStudents = students.filter(student =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Sinh viên</h1>
                    <p className="text-muted-foreground">Quản lý danh sách sinh viên</p>
                </div>
                <Button onClick={handleCreate} className="gap-2">
                    <User className="h-4 w-4" />
                    Thêm sinh viên
                </Button>
            </div>

            <div className="flex items-center gap-2 max-w-sm">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Tìm kiếm sinh viên..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {loading ? (
                <div className="flex justify-center p-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : (
                <div className="border rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/50">
                            <tr>
                                <th className="px-4 py-3 text-left font-medium">Mã SV</th>
                                <th className="px-4 py-3 text-left font-medium">Họ tên</th>
                                <th className="px-4 py-3 text-left font-medium">Email</th>
                                <th className="px-4 py-3 text-left font-medium">Lớp</th>
                                <th className="px-4 py-3 text-left font-medium">Ngày tạo</th>
                                <th className="px-4 py-3 text-right font-medium">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {filteredStudents.map((student) => (
                                <tr key={student.id} className="hover:bg-muted/20">
                                    <td className="px-4 py-3 font-medium">{student.code}</td>
                                    <td className="px-4 py-3 flex items-center gap-2">
                                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                            <User className="h-4 w-4 text-primary" />
                                        </div>
                                        {student.name}
                                    </td>
                                    <td className="px-4 py-3 text-muted-foreground">{student.email}</td>
                                    <td className="px-4 py-3">
                                        {student.class ? (
                                            <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">
                                                {student.class.name}
                                            </span>
                                        ) : (
                                            <span className="text-muted-foreground italic">Chưa có lớp</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-muted-foreground">
                                        {new Date(student.createdAt).toLocaleDateString('vi-VN')}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="icon" onClick={() => handleView(student)}>
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleEdit(student)}>
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDeleteClick(student)}>
                                                <Save className="h-4 w-4 rotate-45" /> {/* Using Save icon rotated as X for now or Trash if available */}
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredStudents.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                                        Không tìm thấy sinh viên nào.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* View Dialog */}
            <Dialog open={viewOpen} onOpenChange={setViewOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Thông tin sinh viên</DialogTitle>
                    </DialogHeader>
                    {selectedStudent && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-2xl">
                                    <User className="h-8 w-8 text-primary" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold">{selectedStudent.name}</h3>
                                    <p className="text-muted-foreground">{selectedStudent.code}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-muted-foreground">Email</Label>
                                    <p>{selectedStudent.email}</p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Số điện thoại</Label>
                                    <p>{selectedStudent.phone || "---"}</p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Lớp</Label>
                                    <p>{selectedStudent.class?.name || "Chưa có lớp"}</p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Ngày tham gia</Label>
                                    <p>{new Date(selectedStudent.createdAt).toLocaleDateString('vi-VN')}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Create Dialog */}
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Thêm sinh viên mới</DialogTitle>
                        <DialogDescription>Nhập thông tin sinh viên mới</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="create-name">Họ và tên</Label>
                            <Input
                                id="create-name"
                                value={editForm.name || ""}
                                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="create-code">Mã sinh viên</Label>
                            <Input
                                id="create-code"
                                value={editForm.code || ""}
                                onChange={(e) => setEditForm({ ...editForm, code: e.target.value })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="create-email">Email</Label>
                            <Input
                                id="create-email"
                                value={editForm.email || ""}
                                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="create-class">Lớp học</Label>
                            <Select
                                value={editForm.classId}
                                onValueChange={(value: string) => setEditForm({ ...editForm, classId: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Chọn lớp học" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">-- Không có lớp --</SelectItem>
                                    {classes.map((cls) => (
                                        <SelectItem key={cls.id} value={cls.id}>
                                            {cls.name} ({cls.code})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setCreateOpen(false)}>Hủy</Button>
                        <Button onClick={handleSaveCreate}>Tạo mới</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Chỉnh sửa sinh viên</DialogTitle>
                        <DialogDescription>Cập nhật thông tin sinh viên</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Họ và tên</Label>
                            <Input
                                id="name"
                                value={editForm.name || ""}
                                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="code">Mã sinh viên</Label>
                            <Input
                                id="code"
                                value={editForm.code || ""}
                                onChange={(e) => setEditForm({ ...editForm, code: e.target.value })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                value={editForm.email || ""}
                                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="class">Lớp học</Label>
                            <Select
                                value={editForm.classId}
                                onValueChange={(value: string) => setEditForm({ ...editForm, classId: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Chọn lớp học" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">-- Không có lớp --</SelectItem>
                                    {classes.map((cls) => (
                                        <SelectItem key={cls.id} value={cls.id}>
                                            {cls.name} ({cls.code})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
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

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Xác nhận xóa</DialogTitle>
                        <DialogDescription>
                            Bạn có chắc chắn muốn xóa sinh viên <strong>{selectedStudent?.name}</strong>?
                            <br />
                            Hành động này không thể hoàn tác.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteOpen(false)}>Hủy</Button>
                        <Button variant="destructive" onClick={handleConfirmDelete}>Xóa</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
