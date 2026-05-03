'use client';

import { useState, useEffect, useCallback } from 'react';
import { Student } from '@/lib/aiService';
import { 
  getStudents, 
  addStudent as addStudentToDB, 
  updateStudent as updateStudentInDB, 
  deleteStudent as deleteStudentFromDB 
} from '@/lib/studentService';

export function useStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStudents = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getStudents();
      setStudents(data);
    } catch (error) {
      console.error('Failed to fetch students:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load from Firebase on mount
  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const addStudent = async (studentData: Omit<Student, 'id'>) => {
    try {
      const newStudent = await addStudentToDB(studentData);
      setStudents(prev => [...prev, newStudent]);
      return newStudent;
    } catch (error) {
      console.error('Failed to add student:', error);
      throw error;
    }
  };

  const updateStudent = async (id: string, updates: Partial<Student>) => {
    try {
      await updateStudentInDB(id, updates);
      setStudents(prev => prev.map(s => (s.id === id ? { ...s, ...updates } : s)));
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
    try {
      // For simplicity using Promise.all, for large datasets writeBatch would be better
      const results = await Promise.all(newStudentsToAdd.map(s => addStudentToDB(s)));
      setStudents(prev => [...prev, ...results]);
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
