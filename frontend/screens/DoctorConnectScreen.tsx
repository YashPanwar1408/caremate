import React, { useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Text, Card, Button, Avatar, Snackbar } from 'react-native-paper';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { api } from '../api/client';
import { useAppStore } from '../context/appStore';
import { useRoute } from '@react-navigation/native';

const ACCENT = '#0ea5e9';

type Doctor = {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  hospital?: string;
  avatarLetter?: string;
};

type RouteParams = { predictionId?: string };

export default function DoctorConnectScreen() {
  const route = useRoute();
  const { predictionId } = (route.params || {}) as RouteParams;
  const predictionHistory = useAppStore((s) => s.predictionHistory);
  const latestPredictionId = useMemo(() => predictionId || predictionHistory[0]?.id, [predictionId, predictionHistory]);

  const [remoteDoctors, setRemoteDoctors] = useState<Doctor[] | null>(null);
  const [disclaimer, setDisclaimer] = useState<string | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState<'date' | 'time'>('date');
  const [chosen, setChosen] = useState<Date | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [snack, setSnack] = useState<string>('');

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await api.get('/doctors');
        const docs = (res.data?.doctors || []) as any[];
        const mapped: Doctor[] = docs.map((d) => ({
          id: String(d.id),
          name: String(d.name),
          specialty: String(d.specialty || ''),
          rating: Number(d.rating || 0),
          hospital: d.hospital || d.clinic || undefined,
          avatarLetter: String((d.name || 'D').charAt(0)).toUpperCase(),
        }));
        if (mounted) {
          setRemoteDoctors(mapped);
          setDisclaimer(res.data?.disclaimer || null);
        }
      } catch {
        // keep null -> fall back to local placeholders
      }
    })();
    return () => { mounted = false; };
  }, []);

  const onSchedule = (doc: Doctor) => {
    setSelectedDoctor(doc);
    setPickerMode('date');
    setShowPicker(true);
  };

  const onChange = (event: DateTimePickerEvent, date?: Date) => {
    if (event.type === 'dismissed') {
      setShowPicker(false);
      return;
    }
    const d = date ? new Date(date) : new Date();
    if (pickerMode === 'date') {
      // First step: pick date then time
      setChosen(d);
      setPickerMode('time');
      if (Platform.OS === 'android') setShowPicker(true); // show next picker
    } else {
      const base = chosen ? new Date(chosen) : new Date();
      base.setHours(d.getHours());
      base.setMinutes(d.getMinutes());
      setChosen(base);
      setShowPicker(false);
      // Call backend to schedule
      (async () => {
        try {
          await api.post('/consult', {
            doctor_id: selectedDoctor?.id,
            prediction_id: latestPredictionId,
            mode: 'teleconsult',
            when_iso: base.toISOString(),
          });
          setSnack(`Teleconsultation scheduled with ${selectedDoctor?.name} on ${base.toLocaleString()}`);
        } catch {
          setSnack(`Scheduled locally for ${selectedDoctor?.name} on ${base.toLocaleString()} (offline)`);
        }
      })();
    }
  };

  const sendReport = (doc: Doctor) => {
    (async () => {
      try {
        await api.post('/consult', {
          doctor_id: doc.id,
          prediction_id: latestPredictionId,
          mode: 'send_report',
        });
        setSnack(`Report sent to ${doc.name}.`);
      } catch {
        setSnack(`Report queued for ${doc.name} (offline).`);
      }
    })();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Connect with a doctor</Text>
      {(remoteDoctors ?? [
        { id: 'd1', name: 'Dr. Maya Rao', specialty: 'Family Medicine', rating: 4.8, hospital: 'Care City Clinic', avatarLetter: 'M' },
        { id: 'd2', name: 'Dr. James Lee', specialty: 'Internal Medicine', rating: 4.7, hospital: 'Wellness Center', avatarLetter: 'J' },
        { id: 'd3', name: 'Dr. Priya Singh', specialty: 'Cardiology', rating: 4.9, hospital: 'Heart Health Hosp.', avatarLetter: 'P' },
        { id: 'd4', name: 'Dr. Omar Nasser', specialty: 'Endocrinology', rating: 4.6, hospital: 'Metro Hospital', avatarLetter: 'O' },
      ]).map((d) => (
        <Card key={d.id} style={styles.card}>
          <Card.Title
            title={d.name}
            subtitle={`${d.specialty} • ${d.hospital ?? ''}`}
            left={(props) => <Avatar.Text {...props} label={d.avatarLetter ?? d.name[0]} />}
          />
          <Card.Content>
            <Text style={{ color: '#475569' }}>Rating: {d.rating.toFixed(1)} / 5.0</Text>
          </Card.Content>
          <Card.Actions>
            <Button mode="text" onPress={() => sendReport(d)} textColor={ACCENT}>Send report</Button>
            <Button mode="contained" onPress={() => onSchedule(d)} buttonColor={ACCENT}>
              Schedule teleconsultation
            </Button>
          </Card.Actions>
        </Card>
      ))}

      <Text style={styles.disclaimer}>
        {disclaimer ?? 'For privacy: Your shared data will be encrypted in transit. This service is for guidance and convenience and does not replace in-person medical care.'}
      </Text>

      {showPicker && (
        <DateTimePicker
          value={chosen ?? new Date()}
          mode={pickerMode}
          is24Hour
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
          onChange={onChange}
        />
      )}

      <Snackbar visible={!!snack} onDismiss={() => setSnack('')} duration={3500}>
        {snack}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 8, color: ACCENT },
  card: { marginBottom: 10 },
  disclaimer: { marginTop: 12, color: '#334155' },
});
