import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppStore } from '../context/appStore';
import { isLoggedIn, getCurrentUser, getOnboardingComplete, getConsentAccepted } from '../utils/auth';
import { Logo } from '../components/Logo';

const ACCENT = '#0ea5e9'; // health-themed accent (sky/teal)

export default function SplashScreen() {
  const nav = useNavigation<any>();
  const onboardingComplete = useAppStore((s) => s.onboardingComplete);
  const consentAccepted = useAppStore((s) => s.consentAccepted);

  useEffect(() => {
    const t = setTimeout(async () => {
      // Sync persisted onboarding/consent first
      try {
        const [pOnboard, pConsent] = await Promise.all([getOnboardingComplete(), getConsentAccepted()]);
        if (pOnboard && !onboardingComplete) useAppStore.getState().completeOnboarding();
        if (pConsent && !consentAccepted) useAppStore.getState().acceptConsent();
      } catch {}

      if (!onboardingComplete) {
        nav.reset({ index: 0, routes: [{ name: 'Onboarding' }] });
      } else if (!consentAccepted) {
        nav.reset({ index: 0, routes: [{ name: 'Consent' }] });
      } else {
        const logged = await isLoggedIn();
        if (logged) {
          const user = await getCurrentUser();
          if (user) useAppStore.getState().setCurrentUser(user);
          // No navigation needed: App.tsx will switch to AppNavigator when currentUser is set
        } else {
          nav.reset({ index: 0, routes: [{ name: 'Login' }] });
        }
      }
    }, 900);
    return () => clearTimeout(t);
  }, [onboardingComplete, consentAccepted, nav]);

  return (
    <View style={styles.container}>
      <Logo size={120} color={ACCENT} />
      <ActivityIndicator color={ACCENT} style={{ marginTop: 24 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
});
