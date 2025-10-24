import React from 'react';
import { Linking, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Text } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

const ACCENT = '#0ea5e9';

const MOCK_PLACES = [
  { id: 'h1', name: 'CityCare Hospital', type: 'Hospital', distanceKm: 1.2 },
  { id: 'c1', name: 'WellLife Clinic', type: 'Clinic', distanceKm: 0.8 },
  { id: 'd1', name: 'Dr. Fernandez Cardio Center', type: 'Specialist', distanceKm: 2.5 },
];

function openMaps(name: string) {
  const query = encodeURIComponent(name);
  const url = Platform.select({
    ios: `http://maps.apple.com/?q=${query}`,
    android: `geo:0,0?q=${query}`,
    default: `https://www.google.com/maps/search/?api=1&query=${query}`,
  });
  if (url) Linking.openURL(url);
}

export default function NearbyScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Nearby care</Text>
      {MOCK_PLACES.map((p) => (
        <Card key={p.id} style={styles.card}>
          <Card.Content>
            <View style={styles.rowBetween}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <MaterialCommunityIcons name={p.type === 'Hospital' ? 'hospital-building' : p.type === 'Clinic' ? 'office-building' : 'heart-pulse'} size={22} color={ACCENT} />
                <Text style={styles.placeName}>{p.name}</Text>
              </View>
              <Text style={{ color: '#64748b' }}>{p.distanceKm} km</Text>
            </View>
            <View style={styles.row}>
              <Button mode="contained" buttonColor={ACCENT} onPress={() => openMaps(p.name)}>
                Open in Maps
              </Button>
              <Button mode="text" textColor={ACCENT} onPress={() => alert('Calling (mock)')}>Call</Button>
            </View>
          </Card.Content>
        </Card>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 8, color: ACCENT },
  card: { marginBottom: 10 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  placeName: { fontWeight: '700' },
  row: { flexDirection: 'row', gap: 8, marginTop: 8 },
});
