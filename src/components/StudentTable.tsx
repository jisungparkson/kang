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
      <div className="toss-card overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#F2F4F6]">
              <th className="px-6 py-5 text-xs font-bold text-[#8B95A1] uppercase tracking-wider w-16 text-center">번호</th>
              <th className="px-6 py-5 text-xs font-bold text-[#8B95A1] uppercase tracking-wider">이름</th>
              <th className="px-6 py-5 text-xs font-bold text-[#8B95A1] uppercase tracking-wider">학생 활동</th>
              <th className="px-6 py-5 text-xs font-bold text-[#8B95A1] uppercase tracking-wider text-center">성취도(선택사항)</th>
              <th className="px-6 py-5 text-xs font-bold text-[#8B95A1] uppercase tracking-wider">교사 작성</th>
              <th className="px-6 py-5 text-xs font-bold text-[#8B95A1] uppercase tracking-wider">교과 세특</th>
              <th className="px-6 py-5 text-xs font-bold text-[#8B95A1] uppercase tracking-wider w-32">나이스 바이트수</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F9FAFB]">
            {students.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-20 text-center text-[#8B95A1] font-medium">
                  학생 데이터가 없습니다.
                </td>
              </tr>
            ) : (
              students.map((student, idx) => {
                const bytes = calculateBytes(student.aiOutput || '');
                return (
                  <tr 
                    key={student.id} 
                    onClick={(e) => {
                      e.preventDefault();
                      onSelectStudent(student);
                    }} 
                    className="hover:bg-[#F9FAFB] cursor-pointer transition-colors group relative"
                  >
                    <td className="px-6 py-5 text-sm text-[#8B95A1] font-medium text-center">{idx + 1}</td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#F2F4F6] flex items-center justify-center text-[#4E5968]">
                          <User size={18} />
                        </div>
                        <span className="font-bold text-[#191F28] text-[15px]">{student.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-sm text-[#4E5968] font-medium">{student.studentNo}</td>
                    <td className="px-6 py-5 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                        student.achievement === '우수' 
                          ? 'bg-[#E8F3FF] text-[#1B64DA]' 
                          : 'bg-[#F2F4F6] text-[#4E5968]'
                      }`}>
                        <Activity size={12} />
                        {student.achievement}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-sm text-[#4E5968] max-w-[200px] truncate">
                      {student.teacherNote || '-'}
                    </td>
                    <td className="px-6 py-5">
                      {student.aiOutput ? (
                        <div className="flex items-center gap-2 text-sm text-[#333D4B]">
                          <FileText size={14} className="text-[#ADB5BD]" />
                          <span className="truncate max-w-[180px]">{student.aiOutput}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-[#ADB5BD] italic">미생성</span>
                      )}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-1.5">
                        <div className="w-full bg-[#F2F4F6] h-1.5 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-500 ${bytes > 1500 ? 'bg-[#F04452]' : 'bg-[#3182F6]'}`} 
                            style={{ width: `${Math.min((bytes / 1500) * 100, 100)}%` }}
                          />
                        </div>
                        <span className={`text-[10px] font-bold ${bytes > 1500 ? 'text-[#F04452]' : 'text-[#8B95A1]'}`}>
                          {bytes} / 1500 Byte
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
