import { useState } from "react";
import { Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useEnrollmentStore } from "@/lib/enrollment-store";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  Combobox,
  ComboboxChips,
  ComboboxChip,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
} from "@/components/ui/combobox";

export default function AdminCoursesPage() {
  const { courses, removeCourse, addCourse, removeInstructor } =
    useEnrollmentStore();

  const [open, setOpen] = useState(false);
  const [newCode, setNewCode] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newInstructors, setNewInstructors] = useState<string[]>([]);

  const allInstructors = Array.from(
    new Set(courses.flatMap((c) => c.instructors || [])),
  );

  const isDuplicate = courses.some(
    (c) => c.courseCode.toLowerCase() === newCode.toLowerCase(),
  );

  const canSave =
    newCode.trim() !== "" && newTitle.trim() !== "" && !isDuplicate;

  const handleAddCourse = () => {
    if (!canSave) return;
    addCourse({
      courseCode: newCode.toUpperCase(),
      courseTitle: newTitle,
      instructors: newInstructors,
    });

    setNewCode("");
    setNewTitle("");
    setNewInstructors([]);
    setOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">จัดการวิชาเรียน</h1>
          <p className="text-sm text-muted-foreground">
            จัดการข้อมูลรายวิชาและผู้สอน
          </p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button />}>
            <Plus className="mr-2 h-4 w-4" /> เพิ่มวิชา
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>เพิ่มวิชาใหม่</DialogTitle>
              <DialogDescription>
                วิชาที่เพิ่มจะไปโผล่เป็นตัวเลือกตอนลงทะเบียนให้นักศึกษาได้ทันที
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="code">รหัสวิชา</Label>
                <Input
                  id="code"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  className={
                    isDuplicate
                      ? "border-destructive focus-visible:ring-destructive"
                      : ""
                  }
                  aria-invalid={isDuplicate}
                />

                {isDuplicate && (
                  <p className="text-sm text-destructive">
                    มีรหัสวิชา {newCode.toUpperCase()} นี้แล้ว
                  </p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="title">ชื่อวิชา</Label>
                <Input
                  id="title"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label>ผู้สอน</Label>
                <Combobox
                  multiple
                  value={newInstructors}
                  onValueChange={setNewInstructors}
                >
                  <ComboboxChips>
                    {newInstructors.map((instructor) => (
                      <ComboboxChip key={instructor}>{instructor}</ComboboxChip>
                    ))}
                    <ComboboxChipsInput placeholder="เพิ่มหรือเลือกผู้สอน..." />
                  </ComboboxChips>

                  <ComboboxContent>
                    <ComboboxEmpty>
                      พิมพ์เพื่อค้นหา หรือเพิ่มผู้สอนใหม่...
                    </ComboboxEmpty>
                    {allInstructors.map((instructor) => (
                      <ComboboxItem key={instructor} value={instructor}>
                        {instructor}
                      </ComboboxItem>
                    ))}
                  </ComboboxContent>
                </Combobox>
              </div>
            </div>

            <DialogFooter>
              <Button onClick={handleAddCourse} disabled={!canSave}>
                บันทึก
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>รหัสวิชา</TableHead>
              <TableHead>ชื่อวิชา</TableHead>
              <TableHead>ผู้สอน</TableHead>
              <TableHead className="w-[100px]">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {courses.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="h-20 text-center text-muted-foreground"
                >
                  ไม่พบข้อมูลวิชาเรียน
                </TableCell>
              </TableRow>
            )}
            {courses.map((course) => (
              <TableRow key={course.courseCode}>
                <TableCell className="font-medium">
                  {course.courseCode}
                </TableCell>
                <TableCell>{course.courseTitle}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {course.instructors && course.instructors.length > 0 ? (
                      course.instructors.map((instructor, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="gap-1"
                        >
                          {instructor}

                          <button
                            className="rounded-full hover:bg-muted p-0.5"
                            onClick={() =>
                              removeInstructor(course.courseCode, instructor)
                            }
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        ยังไม่มีผู้สอน
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <AlertDialog>
                    <AlertDialogTrigger
                      render={
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                        />
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>ยืนยันการลบวิชา?</AlertDialogTitle>
                        <AlertDialogDescription>
                          คุณแน่ใจหรือไม่ที่จะลบวิชา {course.courseCode} -{" "}
                          {course.courseTitle}? 
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => removeCourse(course.courseCode)}
                        >
                          ยืนยัน
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
