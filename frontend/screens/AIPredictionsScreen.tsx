import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Card } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';

const ACCENT = '#0ea5e9';

const DISEASES = [
  { key: 'Diabetes', icon: 'needle', desc: 'Blood sugar and metabolic risks' },
  { key: 'Heart', icon: 'heart-pulse', desc: 'Cardiovascular risk factors' },
  { key: 'Kidney', icon: 'kidney', desc: 'Renal health considerations' },
];

export default function AIPredictionsScreen() {
  const nav = useNavigation<any>();
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>AI Predictions</Text>
      <Text style={styles.subtitle}>Choose a category to begin</Text>
      <View style={styles.grid}>
        {DISEASES.map((d) => (
          <TouchableOpacity key={d.key} style={styles.tile} onPress={() => nav.navigate('HealthIntakeForm' as never, { disease: d.key } as never)}>
            <Card style={{ flex: 1 }}>
              <Card.Content style={styles.tileContent}>
                <MaterialCommunityIcons name={d.icon as any} size={28} color={ACCENT} />
                <Text style={styles.tileTitle}>{d.key}</Text>
                <Text style={styles.tileDesc}>{d.desc}</Text>
              </Card.Content>
            </Card>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 4, color: ACCENT },
  subtitle: { color: '#475569', marginBottom: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  tile: { width: '48%' },
  tileContent: { alignItems: 'flex-start', gap: 6, paddingVertical: 12 },
  tileTitle: { fontWeight: '700' },
  tileDesc: { color: '#64748b', fontSize: 12 },
});
