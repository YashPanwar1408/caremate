import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { loginUser, getCurrentUser } from '../utils/auth';
import { useAppStore } from '../context/appStore';

const ACCENT = '#0ea5e9';

export default function LoginScreen() {
  const nav = useNavigation<any>();
  const setCurrentUser = useAppStore((s) => s.setCurrentUser);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onLogin = async () => {
    setLoading(true);
    setError('');
    const res = await loginUser(email.trim(), password);
    setLoading(false);
    if (!res.ok) {
      setError(res.message || 'Login failed');
      return;
    }
  const user = await getCurrentUser();
  if (user) setCurrentUser(user);
  // No navigation required; App.tsx watches currentUser and switches to AppNavigator
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome back</Text>
      {!!error && <Text style={styles.error}>{error}</Text>}
      <TextInput
        mode="outlined"
        label="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
      />
      <TextInput
        mode="outlined"
        label="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={styles.input}
      />
      <Button mode="contained" onPress={onLogin} loading={loading} buttonColor={ACCENT}>
        Log in
      </Button>
      <Button mode="text" onPress={() => nav.navigate('Signup' as never)} textColor={ACCENT} style={{ marginTop: 8 }}>
        Create an account
      </Button>
      <Text style={styles.hint}>Demo account: demo@caremate.ai / demo123</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 16, color: ACCENT },
  input: { marginBottom: 12 },
  error: { color: '#b91c1c', marginBottom: 12 },
  hint: { marginTop: 16, color: '#475569' },
});
