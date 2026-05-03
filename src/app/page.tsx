'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Prompter from '@/components/Prompter';
import StudentTable from '@/components/StudentTable';
import EditorDrawer from '@/components/EditorDrawer';
import { Student, generateAIContent } from '@/lib/aiService';
import { useStudents } from '@/hooks/useStudents';
import { LayoutGrid, Users, Settings, LogOut, Plus, Search } from 'lucide-react';

export default function Home() {
  const [currentCategory, setCurrentCategory] = useState('교과세특');
  const [promptGuideline, setPromptGuideline] = useState('학생의 관찰 내용을 바탕으로 생활기록부에 적합한 문장을 작성해 주세요. 주어(이름)는 생략하고 서술해 주세요.');
  const { students, isLoading, addStudent, updateStudent } = useStudents();
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Mock "user_01" session
  const userId = 'user_01';

  // useEffect for fetching is no longer needed as useStudents handles it


  const handleSave = async (id: string, updates: Partial<Student>) => {
    try {
      updateStudent(id, updates);
      setSelectedStudent(null);
    } catch (error) {
      alert("데이터 저장 중 오류가 발생했습니다.");
    }
  };

  const handleAddStudent = async () => {
    const name = prompt("학생 이름을 입력하세요:");
    if (!name) return;
    
    const nextStudentNo = (students.length > 0) 
      ? (Math.max(...students.map(s => parseInt(s.studentNo) || 0)) + 1).toString()
      : '10101';

    const newStudent: Omit<Student, 'id'> = {
      name,
      studentNo: nextStudentNo,
      gender: '남',
      birthDate: '',
      phone: '',
      note: '',
      achievement: '보통',
      teacherNote: '',
      aiOutput: ''
    };

    try {
      addStudent(newStudent);
    } catch (error) {
      alert("학생 추가 중 오류가 발생했습니다.");
    }
  };

  const filteredStudents = students.filter(s => 
    s.name.includes(searchTerm) || s.studentNo.includes(searchTerm)
  );

  return (
    <div className="flex h-screen bg-[#F2F4F6] text-[#191F28] overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-72 bg-white flex flex-col px-6 py-10 shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-20">
        <div className="flex items-center gap-3 mb-12 px-2">
          <div className="w-10 h-10 bg-[#3182F6] rounded-[12px] flex items-center justify-center text-white shadow-lg shadow-[#3182F6]/20">
            <LayoutGrid size={22} strokeWidth={2.5} />
          </div>
          <span className="text-2xl font-black tracking-tight text-[#191F28]">StudentAI</span>
        </div>

        <nav className="flex-1 space-y-2">
          <Link href="/" className="flex items-center gap-4 px-5 py-4 bg-[#F2F4F6] text-[#3182F6] rounded-2xl font-bold transition-all">
            <LayoutGrid size={20} strokeWidth={2.5} />
            <span className="text-[16px]">대시보드</span>
          </Link>
          <Link href="/classes" className="flex items-center gap-4 px-5 py-4 text-[#8B95A1] hover:text-[#4E5968] hover:bg-[#F9FAFB] rounded-2xl font-bold transition-all">
            <Users size={20} strokeWidth={2} />
            <span className="text-[16px]">학급 관리</span>
          </Link>
          <Link href="/settings" className="flex items-center gap-4 px-5 py-4 text-[#8B95A1] hover:text-[#4E5968] hover:bg-[#F9FAFB] rounded-2xl font-bold transition-all">
            <Settings size={20} strokeWidth={2} />
            <span className="text-[16px]">설정</span>
          </Link>
        </nav>

        <div className="pt-8 border-t border-[#F2F4F6] flex items-center justify-between px-2">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-[#E8F3FF] border border-[#D0E6FF] flex items-center justify-center text-[#3182F6] font-bold text-sm">
              {userId[0].toUpperCase()}
            </div>
            <div>
              <p className="text-[15px] font-bold text-[#191F28]">테스트 교사</p>
              <p className="text-[12px] text-[#ADB5BD] font-medium">{userId}</p>
            </div>
          </div>
          <button className="p-2.5 text-[#ADB5BD] hover:text-[#F04452] transition-colors bg-[#F9FAFB] rounded-xl hover:bg-[#FFF0F0]">
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="px-10 py-10 flex justify-between items-end bg-[#F2F4F6]/80 backdrop-blur-md z-10">
          <div className="space-y-1">
            <h1 className="text-[32px] font-black text-[#191F28] tracking-tight leading-tight">생활기록부 작성</h1>
            <p className="text-[16px] text-[#8B95A1] font-medium">AI와 함께 더 빠르고 정확하게 작성하세요.</p>
          </div>
          
          <div className="flex items-center gap-4 mb-1">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#ADB5BD] group-focus-within:text-[#3182F6] transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="학생 이름 또는 학번 검색" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-6 py-3.5 bg-white border-none rounded-2xl text-[15px] focus:ring-2 focus:ring-[#3182F6]/20 outline-none w-80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] font-medium text-[#333D4B] placeholder-[#ADB5BD]"
              />
            </div>
            <button 
              onClick={handleAddStudent}
              className="flex items-center gap-2 px-7 py-3.5 bg-[#3182F6] text-white rounded-2xl text-[16px] font-bold hover:bg-[#1B64DA] transition-all shadow-lg shadow-[#3182F6]/20 active:scale-95"
            >
              <Plus size={20} strokeWidth={3} />
              학생 추가
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto pb-20 custom-scrollbar scroll-smooth">
          <Prompter
            promptGuideline={promptGuideline}
            onPromptChange={setPromptGuideline}
          />

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-32 gap-6">
              <div className="w-12 h-12 border-4 border-[#3182F6]/20 border-t-[#3182F6] rounded-full animate-spin" />
              <p className="text-[16px] font-bold text-[#8B95A1]">데이터를 안전하게 불러오고 있어요</p>
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
