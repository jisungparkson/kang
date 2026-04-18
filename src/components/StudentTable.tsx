import { Student } from '@/lib/aiService';
import styles from './StudentTable.module.css';
import { User, Activity, FileText, ChevronRight } from 'lucide-react';

interface StudentTableProps {
  students: Student[];
  onSelectStudent: (student: Student) => void;
}

export default function StudentTable({ students, onSelectStudent }: StudentTableProps) {
  return (
    <div className={`${styles.container} glass-panel`}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>번호</th>
            <th>이름</th>
            <th>학생 정보</th>
            <th>성취도</th>
            <th>교사 원본 메모</th>
            <th>AI 생성 문구</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {students.map((student, idx) => (
            <tr key={student.id} onClick={() => onSelectStudent(student)} className={styles.row}>
              <td className={styles.idx}>{idx + 1}</td>
              <td className={styles.name}>
                <div className={styles.nameBadge}>
                  <User size={14} />
                  {student.name}
                </div>
              </td>
              <td className={styles.studentNo}>{student.studentNo}</td>
              <td>
                <span className={`${styles.achievement} ${student.achievement === '우수' ? styles.high : styles.mid}`}>
                  <Activity size={12} />
                  {student.achievement}
                </span>
              </td>
              <td className={styles.note}>{student.teacherNote}</td>
              <td className={styles.aiOutput}>
                {student.aiOutput ? (
                  <div className={styles.outputPreview}>
                    <FileText size={12} />
                    <span>{student.aiOutput}</span>
                  </div>
                ) : (
                  <span className={styles.empty}>미생성</span>
                )}
              </td>
              <td>
                <ChevronRight size={18} className={styles.chevron} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
