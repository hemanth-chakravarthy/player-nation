import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Image,
  Animated,
  StatusBar,
  Dimensions,
} from 'react-native';
import { useAppStore } from '../store/store';

const { width } = Dimensions.get('window');

export default function LoadingSplashScreen({ navigation }: any) {
  const { fetchMatches } = useAppStore();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.92)).current;

  useEffect(() => {
    // Parallelly fetch match dataset so they are pre-loaded
    fetchMatches();

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

    // Navigate to MatchList after 2.5 seconds with a fade out
    const timeout = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start(() => {
        navigation.replace('MatchList');
      });
    }, 2400);

    return () => clearTimeout(timeout);
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
});
