'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  LayoutGrid, 
  Users, 
  Settings, 
  LogOut, 
  Plus, 
  Search, 
  Upload, 
  Download, 
  Edit2, 
  Trash2,
  MoreVertical,
  ClipboardList
} from 'lucide-react';
import { useStudents } from '@/hooks/useStudents';
import { Student } from '@/lib/aiService';

// Local interface is no longer needed as we use the unified Student type from lib/aiService


export default function ClassesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const { students, addStudent, updateStudent, deleteStudent, bulkAddStudents } = useStudents();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [newStudent, setNewStudent] = useState<Omit<Student, 'id'>>({
    studentNo: '',
    name: '',
    gender: '남',
    birthDate: '',
    phone: '',
    note: '',
    achievement: '보통',
    teacherNote: '',
  });
  
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkText, setBulkText] = useState('');
  
  const userId = 'user_01';

  const filteredStudents = students.filter(s => 
    s.name.includes(searchTerm) || s.studentNo.includes(searchTerm)
  );

  const handleOpenAddModal = () => {
    setEditingStudentId(null);
    setNewStudent({
      studentNo: '',
      name: '',
      gender: '남',
      birthDate: '',
      phone: '',
      note: '',
      achievement: '보통',
      teacherNote: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (student: Student) => {
    setEditingStudentId(student.id);
    setNewStudent({
      studentNo: student.studentNo,
      name: student.name,
      gender: student.gender,
      birthDate: student.birthDate,
      phone: student.phone,
      note: student.note,
      achievement: student.achievement || '보통',
      teacherNote: student.teacherNote || '',
    });
    setIsModalOpen(true);
  };

  const handleDeleteStudent = (id: string) => {
    if (window.confirm("정말로 이 학생 데이터를 삭제하시겠습니까?")) {
      deleteStudent(id);
    }
  };

  const handleSaveStudent = () => {
    if (!newStudent.studentNo || !newStudent.name) {
      alert('번호와 이름은 필수 입력 항목입니다.');
      return;
    }
    
    if (editingStudentId) {
      // Update
      updateStudent(editingStudentId, newStudent);
    } else {
      // Add
      addStudent(newStudent);
    }

    setIsModalOpen(false);
    setEditingStudentId(null);
    setNewStudent({
      studentNo: '',
      name: '',
      gender: '남',
      birthDate: '',
      phone: '',
      note: '',
      achievement: '보통',
      teacherNote: '',
    });
  };

  const handleBulkPaste = () => {
    if (!bulkText.trim()) {
      alert('데이터를 입력해 주세요.');
      return;
    }

    const lines = bulkText.trim().split('\n').filter(line => line.trim() !== '');
    const hasTabs = bulkText.includes('\t');
    
    let newStudentsData: Student[] = [];

    if (!hasTabs) {
      // Case A: Names Only
      let lastNo = 0;
      if (students.length > 0) {
        const lastStudent = students[students.length - 1];
        lastNo = parseInt(lastStudent.studentNo.replace(/[^0-9]/g, '')) || 0;
      }

      newStudentsData = lines.map((name, index) => ({
        id: Math.random().toString(36).substr(2, 9),
        studentNo: (lastNo + index + 1).toString(),
        name: name.trim(),
        gender: '-',
        birthDate: '',
        phone: '',
        note: '',
        achievement: '보통',
        teacherNote: '',
      }));
    } else {
      // Case B: TSV / Excel
      newStudentsData = lines.map(line => {
        const fields = line.split('\t');
        return {
          id: Math.random().toString(36).substr(2, 9),
          studentNo: fields[0]?.trim() || '',
          name: fields[1]?.trim() || '',
          gender: fields[2]?.trim() || '남',
          birthDate: fields[3]?.trim() || '',
          phone: fields[4]?.trim() || '',
          note: fields[5]?.trim() || '',
          achievement: '보통',
          teacherNote: '',
        };
      }).filter(s => s.studentNo || s.name);
    }

    if (newStudentsData.length === 0) {
      alert('추가할 학생 데이터가 없습니다. 형식을 확인해 주세요.');
      return;
    }

    bulkAddStudents(newStudentsData);
    setBulkText('');
    setIsBulkModalOpen(false);
  };

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
          <Link href="/" className="flex items-center gap-4 px-5 py-4 text-[#8B95A1] hover:text-[#4E5968] hover:bg-[#F9FAFB] rounded-2xl font-bold transition-all">
            <LayoutGrid size={20} strokeWidth={2} />
            <span className="text-[16px]">대시보드</span>
          </Link>
          <Link href="/classes" className="flex items-center gap-4 px-5 py-4 bg-[#F2F4F6] text-[#3182F6] rounded-2xl font-bold transition-all">
            <Users size={20} strokeWidth={2.5} />
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
            <h1 className="text-[32px] font-black text-[#191F28] tracking-tight leading-tight">학급 관리</h1>
            <p className="text-[16px] text-[#8B95A1] font-medium">우리 반 학생들의 기본 정보를 관리하세요.</p>
          </div>
          
          <div className="flex items-center gap-3 mb-1">
            <div className="relative group mr-2">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#ADB5BD] group-focus-within:text-[#3182F6] transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="학생 이름 또는 번호 검색" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-6 py-3.5 bg-white border-none rounded-2xl text-[15px] focus:ring-2 focus:ring-[#3182F6]/20 outline-none w-72 shadow-[0_4px_20px_rgba(0,0,0,0.03)] font-medium text-[#333D4B] placeholder-[#ADB5BD]"
              />
            </div>
            
            <button 
              onClick={handleOpenAddModal}
              className="flex items-center gap-2 px-5 py-3.5 bg-[#3182F6] text-white rounded-2xl text-[15px] font-bold hover:bg-[#1B64DA] transition-all shadow-lg shadow-[#3182F6]/20 active:scale-95"
            >
              <Plus size={18} strokeWidth={3} />
              학생 추가
            </button>
            <button 
              onClick={() => setIsBulkModalOpen(true)}
              className="flex items-center gap-2 px-5 py-3.5 bg-white text-[#4E5968] border border-[#E5E8EB] rounded-2xl text-[15px] font-bold hover:bg-[#F9FAFB] transition-all active:scale-95"
            >
              <ClipboardList size={18} className="text-[#3182F6]" />
              📋 일괄 붙여넣기
            </button>
            <button className="flex items-center gap-2 px-5 py-3.5 bg-white text-[#4E5968] border border-[#E5E8EB] rounded-2xl text-[15px] font-bold hover:bg-[#F9FAFB] transition-all active:scale-95">
              <Download size={18} />
              엑셀 다운로드
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-10 pb-20 custom-scrollbar scroll-smooth">
          <div className="bg-white rounded-[32px] shadow-[0_8px_40px_rgba(0,0,0,0.02)] overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#F2F4F6]">
                  <th className="px-6 py-5 text-xs font-bold text-[#8B95A1] uppercase tracking-wider w-20 text-center">번호</th>
                  <th className="px-6 py-5 text-xs font-bold text-[#8B95A1] uppercase tracking-wider">이름</th>
                  <th className="px-6 py-5 text-xs font-bold text-[#8B95A1] uppercase tracking-wider text-center">성별</th>
                  <th className="px-6 py-5 text-xs font-bold text-[#8B95A1] uppercase tracking-wider">생년월일</th>
                  <th className="px-6 py-5 text-xs font-bold text-[#8B95A1] uppercase tracking-wider">연락처</th>
                  <th className="px-6 py-5 text-xs font-bold text-[#8B95A1] uppercase tracking-wider">특이사항</th>
                  <th className="px-6 py-5 text-xs font-bold text-[#8B95A1] uppercase tracking-wider w-24 text-center">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F9FAFB]">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-20 text-center text-[#8B95A1] font-medium">
                      검색 결과가 없습니다.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((student) => (
                    <tr key={student.id} className="hover:bg-[#F9FAFB]/80 transition-colors group">
                      <td className="px-6 py-5 text-sm text-[#8B95A1] font-medium text-center">{student.studentNo}</td>
                      <td className="px-6 py-5 font-bold text-[#191F28] text-[15px]">{student.name}</td>
                      <td className="px-6 py-5 text-center">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                          student.gender === '남' ? 'bg-[#E8F3FF] text-[#3182F6]' : 'bg-[#FFF0F0] text-[#F04452]'
                        }`}>
                          {student.gender}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-sm text-[#4E5968]">{student.birthDate}</td>
                      <td className="px-6 py-5 text-sm text-[#4E5968]">{student.phone}</td>
                      <td className="px-6 py-5 text-sm text-[#8B95A1] max-w-[200px] truncate">{student.note}</td>
                      <td className="px-6 py-5">
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            onClick={() => handleOpenEditModal(student)}
                            className="p-2 text-[#ADB5BD] hover:text-[#3182F6] hover:bg-[#E8F3FF] rounded-lg transition-all"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            onClick={() => handleDeleteStudent(student.id)}
                            className="p-2 text-[#ADB5BD] hover:text-[#F04452] hover:bg-[#FFF0F0] rounded-lg transition-all"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Modal */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200 px-6"
          onClick={() => {
            setIsModalOpen(false);
            setEditingStudentId(null);
          }}
        >
          <div 
            className="bg-white rounded-[32px] w-full max-w-lg p-10 shadow-[0_20px_60px_rgba(0,0,0,0.15)] animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-[24px] font-black text-[#191F28] mb-8">
              {editingStudentId ? '학생 정보 수정' : '학생 추가'}
            </h2>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-[#4E5968] ml-1">번호 (필수)</label>
                  <input 
                    type="text" 
                    placeholder="예: 10101"
                    className="w-full px-5 py-3.5 bg-[#F9FAFB] border-none rounded-2xl text-[15px] focus:ring-2 focus:ring-[#3182F6]/20 outline-none font-medium text-[#191F28]"
                    value={newStudent.studentNo}
                    onChange={(e) => setNewStudent({...newStudent, studentNo: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-[#4E5968] ml-1">이름 (필수)</label>
                  <input 
                    type="text" 
                    placeholder="예: 김민수"
                    className="w-full px-5 py-3.5 bg-[#F9FAFB] border-none rounded-2xl text-[15px] focus:ring-2 focus:ring-[#3182F6]/20 outline-none font-medium text-[#191F28]"
                    value={newStudent.name}
                    onChange={(e) => setNewStudent({...newStudent, name: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-[#4E5968] ml-1">성별</label>
                  <select 
                    className="w-full px-5 py-3.5 bg-[#F9FAFB] border-none rounded-2xl text-[15px] focus:ring-2 focus:ring-[#3182F6]/20 outline-none font-medium text-[#191F28] appearance-none"
                    value={newStudent.gender}
                    onChange={(e) => setNewStudent({...newStudent, gender: e.target.value})}
                  >
                    <option value="남">남</option>
                    <option value="여">여</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-[#4E5968] ml-1">생년월일</label>
                  <input 
                    type="date" 
                    className="w-full px-5 py-3.5 bg-[#F9FAFB] border-none rounded-2xl text-[15px] focus:ring-2 focus:ring-[#3182F6]/20 outline-none font-medium text-[#191F28]"
                    value={newStudent.birthDate}
                    onChange={(e) => setNewStudent({...newStudent, birthDate: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-[#4E5968] ml-1">연락처</label>
                <input 
                  type="text" 
                  placeholder="예: 010-0000-0000"
                  className="w-full px-5 py-3.5 bg-[#F9FAFB] border-none rounded-2xl text-[15px] focus:ring-2 focus:ring-[#3182F6]/20 outline-none font-medium text-[#191F28]"
                  value={newStudent.phone}
                  onChange={(e) => setNewStudent({...newStudent, phone: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-[#4E5968] ml-1">특이사항</label>
                <textarea 
                  placeholder="참고할 내용을 입력하세요."
                  className="w-full px-5 py-3.5 bg-[#F9FAFB] border-none rounded-2xl text-[15px] focus:ring-2 focus:ring-[#3182F6]/20 outline-none font-medium text-[#191F28] min-h-[100px] resize-none"
                  value={newStudent.note}
                  onChange={(e) => setNewStudent({...newStudent, note: e.target.value})}
                />
              </div>
            </div>

            <div className="flex items-center gap-3 mt-10">
              <button 
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingStudentId(null);
                }}
                className="flex-1 py-4 bg-[#F2F4F6] text-[#4E5968] rounded-2xl text-[16px] font-bold hover:bg-[#E5E8EB] transition-all"
              >
                취소
              </button>
              <button 
                onClick={handleSaveStudent}
                className="flex-1 py-4 bg-[#3182F6] text-white rounded-2xl text-[16px] font-bold hover:bg-[#1B64DA] transition-all shadow-lg shadow-[#3182F6]/20"
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Paste Modal */}
      {isBulkModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200 px-6"
          onClick={() => {
            setIsBulkModalOpen(false);
            setBulkText('');
          }}
        >
          <div 
            className="bg-white rounded-[32px] w-full max-w-2xl p-10 shadow-[0_20px_60px_rgba(0,0,0,0.15)] animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-[#E8F3FF] rounded-xl flex items-center justify-center text-[#3182F6]">
                <ClipboardList size={22} />
              </div>
              <h2 className="text-[24px] font-black text-[#191F28]">학생 일괄 추가</h2>
            </div>
            
            <p className="text-[15px] text-[#4E5968] mb-6 leading-relaxed bg-[#F9FAFB] p-4 rounded-2xl border border-[#F2F4F6]">
              <span className="font-bold text-[#3182F6]">💡 안내:</span> 학생 이름만 한 줄씩 입력하여 빠르게 추가하거나, 엑셀/나이스 표를 그대로 복사해서 붙여넣으세요.
            </p>
            
            <div className="space-y-4">
              <textarea 
                rows={10}
                placeholder="여기에 데이터를 붙여넣으세요.&#10;(형식: 번호 [TAB] 이름 [TAB] 성별 [TAB] 생년월일 [TAB] 연락처 [TAB] 특이사항)"
                className="w-full px-6 py-5 bg-[#F9FAFB] border-2 border-transparent focus:border-[#3182F6]/20 focus:bg-white rounded-[24px] text-[15px] outline-none font-mono text-[#191F28] shadow-inner transition-all resize-none"
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
              />
              <p className="text-[12px] text-[#ADB5BD] ml-2">
                * 이름만 입력하면 번호가 자동 부여됩니다. 엑셀 데이터는 탭으로 구분됩니다.
              </p>
            </div>

            <div className="flex items-center gap-3 mt-10">
              <button 
                onClick={() => {
                  setIsBulkModalOpen(false);
                  setBulkText('');
                }}
                className="flex-1 py-4 bg-[#F2F4F6] text-[#4E5968] rounded-2xl text-[16px] font-bold hover:bg-[#E5E8EB] transition-all"
              >
                취소
              </button>
              <button 
                onClick={handleBulkPaste}
                className="flex-1 py-4 bg-[#3182F6] text-white rounded-2xl text-[16px] font-bold hover:bg-[#1B64DA] transition-all shadow-lg shadow-[#3182F6]/20 active:scale-95"
              >
                추가하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
