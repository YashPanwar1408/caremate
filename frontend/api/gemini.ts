// AI Doctor chat integration: calls backend /chat (Gemini-backed), with a graceful fallback mock.
import { api } from './client';

export type AIMessageRequest = {
  userText: string;
};

export async function generateAdvice(req: AIMessageRequest): Promise<string> {
  const userText = req.userText?.trim() || '';
  if (!userText) return '';
  try {
    const res = await api.post('/chat', { text: userText });
    const data = res.data || {};
    if (data.reply) return String(data.reply);
  } catch {}

  // Fallback mock
  const text = userText.toLowerCase();
  let topic = 'your health concern';
  if (text.includes('headache')) topic = 'headaches';
  if (text.includes('fever')) topic = 'fever';
  if (text.includes('cough')) topic = 'cough';
  if (text.includes('bp') || text.includes('blood pressure')) topic = 'blood pressure';
  return (
    `I hear you—dealing with ${topic} can be uncomfortable. ` +
    `Based on what you've shared, consider rest, hydration, and tracking key symptoms. ` +
    `If symptoms worsen, persist beyond 48–72 hours, or you notice red flags (severe pain, shortness of breath, confusion), ` +
    `please seek in-person medical care. I can also help record your symptoms in the Health Intake form.`
  );
}
