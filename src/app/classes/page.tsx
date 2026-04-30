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
  MoreVertical
} from 'lucide-react';

interface ClassStudent {
  id: string;
  studentNo: string;
  name: string;
  gender: string;
  birthDate: string;
  phone: string;
  note: string;
}

const initialClassStudents: ClassStudent[] = [
  { id: '1', studentNo: '10101', name: '김민수', gender: '남', birthDate: '2008-03-12', phone: '010-1234-5678', note: '학급 회장' },
  { id: '2', studentNo: '10102', name: '이영희', gender: '여', birthDate: '2008-05-24', phone: '010-2345-6789', note: '-' },
  { id: '3', studentNo: '10103', name: '박지성', gender: '남', birthDate: '2008-02-11', phone: '010-3456-7890', note: '축구부' },
  { id: '4', studentNo: '10104', name: '최유진', gender: '여', birthDate: '2008-11-30', phone: '010-4567-8901', note: '미술 특기자' },
  { id: '5', studentNo: '10105', name: '정태양', gender: '남', birthDate: '2008-08-15', phone: '010-5678-9012', note: '-' },
];

export default function ClassesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [students, setStudents] = useState<ClassStudent[]>(initialClassStudents);
  
  const userId = 'user_01';

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
            
            <button className="flex items-center gap-2 px-5 py-3.5 bg-[#3182F6] text-white rounded-2xl text-[15px] font-bold hover:bg-[#1B64DA] transition-all shadow-lg shadow-[#3182F6]/20 active:scale-95">
              <Plus size={18} strokeWidth={3} />
              학생 추가
            </button>
            <button className="flex items-center gap-2 px-5 py-3.5 bg-white text-[#4E5968] border border-[#E5E8EB] rounded-2xl text-[15px] font-bold hover:bg-[#F9FAFB] transition-all active:scale-95">
              <Upload size={18} />
              엑셀 업로드
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
                          <button className="p-2 text-[#ADB5BD] hover:text-[#3182F6] hover:bg-[#E8F3FF] rounded-lg transition-all">
                            <Edit2 size={16} />
                          </button>
                          <button className="p-2 text-[#ADB5BD] hover:text-[#F04452] hover:bg-[#FFF0F0] rounded-lg transition-all">
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
    </div>
  );
}
