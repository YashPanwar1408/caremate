import { api } from './client';

export type DiseaseRisk = {
  name: string;
  probability: number; // 0..1
  band: 'low' | 'medium' | 'high';
};

export type PredictionResponse = {
  diseases: DiseaseRisk[];
  overallBand?: 'low' | 'medium' | 'high';
  shapTop?: Array<{ feature: string; impact: number }>
  recommendations?: {
    nextSteps?: string[];
    lifestyle?: string[];
    summary?: string;
  };
  reportId?: string;
  generatedAt?: string; // ISO datetime
};

function bandFromProb(p: number): 'low' | 'medium' | 'high' {
  const pct = Math.round((p || 0) * 100);
  if (pct >= 67) return 'high';
  if (pct >= 34) return 'medium';
  return 'low';
}

export async function submitHealthForm(formData: any): Promise<PredictionResponse> {
  // POST to backend /predict (to be implemented on server)
  // This function normalizes the response shape for the app.
  try {
    const res = await api.post('/predict', formData);
    const data = res.data || {};

    // Normalize diseases array
    const diseases: DiseaseRisk[] = (data.diseases || []).map((d: any) => ({
      name: String(d.name ?? 'Unknown'),
      probability: typeof d.probability === 'number' ? d.probability : Number(d.probability ?? 0),
      band: (d.band as any) || bandFromProb(Number(d.probability ?? 0))
    }));

    // Determine overall band if missing
    const overallBand: 'low' | 'medium' | 'high' | undefined = data.overallBand ||
      diseases.reduce<'low' | 'medium' | 'high' | undefined>((acc, d) => {
        if (!acc) return d.band;
        if (d.band === 'high' || (d.band === 'medium' && acc === 'low')) return d.band;
        return acc;
      }, undefined);

    const shapTop = Array.isArray(data.shapTop) ? data.shapTop : [];
    const recommendations = data.recommendations || undefined;
    const reportId = data.reportId || undefined;
    const generatedAt = data.generatedAt || new Date().toISOString();

    return { diseases, overallBand, shapTop, recommendations, reportId, generatedAt };
  } catch (e) {
    // When backend is not ready, derive a mock result for demo purposes
    const age = Number(formData?.age) || 0;
    const sys = Number(formData?.systolic) || 0;
    const dia = Number(formData?.diastolic) || 0;
    const glu = Number(formData?.glucose) || 0;

    const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
    const diabetesProb = clamp01((glu - 90) / 120);
    const heartProb = clamp01(((sys - 110) / 70) * 0.7 + ((dia - 70) / 40) * 0.3);
    const kidneyProb = clamp01(((age - 40) / 40) * 0.4 + ((dia - 70) / 50) * 0.6);

    const diseases: DiseaseRisk[] = [
      { name: 'Diabetes', probability: diabetesProb, band: bandFromProb(diabetesProb) },
      { name: 'Heart', probability: heartProb, band: bandFromProb(heartProb) },
      { name: 'Kidney', probability: kidneyProb, band: bandFromProb(kidneyProb) },
    ];

    const overallBand = diseases.some(d => d.band === 'high') ? 'high' : (diseases.some(d => d.band === 'medium') ? 'medium' : 'low');

    const shapTop = [
      { feature: `Glucose ${glu} mg/dL`, impact: glu - 110 },
      { feature: `Systolic BP ${sys} mmHg`, impact: sys - 120 },
      { feature: `Diastolic BP ${dia} mmHg`, impact: dia - 80 },
      { feature: `Age ${age}`, impact: age - 45 },
    ];

    const recommendations = {
      summary: 'Based on your intake, here are tailored next steps and lifestyle suggestions to lower your health risks.',
      nextSteps: [
        'Schedule a follow-up consultation if symptoms persist or worsen.',
        'Consider home BP monitoring for 1-2 weeks and record readings.',
        'If fasting glucose remains elevated, discuss HbA1c testing with your clinician.',
      ],
      lifestyle: [
        'Aim for 150 minutes/week of moderate activity (e.g., brisk walking).',
        'Reduce added sugars and refined carbs; focus on lean proteins and fiber.',
        'Prioritize 7–8 hours of sleep and manage stress with breathing or mindfulness.',
      ],
    };

    return { diseases, overallBand, shapTop, recommendations, generatedAt: new Date().toISOString() };
  }
}

export default {
  submitHealthForm,
};
