'use client';

import { useState, useEffect } from 'react';
import styles from './page.module.css';
import Prompter from '@/components/Prompter';
import StudentTable from '@/components/StudentTable';
import EditorDrawer from '@/components/EditorDrawer';
import { initialStudents, Student, generateAIContent } from '@/lib/aiService';
import { LayoutGrid, Users, Settings, LogOut } from 'lucide-react';

export default function Home() {
  const [currentCategory, setCurrentCategory] = useState('생활');
  const [promptGuideline, setPromptGuideline] = useState('학생의 관찰 내용을 바탕으로 생활기록부에 적합한 문장을 작성해 주세요. 주어(이름)는 생략하고 서술해 주세요.');
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // Mock "user_01" session - for now just an effect or constant
  const userId = 'user_01';

  const handleSave = (id: string, newText: string) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, aiOutput: newText } : s))
    );
    setSelectedStudent(null);
  };

  const handleGenerate = async (student: Student) => {
    const result = await generateAIContent({
      student,
      category: currentCategory,
      promptGuideline,
    });
    return result;
  };

  return (
    <main className={styles.main}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}>A</div>
          <span>StudentAI</span>
        </div>
        <nav className={styles.nav}>
          <a href="#" className={styles.navItem + ' ' + styles.active}>
            <LayoutGrid size={18} />
            <span>대시보드</span>
          </a>
          <a href="#" className={styles.navItem}>
            <Users size={18} />
            <span>학급 관리</span>
          </a>
          <a href="#" className={styles.navItem}>
            <Settings size={18} />
            <span>설정</span>
          </a>
        </nav>
        <div className={styles.userSection}>
          <div className={styles.userInfo}>
            <div className={styles.avatar}>T</div>
            <div>
              <p className={styles.userName}>테스트 교사</p>
              <p className={styles.userId}>{userId}</p>
            </div>
          </div>
          <button className={styles.logoutBtn}>
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <section className={styles.content}>
        <header className={styles.header}>
          <h1>생활기록부 작성 도우미</h1>
          <div className={styles.headerRight}>
            <span className={styles.badge}>현재 카테고리: {currentCategory}</span>
          </div>
        </header>

        <div className={styles.scrollArea}>
          <Prompter
            currentCategory={currentCategory}
            onCategoryChange={setCurrentCategory}
            promptGuideline={promptGuideline}
            onPromptChange={setPromptGuideline}
          />

          <StudentTable
            students={students}
            onSelectStudent={setSelectedStudent}
          />
        </div>
      </section>

      <EditorDrawer
        student={selectedStudent}
        onClose={() => setSelectedStudent(null)}
        onSave={handleSave}
        onGenerate={handleGenerate}
      />
    </main>
  );
}
