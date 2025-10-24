import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View, Linking } from 'react-native';
import { Card, Button, Text } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useAppStore } from '../context/appStore';
import { api } from '../api/client';

const ACCENT = '#0ea5e9';

type Consultation = {
  id: string;
  date: string;
  riskScore: number;
  summary: string;
};

const mockConsultations: Consultation[] = [
  { id: '1', date: '2025-09-01', riskScore: 18, summary: 'Mild viral symptoms, supportive care recommended.' },
  { id: '2', date: '2025-09-14', riskScore: 26, summary: 'Seasonal allergies likely; consider antihistamines.' },
  { id: '3', date: '2025-10-01', riskScore: 35, summary: 'Possible tension headaches; hydration and rest.' },
  { id: '4', date: '2025-10-20', riskScore: 28, summary: 'Improving trend; continue monitoring BP and hydration.' },
];

export default function ReportsScreen() {
  const nav = useNavigation<any>();
  const reports = useAppStore((s) => s.reportHistory);
  const setReports = useAppStore((s) => s.setReports);
  const [items, setItems] = useState<any[] | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await api.get('/dashboard');
        const arr = (res.data?.items || []) as any[];
        if (mounted) setItems(arr);
      } catch {
        // ignore, fall back to local store or mock
      }
    })();
    return () => { mounted = false; };
  }, []);

  const data = items && items.length
    ? items.map((it) => ({
        id: String(it.prediction_id),
        date: it.date,
        riskScore: Math.round(((it.diseases?.[0]?.probability ?? 0) as number) * 100),
        summary: (it.diseases?.map((d: any) => `${d.disease} ${Math.round((d.probability||0)*100)}%`).join(', ')) || 'Report',
        pdf_link: it.pdf_link,
      }))
    : (reports.length ? reports : mockConsultations);
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Reports</Text>
      {data.map((c) => (
        <Card key={c.id} style={styles.card}>
          <Card.Content>
            <Text style={styles.consultTitle}>{new Date(c.date).toLocaleDateString()} — Risk {c.riskScore}%</Text>
            <Text style={styles.consultSummary}>{c.summary}</Text>
            <View style={styles.row}>
              {('pdf_link' in c) ? (
                <>
                  <Button
                    mode="contained"
                    onPress={async () => {
                      const url = (c as any).pdf_link as string;
                      await Linking.openURL(url);
                    }}
                    buttonColor={ACCENT}
                  >
                    Open report
                  </Button>
                  <Button
                    mode="text"
                    onPress={async () => {
                      const url = (c as any).pdf_link as string;
                      await Linking.openURL(url);
                    }}
                    textColor={ACCENT}
                  >
                    Download PDF
                  </Button>
                </>
              ) : (
                <>
                  <Button mode="contained" onPress={() => nav.navigate('ReportViewer' as never, { id: c.id } as never)} buttonColor={ACCENT}>
                    Open report
                  </Button>
                  <Button mode="text" onPress={() => alert('Downloading PDF (mock)')} textColor={ACCENT}>
                    Download PDF
                  </Button>
                </>
              )}
            </View>
          </Card.Content>
        </Card>
      ))}
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
  card: { marginBottom: 10 },
  consultTitle: { fontWeight: '600', marginBottom: 4 },
  consultSummary: { color: '#475569', marginBottom: 6 },
  row: { flexDirection: 'row', gap: 8 },
});
