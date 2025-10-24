import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { signupUser } from '../utils/auth';

const ACCENT = '#0ea5e9';

export default function SignupScreen() {
  const nav = useNavigation<any>();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const onSignup = async () => {
    setError('');
    setSuccess('');
    if (!name || !email || !password || !confirmPassword) {
      setError('All fields are required.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    const res = await signupUser(name.trim(), email.trim(), password);
    setLoading(false);
    if (!res.ok) {
      setError(res.message || 'Signup failed');
      return;
    }
    setSuccess('Account created. You can now log in.');
    // Navigate to Login after a brief delay
    setTimeout(() => nav.navigate('Login' as never), 300);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create account</Text>
      {!!error && <Text style={styles.error}>{error}</Text>}
      {!!success && <Text style={styles.success}>{success}</Text>}
      <TextInput mode="outlined" label="Name" value={name} onChangeText={setName} style={styles.input} />
      <TextInput
        mode="outlined"
        label="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
      />
      <TextInput mode="outlined" label="Password" secureTextEntry value={password} onChangeText={setPassword} style={styles.input} />
      <TextInput
        mode="outlined"
        label="Confirm Password"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        style={styles.input}
      />
      <Button mode="contained" onPress={onSignup} loading={loading} buttonColor={ACCENT}>
        Sign up
      </Button>
      <Button mode="text" onPress={() => nav.navigate('Login' as never)} textColor={ACCENT} style={{ marginTop: 8 }}>
        Already have an account? Log in
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 16, color: ACCENT },
  input: { marginBottom: 12 },
  error: { color: '#b91c1c', marginBottom: 12 },
  success: { color: '#15803d', marginBottom: 12 },
});
