import { Student } from '@/lib/aiService';
import { calculateBytes } from '@/lib/utils';
import { User, Activity, FileText, ChevronRight } from 'lucide-react';

interface StudentTableProps {
  students: Student[];
  onSelectStudent: (student: Student) => void;
}

export default function StudentTable({ students, onSelectStudent }: StudentTableProps) {
  return (
    <div className="max-w-7xl mx-auto px-6">
      <div className="bg-white border border-border rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-border">
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider w-16">번호</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">이름</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">학번/활동</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">성취도</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">교사 메모</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">AI 생성 문구</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider w-32">바이트(NEIS)</th>
              <th className="px-6 py-4 w-12"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {students.map((student, idx) => {
              const bytes = calculateBytes(student.aiOutput || '');
              return (
                <tr 
                  key={student.id} 
                  onClick={() => onSelectStudent(student)} 
                  className="hover:bg-blue-50/30 cursor-pointer transition-colors group"
                >
                  <td className="px-6 py-4 text-sm text-gray-400 font-medium">{idx + 1}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-primary">
                        <User size={14} />
                      </div>
                      <span className="font-semibold text-gray-700">{student.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 font-mono">{student.studentNo}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      student.achievement === '우수' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      <Activity size={10} />
                      {student.achievement}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                    {student.teacherNote}
                  </td>
                  <td className="px-6 py-4">
                    {student.aiOutput ? (
                      <div className="flex items-center gap-1.5 text-sm text-gray-600">
                        <FileText size={12} className="text-gray-400" />
                        <span className="truncate max-w-[200px]">{student.aiOutput}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-300 italic">미생성</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <div className="w-full bg-gray-100 h-1 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all ${bytes > 1500 ? 'bg-red-500' : 'bg-primary'}`} 
                          style={{ width: `${Math.min((bytes / 1500) * 100, 100)}%` }}
                        />
                      </div>
                      <span className={`text-[10px] font-bold ${bytes > 1500 ? 'text-red-500' : 'text-gray-400'}`}>
                        {bytes} / 1500 Byte
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <ChevronRight size={18} className="text-gray-300 group-hover:text-primary transition-colors" />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
