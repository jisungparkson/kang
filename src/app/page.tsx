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
import { LayoutGrid, Users, Settings, LogOut, Plus, Search, X, Menu } from 'lucide-react';

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

  // ── Sidebar Toggle State ──
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Responsive: Close sidebar on mobile by default
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };
    
    // Set initial state
    handleResize();
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ── Global state ──
  const [promptGuideline, setPromptGuideline] = useState(
    '학생의 관찰 내용을 바탕으로 생활기록부에 적합한 문장을 작성해 주세요. 주어(이름)는 생략하고 서술해 주세요.'
  );
  const { user, logout } = useAuth();
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'incomplete'>('all');

  // ── Workspace (dynamic tab) state ──
  const [workspaces, setWorkspaces] = useState<WorkspaceTab[]>([
    { id: 'init_subject', name: '1학기 교과세특', category: '교과세특', tabType: 'subject' },
  ]);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState('init_subject');

  // ── Create-tab modal state ──
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTabName, setNewTabName] = useState('');
  const [newTabCategory, setNewTabCategory] = useState<'교과세특' | '행발'>('교과세특');

  const activeWorkspace = workspaces.find(w => w.id === activeWorkspaceId) || workspaces[0];

  // Scoped data: Always scoped by activeWorkspaceId now
  const scopedTabId = activeWorkspace?.id;
  const { students, isLoading, addStudent, updateStudent } = useStudents(scopedTabId);

  // ── Handlers ──
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

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
    setIsModalOpen(false);
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

  const handleSave = async (id: string, updates: Partial<Student>) => {
    try {
      await updateStudent(id, updates);
      setSelectedStudent(null);
    } catch {
      alert('데이터 저장 중 오류가 발생했습니다.');
    }
  };

  const handleAddStudent = async () => {
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
      {/* ── Mobile Overlay ── */}
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

      {/* ════════════════════════════════════════════════
          Sidebar
         ════════════════════════════════════════════════ */}
      <aside className={`bg-white flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-40 transition-all duration-300 ease-in-out overflow-hidden h-full ${
        isSidebarOpen ? 'w-72 px-6 py-10 opacity-100' : 'w-0 px-0 py-10 opacity-0 pointer-events-none'
      } fixed md:relative`}>
        {/* Sidebar Header (Brand + Toggle) */}
        <div className="flex items-center gap-3 mb-8 px-2 pb-6 border-b border-[#F2F4F6] whitespace-nowrap">
          <button
            onClick={toggleSidebar}
            className="p-2 -ml-1 text-[#8B95A1] hover:bg-gray-100 rounded-full transition-colors flex items-center justify-center"
            title="메뉴 토글"
          >
            <Menu size={24} />
          </button>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#3182F6] rounded-[10px] flex items-center justify-center text-white shadow-sm">
              <LayoutGrid size={18} strokeWidth={2.5} />
            </div>
            <span className="text-[19px] font-black tracking-tight text-[#191F28]">StudentAI</span>
          </div>
        </div>

        {/* Navigation Section */}
        <nav className="flex-1 space-y-2 whitespace-nowrap">
          <button 
            onClick={() => setCurrentMenu('dashboard')}
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all ${
              currentMenu === 'dashboard' ? 'bg-[#F2F4F6] text-[#3182F6]' : 'text-[#8B95A1] hover:text-[#4E5968] hover:bg-[#F9FAFB]'
            }`}
          >
            <LayoutGrid size={20} strokeWidth={2.5} />
            <span className="text-[16px]">대시보드</span>
          </button>
          <button 
            onClick={() => setCurrentMenu('management')}
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all ${
              currentMenu === 'management' ? 'bg-[#F2F4F6] text-[#3182F6]' : 'text-[#8B95A1] hover:text-[#4E5968] hover:bg-[#F9FAFB]'
            }`}
          >
            <Users size={20} strokeWidth={2} />
            <span className="text-[16px]">학급 관리</span>
          </button>
          <button 
            onClick={() => setCurrentMenu('settings')}
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all ${
              currentMenu === 'settings' ? 'bg-[#F2F4F6] text-[#3182F6]' : 'text-[#8B95A1] hover:text-[#4E5968] hover:bg-[#F9FAFB]'
            }`}
          >
            <Settings size={20} strokeWidth={2} />
            <span className="text-[16px]">설정</span>
          </button>
        </nav>

        <div className="pt-8 border-t border-[#F2F4F6] flex items-center justify-between px-2 whitespace-nowrap">
          <div className="flex items-center gap-3">
            {user?.photoURL ? (
              <img src={user.photoURL} alt="profile" className="w-11 h-11 rounded-full border border-[#D0E6FF]" />
            ) : (
              <div className="w-11 h-11 rounded-full bg-[#E8F3FF] border border-[#D0E6FF] flex items-center justify-center text-[#3182F6] font-bold text-sm">
                {user?.displayName?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
              </div>
            )}
            <div className="max-w-[120px]">
              <p className="text-[15px] font-bold text-[#191F28] truncate">{user?.displayName || '테스트 교사'}</p>
              <p className="text-[12px] text-[#ADB5BD] font-medium truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="p-2.5 text-[#ADB5BD] hover:text-[#F04452] transition-colors bg-[#F9FAFB] rounded-xl hover:bg-[#FFF0F0]"
          >
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      {/* ════════════════════════════════════════════════
          Main Content Area (right side)
         ════════════════════════════════════════════════ */}
      <main className="flex-1 flex flex-col overflow-hidden relative">

        {currentMenu === 'management' ? (
          <>
            {/* ── Dynamic Workspace Tab Bar (ONLY IN MANAGEMENT) ── */}
            <div className="bg-white border-b border-[#F2F4F6] px-8 pt-5 flex items-end justify-between">
              <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide pr-6 max-w-[calc(100%-200px)]">
                {/* Re-open Sidebar Button (Hidden when sidebar is open) */}
                {!isSidebarOpen && (
                  <button
                    onClick={toggleSidebar}
                    className="p-2.5 mr-4 text-[#8B95A1] hover:bg-gray-100 rounded-full transition-colors mb-2 flex-shrink-0"
                    title="메뉴 열기"
                  >
                    <Menu size={24} />
                  </button>
                )}

                {workspaces.map((ws) => (
                  <button
                    key={ws.id}
                    onClick={() => setActiveWorkspaceId(ws.id)}
                    className={`relative flex items-center gap-2 px-5 py-3.5 rounded-t-2xl text-[14px] font-bold transition-all whitespace-nowrap ${
                      activeWorkspaceId === ws.id
                        ? 'text-[#3182F6] bg-[#F2F4F6]/60'
                        : 'text-[#8B95A1] hover:text-[#4E5968] hover:bg-[#F9FAFB]'
                    }`}
                  >
                    {ws.name}
                    <X
                      size={14}
                      className="text-[#ADB5BD] hover:text-[#F04452] transition-colors ml-1"
                      onClick={(e) => handleCloseWorkspace(ws.id, e)}
                    />
                    {activeWorkspaceId === ws.id && (
                      <motion.div
                        layoutId="wsIndicator"
                        className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#3182F6] rounded-t-full"
                      />
                    )}
                  </button>
                ))}

                {/* + button */}
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="w-9 h-9 rounded-full bg-[#F2F4F6] flex items-center justify-center text-[#8B95A1] hover:text-[#3182F6] hover:bg-[#E8F3FF] transition-all mb-2 ml-2 flex-shrink-0"
                >
                  <Plus size={18} strokeWidth={3} />
                </button>
              </div>

              {/* 학생 추가 button */}
              <div className="pb-3">
                <button
                  onClick={handleAddStudent}
                  className="flex items-center gap-2 px-6 py-3 bg-[#3182F6] text-white rounded-2xl text-[15px] font-bold hover:bg-[#1B64DA] transition-all shadow-lg shadow-[#3182F6]/20 active:scale-95"
                >
                  <Plus size={18} strokeWidth={3} />
                  학생 추가
                </button>
              </div>
            </div>

            {/* ── Scrollable content below tabs ── */}
            <div className="flex-1 overflow-y-auto pb-20 custom-scrollbar scroll-smooth">
              <Prompter
                promptGuideline={promptGuideline}
                onPromptChange={setPromptGuideline}
              />

              {/* Filter & Search Bar */}
              <div className="max-w-7xl mx-auto px-6 mb-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-hide">
                    {(['all', 'completed', 'incomplete'] as const).map((status) => (
                      <button
                        key={status}
                        onClick={() => setFilterStatus(status)}
                        className={`px-5 py-2.5 rounded-full text-[14px] font-bold transition-all whitespace-nowrap ${
                          filterStatus === status
                            ? 'bg-[#3182F6] text-white shadow-md shadow-[#3182F6]/10'
                            : 'bg-[#F2F4F6] text-[#8B95A1] hover:bg-[#E5E8EB]'
                        }`}
                      >
                        {status === 'all' ? '전체보기' : status === 'completed' ? '작성 완료' : '미완료'}
                      </button>
                    ))}
                  </div>

                  <div className="relative group flex-1 md:max-w-sm">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#ADB5BD] group-focus-within:text-[#3182F6] transition-colors" size={18} />
                    <input
                      type="text"
                      placeholder="학생 이름 또는 학번 검색"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-11 pr-6 py-3 bg-[#F2F4F6] border-2 border-transparent rounded-full text-[15px] focus:bg-white focus:border-[#3182F6]/30 focus:ring-4 focus:ring-[#3182F6]/5 outline-none transition-all font-medium text-[#333D4B] placeholder-[#ADB5BD]"
                    />
                  </div>
                </div>
              </div>

              {/* Student Table */}
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-32 gap-6">
                  <div className="w-12 h-12 border-4 border-[#3182F6]/20 border-t-[#3182F6] rounded-full animate-spin" />
                  <p className="text-[16px] font-bold text-[#8B95A1]">데이터를 안전하게 불러오고 있어요</p>
                </div>
              ) : (
                <StudentTable
                  students={filteredStudents}
                  onSelectStudent={setSelectedStudent}
                  tabType={activeWorkspace?.tabType}
                />
              )}
            </div>
          </>
        ) : currentMenu === 'dashboard' ? (
          <div className="flex-1 overflow-y-auto p-10 bg-[#F2F4F6]">
            <div className="max-w-5xl mx-auto space-y-10">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  {/* Re-open Sidebar Button for Dashboard */}
                  {!isSidebarOpen && (
                    <button
                      onClick={toggleSidebar}
                      className="p-2 text-[#8B95A1] hover:bg-white rounded-full transition-colors flex items-center justify-center shadow-sm"
                      title="메뉴 열기"
                    >
                      <Menu size={24} />
                    </button>
                  )}
                  
                  <h1 className="text-3xl font-black text-[#191F28] tracking-tight">대시보드</h1>
                </div>
                <p className="text-[#8B95A1] font-medium ml-1">학급의 전체 현황을 한눈에 파악하세요.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-8 rounded-[32px] shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-white">
                  <p className="text-[#8B95A1] text-sm font-bold mb-2 uppercase tracking-wider">전체 학생 수</p>
                  <p className="text-4xl font-black text-[#191F28]">3명</p>
                </div>
                <div className="bg-white p-8 rounded-[32px] shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-white">
                  <p className="text-[#8B95A1] text-sm font-bold mb-2 uppercase tracking-wider">작성 완료율</p>
                  <p className="text-4xl font-black text-[#3182F6]">0%</p>
                </div>
                <div className="bg-white p-8 rounded-[32px] shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-white">
                  <p className="text-[#8B95A1] text-sm font-bold mb-2 uppercase tracking-wider">현재 활성 탭</p>
                  <p className="text-2xl font-black text-[#191F28] truncate">{workspaces.length}개</p>
                </div>
              </div>

              <div className="bg-white p-10 rounded-[40px] shadow-[0_8px_32px_rgba(0,0,0,0.03)] border border-white">
                <h3 className="text-xl font-bold text-[#191F28] mb-6">최근 작업 공간</h3>
                <div className="space-y-4">
                  {workspaces.map(ws => (
                    <div key={ws.id} className="flex items-center justify-between p-5 hover:bg-[#F9FAFB] rounded-2xl transition-all border border-transparent hover:border-[#F2F4F6] cursor-pointer">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white ${ws.category === '교과세특' ? 'bg-[#3182F6]' : 'bg-[#F04452]'}`}>
                          {ws.category === '교과세특' ? '세' : '행'}
                        </div>
                        <div>
                          <p className="font-bold text-[#333D4B]">{ws.name}</p>
                          <p className="text-xs text-[#8B95A1]">{ws.category}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => {
                          setCurrentMenu('management');
                          setActiveWorkspaceId(ws.id);
                        }}
                        className="text-[#3182F6] font-bold text-sm hover:underline"
                      >
                        이동하기
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-[#F2F4F6] rounded-3xl flex items-center justify-center mx-auto text-[#ADB5BD]">
                <Settings size={32} />
              </div>
              <h2 className="text-xl font-bold text-[#191F28]">설정</h2>
              <p className="text-[#8B95A1]">준비 중인 기능입니다.</p>
            </div>
          </div>
        )}
      </main>

      {/* ════════════════════════════════════════════════
          Create Workspace Modal
         ════════════════════════════════════════════════ */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/20 backdrop-blur-sm"
              onClick={() => setIsModalOpen(false)}
            />
            {/* Modal card */}
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 24 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 24 }}
              transition={{ type: 'spring', damping: 26, stiffness: 300 }}
              className="relative w-full max-w-md bg-white rounded-[32px] shadow-[0_20px_60px_rgba(0,0,0,0.12)] p-10 overflow-hidden"
            >
              <h2 className="text-[22px] font-black text-[#191F28] mb-8">새 작업 공간 만들기</h2>

              <div className="space-y-7">
                {/* Category selection */}
                <div className="space-y-3">
                  <label className="text-[13px] font-bold text-[#8B95A1] px-1">기록 항목 선택</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setNewTabCategory('교과세특')}
                      className={`py-4 rounded-2xl text-[15px] font-bold transition-all border-2 ${
                        newTabCategory === '교과세특'
                          ? 'bg-[#E8F3FF] border-[#3182F6] text-[#3182F6]'
                          : 'bg-white border-[#F2F4F6] text-[#8B95A1] hover:bg-[#F9FAFB]'
                      }`}
                    >
                      교과세특
                    </button>
                    <button
                      onClick={() => setNewTabCategory('행발')}
                      className={`py-4 rounded-2xl text-[15px] font-bold transition-all border-2 ${
                        newTabCategory === '행발'
                          ? 'bg-[#FFF0F0] border-[#F04452] text-[#F04452]'
                          : 'bg-white border-[#F2F4F6] text-[#8B95A1] hover:bg-[#F9FAFB]'
                      }`}
                    >
                      행동특성
                    </button>
                  </div>
                </div>

                {/* Name input */}
                <div className="space-y-3">
                  <label className="text-[13px] font-bold text-[#8B95A1] px-1">작업 공간 이름</label>
                  <input
                    type="text"
                    placeholder="예) 1학기 국어, 2학기 창체"
                    value={newTabName}
                    onChange={(e) => setNewTabName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCreateWorkspace()}
                    className="w-full px-6 py-4 bg-[#F2F4F6] border-none rounded-2xl text-[16px] focus:ring-2 focus:ring-[#3182F6]/20 outline-none font-bold text-[#191F28] placeholder-[#ADB5BD] transition-all"
                    autoFocus
                  />
                </div>

                {/* Action buttons */}
                <div className="flex gap-3 pt-3">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-4 bg-[#F2F4F6] text-[#8B95A1] rounded-2xl font-bold hover:bg-[#E5E8EB] transition-all active:scale-95"
                  >
                    취소
                  </button>
                  <button
                    onClick={handleCreateWorkspace}
                    className="flex-1 py-4 bg-[#3182F6] text-white rounded-2xl font-bold hover:bg-[#1B64DA] shadow-lg shadow-[#3182F6]/20 active:scale-95 transition-all"
                  >
                    생성하기
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Editor Drawer ── */}
      <EditorDrawer
        student={selectedStudent}
        onClose={() => setSelectedStudent(null)}
        onSave={handleSave}
        onGenerate={(student) =>
          generateAIContent({
            student,
            category: activeWorkspace?.category === '행발' ? '인성' : '교과세특',
            promptGuideline,
          })
        }
      />
    </div>
  );
}
