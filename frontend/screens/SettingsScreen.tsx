import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, Divider, Avatar } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { logout } from '../utils/auth';
import { useAppStore } from '../context/appStore';

const ACCENT = '#0ea5e9';

export default function SettingsScreen() {
  const nav = useNavigation<any>();
  const user = useAppStore((s) => s.currentUser);
  const setCurrentUser = useAppStore((s) => s.setCurrentUser);

  const onLogout = async () => {
    await logout();
    setCurrentUser(null);
    // AppNavigator will unmount due to conditional in App.tsx and show AuthNavigator
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Avatar.Text label={(user?.name?.[0] || user?.email?.[0] || 'U').toUpperCase()} size={56} />
        <View style={{ marginLeft: 12 }}>
          <Text style={styles.title}>Account</Text>
          <Text style={styles.subtitle}>{user?.email ?? 'Not logged in'}</Text>
        </View>
      </View>

      <Divider style={{ marginVertical: 16 }} />

      <Button mode="contained" onPress={onLogout} buttonColor={ACCENT}>
        Log out
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  headerRow: { flexDirection: 'row', alignItems: 'center' },
  title: { fontSize: 20, fontWeight: '700' },
  subtitle: { color: '#475569', marginTop: 2 },
});
