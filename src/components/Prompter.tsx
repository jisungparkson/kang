interface PrompterProps {
  currentCategory: string;
  onCategoryChange: (cat: string) => void;
  promptGuideline: string;
  onPromptChange: (val: string) => void;
}

const categories = ['생활', '인성', '학습', '교과세특'];

export default function Prompter({
  currentCategory,
  onCategoryChange,
  promptGuideline,
  onPromptChange,
}: PrompterProps) {
  return (
    <div className="sticky top-0 z-10 w-full glass-panel border-b border-[#F2F4F6] py-8 px-6 mb-10">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-1 bg-[#F2F4F6] p-1.5 rounded-2xl w-fit mb-8">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => onCategoryChange(cat)}
              className={`px-8 py-2.5 rounded-xl text-[15px] font-bold transition-all ${
                currentCategory === cat
                  ? "bg-white text-[#3182F6] shadow-[0_4px_12px_rgb(0,0,0,0.05)]"
                  : "text-[#8B95A1] hover:text-[#4E5968] hover:bg-white/50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-5 bg-[#3182F6] rounded-full" />
            <label className="text-sm font-bold text-[#191F28]">
              AI 생성 지시문 (SYSTEM PROMPT)
            </label>
          </div>
          <textarea
            value={promptGuideline}
            onChange={(e) => onPromptChange(e.target.value)}
            className="w-full h-28 p-5 text-[15px] bg-white border-2 border-[#F2F4F6] rounded-2xl focus:border-[#3182F6] focus:ring-0 outline-none transition-all resize-none shadow-[0_4px_12px_rgb(0,0,0,0.02)] text-[#333D4B] placeholder-[#ADB5BD] font-medium"
            placeholder="AI에게 전달할 지시문을 입력하세요..."
          />
          <p className="text-[12px] text-[#8B95A1] font-medium pl-1">
            ※ 모든 학생에게 공통 적용되며, 이름은 자동으로 생략되고 개조식(~함.)으로 작성됩니다.
          </p>
        </div>
      </div>
    </div>
  );
}
