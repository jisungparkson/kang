import { db } from './firebase';
import { collection, getDocs, doc, updateDoc, setDoc, query, orderBy } from 'firebase/firestore';
import { Student, initialStudents } from './aiService';

const COLLECTION_NAME = 'students';

export const getStudents = async (): Promise<Student[]> => {
  try {
    const q = query(collection(db, COLLECTION_NAME));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      // Seed database with initial data if empty
      await Promise.all(
        initialStudents.map((student) => 
          setDoc(doc(db, COLLECTION_NAME, student.id), student)
        )
      );
      return initialStudents;
    }

    return querySnapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    } as Student));
  } catch (error) {
    console.error("Error fetching students: ", error);
    return initialStudents; // Fallback
  }
};

export const updateStudentAIOutput = async (studentId: string, aiOutput: string): Promise<void> => {
  try {
    const studentRef = doc(db, COLLECTION_NAME, studentId);
    await updateDoc(studentRef, { aiOutput });
  } catch (error) {
    console.error("Error updating student: ", error);
    throw error;
  }
};
