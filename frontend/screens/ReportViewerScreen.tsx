import React from 'react';
import { ScrollView, StyleSheet, View, Linking } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { useRoute, useNavigation } from '@react-navigation/native';
import { api } from '../api/client';

const ACCENT = '#0ea5e9';

type Params = { id?: string };

const mockReport = `
Consultation Report
-------------------
Chief concern: Intermittent headaches for 3 days.

Assessment (AI-generated):
- Most consistent with tension-type headaches; hydration and rest are advised.
- Consider tracking triggers (sleep, stress, caffeine).
- Red flags to watch for: sudden severe headache, neurological changes, fever with neck stiffness—seek urgent care.

Plan:
- Hydration, adequate sleep.
- Over-the-counter analgesics as appropriate.
- Follow-up if no improvement in 72 hours.
`;

export default function ReportViewerScreen() {
  const route = useRoute();
  const { id } = (route.params || {}) as Params;
  const navigation = useNavigation<any>();
  const pdfUrl = id ? `${api.defaults.baseURL}/report/${id}` : undefined;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Report {id ? `#${id}` : ''}</Text>
      <View style={styles.reportBox}>
        <Text style={styles.reportText}>{mockReport}</Text>
      </View>
      {pdfUrl && (
        <Button mode="contained" onPress={async () => { await Linking.openURL(pdfUrl); }} buttonColor={ACCENT}>
          Open PDF
        </Button>
      )}
      <Button mode="contained" onPress={() => navigation.navigate('DoctorConnect' as never)} buttonColor={ACCENT} style={{ marginTop: 8 }}>
        Connect with a doctor
      </Button>
      <Button mode="text" onPress={() => alert('Sharing PDF (mock)')} textColor={ACCENT}>
        Share
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 12, color: ACCENT },
  reportBox: { backgroundColor: '#f1f5f9', padding: 12, borderRadius: 8, marginBottom: 12 },
  reportText: { fontFamily: 'monospace' as any, color: '#0f172a' },
});
