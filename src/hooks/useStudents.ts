'use client';

import { useState, useEffect, useCallback } from 'react';
import { Student } from '@/lib/aiService';
import { 
  getStudents, 
  addStudent as addStudentToDB, 
  updateStudent as updateStudentInDB, 
  deleteStudent as deleteStudentFromDB 
} from '@/lib/studentService';

export function useStudents(classId?: string, tabId?: string) {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStudents = useCallback(async () => {
    if (!classId) {
      setStudents([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const data = await getStudents(classId, tabId);
      setStudents(data);
    } catch (error) {
      console.error('Failed to fetch students:', error);
    } finally {
      setIsLoading(false);
    }
  }, [classId, tabId]);

  // Re-fetch when classId or tabId changes
  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const addStudent = async (studentData: Omit<Student, 'id'>) => {
    if (!classId) throw new Error("Class ID is required to add student");
    try {
      const dataWithContext = { 
        ...studentData, 
        classId,
        tabId: tabId || null 
      };
      const newStudent = await addStudentToDB(dataWithContext);
      setStudents(prev => {
        const updated = [...prev, newStudent];
        return updated.sort((a, b) => Number(a.studentNo) - Number(b.studentNo));
      });
      return newStudent;
    } catch (error) {
      console.error('Failed to add student:', error);
      throw error;
    }
  };

  const updateStudent = async (id: string, updates: Partial<Student>) => {
    try {
      await updateStudentInDB(id, updates);
      setStudents(prev => {
        const updated = prev.map(s => (s.id === id ? { ...s, ...updates } : s));
        return updated.sort((a, b) => Number(a.studentNo) - Number(b.studentNo));
      });
    } catch (error) {
      console.error('Failed to update student:', error);
      throw error;
    }
  };

  const deleteStudent = async (id: string) => {
    try {
      await deleteStudentFromDB(id);
      setStudents(prev => prev.filter(s => s.id !== id));
    } catch (error) {
      console.error('Failed to delete student:', error);
      throw error;
    }
  };

  const bulkAddStudents = async (newStudentsToAdd: Omit<Student, 'id'>[]) => {
    if (!classId) throw new Error("Class ID is required for bulk add");
    try {
      const dataWithContext = newStudentsToAdd.map(s => ({ 
        ...s, 
        classId,
        tabId: tabId || null 
      }));
      const results = await Promise.all(dataWithContext.map(s => addStudentToDB(s)));
      setStudents(prev => {
        const updated = [...prev, ...results];
        return updated.sort((a, b) => Number(a.studentNo) - Number(b.studentNo));
      });
    } catch (error) {
      console.error('Failed to bulk add students:', error);
      throw error;
    }
  };

  return {
    students,
    isLoading,
    addStudent,
    updateStudent,
    deleteStudent,
    bulkAddStudents,
    refreshStudents: fetchStudents,
  };
}
