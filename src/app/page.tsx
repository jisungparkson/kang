'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Prompter from '@/components/Prompter';
import StudentTable, { TabType } from '@/components/StudentTable';
import EditorDrawer from '@/components/EditorDrawer';
import { Student, generateAIContent } from '@/lib/aiService';
import { useStudents } from '@/hooks/useStudents';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutGrid, Users, Settings, LogOut, Plus, Search, X, Menu, ChevronRight, Trash2, Pencil } from 'lucide-react';
import { ClassInfo, getClasses, addClass, deleteClass, updateClassName } from '@/lib/classService';

// ── Workspace Tab type ──
interface WorkspaceTab {
  id: string;
  name: string;
  category: '교과세특' | '행발';
  tabType: TabType;
}

type MenuType = 'dashboard' | 'management' | 'settings';

export default function Home() {
  // ── Sidebar Menu State ──
  const [currentMenu, setCurrentMenu] = useState<MenuType>('management');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // ── Multi-Class State ──
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [activeClassId, setActiveClassId] = useState<string | null>(null);
  const [isClassLoading, setIsClassLoading] = useState(true);

  // ── Workspace (dynamic tab) state ──
  const [workspaces, setWorkspaces] = useState<WorkspaceTab[]>([
    { id: 'init_subject', name: '1학기 교과세특', category: '교과세특', tabType: 'subject' },
  ]);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState('init_subject');

  // ── UI States ──
  const [promptGuideline, setPromptGuideline] = useState(
    '학생의 관찰 내용을 바탕으로 생활기록부에 적합한 문장을 작성해 주세요. 주어(이름)는 생략하고 서술해 주세요.'
  );
  const { user, logout } = useAuth();
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'incomplete'>('all');
  const [isTabModalOpen, setIsTabModalOpen] = useState(false);
  const [newTabName, setNewTabName] = useState('');
  const [newTabCategory, setNewTabCategory] = useState<'교과세특' | '행발'>('교과세특');

  // ── Fetch Classes ──
  useEffect(() => {
    const fetchClasses = async () => {
      setIsClassLoading(true);
      const data = await getClasses();
      setClasses(data);
      if (data.length > 0 && !activeClassId) {
        setActiveClassId(data[0].id);
      }
      setIsClassLoading(false);
    };
    fetchClasses();
  }, []);

  // Responsive: Close sidebar on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) setIsSidebarOpen(false);
      else setIsSidebarOpen(true);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const activeWorkspace = workspaces.find(w => w.id === activeWorkspaceId) || workspaces[0];
  const activeClass = classes.find(c => c.id === activeClassId);

  // ── Scoped Student Data ──
  const { students, isLoading, addStudent, updateStudent } = useStudents(activeClassId || undefined, activeWorkspace?.id);

  // ── Handlers ──
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const handleCreateClass = async () => {
    const name = prompt('새 학급 이름을 입력하세요 (예: 6학년 1반):');
    if (!name) return;
    try {
      const newClass = await addClass(name);
      setClasses(prev => [newClass, ...prev]);
      setActiveClassId(newClass.id);
      setCurrentMenu('dashboard');
    } catch {
      alert('학급 생성 중 오류가 발생했습니다.');
    }
  };

  const handleEditClassName = async (e: React.MouseEvent, classId: string, currentName: string) => {
    e.stopPropagation();
    const newName = prompt('수정할 학급 이름을 입력하세요:', currentName);
    if (!newName || newName.trim() === '' || newName === currentName) return;
    try {
      await updateClassName(classId, newName.trim());
      setClasses(prev => prev.map(c => c.id === classId ? { ...c, name: newName.trim() } : c));
    } catch {
      alert('학급 이름 수정 중 오류가 발생했습니다.');
    }
  };

  const handleDeleteClass = async (e: React.MouseEvent, classId: string, className: string) => {
    e.stopPropagation();
    if (!confirm(`정말 '${className}'을(를) 삭제하시겠습니까? 학급 내 모든 학생 데이터가 함께 삭제됩니다.`)) {
      return;
    }
    try {
      await deleteClass(classId);
      setClasses(prev => prev.filter(c => c.id !== classId));
      if (activeClassId === classId) {
        setActiveClassId(null);
      }
    } catch {
      alert('학급 삭제 중 오류가 발생했습니다.');
    }
  };

  const handleCreateWorkspace = () => {
    if (!newTabName.trim()) {
      alert('탭 이름을 입력해주세요.');
      return;
    }
    const newId = `ws_${Date.now()}`;
    const newTab: WorkspaceTab = {
      id: newId,
      name: newTabName,
      category: newTabCategory,
      tabType: newTabCategory === '교과세특' ? 'subject' : 'behavior',
    };
    setWorkspaces(prev => [...prev, newTab]);
    setActiveWorkspaceId(newId);
    setIsTabModalOpen(false);
    setNewTabName('');
  };

  const handleCloseWorkspace = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = workspaces.filter(w => w.id !== id);
    if (next.length === 0) {
      alert("최소 하나 이상의 작업 공간이 필요합니다.");
      return;
    }
    setWorkspaces(next);
    if (activeWorkspaceId === id) setActiveWorkspaceId(next[next.length - 1].id);
  };

  const handleAddStudent = async () => {
    if (!activeClassId) return alert('학급을 먼저 선택해주세요.');
    const name = prompt('학생 이름을 입력하세요:');
    if (!name) return;
    const nextStudentNo =
      students.length > 0
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
      aiOutput: '',
    };
    try {
      await addStudent(newStudent);
    } catch {
      alert('학생 추가 중 오류가 발생했습니다.');
    }
  };

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.name.includes(searchTerm) || s.studentNo.includes(searchTerm);
    const matchesFilter =
      filterStatus === 'all'
        ? true
        : filterStatus === 'completed'
          ? s.aiOutput && s.aiOutput.trim() !== ''
          : !s.aiOutput || s.aiOutput.trim() === '';
    return matchesSearch && matchesFilter;
  });

  // ── JSX ──
  return (
    <div className="flex h-screen bg-[#F2F4F6] text-[#191F28] overflow-hidden font-sans">
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      <aside className={`bg-white flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-40 transition-all duration-300 ease-in-out overflow-hidden h-full ${
        isSidebarOpen ? 'w-72 px-6 py-10 opacity-100' : 'w-0 px-0 py-10 opacity-0 pointer-events-none'
      } fixed md:relative`}>
        <div className="flex items-center gap-3 mb-8 px-2 pb-6 border-b border-[#F2F4F6] whitespace-nowrap">
          <button onClick={toggleSidebar} className="p-2 -ml-1 text-[#8B95A1] hover:bg-gray-100 rounded-full transition-colors"><Menu size={24} /></button>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#3182F6] rounded-[10px] flex items-center justify-center text-white shadow-sm"><LayoutGrid size={18} strokeWidth={2.5} /></div>
            <span className="text-[19px] font-black tracking-tight text-[#191F28]">StudentAI</span>
          </div>
        </div>

        <nav className="flex-1 space-y-2 whitespace-nowrap">
          <button onClick={() => setCurrentMenu('dashboard')} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all ${currentMenu === 'dashboard' ? 'bg-[#F2F4F6] text-[#3182F6]' : 'text-[#8B95A1] hover:text-[#4E5968] hover:bg-[#F9FAFB]'}`}><LayoutGrid size={20} /><span className="text-[16px]">대시보드</span></button>
          <button onClick={() => setCurrentMenu('management')} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all ${currentMenu === 'management' ? 'bg-[#F2F4F6] text-[#3182F6]' : 'text-[#8B95A1] hover:text-[#4E5968] hover:bg-[#F9FAFB]'}`}><Users size={20} /><span className="text-[16px]">학급 관리</span></button>
          <button onClick={() => setCurrentMenu('settings')} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all ${currentMenu === 'settings' ? 'bg-[#F2F4F6] text-[#3182F6]' : 'text-[#8B95A1] hover:text-[#4E5968] hover:bg-[#F9FAFB]'}`}><Settings size={20} /><span className="text-[16px]">설정</span></button>
        </nav>

        <div className="pt-8 border-t border-[#F2F4F6] flex items-center justify-between px-2 whitespace-nowrap">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-[#E8F3FF] border border-[#D0E6FF] flex items-center justify-center text-[#3182F6] font-bold text-sm">{user?.displayName?.[0] || 'U'}</div>
            <div className="max-w-[120px]">
              <p className="text-[15px] font-bold text-[#191F28] truncate">{user?.displayName || '테스트 교사'}</p>
              <p className="text-[12px] text-[#ADB5BD] font-medium truncate">{user?.email}</p>
            </div>
          </div>
          <button onClick={logout} className="p-2.5 text-[#ADB5BD] hover:text-[#F04452] transition-colors bg-[#F9FAFB] rounded-xl"><LogOut size={18} /></button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden relative">
        {currentMenu === 'dashboard' ? (
          <>
            <div className="bg-white border-b border-[#F2F4F6] px-8 pt-5 flex items-end justify-between">
              <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide pr-6 max-w-[calc(100%-200px)]">
                {!isSidebarOpen && <button onClick={toggleSidebar} className="p-2.5 mr-4 text-[#8B95A1] hover:bg-gray-100 rounded-full mb-2 flex-shrink-0"><Menu size={24} /></button>}
                <div className="flex items-center gap-3 mb-3.5 mr-6 px-3 py-1.5 bg-[#F2F4F6] rounded-xl flex-shrink-0">
                  <span className="text-[14px] font-bold text-[#3182F6]">{activeClass?.name || '학급 선택 필요'}</span>
                </div>
                {workspaces.map((ws) => (
                  <button key={ws.id} onClick={() => setActiveWorkspaceId(ws.id)} className={`relative flex items-center gap-2 px-5 py-3.5 rounded-t-2xl text-[14px] font-bold transition-all whitespace-nowrap ${activeWorkspaceId === ws.id ? 'text-[#3182F6] bg-[#F2F4F6]/60' : 'text-[#8B95A1] hover:text-[#4E5968]'}`}>
                    {ws.name}<X size={14} className="text-[#ADB5BD] hover:text-[#F04452] ml-1" onClick={(e) => handleCloseWorkspace(ws.id, e)} />
                    {activeWorkspaceId === ws.id && <motion.div layoutId="wsIndicator" className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#3182F6] rounded-t-full" />}
                  </button>
                ))}
                <button onClick={() => setIsTabModalOpen(true)} className="w-9 h-9 rounded-full bg-[#F2F4F6] flex items-center justify-center text-[#8B95A1] hover:text-[#3182F6] mb-2 ml-2 flex-shrink-0"><Plus size={18} /></button>
              </div>
              <div className="pb-3"><button onClick={handleAddStudent} className="flex items-center gap-2 px-6 py-3 bg-[#3182F6] text-white rounded-2xl text-[15px] font-bold hover:bg-[#1B64DA] shadow-lg shadow-[#3182F6]/20 active:scale-95"><Plus size={18} strokeWidth={3} />학생 추가</button></div>
            </div>

            <div className="flex-1 overflow-y-auto pb-20 custom-scrollbar scroll-smooth">
              <Prompter promptGuideline={promptGuideline} onPromptChange={setPromptGuideline} />
              <div className="max-w-7xl mx-auto px-6 mb-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-hide">{(['all', 'completed', 'incomplete'] as const).map((status) => (<button key={status} onClick={() => setFilterStatus(status)} className={`px-5 py-2.5 rounded-full text-[14px] font-bold transition-all whitespace-nowrap ${filterStatus === status ? 'bg-[#3182F6] text-white' : 'bg-[#F2F4F6] text-[#8B95A1] hover:bg-[#E5E8EB]'}`}>{status === 'all' ? '전체보기' : status === 'completed' ? '작성 완료' : '미완료'}</button>))}</div>
                  <div className="relative group flex-1 md:max-w-sm"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#ADB5BD]" size={18} /><input type="text" placeholder="이름 또는 학번 검색" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-11 pr-6 py-3 bg-[#F2F4F6] border-2 border-transparent rounded-full focus:bg-white focus:border-[#3182F6]/30 outline-none font-medium" /></div>
                </div>
              </div>
              {isLoading ? (<div className="flex flex-col items-center justify-center py-32 gap-6"><div className="w-12 h-12 border-4 border-[#3182F6]/20 border-t-[#3182F6] rounded-full animate-spin" /><p className="text-[16px] font-bold text-[#8B95A1]">데이터를 안전하게 불러오고 있어요</p></div>) : (<StudentTable students={filteredStudents} onSelectStudent={setSelectedStudent} tabType={activeWorkspace?.tabType} />)}
            </div>
          </>
        ) : currentMenu === 'management' ? (
          <div className="flex-1 overflow-y-auto p-10 bg-[#F2F4F6]">
            <div className="max-w-6xl mx-auto space-y-10">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-4">
                    {!isSidebarOpen && <button onClick={toggleSidebar} className="p-2.5 text-[#8B95A1] hover:bg-white rounded-full shadow-sm"><Menu size={24} /></button>}
                    <h1 className="text-3xl font-black text-[#191F28] tracking-tight">학급 관리</h1>
                  </div>
                  <p className="text-[#8B95A1] font-medium ml-1">작업할 학급을 선택하거나 새로운 학급을 추가하세요.</p>
                </div>
                <button onClick={handleCreateClass} className="flex items-center gap-2 px-6 py-4 bg-[#3182F6] text-white rounded-2xl font-bold hover:bg-[#1B64DA] transition-all shadow-lg shadow-[#3182F6]/20"><Plus size={20} />학급 추가</button>
              </div>

              {isClassLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                  {[1, 2, 3].map(i => <div key={i} className="h-48 bg-white/50 rounded-[32px]" />)}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {classes.map((cls) => (
                    <motion.div 
                      key={cls.id} 
                      whileHover={{ y: -5 }} 
                      onClick={() => { setActiveClassId(cls.id); setCurrentMenu('dashboard'); }}
                      className={`relative group bg-white p-8 rounded-[40px] shadow-[0_8px_30px_rgba(0,0,0,0.02)] border-2 transition-all cursor-pointer ${activeClassId === cls.id ? 'border-[#3182F6] ring-4 ring-[#3182F6]/5' : 'border-transparent hover:border-[#E5E8EB]'}`}
                    >
                      {/* Action Buttons */}
                      <div className="absolute top-6 right-8 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                        <button
                          onClick={(e) => handleEditClassName(e, cls.id, cls.name)}
                          className="p-2 text-[#ADB5BD] hover:text-[#3182F6] hover:bg-blue-50 rounded-xl transition-all"
                          title="학급 이름 수정"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          onClick={(e) => handleDeleteClass(e, cls.id, cls.name)}
                          className="p-2 text-[#ADB5BD] hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                          title="학급 삭제"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>

                      <div className="flex flex-col h-full justify-between">
                        <div>
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-colors ${activeClassId === cls.id ? 'bg-[#3182F6] text-white' : 'bg-[#F2F4F6] text-[#8B95A1] group-hover:bg-[#E8F3FF] group-hover:text-[#3182F6]'}`}>
                            <Users size={28} />
                          </div>
                          <h3 className="text-2xl font-black text-[#191F28] mb-2">{cls.name}</h3>
                          <p className="text-[#8B95A1] font-bold text-sm">생성일: {new Date(cls.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="mt-8 flex items-center justify-between">
                          <span className={`text-sm font-bold ${activeClassId === cls.id ? 'text-[#3182F6]' : 'text-[#ADB5BD]'}`}>
                            {activeClassId === cls.id ? '현재 작업 중' : '선택하기'}
                          </span>
                          <ChevronRight size={20} className={activeClassId === cls.id ? 'text-[#3182F6]' : 'text-[#ADB5BD]'} />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center"><div className="text-center space-y-4"><div className="w-16 h-16 bg-[#F2F4F6] rounded-3xl flex items-center justify-center mx-auto text-[#ADB5BD]"><Settings size={32} /></div><h2 className="text-xl font-bold text-[#191F28]">설정</h2><p className="text-[#8B95A1]">준비 중인 기능입니다.</p></div></div>
        )}
      </main>

      <AnimatePresence>
        {isTabModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setIsTabModalOpen(false)} />
            <motion.div initial={{ scale: 0.92, opacity: 0, y: 24 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.92, opacity: 0, y: 24 }} className="relative w-full max-w-md bg-white rounded-[32px] p-10 shadow-2xl">
              <h2 className="text-[22px] font-black text-[#191F28] mb-8">새 작업 공간 만들기</h2>
              <div className="space-y-7">
                <div className="space-y-3"><label className="text-[13px] font-bold text-[#8B95A1] px-1">기록 항목 선택</label><div className="grid grid-cols-2 gap-3">
                  <button onClick={() => setNewTabCategory('교과세특')} className={`py-4 rounded-2xl text-[15px] font-bold border-2 transition-all ${newTabCategory === '교과세특' ? 'bg-[#E8F3FF] border-[#3182F6] text-[#3182F6]' : 'bg-white border-[#F2F4F6] text-[#8B95A1]'}`}>교과세특</button>
                  <button onClick={() => setNewTabCategory('행발')} className={`py-4 rounded-2xl text-[15px] font-bold border-2 transition-all ${newTabCategory === '행발' ? 'bg-[#FFF0F0] border-[#F04452] text-[#F04452]' : 'bg-white border-[#F2F4F6] text-[#8B95A1]'}`}>행동특성</button>
                </div></div>
                <div className="space-y-3"><label className="text-[13px] font-bold text-[#8B95A1] px-1">작업 공간 이름</label><input type="text" placeholder="예) 1학기 국어" value={newTabName} onChange={(e) => setNewTabName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleCreateWorkspace()} className="w-full px-6 py-4 bg-[#F2F4F6] rounded-2xl text-[16px] outline-none font-bold" autoFocus /></div>
                <div className="flex gap-3 pt-3"><button onClick={() => setIsTabModalOpen(false)} className="flex-1 py-4 bg-[#F2F4F6] text-[#8B95A1] rounded-2xl font-bold">취소</button><button onClick={handleCreateWorkspace} className="flex-1 py-4 bg-[#3182F6] text-white rounded-2xl font-bold shadow-lg shadow-[#3182F6]/20">생성하기</button></div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <EditorDrawer student={selectedStudent} onClose={() => setSelectedStudent(null)} onSave={(id, updates) => updateStudent(id, updates)} onGenerate={(student) => generateAIContent({ student, category: activeWorkspace?.category === '행발' ? '인성' : '교과세특', promptGuideline })} />
    </div>
  );
}
