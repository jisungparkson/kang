import { db } from './firebase';
import { collection, getDocs, doc, updateDoc, setDoc, query, orderBy, deleteDoc, addDoc } from 'firebase/firestore';
import { Student, initialStudents } from './aiService';

const COLLECTION_NAME = 'students';

export const getStudents = async (): Promise<Student[]> => {
  try {
    const q = query(collection(db, COLLECTION_NAME));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      console.log("No students found, seeding initial data...");
      // Seed database with initial data if empty
      await Promise.all(
        initialStudents.map((student) => 
          setDoc(doc(db, COLLECTION_NAME, student.id), student)
        )
      );
      return initialStudents;
    }

    const students = querySnapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    } as Student));

    return students;
  } catch (error) {
    console.error("Error fetching students: ", error);
    // If Firebase fails, we still want the app to be usable with initial data
    return initialStudents;
  }
};

export const addStudent = async (student: Omit<Student, 'id'>): Promise<Student> => {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), student);
    return { ...student, id: docRef.id };
  } catch (error) {
    console.error("Error adding student: ", error);
    throw error;
  }
};

export const updateStudent = async (studentId: string, updates: Partial<Student>): Promise<void> => {
  try {
    const studentRef = doc(db, COLLECTION_NAME, studentId);
    await updateDoc(studentRef, updates);
  } catch (error) {
    console.error("Error updating student: ", error);
    throw error;
  }
};

export const updateStudentAIOutput = async (studentId: string, aiOutput: string): Promise<void> => {
  return updateStudent(studentId, { aiOutput });
};

export const deleteStudent = async (studentId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, studentId));
  } catch (error) {
    console.error("Error deleting student: ", error);
    throw error;
  }
};
