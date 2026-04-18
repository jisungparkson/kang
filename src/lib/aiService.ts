export interface Student {
  id: string;
  name: string;
  studentNo: string; // 학번 또는 핵심 특성
  achievement: string;
  teacherNote: string;
  aiOutput?: string;
}

export interface GeneratePromptArgs {
  student: Student;
  category: string;
  promptGuideline: string;
}

const MOCK_DELAY = 1500;

export const generateAIContent = async ({
  student,
  category,
  promptGuideline,
}: GeneratePromptArgs): Promise<string> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY));

  // Dummy logic for now, simulating gpt-4o-mini behavior
  // Important Rule: No student name (주어 생략)
  
  const contentMap: Record<string, string[]> = {
    생활: [
      "매사에 성실하고 규칙을 준수하며 학급 분위기 조성에 긍정적인 영향을 미침.",
      "자신의 역할에 책임감을 가지고 끝까지 완수하는 자세가 돋보임.",
      "타인에 대한 배려가 깊고 협력적인 태도로 조별 과제를 주도적으로 수행함."
    ],
    인성: [
      "공감 능력이 뛰어나며 친구들의 고충을 경청하고 조언하는 포용력을 보여줌.",
      "정직하고 바른 언행을 생활화하며 주변 사람들에게 신뢰를 주는 성품임.",
      "나눔과 봉사의 정신을 실천하며 공동체 의식이 매우 투철함."
    ],
    학습: [
      "논리적 사고력이 뛰어나며 문제 해결 과정에서 창의적인 대안을 제시함.",
      "학습 목표를 스스로 설정하고 체계적으로 실행하는 자기 주도적 능력이 우수함.",
      "어려운 개념도 포기하지 않고 끝까지 탐구하여 깊이 있는 이해를 도달함."
    ],
    교과세특: [
      "수업 시간에 배운 이론을 실제 사례에 적용하여 분석하는 능력이 탁월함.",
      "발표 준비 과정에서 다양한 자료를 수집하고 핵심을 명확하게 전달하는 소통 능력을 발휘함.",
      "토론 활동 시 상대방의 의견을 존중하면서도 자신의 논리를 설득력 있게 전개함."
    ]
  };

  const pool = contentMap[category] || contentMap['생활']!;
  const randomIndex = Math.floor(Math.random() * pool.length);
  let baseText = pool[randomIndex];

  // In a real implementation, the system prompt would ensure this.
  // Here we just return the string which already follows the rule (no name).
  
  return `[${category}] ${baseText}`;
};

export const initialStudents: Student[] = [
  { id: '1', name: '김민수', studentNo: '10101', achievement: '우수', teacherNote: '수학 창의성 높음, 협동심 부족' },
  { id: '2', name: '이영희', studentNo: '10102', achievement: '보통', teacherNote: '성실함, 발표력 향상 필요' },
  { id: '3', name: '박지성', studentNo: '10103', achievement: '우수', teacherNote: '리더십 탁월, 운동 능력 우수' },
  { id: '4', name: '최유진', studentNo: '10104', achievement: '보통', teacherNote: '배려심 깊음, 소극적 성향' },
  { id: '5', name: '정하늘', studentNo: '10105', achievement: '우수', teacherNote: '분석력 뛰어남, 꼼꼼함' },
];
