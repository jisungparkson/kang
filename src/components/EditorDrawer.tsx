import { Student } from '@/lib/aiService';
import styles from './EditorDrawer.module.css';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Wand2, Save } from 'lucide-react';
import { useState, useEffect } from 'react';

interface EditorDrawerProps {
  student: Student | null;
  onClose: () => void;
  onSave: (id: string, newText: string) => void;
  onGenerate: (student: Student) => Promise<string>;
}

export default function EditorDrawer({ student, onClose, onSave, onGenerate }: EditorDrawerProps) {
  const [editText, setEditText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (student) {
      setEditText(student.aiOutput || '');
    }
  }, [student]);

  const handleGenerate = async () => {
    if (!student) return;
    setIsGenerating(true);
    const result = await onGenerate(student);
    setEditText(result);
    setIsGenerating(false);
  };

  return (
    <AnimatePresence>
      {student && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={styles.overlay}
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={`${styles.drawer} glass-panel`}
          >
            <div className={styles.header}>
              <div>
                <h2>{student.name} 학생 기록</h2>
                <p className={styles.subTitle}>{student.studentNo} | {student.achievement}</p>
              </div>
              <button onClick={onClose} className={styles.closeBtn}>
                <X size={20} />
              </button>
            </div>

            <div className={styles.content}>
              <div className={styles.section}>
                <h3>교사 관찰 메모</h3>
                <div className={styles.teacherNoteBox}>
                  {student.teacherNote}
                </div>
              </div>

              <div className={styles.section}>
                <div className={styles.sectionHeader}>
                  <h3>AI 생성 생기부 문구</h3>
                  <button 
                    onClick={handleGenerate} 
                    disabled={isGenerating}
                    className={styles.generateBtn}
                  >
                    <Wand2 size={14} />
                    {isGenerating ? '생성 중...' : 'AI 문구 생성'}
                  </button>
                </div>
                <textarea
                  className={styles.editor}
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  placeholder="AI를 통해 문구를 생성하거나 직접 입력해 주세요..."
                />
              </div>
            </div>

            <div className={styles.footer}>
              <button 
                className={styles.saveBtn} 
                onClick={() => onSave(student.id, editText)}
              >
                <Save size={16} />
                변경사항 저장
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
