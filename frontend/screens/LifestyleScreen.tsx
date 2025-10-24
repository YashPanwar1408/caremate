import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Text } from 'react-native-paper';
import { useAppStore } from '../context/appStore';

const ACCENT = '#0ea5e9';

export default function LifestyleScreen() {
  const preds = useAppStore((s) => s.predictionHistory);
  const last = preds[0];

  const generic = [
    'Aim for 150 minutes/week of moderate activity.',
    'Prioritize whole foods: vegetables, fruits, lean proteins, whole grains.',
    'Stay hydrated; limit sugary beverages.',
    'Sleep 7–8 hours nightly and manage stress.',
  ];

  const extra = last ? [
    `Based on your latest result, focus on: ${(last.diseases[0]?.name) || 'overall wellness'}.`,
  ] : [];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Healthy lifestyle</Text>

      <Card style={styles.card}>
        <Card.Title title="Daily habits" subtitle="Small steps, big impact" />
        <Card.Content>
          {generic.concat(extra).map((t, i) => (
            <Text key={i} style={styles.bullet}>• {t}</Text>
          ))}
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Title title="Exercise" subtitle="Move more, feel better" />
        <Card.Content>
          <Text style={styles.bullet}>• 30 minutes brisk walking most days.</Text>
          <Text style={styles.bullet}>• Add 2 sessions/week of strength training.</Text>
          <Text style={styles.bullet}>• Stretch 5–10 minutes after workouts.</Text>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Title title="Nutrition" subtitle="Simple food swaps" />
        <Card.Content>
          <Text style={styles.bullet}>• Replace sugary snacks with nuts or fruit.</Text>
          <Text style={styles.bullet}>• Choose whole grains over refined grains.</Text>
          <Text style={styles.bullet}>• Balance your plate: half veggies, quarter protein, quarter carbs.</Text>
        </Card.Content>
      </Card>

      <Button mode="text" textColor={ACCENT} onPress={() => alert('Coming soon: personalized programs')}>
        Explore personalized programs
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 8, color: ACCENT },
  card: { marginBottom: 10 },
  bullet: { marginBottom: 6, color: '#334155' },
});
