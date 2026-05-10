import { db } from './firebase';
import { collection, getDocs, doc, setDoc, query, orderBy, addDoc, deleteDoc, where, writeBatch, updateDoc } from 'firebase/firestore';

const COLLECTION_NAME = 'classes';
const STUDENTS_COLLECTION = 'students';

export interface ClassInfo {
  id: string;
  name: string;
  createdAt: number;
}

export const getClasses = async (): Promise<ClassInfo[]> => {
  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      // Seed initial class
      const initialClass = { name: '6학년 1반', createdAt: Date.now() };
      const docRef = await addDoc(collection(db, COLLECTION_NAME), initialClass);
      return [{ ...initialClass, id: docRef.id }];
    }

    return querySnapshot.docs.map((d) => ({
      ...d.data(),
      id: d.id,
    } as ClassInfo));
  } catch (error) {
    console.error("Error fetching classes: ", error);
    return [];
  }
};

export const addClass = async (name: string): Promise<ClassInfo> => {
  try {
    const newClass = { name, createdAt: Date.now() };
    const docRef = await addDoc(collection(db, COLLECTION_NAME), newClass);
    return { ...newClass, id: docRef.id };
  } catch (error) {
    console.error("Error adding class: ", error);
    throw error;
  }
};

export const updateClassName = async (classId: string, newName: string): Promise<void> => {
  try {
    const classRef = doc(db, COLLECTION_NAME, classId);
    await updateDoc(classRef, { name: newName });
  } catch (error) {
    console.error("Error updating class name: ", error);
    throw error;
  }
};

export const deleteClass = async (classId: string): Promise<void> => {
  try {
    // 1. Delete all students in this class
    const studentsQuery = query(collection(db, STUDENTS_COLLECTION), where('classId', '==', classId));
    const studentsSnapshot = await getDocs(studentsQuery);
    
    const batch = writeBatch(db);
    studentsSnapshot.docs.forEach((d) => {
      batch.delete(d.ref);
    });
    
    // 2. Delete the class itself
    batch.delete(doc(db, COLLECTION_NAME, classId));
    
    await batch.commit();
  } catch (error) {
    console.error("Error deleting class: ", error);
    throw error;
  }
};
