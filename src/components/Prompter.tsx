import styles from './Prompter.module.css';

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
    <div className={`${styles.container} glass-panel`}>
      <div className={styles.tabs}>
        {categories.map((cat) => (
          <button
            key={cat}
            className={`${styles.tab} ${currentCategory === cat ? styles.active : ''}`}
            onClick={() => onCategoryChange(cat)}
          >
            {cat}
          </button>
        ))}
      </div>
      <div className={styles.editorArea}>
        <label className={styles.label}>AI 생성 지시문 (System Prompt)</label>
        <textarea
          className={styles.textarea}
          value={promptGuideline}
          onChange={(e) => onPromptChange(e.target.value)}
          placeholder="여기에 생기부 작성 규칙이나 강조하고 싶은 점을 적어주세요..."
        />
        <p className={styles.hint}>
          ※ 입력된 지시문은 해당 카테고리의 모든 학생에게 공통 적용되며, 이름은 자동으로 생략됩니다.
        </p>
      </div>
    </div>
  );
}
