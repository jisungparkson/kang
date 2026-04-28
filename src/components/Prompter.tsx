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
    <div className="sticky top-0 z-10 w-full glass-panel border-b border-border p-6 mb-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex gap-2 mb-6">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => onCategoryChange(cat)}
              className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${
                currentCategory === cat
                  ? "bg-primary text-white shadow-md shadow-primary/20"
                  : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        
        <div className="space-y-2">
          <label className="text-xs font-bold text-primary uppercase tracking-wider">
            AI 생성 지시문 (SYSTEM PROMPT)
          </label>
          <textarea
            value={promptGuideline}
            onChange={(e) => onPromptChange(e.target.value)}
            className="w-full h-24 p-4 text-sm bg-white border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none shadow-sm"
            placeholder="AI에게 전달할 지시문을 입력하세요..."
          />
          <p className="text-[11px] text-gray-400 italic">
            ※ 입력된 지시문은 모든 학생에게 공통 적용되며, 이름은 자동으로 생략되고 개조식(~함.)으로 작성됩니다.
          </p>
        </div>
      </div>
    </div>
  );
}
