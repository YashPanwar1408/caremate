import React, { useMemo } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Button, Card, Divider } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { LineChart } from '../components/LineChart';
import { useAppStore } from '../context/appStore';

const ACCENT = '#0ea5e9';

type Consultation = {
  id: string;
  date: string; // ISO date
  riskScore: number; // 0..100
  summary: string;
};

const mockConsultations: Consultation[] = [
  { id: '1', date: '2025-09-01', riskScore: 18, summary: 'Mild viral symptoms, supportive care recommended.' },
  { id: '2', date: '2025-09-14', riskScore: 26, summary: 'Seasonal allergies likely; consider antihistamines.' },
  { id: '3', date: '2025-10-01', riskScore: 35, summary: 'Possible tension headaches; hydration and rest.' },
  { id: '4', date: '2025-10-20', riskScore: 28, summary: 'Improving trend; continue monitoring BP and hydration.' },
];

export default function DashboardScreen() {
  const nav = useNavigation<any>();
  const reports = useAppStore((s) => s.reportHistory);
  const setReports = useAppStore((s) => s.setReports);
  const predictions = useAppStore((s) => s.predictionHistory);
  const data = reports.length ? reports : mockConsultations;
  const series = useMemo(() => data.map((c) => c.riskScore), [data]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Dashboard</Text>

      {/* Quick actions */}
      <View style={styles.quickGrid}>
        <Card style={styles.quickCard} onPress={() => nav.navigate('Chat' as never)}>
          <Card.Content style={styles.quickContent}>
            <MaterialCommunityIcons name="stethoscope" size={22} color={ACCENT} />
            <Text style={styles.quickText}>AI Doctor</Text>
          </Card.Content>
        </Card>
        <Card style={styles.quickCard} onPress={() => nav.navigate('AIPredictions' as never)}>
          <Card.Content style={styles.quickContent}>
            <MaterialCommunityIcons name="chart-donut" size={22} color={ACCENT} />
            <Text style={styles.quickText}>AI Predictions</Text>
          </Card.Content>
        </Card>
        <Card style={styles.quickCard} onPress={() => nav.navigate('DoctorConnect' as never)}>
          <Card.Content style={styles.quickContent}>
            <MaterialCommunityIcons name="account-heart-outline" size={22} color={ACCENT} />
            <Text style={styles.quickText}>Doctor</Text>
          </Card.Content>
        </Card>
        <Card style={styles.quickCard} onPress={() => nav.navigate('Nearby' as never)}>
          <Card.Content style={styles.quickContent}>
            <MaterialCommunityIcons name="hospital-building" size={22} color={ACCENT} />
            <Text style={styles.quickText}>Nearby</Text>
          </Card.Content>
        </Card>
        <Card style={styles.quickCard} onPress={() => nav.navigate('Reports' as never)}>
          <Card.Content style={styles.quickContent}>
            <MaterialCommunityIcons name="file-document-outline" size={22} color={ACCENT} />
            <Text style={styles.quickText}>Reports</Text>
          </Card.Content>
        </Card>
        <Card style={styles.quickCard} onPress={() => nav.navigate('Lifestyle' as never)}>
          <Card.Content style={styles.quickContent}>
            <MaterialCommunityIcons name="leaf" size={22} color={ACCENT} />
            <Text style={styles.quickText}>Lifestyle</Text>
          </Card.Content>
        </Card>
      </View>

      <Card style={styles.card}>
        <Card.Title title="Risk trend" subtitle="Recent consultation risk scores" />
        <Card.Content>
          <View style={{ alignItems: 'center' }}>
            <LineChart values={series} width={320} height={160} color={ACCENT} />
          </View>
        </Card.Content>
      </Card>
      <Button mode="contained" onPress={() => nav.navigate('DoctorConnect' as never)} buttonColor={ACCENT}>
        Connect with a doctor
      </Button>

      <Text style={styles.sectionLabel}>AI predictions</Text>
      {predictions.map((p) => {
        const top = [...p.diseases].sort((a, b) => (b.probability || 0) - (a.probability || 0))[0];
        const pct = Math.round((top?.probability || 0) * 100);
        const color = top?.band === 'high' ? '#ef4444' : top?.band === 'medium' ? '#f59e0b' : '#10b981';
        return (
          <Card key={p.id} style={styles.card}>
            <Card.Content>
              <Text style={styles.consultTitle}>{new Date(p.date).toLocaleString()} — {top?.name} <Text style={{ color }}>{top?.band?.toUpperCase()}</Text> ({pct}%)</Text>
              <Text style={styles.consultSummary}>{p.summary}</Text>
              <View style={styles.row}>
                {p.reportId ? (
                  <Button mode="text" onPress={() => nav.navigate('ReportViewer' as never, { id: p.reportId } as never)} textColor={ACCENT}>
                    View report
                  </Button>
                ) : null}
              </View>
            </Card.Content>
          </Card>
        );
      })}

      <Divider style={{ marginVertical: 8 }} />

      <Text style={styles.sectionLabel}>Past consultations</Text>
      {data.map((c) => (
        <Card key={c.id} style={styles.card}>
          <Card.Content>
            <Text style={styles.consultTitle}>{new Date(c.date).toLocaleDateString()} — Risk {c.riskScore}%</Text>
            <Text style={styles.consultSummary}>{c.summary}</Text>
            <View style={styles.row}>
              <Button mode="text" onPress={() => nav.navigate('ReportViewer' as never, { id: c.id } as never)} textColor={ACCENT}>
                View report
              </Button>
              <Button mode="text" onPress={() => alert('Downloading PDF (mock)')} textColor={ACCENT}>
                Download PDF
              </Button>
            </View>
          </Card.Content>
        </Card>
      ))}

      {/* Demo data control */}
      {!reports.length && (
        <Button mode="text" onPress={() => setReports(mockConsultations as any)} textColor={ACCENT}>
          Load demo data
        </Button>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 8, color: ACCENT },
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  quickCard: { width: '31%' },
  quickContent: { alignItems: 'center', gap: 6, paddingVertical: 10 },
  quickText: { fontWeight: '700', fontSize: 12, textAlign: 'center' },
  sectionLabel: { marginTop: 8, marginBottom: 4, fontWeight: '600' },
  card: { marginBottom: 10 },
  consultTitle: { fontWeight: '600', marginBottom: 4 },
  consultSummary: { color: '#475569', marginBottom: 6 },
  row: { flexDirection: 'row' },
});
