'use client';

import { useState, useEffect } from 'react';
import Prompter from '@/components/Prompter';
import StudentTable from '@/components/StudentTable';
import EditorDrawer from '@/components/EditorDrawer';
import { Student, generateAIContent, initialStudents } from '@/lib/aiService';
import { getStudents, updateStudent, addStudent } from '@/lib/studentService';
import { LayoutGrid, Users, Settings, LogOut, Plus, Search } from 'lucide-react';

export default function Home() {
  const [currentCategory, setCurrentCategory] = useState('생활');
  const [promptGuideline, setPromptGuideline] = useState('학생의 관찰 내용을 바탕으로 생활기록부에 적합한 문장을 작성해 주세요. 주어(이름)는 생략하고 서술해 주세요.');
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Mock "user_01" session
  const userId = 'user_01';

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const timeoutPromise = new Promise<Student[]>((resolve) => 
        setTimeout(() => resolve([]), 3000)
      );

      try {
        const data = await Promise.race([getStudents(), timeoutPromise]);
        if (data && data.length > 0) {
          setStudents(data);
        } else {
          setStudents(initialStudents);
        }
      } catch (err) {
        setStudents(initialStudents);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSave = async (id: string, updates: Partial<Student>) => {
    try {
      await updateStudent(id, updates);
      setStudents((prev) =>
        prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
      );
      setSelectedStudent(null);
    } catch (error) {
      alert("데이터 저장 중 오류가 발생했습니다.");
    }
  };

  const handleAddStudent = async () => {
    const name = prompt("학생 이름을 입력하세요:");
    if (!name) return;
    
    const newStudent: Omit<Student, 'id'> = {
      name,
      studentNo: (students.length + 10101).toString(),
      achievement: '보통',
      teacherNote: '',
      aiOutput: ''
    };

    try {
      const added = await addStudent(newStudent);
      setStudents(prev => [...prev, added]);
    } catch (error) {
      alert("학생 추가 중 오류가 발생했습니다.");
    }
  };

  const filteredStudents = students.filter(s => 
    s.name.includes(searchTerm) || s.studentNo.includes(searchTerm)
  );

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 glass-panel border-r border-border flex flex-col p-6">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-sm">S</div>
          <span className="text-xl font-bold tracking-tight">StudentAI</span>
        </div>

        <nav className="flex-1 space-y-1">
          <a href="#" className="flex items-center gap-3 px-4 py-3 bg-white text-primary rounded-xl font-bold shadow-sm border border-border">
            <LayoutGrid size={18} />
            <span className="text-sm">대시보드</span>
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-primary hover:bg-white/50 rounded-xl font-medium transition-all">
            <Users size={18} />
            <span className="text-sm">학급 관리</span>
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-primary hover:bg-white/50 rounded-xl font-medium transition-all">
            <Settings size={18} />
            <span className="text-sm">설정</span>
          </a>
        </nav>

        <div className="pt-6 border-t border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-primary font-bold text-xs uppercase">
              {userId[0]}
            </div>
            <div>
              <p className="text-xs font-bold text-gray-700">테스트 교사</p>
              <p className="text-[10px] text-gray-400 font-mono">{userId}</p>
            </div>
          </div>
          <button className="p-2 text-gray-300 hover:text-red-500 transition-colors">
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="px-10 py-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">생활기록부 작성 도우미</h1>
            <p className="text-sm text-gray-400 mt-1 font-medium">나이스(NEIS) 기준에 맞춘 AI 문장을 생성하고 관리하세요.</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              <input 
                type="text" 
                placeholder="학생 검색..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 bg-white border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none w-64 shadow-sm"
              />
            </div>
            <button 
              onClick={handleAddStudent}
              className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-black transition-all shadow-lg active:scale-95"
            >
              <Plus size={16} />
              학생 추가
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto pb-10">
          <Prompter
            currentCategory={currentCategory}
            onCategoryChange={setCurrentCategory}
            promptGuideline={promptGuideline}
            onPromptChange={setPromptGuideline}
          />

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
              <p className="text-sm font-bold text-gray-400">데이터를 불러오는 중...</p>
            </div>
          ) : (
            <StudentTable
              students={filteredStudents}
              onSelectStudent={setSelectedStudent}
            />
          )}
        </div>
      </main>

      <EditorDrawer
        student={selectedStudent}
        onClose={() => setSelectedStudent(null)}
        onSave={handleSave}
        onGenerate={(student) => generateAIContent({
          student,
          category: currentCategory,
          promptGuideline,
        })}
      />
    </div>
  );
}
