'use client';

import { useState, useEffect } from 'react';
import { Student, initialStudents } from '@/lib/aiService';

const STORAGE_KEY = 'kang_students';

export function useStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        setStudents(JSON.parse(savedData));
      } catch (e) {
        console.error('Failed to parse students from localStorage', e);
        setStudents(initialStudents);
      }
    } else {
      setStudents(initialStudents);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialStudents));
    }
    setIsLoading(false);
  }, []);

  // Save to localStorage whenever students change
  const saveToStorage = (newStudents: Student[]) => {
    setStudents(newStudents);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newStudents));
  };

  const addStudent = (student: Omit<Student, 'id'>) => {
    const newStudent: Student = {
      ...student,
      id: Math.random().toString(36).substr(2, 9),
    };
    const newStudents = [...students, newStudent];
    saveToStorage(newStudents);
    return newStudent;
  };

  const updateStudent = (id: string, updates: Partial<Student>) => {
    const newStudents = students.map((s) => (s.id === id ? { ...s, ...updates } : s));
    saveToStorage(newStudents);
  };

  const deleteStudent = (id: string) => {
    const newStudents = students.filter((s) => s.id !== id);
    saveToStorage(newStudents);
  };

  const bulkAddStudents = (newStudentsToAdd: Student[]) => {
    const newStudents = [...students, ...newStudentsToAdd];
    saveToStorage(newStudents);
  };

  return {
    students,
    isLoading,
    addStudent,
    updateStudent,
    deleteStudent,
    bulkAddStudents,
    setStudents: saveToStorage, // Allow direct setting if needed
  };
}
