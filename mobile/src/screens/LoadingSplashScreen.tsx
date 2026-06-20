import React, { useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  Image,
  Animated,
  StatusBar,
  Dimensions,
  Text,
} from 'react-native';
import { useAppStore, discoverApiUrl } from '../store/store';
import axios from 'axios';

const { width } = Dimensions.get('window');
const SORA = 'Sora-Regular';
const MONO = 'JetBrainsMono-Regular';

export default function LoadingSplashScreen({ navigation }: any) {
  const fetchMatches = useAppStore((state) => state.fetchMatches);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.92)).current;
  
  const [countdown, setCountdown] = useState(30);
  const [statusText, setStatusText] = useState('Connecting to server...');
  const [showStatus, setShowStatus] = useState(false);

  useEffect(() => {
    const startTime = Date.now();

    // Start premium entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
    ]).start();

    let checkInterval: NodeJS.Timeout;
    let countdownInterval: NodeJS.Timeout;
    let isTransitioning = false;

    const transitionToApp = () => {
      if (isTransitioning) return;
      isTransitioning = true;
      
      clearInterval(checkInterval);
      clearInterval(countdownInterval);

      // Pre-fetch matches in the background
      fetchMatches();

      // Ensure the logo animation gets at least 1.2s to look clean
      const elapsed = Date.now() - startTime;
      const delay = Math.max(0, 1200 - elapsed);

      setTimeout(() => {
        // Fade out and transition
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }).start(() => {
          navigation.replace('MatchList');
        });
      }, delay);
    };

    // Show status/countdown if the server is taking long to respond (asleep)
    const statusTimeout = setTimeout(() => {
      if (!isTransitioning) {
        setShowStatus(true);
        setStatusText('Waking up cloud server...');
      }
    }, 800);

    // 1. Start waking up the server and checking its health using store's discoverApiUrl
    const checkServerHealth = async () => {
      try {
        // Automatically discovers API URL by probing all candidates in parallel (including local and production)
        const url = await discoverApiUrl();
        const response = await axios.get(`${url}/health`, { timeout: 1500 });
        if (response.data && response.data.status === 'healthy') {
          clearTimeout(statusTimeout);
          transitionToApp();
        }
      } catch (err) {
        // Server is still waking up
        if (!isTransitioning) {
          setShowStatus(true);
          setStatusText('Waking up cloud server...');
        }
      }
    };

    // Run first check immediately
    checkServerHealth();

    // Check server health every 3 seconds
    checkInterval = setInterval(checkServerHealth, 3000);

    // 2. Countdown timer for user feedback (30 seconds)
    countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          clearInterval(checkInterval);
          clearTimeout(statusTimeout);
          // If countdown reaches 0, proceed to app anyway (it will show the error screen)
          transitionToApp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearTimeout(statusTimeout);
      clearInterval(checkInterval);
      clearInterval(countdownInterval);
    };
  }, []);

  return (
    <View style={s.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <Animated.View style={[s.content, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        <Image
          source={require('../../assets/PlayerNation.png')}
          style={s.logo}
          resizeMode="contain"
        />
      </Animated.View>
      
      {showStatus && (
        <Animated.View style={[s.statusContainer, { opacity: fadeAnim }]}>
          <Text style={s.statusMessage}>{statusText}</Text>
          <Text style={s.timerText}>Establishing link... {countdown}s</Text>
        </Animated.View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: width * 0.8,
    height: width * 0.8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  statusContainer: {
    position: 'absolute',
    bottom: 60,
    alignItems: 'center',
    gap: 6,
  },
  statusMessage: {
    fontFamily: SORA,
    fontSize: 14,
    color: '#E5E2E1',
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  timerText: {
    fontFamily: MONO,
    fontSize: 11,
    color: '#8F9378',
    letterSpacing: 0.5,
  },
});
