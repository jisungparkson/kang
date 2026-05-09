import { db } from './firebase';
import { collection, getDocs, doc, updateDoc, setDoc, query, orderBy, deleteDoc, addDoc, where } from 'firebase/firestore';
import { Student, initialStudents } from './aiService';

const COLLECTION_NAME = 'students';

export const getStudents = async (tabId?: string): Promise<Student[]> => {
  try {
    let q;
    
    if (tabId) {
      // Scoped: only students belonging to this workspace tab
      q = query(
        collection(db, COLLECTION_NAME),
        where('tabId', '==', tabId),
        orderBy('studentNo', 'asc')
      );
    } else {
      // Global: students without a tabId (master list)
      q = query(
        collection(db, COLLECTION_NAME),
        orderBy('studentNo', 'asc')
      );
    }

    const querySnapshot = await getDocs(q);

    // When fetching global list and it's empty, seed initial data
    if (querySnapshot.empty && !tabId) {
      console.log("No students found, seeding initial data...");
      await Promise.all(
        initialStudents.map((student) =>
          setDoc(doc(db, COLLECTION_NAME, student.id), student)
        )
      );
      return initialStudents.sort((a, b) => Number(a.studentNo) - Number(b.studentNo));
    }

    let students = querySnapshot.docs.map((d) => ({
      ...d.data(),
      id: d.id,
    } as Student));

    // For global list, filter out students that belong to a workspace tab
    if (!tabId) {
      students = students.filter(s => !s.tabId);
    }

    return students.sort((a, b) => Number(a.studentNo) - Number(b.studentNo));
  } catch (error) {
    console.error("Error fetching students: ", error);
    return tabId ? [] : initialStudents;
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
