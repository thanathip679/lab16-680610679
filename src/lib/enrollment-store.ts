import { create } from "zustand";
import { persist } from "zustand/middleware";

import {
  students as initialStudents,
  courses as initialCourses,
} from "@/lib/mock-data";
import type { Course, Student } from "@/lib/types";

type EnrollmentStore = {
  students: Student[];
  courses: Course[];
  /** ลบนักศึกษา พร้อมการลงทะเบียนทั้งหมดของคนนั้น */
  removeStudent: (studentId: string) => void;
  /** ลบวิชาออกจากรายวิชาที่เปิดสอน พร้อม cascade ลบ enrollment ที่อ้างถึงวิชานั้นทั้งหมด */
  removeCourse: (courseId: string) => void;
  addCourse: (course: Course) => void;
  enroll: (courseCode: string, studentIds: string[]) => void;
  drop: (courseCode: string, studentId: string) => void;
  removeInstructor: (courseCode: string, instructorName: string) => void;
};

export const useEnrollmentStore = create<EnrollmentStore>()(
persist(
    (set) => ({
      students: initialStudents,
      courses: initialCourses,

      removeStudent: (studentId) =>
        set((state) => ({
          students: state.students.filter((s) => s.studentId !== studentId),
        })),

      removeCourse: (courseCode) =>
        set((state) => ({
          courses: state.courses.filter((c) => c.courseCode !== courseCode),
          students: state.students.map((s) => ({
            ...s,
            enrolledCourses: s.enrolledCourses.filter((code) => code !== courseCode),
          })),
      
        })),
      
      addCourse: (course) =>
    set((state) => ({
      courses: [...state.courses, course],
    })),

      enroll: (courseCode, studentIds) =>
    set((state) => ({
      students: state.students.map((s) =>
        
        studentIds.includes(s.studentId) && !s.enrolledCourses.includes(courseCode)
          ? { ...s, enrolledCourses: [...s.enrolledCourses, courseCode] }
          : s
      ),
    })),

  drop: (courseCode, studentId) =>
    set((state) => ({
      students: state.students.map((s) =>
        
        s.studentId === studentId
          ? { ...s, enrolledCourses: s.enrolledCourses.filter((c) => c !== courseCode) }
          : s
      ),
    })),

    removeInstructor: (courseCode, instructorName) =>
    set((state) => ({
      courses: state.courses.map((c) =>
        c.courseCode === courseCode
          ? {
              ...c,
              
              instructors: c.instructors?.filter((i) => i !== instructorName),
            }
          : c
      ),
    })),
    }),
    {
      
      name: "lab16-2569-680610679", 
      
      partialize: (state) => ({
        students: state.students,
        courses: state.courses,
      }),
    }
  )
);
