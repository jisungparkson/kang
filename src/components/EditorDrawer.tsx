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
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[900]"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 w-full max-w-xl h-screen bg-white shadow-2xl z-[1000] flex flex-col"
          >
            <div className="p-8 border-b border-border flex justify-between items-center bg-gray-50/50">
              <div>
                <h2 className="text-xl font-bold text-gray-800">{student.name} 학생 기록</h2>
                <p className="text-sm text-gray-500 font-medium mt-1">{student.studentNo} | {student.achievement}</p>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-10">
              <section className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-bold text-primary uppercase tracking-widest">교사 관찰 메모</h3>
                </div>
                <textarea
                  value={teacherNote}
                  onChange={(e) => setTeacherNote(e.target.value)}
                  className="w-full h-32 p-4 text-sm bg-gray-50 border border-border rounded-xl focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none transition-all resize-none font-medium"
                  placeholder="학생의 활동 내용을 구체적으로 입력하세요..."
                />
              </section>

              <section className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-bold text-primary uppercase tracking-widest">AI 생성 생기부 문구</h3>
                  <button 
                    onClick={handleGenerate} 
                    disabled={isGenerating}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary to-blue-600 text-white text-xs font-bold rounded-lg shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100"
                  >
                    <Wand2 size={14} />
                    {isGenerating ? '문장 생성 중...' : 'AI 문구 생성'}
                  </button>
                </div>
                
                <div className="relative">
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className={`w-full h-64 p-5 text-[15px] leading-relaxed bg-white border rounded-2xl focus:ring-4 outline-none transition-all resize-none shadow-inner ${
                      isOverLimit 
                        ? 'border-red-300 focus:ring-red-500/5' 
                        : 'border-border focus:ring-primary/5 focus:border-primary'
                    }`}
                    placeholder="AI를 통해 문구를 생성하거나 직접 입력해 주세요..."
                  />
                  
                  <div className={`absolute bottom-4 right-4 px-3 py-1 rounded-full text-[10px] font-bold shadow-sm flex items-center gap-1.5 ${
                    isOverLimit ? 'bg-red-500 text-white' : 'bg-gray-800 text-white'
                  }`}>
                    {isOverLimit && <AlertCircle size={10} />}
                    {bytes} / 1500 Byte (NEIS)
                  </div>
                </div>
                
                {isOverLimit && (
                  <p className="text-[11px] text-red-500 font-bold flex items-center gap-1">
                    <AlertCircle size={12} />
                    나이스(NEIS) 입력 글자 수 제한을 초과했습니다. 문장을 다듬어 주세요.
                  </p>
                )}
              </section>
            </div>

            <div className="p-8 border-t border-border bg-gray-50/50">
              <button 
                onClick={() => onSave(student.id, { aiOutput: editText, teacherNote })}
                className="w-full flex items-center justify-center gap-2 p-4 bg-gray-800 text-white rounded-2xl font-bold hover:bg-black transition-all shadow-xl active:translate-y-0.5"
              >
                <Save size={18} />
                변경사항 저장하기
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
