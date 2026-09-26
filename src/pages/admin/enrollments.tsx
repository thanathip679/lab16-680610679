import { useState } from "react";
import { PlusCircle, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useEnrollmentStore } from "@/lib/enrollment-store";

// Import Combobox 
import {
  Combobox,
  ComboboxChips,
  ComboboxChip,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  useComboboxAnchor,
} from "@/components/ui/combobox";

export default function AdminEnrollmentsPage() {
  
  const { students, courses, enroll, drop } = useEnrollmentStore();

  
  const [enrollDialogOpen, setEnrollDialogOpen] = useState(false);
  const [formCourse, setFormCourse] = useState<string | null>(null);
  const [formStudents, setFormStudents] = useState<string[]>([]);
  const [studentInput, setStudentInput] = useState("");

  
  const courseOptions = courses.map((c) => ({
    value: c.courseCode,
    label: `${c.courseCode} - ${c.courseTitle}`,
  }));

  const studentOptions = students.map((s) => ({
    value: s.studentId,
    label: `${s.studentId} - ${s.firstName} ${s.lastName}`,
  }));

  
  const handleCourseChange = (courseCode: string | null) => {
    setFormCourse(courseCode);
    setFormStudents([]); 
  };

  const handleEnroll = () => {
    if (!formCourse || formStudents.length === 0) return;
    enroll(formCourse, formStudents);
    setEnrollDialogOpen(false);
  };

  // ล้างฟอร์มเมื่อปิด Dialog
  const handleEnrollDialogOpenChange = (open: boolean) => {
    setEnrollDialogOpen(open);
    if (!open) {
      setFormCourse(null);
      setFormStudents([]);
      setStudentInput("");
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">จัดการการลงทะเบียน</h1>
        <p className="text-sm text-muted-foreground">
          Admin ลงทะเบียนและยกเลิกการลงทะเบียนให้นักศึกษาได้ทุกคน
        </p>
      </div>

      <Dialog open={enrollDialogOpen} onOpenChange={handleEnrollDialogOpenChange}>
        <DialogTrigger render={<Button />}>
  <PlusCircle className="mr-2 h-4 w-4" />
  ลงทะเบียนให้นักศึกษา
</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ลงทะเบียนให้นักศึกษา</DialogTitle>
            <DialogDescription>
              เลือกวิชาก่อน แล้วจึงเลือกนักศึกษา
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            
            <div className="grid gap-2">
              <Label>วิชา</Label>
              <Select value={formCourse || ""} onValueChange={handleCourseChange}>
                <SelectTrigger>
                  <SelectValue placeholder="เลือกวิชา" />
                </SelectTrigger>
                <SelectContent>
                  {courseOptions.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            
            <div className="grid gap-2">
              <Label>นักศึกษา</Label>
              <Combobox
                multiple
                value={formStudents}
                onValueChange={setFormStudents}
              >
                <ComboboxChips>
                  {formStudents.map((id) => {
                    const s = students.find((x) => x.studentId === id);
                    return (
                      
                      <ComboboxChip key={id} >
                        {s ? `${s.firstName} ${s.lastName}` : id}
                      </ComboboxChip>
                    );
                  })}
                  <ComboboxChipsInput
                    placeholder={!formCourse ? "กรุณาเลือกวิชาก่อน" : "ค้นหาหรือเลือกนักศึกษา..."}
                    value={studentInput}
                    onChange={(e) => setStudentInput(e.target.value)}
                    disabled={!formCourse} 
                  />
                </ComboboxChips>
                
                
                {formCourse && (
                  <ComboboxContent anchor={useComboboxAnchor()}>
                    <ComboboxEmpty>ไม่พบรายชื่อนักศึกษา</ComboboxEmpty>
                    {studentOptions
                      .filter((opt) => opt.label.toLowerCase().includes(studentInput.toLowerCase()))
                      
                      .filter((opt) => {
                        const s = students.find((x) => x.studentId === opt.value);
                        return !s?.enrolledCourses.includes(formCourse);
                      })
                      .map((opt) => (
                        <ComboboxItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </ComboboxItem>
                      ))}
                  </ComboboxContent>
                )}
              </Combobox>
            </div>
          </div>

          <DialogFooter>
            
            <Button onClick={handleEnroll} disabled={!formCourse || formStudents.length === 0}>
              <PlusCircle className="mr-2 h-4 w-4" />
              ลงทะเบียน ({formStudents.length} คน)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>รหัสวิชา</TableHead>
              <TableHead>ชื่อวิชา</TableHead>
              <TableHead>จำนวน นศ.</TableHead>
              <TableHead>นักศึกษาที่ลงทะเบียน</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {courses.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="h-20 text-center text-muted-foreground">
                  ไม่มีวิชาเรียน
                </TableCell>
              </TableRow>
            )}
            
            {courses.map((course) => {
              
              const enrolledStudents = students.filter((s) =>
                s.enrolledCourses.includes(course.courseCode)
              );

              return (
                <TableRow key={course.courseCode}>
                  <TableCell className="font-medium">{course.courseCode}</TableCell>
                  <TableCell>{course.courseTitle}</TableCell>
                  <TableCell>{enrolledStudents.length}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {enrolledStudents.length > 0 ? (
                        enrolledStudents.map((s) => (
                          <Badge key={s.studentId} variant="secondary" className="gap-1">
                            {s.firstName} {s.lastName}
                            
                            <button
                              className="rounded-full hover:bg-muted p-0.5"
                              onClick={() => drop(course.courseCode, s.studentId)}
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))
                      ) : (
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}