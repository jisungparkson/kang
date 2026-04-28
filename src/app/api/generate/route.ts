import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey || apiKey === 'your_api_key_here') {
    return NextResponse.json(
      { error: 'OpenAI API Key is not configured on the server.' },
      { status: 500 }
    );
  }

  try {
    const { category, teacherNote, achievement, promptGuideline } = await request.json();

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `${promptGuideline}\n\n[규칙]\n1. 학생의 이름(주어)을 절대 포함하지 마세요.\n2. "~함.", "~임."과 같은 간결한 개조식 문체로 작성하세요.\n3. 결과는 오직 생성된 문장만 출력하세요.`,
          },
          {
            role: 'user',
            content: `카테고리: ${category}\n학생 관찰 내용: ${teacherNote}\n성취도: ${achievement}`,
          },
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.error?.message || 'OpenAI API error' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({ result: data.choices[0].message.content.trim() });
  } catch (error) {
    console.error('API Route Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
