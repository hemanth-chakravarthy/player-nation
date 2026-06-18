import React from 'react';
import { MD3DarkTheme, PaperProvider } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import { View } from 'react-native';
import { Sora_400Regular, Sora_500Medium, Sora_700Bold, Sora_800ExtraBold } from '@expo-google-fonts/sora';
import { Inter_400Regular, Inter_500Medium, Inter_700Bold } from '@expo-google-fonts/inter';
import { JetBrainsMono_400Regular, JetBrainsMono_700Bold } from '@expo-google-fonts/jetbrains-mono';

import LoadingSplashScreen from './src/screens/LoadingSplashScreen';
import MatchListScreen from './src/screens/MatchListScreen';
import ReportScreen from './src/screens/ReportScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import SavedReportsScreen from './src/screens/SavedReportsScreen';
import MatchDetailScreen from './src/screens/MatchDetailScreen';

const Stack = createStackNavigator();

// ─── Velocity Dark Theme ────────────────────────────────────────────────────────
const theme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#D7FF00',       // neon-lime
    secondary: '#C8C6C5',     // secondary text
    background: '#000000',    // pure black
    surface: '#1A1A1A',       // charcoal
    onSurface: '#E5E2E1',     // on-surface
    outline: '#2D2D2D',       // steel
    error: '#FF4B4B',         // error-red
  },
};

export default function App() {
  const [fontsLoaded] = useFonts({
    'Sora-Regular': Sora_400Regular,
    'Sora-Medium': Sora_500Medium,
    'Sora-Bold': Sora_700Bold,
    'Sora-ExtraBold': Sora_800ExtraBold,
    'Inter-Regular': Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'Inter-Bold': Inter_700Bold,
    'JetBrainsMono-Regular': JetBrainsMono_400Regular,
    'JetBrainsMono-Bold': JetBrainsMono_700Bold,
  });

  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: '#000000' }} />;
  }

  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="Splash"
            screenOptions={{
              headerShown: false,
              cardStyle: { backgroundColor: '#000000' },
            }}
          >
            <Stack.Screen name="Splash" component={LoadingSplashScreen} />
            <Stack.Screen name="MatchList" component={MatchListScreen} />
            <Stack.Screen name="Report" component={ReportScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen name="SavedReports" component={SavedReportsScreen} />
            <Stack.Screen name="MatchDetail" component={MatchDetailScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </PaperProvider>
    </SafeAreaProvider>
  );
}

