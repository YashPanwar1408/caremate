import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DefaultTheme, DarkTheme, Theme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as PaperProvider } from 'react-native-paper';
import { useColorScheme } from 'react-native';

import HomeScreen from './screens/HomeScreen';
import SettingsScreen from './screens/SettingsScreen';
import DetailsScreen from './screens/DetailsScreen';
import SplashScreen from './screens/SplashScreen';
import OnboardingScreen from './screens/OnboardingScreen';
import ConsentScreen from './screens/ConsentScreen';
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import ChatScreen from './screens/ChatScreen';
import HealthIntakeForm from './screens/HealthIntakeForm';
import DashboardScreen from './screens/DashboardScreen';
import ReportViewerScreen from './screens/ReportViewerScreen';
import DoctorConnectScreen from './screens/DoctorConnectScreen';
import MLPredictionScreen from './screens/MLPredictionScreen';
import AIPredictionsScreen from './screens/AIPredictionsScreen';
import NearbyScreen from './screens/NearbyScreen';
import LifestyleScreen from './screens/LifestyleScreen';
import { useAppStore } from './context/appStore';

export type AuthStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Consent: undefined;
  Login: undefined;
  Signup: undefined;
};

export type AppStackParamList = {
  Root: undefined;
  HealthIntakeForm: undefined;
  Details: undefined;
  ReportViewer: { id?: string } | undefined;
  DoctorConnect: undefined;
  MLPrediction: {
    riskBand: 'low' | 'medium' | 'high';
    diseases: Array<{ name: string; probability: number }>;
    shapTop: Array<{ feature: string; impact: number }>;
    recommendations?: {
      nextSteps?: string[];
      lifestyle?: string[];
      summary?: string;
    };
    reportId?: string;
  };
  AIPredictions: undefined;
  Nearby: undefined;
  Lifestyle: undefined;
};

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const AppStack = createNativeStackNavigator<AppStackParamList>();

// Tabs are now defined inside HomeScreen

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShadowVisible: false }}>
      <AuthStack.Screen name="Splash" component={SplashScreen} options={{ headerShown: false }} />
      <AuthStack.Screen name="Onboarding" component={OnboardingScreen} options={{ title: 'Welcome' }} />
      <AuthStack.Screen name="Consent" component={ConsentScreen} options={{ title: 'Consent' }} />
      <AuthStack.Screen name="Login" component={LoginScreen} options={{ title: 'Log in' }} />
      <AuthStack.Screen name="Signup" component={SignupScreen} options={{ title: 'Sign up' }} />
    </AuthStack.Navigator>
  );
}

function AppNavigator() {
  return (
    <AppStack.Navigator screenOptions={{ headerShadowVisible: false }}>
      <AppStack.Screen name="Root" component={HomeScreen} options={{ headerShown: false }} />
      <AppStack.Screen name="HealthIntakeForm" component={HealthIntakeForm} options={{ title: 'Health Intake' }} />
  <AppStack.Screen name="AIPredictions" component={AIPredictionsScreen} options={{ title: 'AI Predictions' }} />
  <AppStack.Screen name="Nearby" component={NearbyScreen} options={{ title: 'Nearby Care' }} />
  <AppStack.Screen name="Lifestyle" component={LifestyleScreen} options={{ title: 'Lifestyle' }} />
  <AppStack.Screen name="MLPrediction" component={MLPredictionScreen} options={{ title: 'AI Risk Results' }} />
      <AppStack.Screen name="ReportViewer" component={ReportViewerScreen} options={{ title: 'Consultation Report' }} />
      <AppStack.Screen name="DoctorConnect" component={DoctorConnectScreen} options={{ title: 'Doctor Connect' }} />
      <AppStack.Screen name="Details" component={DetailsScreen} />
    </AppStack.Navigator>
  );
}

const ACCENT = '#0ea5e9';

export default function App() {
  const scheme = useColorScheme();
  const consentAccepted = useAppStore((s) => s.consentAccepted);
  const onboardingComplete = useAppStore((s) => s.onboardingComplete);
  const currentUser = useAppStore((s) => s.currentUser);

  const navTheme: Theme = {
    ...(scheme === 'dark' ? DarkTheme : DefaultTheme),
    colors: {
      ...(scheme === 'dark' ? DarkTheme.colors : DefaultTheme.colors),
      primary: ACCENT,
    },
  };

  return (
    <SafeAreaProvider>
      <PaperProvider>
        <NavigationContainer theme={navTheme}>
          {/* Decide which stack to show based on gating + auth */}
          {onboardingComplete && consentAccepted && currentUser ? (
            <AppNavigator />
          ) : (
            <AuthNavigator />
          )}
          <StatusBar style="auto" />
        </NavigationContainer>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
