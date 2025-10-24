import React, { useEffect, useRef } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Button, Card, ProgressBar, Text, Divider } from 'react-native-paper';
import { useAppStore } from '../context/appStore';

const ACCENT = '#0ea5e9';

export type ModelOutputParams = {
  riskBand: 'low' | 'medium' | 'high';
  diseases: Array<{ name: string; probability: number }>; // probability: 0..1
  shapTop: Array<{ feature: string; impact: number }>; // impact: +/- importance
  recommendations?: {
    nextSteps?: string[];
    lifestyle?: string[];
    summary?: string;
  };
  reportId?: string;
};

function bandMeta(band: 'low' | 'medium' | 'high') {
  switch (band) {
    case 'low':
      return { label: 'Low risk', color: '#10b981', icon: '🛡️' };
    case 'medium':
      return { label: 'Medium risk', color: '#f59e0b', icon: '⚠️' };
    case 'high':
      return { label: 'High risk', color: '#ef4444', icon: '🚨' };
    default:
      return { label: 'Risk', color: ACCENT, icon: 'ℹ️' };
  }
}

export default function MLPredictionScreen() {
  const route = useRoute();
  const nav = useNavigation<any>();
  const params = (route.params || {}) as ModelOutputParams;
  const addPrediction = useAppStore((s) => s.addPrediction);
  const savedRef = useRef(false);

  const meta = bandMeta(params.riskBand || 'low');
  const diseases = params.diseases || [];
  const shapTop = params.shapTop || [];
  const rec = params.recommendations || {};

  // Save into history once per mount
  useEffect(() => {
    if (savedRef.current) return;
    const top = [...diseases].sort((a, b) => (b.probability || 0) - (a.probability || 0))[0];
    const pct = Math.round((top?.probability || 0) * 100);
    const summary = top ? `Top: ${top.name} ${bandMeta(params.riskBand || 'low').label} (${pct}%)` : 'Prediction result';
    const id = params.reportId || `${Date.now()}`;
    addPrediction({
      id,
      date: new Date().toISOString(),
      diseases: diseases.map((d) => ({ name: d.name, probability: d.probability, band: (d as any).band || (d.probability >= 0.67 ? 'high' : d.probability >= 0.34 ? 'medium' : 'low') })),
      summary,
      reportId: params.reportId,
    });
    savedRef.current = true;
  }, [addPrediction, diseases, params.reportId, params.riskBand]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header Risk Band */}
      <Card style={styles.headerCard}>
        <Card.Content>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
            <Text style={[styles.bandIcon]}>{meta.icon}</Text>
            <Text style={[styles.title, { color: meta.color }]}>{meta.label}</Text>
          </View>
          <Text style={{ color: '#334155' }}>
            These AI predictions are informational and not a diagnosis. Please consult a medical professional for clinical decisions.
          </Text>
        </Card.Content>
      </Card>

      {/* Disease probabilities */}
      <Text style={styles.sectionTitle}>Disease probabilities</Text>
      <View>
        {diseases.map((d) => {
          const pct = Math.round((d.probability ?? 0) * 100);
          const color = pct >= 67 ? '#ef4444' : pct >= 34 ? '#f59e0b' : '#10b981';
          return (
            <Card key={d.name} style={styles.card}>
              <Card.Content>
                <View style={styles.rowBetween}>
                  <Text style={styles.cardTitle}>{d.name}</Text>
                  <Text style={[styles.pct, { color }]}>{pct}%</Text>
                </View>
                <ProgressBar progress={Math.max(0, Math.min(1, d.probability || 0))} color={color} style={{ height: 8, borderRadius: 6 }} />
              </Card.Content>
            </Card>
          );
        })}
      </View>

      {/* SHAP explanations */}
      {shapTop.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Top contributing factors</Text>
          <Card style={styles.card}>
            <Card.Content>
              {shapTop.slice(0, 5).map((s, idx) => (
                <View key={idx} style={{ marginBottom: 6 }}>
                  <Text style={styles.bullet}>• {s.feature} {s.impact >= 0 ? '(higher risk)' : '(lower risk)'}</Text>
                </View>
              ))}
            </Card.Content>
          </Card>
        </>
      )}

      {/* Recommendations */}
      <Text style={styles.sectionTitle}>Personalized recommendations</Text>
      <Card style={styles.card}>
        <Card.Content>
          {rec.summary && (
            <Text style={{ marginBottom: 8, color: '#334155' }}>{rec.summary}</Text>
          )}
          {Array.isArray(rec.nextSteps) && rec.nextSteps.length > 0 && (
            <>
              <Text style={styles.subheading}>Next steps</Text>
              {rec.nextSteps.map((t, i) => (
                <Text key={i} style={styles.bullet}>• {t}</Text>
              ))}
              <Divider style={{ marginVertical: 8 }} />
            </>
          )}
          {Array.isArray(rec.lifestyle) && rec.lifestyle.length > 0 && (
            <>
              <Text style={styles.subheading}>Lifestyle tips</Text>
              {rec.lifestyle.map((t, i) => (
                <Text key={i} style={styles.bullet}>• {t}</Text>
              ))}
            </>
          )}
        </Card.Content>
      </Card>

      {/* Actions */}
      <Button
        mode="contained"
        onPress={() => nav.navigate('ReportViewer', { id: params.reportId } as never)}
        buttonColor={ACCENT}
      >
        View consultation report (PDF)
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#fff' },
  headerCard: { marginBottom: 12, backgroundColor: '#f0fdf4' },
  title: { fontSize: 24, fontWeight: '700' },
  bandIcon: { fontSize: 22, marginRight: 8 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginTop: 12, marginBottom: 8, color: ACCENT },
  card: { marginBottom: 10 },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  cardTitle: { fontSize: 16, fontWeight: '600' },
  pct: { fontSize: 16, fontWeight: '700' },
  subheading: { fontWeight: '700', marginBottom: 6 },
  bullet: { color: '#334155', marginBottom: 4 },
});
