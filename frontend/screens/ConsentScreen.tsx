import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Button, Checkbox } from 'react-native-paper';
import { isLoggedIn } from '../utils/auth';
import { useNavigation } from '@react-navigation/native';
import { useAppStore } from '../context/appStore';

const ACCENT = '#0ea5e9';

export default function ConsentScreen() {
  const [checked, setChecked] = useState(false);
  const nav = useNavigation<any>();
  const acceptConsent = useAppStore((s) => s.acceptConsent);

  const onAccept = () => {
    if (!checked) return;
    acceptConsent();
    // After consent, route to login if not logged in. If logged in, App.tsx will switch stacks.
    (async () => {
      const logged = await isLoggedIn();
      if (logged) {
        // Force a quick hand-off to Splash to re-evaluate gating and swap stacks immediately
        nav.reset({ index: 0, routes: [{ name: 'Splash' }] });
      } else {
        nav.reset({ index: 0, routes: [{ name: 'Login' }] });
      }
    })();
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }} style={styles.container}>
      <View style={styles.inner}>
        <Text style={[styles.title, { color: ACCENT }] }>
          Consent & Disclaimer
        </Text>
        <Text style={styles.body}>
          Privacy: We respect your data. Information you enter may be stored securely to provide app functionality.
        </Text>
        <Text style={styles.body}>
          Medical Disclaimer: This tool is not a replacement for a doctor. Always seek professional medical advice for
          diagnosis and treatment.
        </Text>

        <View style={styles.checkRow}>
          <Checkbox status={checked ? 'checked' : 'unchecked'} onPress={() => setChecked(!checked)} color={ACCENT} />
          <Text style={styles.checkLabel}>
            I have read and agree.
          </Text>
        </View>

        <Button mode="contained" onPress={onAccept} buttonColor={ACCENT} style={{ marginTop: 16, marginBottom: 24 }} disabled={!checked}>
          Accept and Continue
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#fff' },
  inner: { flex: 1, paddingHorizontal: 24, paddingVertical: 40 },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 16 },
  body: { fontSize: 18, color: '#334155', marginBottom: 16 },
  checkRow: { flexDirection: 'row', alignItems: 'center', marginTop: 24 },
  checkLabel: { fontSize: 16, marginLeft: 8 },
});
