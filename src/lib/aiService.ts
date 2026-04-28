export interface Student {
  id: string;
  name: string;
  studentNo: string;
  achievement: string;
  teacherNote: string;
  aiOutput?: string;
}

export interface GeneratePromptArgs {
  student: Student;
  category: string;
  promptGuideline: string;
}

export const generateAIContent = async ({
  student,
  category,
  promptGuideline,
}: GeneratePromptArgs): Promise<string> => {
  try {
    // Call our internal API route instead of calling OpenAI directly
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        category,
        teacherNote: student.teacherNote,
        achievement: student.achievement,
        promptGuideline,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.warn('API Route fallback to mock due to:', data.error);
      return mockGenerateAIContent({ student, category, promptGuideline });
    }

    return data.result;
  } catch (error) {
    console.error('Fetch error calling internal API:', error);
    return mockGenerateAIContent({ student, category, promptGuideline });
  }
};

const mockGenerateAIContent = async ({
  category,
}: GeneratePromptArgs): Promise<string> => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  
  const contentMap: Record<string, string[]> = {
    생활: ["학급 활동에 적극적으로 참여하며 급우들과 원만한 관계를 유지함.", "매사에 성실하고 책임감이 강하며 맡은 바 임무를 끝까지 완수함."],
    인성: ["타인에 대한 배려심이 깊고 공동체 의식이 투철하여 모범이 됨.", "갈등 상황에서 중재자 역할을 훌륭히 수행하며 포용력을 보여줌."],
    학습: ["논리적인 사고력이 뛰어나며 수업 내용에 대한 탐구 의지가 강함.", "자기주도적 학습 능력이 우수하고 어려운 과제도 끈기 있게 도전함."],
    교과세특: ["핵심 개념을 명확히 이해하고 이를 실생활 사례에 적용하는 능력이 탁월함.", "토론 과정에서 자신의 의견을 논리적으로 전개하며 비판적 사고력을 발휘함."]
  };

  const pool = contentMap[category] || contentMap['생활']!;
  const randomIndex = Math.floor(Math.random() * pool.length);
  return `[MOCK] ${pool[randomIndex]}`;
};

export const initialStudents: Student[] = [
  { id: '1', name: '김민수', studentNo: '10101', achievement: '우수', teacherNote: '수학적 직관력이 뛰어나며 창의적인 문제 해결 방식을 보여줌.' },
  { id: '2', name: '이영희', studentNo: '10102', achievement: '보통', teacherNote: '성실하게 과제를 수행하며 학급 활동에 협조적인 태도를 보임.' },
  { id: '3', name: '박지성', studentNo: '10103', achievement: '우수', teacherNote: '리더십이 강하고 팀 프로젝트에서 주도적인 역할을 수행함.' },
];
