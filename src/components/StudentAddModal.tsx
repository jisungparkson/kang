'use client';

import { useState } from 'react';
import { X, UserPlus, FileSpreadsheet, Plus, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface StudentAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddIndividual: (studentNo: string, name: string) => Promise<void>;
  onAddBulk: (students: { studentNo: string; name: string }[]) => Promise<void>;
}

export default function StudentAddModal({ isOpen, onClose, onAddIndividual, onAddBulk }: StudentAddModalProps) {
  const [activeTab, setActiveTab] = useState<'individual' | 'bulk'>('individual');
  const [individualNo, setIndividualNo] = useState('');
  const [individualName, setIndividualName] = useState('');
  const [bulkText, setBulkText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleIndividualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!individualNo || !individualName) return alert('번호와 이름을 모두 입력해주세요.');
    setIsLoading(true);
    try {
      await onAddIndividual(individualNo, individualName);
      setIndividualNo('');
      setIndividualName('');
      onClose();
    } catch (err) {
      alert('학생 추가 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkSubmit = async () => {
    if (!bulkText.trim()) return alert('복사한 명렬표 내용을 붙여넣어 주세요.');
    setIsLoading(true);
    try {
      const lines = bulkText.split('\n').filter(l => l.trim() !== '');
      const parsedStudents = lines.map((line, index) => {
        const parts = line.trim().split(/[\t]+| {2,}/).filter(p => p.trim() !== ''); // Prefer tabs or multiple spaces
        if (parts.length >= 2) {
          const first = parts[0].replace(/[^0-9]/g, '');
          if (first && first.length > 0) {
            return { studentNo: first, name: parts[1] };
          }
        }
        
        // If not clearly separated, try single space or just name
        const singleSpaceParts = line.trim().split(/\s+/);
        if (singleSpaceParts.length >= 2) {
          const first = singleSpaceParts[0].replace(/[^0-9]/g, '');
          if (first && first.length > 0) {
             return { studentNo: first, name: singleSpaceParts[1] };
          }
        }

        // Fallback: entire line is name, auto-index
        return { studentNo: (index + 1).toString(), name: line.trim() };
      });

      if (parsedStudents.length === 0) throw new Error('파싱된 학생이 없습니다.');
      
      await onAddBulk(parsedStudents);
      setBulkText('');
      onClose();
    } catch (err) {
      alert('일괄 추가 중 오류가 발생했습니다. 형식을 확인해 주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }} 
        className="absolute inset-0 bg-black/30 backdrop-blur-md" 
        onClick={onClose} 
      />
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 20 }} 
        animate={{ scale: 1, opacity: 1, y: 0 }} 
        exit={{ scale: 0.95, opacity: 0, y: 20 }} 
        className="relative w-full max-w-lg bg-white rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="px-10 pt-10 pb-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-[24px] font-black text-[#191F28] tracking-tight">학생 추가하기</h2>
            <button onClick={onClose} className="p-2 text-[#ADB5BD] hover:bg-[#F2F4F6] rounded-full transition-all">
              <X size={24} />
            </button>
          </div>

          <div className="flex p-1.5 bg-[#F2F4F6] rounded-2xl mb-8">
            <button 
              onClick={() => setActiveTab('individual')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[15px] font-bold transition-all ${activeTab === 'individual' ? 'bg-white text-[#3182F6] shadow-sm' : 'text-[#8B95A1] hover:text-[#4E5968]'}`}
            >
              <UserPlus size={18} />
              개별 추가
            </button>
            <button 
              onClick={() => setActiveTab('bulk')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[15px] font-bold transition-all ${activeTab === 'bulk' ? 'bg-white text-[#3182F6] shadow-sm' : 'text-[#8B95A1] hover:text-[#4E5968]'}`}
            >
              <FileSpreadsheet size={18} />
              일괄 추가
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-10 pb-10">
          {activeTab === 'individual' ? (
            <form onSubmit={handleIndividualSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[13px] font-bold text-[#8B95A1] px-1">출석 번호</label>
                <input 
                  type="text" 
                  placeholder="예) 1" 
                  value={individualNo}
                  onChange={(e) => setIndividualNo(e.target.value)}
                  className="w-full px-6 py-4 bg-[#F9FAFB] border-2 border-transparent focus:border-[#3182F6]/30 focus:bg-white rounded-2xl text-[16px] font-bold outline-none transition-all"
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <label className="text-[13px] font-bold text-[#8B95A1] px-1">학생 이름</label>
                <input 
                  type="text" 
                  placeholder="예) 홍길동" 
                  value={individualName}
                  onChange={(e) => setIndividualName(e.target.value)}
                  className="w-full px-6 py-4 bg-[#F9FAFB] border-2 border-transparent focus:border-[#3182F6]/30 focus:bg-white rounded-2xl text-[16px] font-bold outline-none transition-all"
                />
              </div>
              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full py-5 bg-[#3182F6] text-white rounded-2xl text-[16px] font-black shadow-lg shadow-[#3182F6]/20 hover:bg-[#1B64DA] active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {isLoading ? '저장 중...' : '추가하기'}
              </button>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="bg-[#E8F3FF] p-4 rounded-2xl flex gap-3 mb-2">
                <AlertCircle className="text-[#3182F6] shrink-0" size={20} />
                <p className="text-[13px] text-[#3182F6] font-medium leading-relaxed">
                  나이스(NEIS)나 엑셀에서 <span className="font-bold">번호와 이름 열</span>을 드래그해서 복사한 후 아래에 붙여넣기 하세요. 탭이나 공백으로 구분된 데이터를 자동으로 인식합니다.
                </p>
              </div>
              <textarea 
                placeholder="1 홍길동&#10;2 김철수&#10;3 이영희..."
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                className="w-full h-64 px-6 py-5 bg-[#F9FAFB] border-2 border-transparent focus:border-[#3182F6]/30 focus:bg-white rounded-[24px] text-[15px] font-medium outline-none transition-all resize-none scrollbar-hide"
              />
              <button 
                onClick={handleBulkSubmit}
                disabled={isLoading}
                className="w-full py-5 bg-[#3182F6] text-white rounded-2xl text-[16px] font-black shadow-lg shadow-[#3182F6]/20 hover:bg-[#1B64DA] active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {isLoading ? '학생 명단 분석 및 저장 중...' : '일괄 등록하기'}
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
