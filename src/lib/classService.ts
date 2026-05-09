import { db } from './firebase';
import { collection, getDocs, doc, setDoc, query, orderBy, addDoc } from 'firebase/firestore';

const COLLECTION_NAME = 'classes';

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
