import React, { useRef, useState } from 'react';
import { View, Text, ScrollView, useWindowDimensions, NativeScrollEvent, NativeSyntheticEvent, StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useAppStore } from '../context/appStore';
import { Logo } from '../components/Logo';

const slides = [
  { title: 'Medication Reminders', desc: 'Stay on track with timely alerts.' },
  { title: 'Vitals Tracking', desc: 'Log and visualize your health data.' },
  { title: 'Caregiver Support', desc: 'Share updates with loved ones.' },
];

const ACCENT = '#0ea5e9';

export default function OnboardingScreen() {
  const { width } = useWindowDimensions();
  const scrollRef = useRef<ScrollView>(null);
  const [index, setIndex] = useState(0);
  const nav = useNavigation<any>();
  const completeOnboarding = useAppStore((s) => s.completeOnboarding);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const i = Math.round(e.nativeEvent.contentOffset.x / width);
    if (i !== index) setIndex(i);
  };

  const next = () => {
    if (index < slides.length - 1) {
      scrollRef.current?.scrollTo({ x: (index + 1) * width, animated: true });
      setIndex(index + 1);
    } else {
      completeOnboarding();
      nav.navigate('Consent' as never);
    }
  };

  const skip = () => {
    completeOnboarding();
    nav.navigate('Consent' as never);
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoWrap}>
        <Logo size={72} color={ACCENT} />
      </View>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={32}
        style={{ marginTop: 24 }}
      >
        {slides.map((s, i) => (
          <View key={i} style={[{ width }, styles.slide]}>
            <Text style={[styles.title, { color: ACCENT }] }>
              {s.title}
            </Text>
            <Text style={styles.desc}>
              {s.desc}
            </Text>
          </View>
        ))}
      </ScrollView>
      <View style={styles.dotsRow}>
        {slides.map((_, i) => (
          <View
            key={i}
            style={{ width: 8, height: 8, borderRadius: 4, marginHorizontal: 4, backgroundColor: i === index ? ACCENT : '#cbd5e1' }}
          />
        ))}
      </View>
      <View style={styles.actionsRow}>
        <Button mode="text" onPress={skip} textColor={ACCENT} style={{ marginBottom: 16 }}>
          Skip
        </Button>
        <Button mode="contained" onPress={next} buttonColor={ACCENT} style={{ marginBottom: 16 }}>
          {index < slides.length - 1 ? 'Next' : 'Continue'}
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  logoWrap: { alignItems: 'center', marginTop: 48 },
  slide: { paddingHorizontal: 32, alignItems: 'center' },
  title: { marginTop: 24, textAlign: 'center', fontSize: 28, fontWeight: '700' },
  desc: { marginTop: 12, textAlign: 'center', fontSize: 18, color: '#334155' },
  dotsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 16 },
  actionsRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 24, marginTop: 24, marginBottom: 12 },
});
