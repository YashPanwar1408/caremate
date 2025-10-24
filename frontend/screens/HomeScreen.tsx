import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import DashboardScreen from './DashboardScreen';
import ChatScreen from './ChatScreen';
import ReportsScreen from './ReportsScreen';
import DoctorConnectScreen from './DoctorConnectScreen';
import SettingsScreen from './SettingsScreen';

export type HomeTabsParamList = {
  Dashboard: undefined;
  Chat: undefined;
  Reports: undefined;
  Doctor: undefined;
  Settings: undefined;
};

const Tab = createBottomTabNavigator<HomeTabsParamList>();

export default function HomeScreen() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          const name =
            route.name === 'Dashboard' ? 'view-dashboard-outline' :
            route.name === 'Chat' ? 'stethoscope' :
            route.name === 'Reports' ? 'file-document-outline' :
            route.name === 'Doctor' ? 'account-heart-outline' :
            'cog-outline';
          return <MaterialCommunityIcons name={name as any} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#0ea5e9',
        tabBarInactiveTintColor: '#94a3b8',
        headerTitleStyle: { fontWeight: '700' },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Chat" component={ChatScreen} options={{ title: 'AI Doctor' }} />
      <Tab.Screen name="Reports" component={ReportsScreen} />
      <Tab.Screen name="Doctor" component={DoctorConnectScreen} options={{ title: 'Doctor' }} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}
