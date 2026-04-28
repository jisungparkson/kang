import { Student } from '@/lib/aiService';
import { calculateBytes } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Wand2, Save, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';

interface EditorDrawerProps {
  student: Student | null;
  onClose: () => void;
  onSave: (id: string, updates: Partial<Student>) => void;
  onGenerate: (student: Student) => Promise<string>;
}

export default function EditorDrawer({ student, onClose, onSave, onGenerate }: EditorDrawerProps) {
  const [editText, setEditText] = useState('');
  const [teacherNote, setTeacherNote] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (student) {
      setEditText(student.aiOutput || '');
      setTeacherNote(student.teacherNote || '');
    }
  }, [student]);

  const handleGenerate = async () => {
    if (!student) return;
    setIsGenerating(true);
    try {
      const result = await onGenerate({ ...student, teacherNote });
      setEditText(result);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!student) return;
    setIsSaving(true);
    try {
      await onSave(student.id, { aiOutput: editText, teacherNote });
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    const isTextChanged = editText !== (student?.aiOutput || '');
    const isNoteChanged = teacherNote !== (student?.teacherNote || '');

    if (isTextChanged || isNoteChanged) {
      if (confirm('저장하지 않은 내용이 사라집니다. 창을 닫으시겠습니까?')) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  const bytes = calculateBytes(editText);
  const isOverLimit = bytes > 1500;

  return (
    <AnimatePresence>
      {student && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-md z-[900]"
            onClick={handleClose}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 w-full max-w-xl h-screen bg-white shadow-[-20px_0_60px_-15px_rgba(0,0,0,0.1)] z-[1000] flex flex-col md:rounded-l-[32px] overflow-hidden"
          >
            <div className="px-8 py-10 flex justify-between items-center bg-white border-b border-[#F2F4F6]">
              <div>
                <h2 className="text-2xl font-bold text-[#191F28] tracking-tight">{student.name} 학생 기록</h2>
                <p className="text-sm text-[#8B95A1] font-medium mt-1.5 flex items-center gap-2">
                  <span className="bg-[#F2F4F6] px-2 py-0.5 rounded text-[11px] font-bold">{student.studentNo}</span>
                  <span className="text-[#ADB5BD]">|</span>
                  <span className={`${student.achievement === '우수' ? 'text-[#3182F6]' : 'text-[#4E5968]'}`}>{student.achievement} 성취도</span>
                </p>
              </div>
              <button 
                onClick={handleClose} 
                className="w-10 h-10 flex items-center justify-center hover:bg-[#F2F4F6] rounded-full transition-colors text-[#8B95A1] hover:text-[#191F28]"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-12">
              <section className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-1.5 h-6 bg-[#3182F6] rounded-full" />
                  <h3 className="text-lg font-bold text-[#191F28]">교사 관찰 메모</h3>
                </div>
                <textarea
                  value={teacherNote}
                  onChange={(e) => setTeacherNote(e.target.value)}
                  className="w-full h-36 p-5 text-[15px] bg-[#F9FAFB] border-none rounded-2xl focus:ring-2 focus:ring-[#3182F6]/20 outline-none transition-all resize-none font-medium text-[#333D4B] placeholder-[#ADB5BD]"
                  placeholder="학생의 활동 내용을 구체적으로 입력하세요..."
                />
              </section>

              <section className="space-y-4">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-6 bg-[#3182F6] rounded-full" />
                    <h3 className="text-lg font-bold text-[#191F28]">AI 생성 생기부 문구</h3>
                  </div>
                  <button 
                    onClick={handleGenerate} 
                    disabled={isGenerating}
                    className="flex items-center gap-2 px-5 py-2.5 bg-[#E8F3FF] text-[#1B64DA] text-sm font-bold rounded-xl hover:bg-[#D0E6FF] active:scale-95 transition-all disabled:opacity-50"
                  >
                    {isGenerating ? (
                      <div className="w-4 h-4 border-2 border-[#1B64DA]/30 border-t-[#1B64DA] rounded-full animate-spin" />
                    ) : (
                      <Wand2 size={16} />
                    )}
                    {isGenerating ? '생성 중' : 'AI 문구 생성'}
                  </button>
                </div>
                
                <div className="relative">
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className={`w-full h-72 p-6 text-[16px] leading-relaxed bg-white border-2 rounded-3xl focus:ring-0 outline-none transition-all resize-none shadow-[0_4px_20px_rgb(0,0,0,0.03)] ${
                      isOverLimit 
                        ? 'border-[#F04452]' 
                        : 'border-[#F2F4F6] focus:border-[#3182F6]'
                    }`}
                    placeholder="AI를 통해 문구를 생성하거나 직접 입력해 주세요..."
                  />
                  
                  <div className={`absolute bottom-6 right-6 px-4 py-2 rounded-2xl text-xs font-bold shadow-sm flex items-center gap-2 ${
                    isOverLimit ? 'bg-[#F04452] text-white' : 'bg-[#191F28] text-white'
                  }`}>
                    {isOverLimit && <AlertCircle size={14} />}
                    {bytes} / 1500 Byte (NEIS)
                  </div>
                </div>
                
                {isOverLimit && (
                  <p className="text-[13px] text-[#F04452] font-semibold flex items-center gap-1.5 px-2">
                    <AlertCircle size={14} />
                    나이스(NEIS) 입력 글자 수 제한을 초과했습니다.
                  </p>
                )}
              </section>
            </div>

            <div className="p-8 border-t border-[#F2F4F6] bg-white">
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="w-full flex items-center justify-center gap-2 p-5 bg-[#3182F6] text-white rounded-[20px] text-[17px] font-bold hover:bg-[#1B64DA] active:scale-[0.98] transition-all shadow-lg shadow-[#3182F6]/20 disabled:bg-[#B0B8C1]"
              >
                {isSaving ? (
                  <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Save size={20} />
                )}
                {isSaving ? '저장 중...' : '변경사항 저장하기'}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
