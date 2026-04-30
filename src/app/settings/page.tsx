import Link from 'next/link';
import { Settings, ArrowLeft } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-[#F2F4F6] text-[#191F28] p-10 font-sans">
      <div className="max-w-2xl mx-auto bg-white rounded-3xl p-10 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-[#3182F6] rounded-2xl flex items-center justify-center text-white">
            <Settings size={24} />
          </div>
          <h1 className="text-3xl font-black tracking-tight">설정</h1>
        </div>
        
        <p className="text-[17px] text-[#4E5968] leading-relaxed mb-10">
          설정 페이지가 준비 중입니다. 서비스 이용 환경과 알림 설정을 여기서 변경하실 수 있게 될 예정입니다.
        </p>

        <Link 
          href="/" 
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#F2F4F6] text-[#4E5968] rounded-xl font-bold hover:bg-[#E5E8EB] transition-all"
        >
          <ArrowLeft size={18} />
          대시보드로 돌아가기
        </Link>
      </div>
    </div>
  );
}
