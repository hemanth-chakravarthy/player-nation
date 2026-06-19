import React, { useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  Animated,
  Dimensions,
  Pressable,
  Platform,
} from 'react-native';
import {
  CloseIcon,
  HomeIcon,
  SoccerIcon,
  BookmarkIcon,
  ProfileIcon,
  SettingsIcon,
  HelpIcon,
  LogoutIcon,
} from './Icons';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const DRAWER_WIDTH = 280;
const MONO = Platform.select({ ios: 'Courier New', android: 'monospace', default: 'monospace' });

type AlertBtn = { label: string; onPress?: () => void; destructive?: boolean; ghost?: boolean };

function AppAlert({
  visible, title, message, buttons, onDismiss,
}: {
  visible: boolean; title: string; message: string;
  buttons: AlertBtn[]; onDismiss?: () => void;
}) {
  if (!visible) return null;
  return (
    <View style={al.backdrop}>
      <TouchableOpacity style={StyleSheet.absoluteFillObject} onPress={onDismiss} activeOpacity={1} />
      <View style={al.box}>
        <Text style={al.title}>{title}</Text>
        <Text style={al.message}>{message}</Text>
        <View style={al.btnRow}>
          {buttons.map((b, i) => (
            <TouchableOpacity
              key={i}
              style={[al.btn, b.ghost && al.btnGhost]}
              onPress={() => { b.onPress?.(); onDismiss?.(); }}
              activeOpacity={0.82}
            >
              <Text style={[al.btnText, b.ghost && al.btnTextGhost]}>
                {b.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
}

const al = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0, bottom: 0, left: 0, right: 0,
    backgroundColor: 'rgba(0,0,0,0.85)',
    zIndex: 9999,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  box: {
    width: '90%',
    backgroundColor: '#1A1A1A',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#2D2D2D',
    padding: 24,
    alignItems: 'center',
  },
  title: {
    fontFamily: 'Sora-Bold',
    fontSize: 18, fontWeight: '800',
    color: '#FFFFFF', textAlign: 'center', marginBottom: 8,
  },
  message: {
    fontFamily: 'Inter-Regular',
    fontSize: 14, color: '#C8C6C5',
    textAlign: 'center', lineHeight: 21, marginBottom: 24,
  },
  btnRow: { flexDirection: 'row', gap: 10, width: '100%' },
  btn: {
    flex: 1, backgroundColor: '#D7FF00',
    borderRadius: 6, paddingVertical: 13,
    alignItems: 'center', justifyContent: 'center',
  },
  btnGhost: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#2D2D2D' },
  btnText: { fontFamily: 'JetBrainsMono-Bold', fontSize: 12, fontWeight: '800', color: '#0D0D0D', letterSpacing: 0.5 },
  btnTextGhost: { color: '#C8C6C5' },
});

interface SidebarDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  navigation: any;
  activeScreen?: string;
}

export default function SidebarDrawer({ isOpen, onClose, navigation, activeScreen }: SidebarDrawerProps) {
  const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [alertVisible, setAlertVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0.6,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -DRAWER_WIDTH,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleNav = (screenName: string) => {
    onClose();
    navigation.navigate(screenName);
  };

  return (
    <View style={StyleSheet.absoluteFillObject}>
      {/* Backdrop */}
      <Pressable style={s.backdrop} onPress={onClose}>
        <Animated.View style={[s.backdropBg, { opacity: fadeAnim }]} />
      </Pressable>

      {/* Drawer Panel */}
      <Animated.View style={[s.drawer, { transform: [{ translateX: slideAnim }] }]}>
        {/* Header */}
        <View style={s.header}>
          <Text style={s.logoText}>PLAYERNATION</Text>
          <TouchableOpacity style={s.closeBtn} onPress={onClose} activeOpacity={0.7}>
            <CloseIcon color="#C8C6C5" size={16} />
          </TouchableOpacity>
        </View>

        {/* Links */}
        <View style={s.links}>
          <TouchableOpacity
            style={[s.linkItem, activeScreen === 'MatchList' && s.linkItemActive]}
            onPress={() => handleNav('MatchList')}
            activeOpacity={0.7}
          >
            <HomeIcon color={activeScreen === 'MatchList' ? '#D7FF00' : '#C8C6C5'} size={16} />
            <Text style={[s.linkText, activeScreen === 'MatchList' && s.linkTextActive]}>Home</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[s.linkItem, activeScreen === 'MatchList' && s.linkItemActive]}
            onPress={() => handleNav('MatchList')}
            activeOpacity={0.7}
          >
            <SoccerIcon color={activeScreen === 'MatchList' ? '#D7FF00' : '#C8C6C5'} size={16} />
            <Text style={[s.linkText, activeScreen === 'MatchList' && s.linkTextActive]}>Matches</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[s.linkItem, activeScreen === 'SavedReports' && s.linkItemActive]}
            onPress={() => handleNav('SavedReports')}
            activeOpacity={0.7}
          >
            <BookmarkIcon color={activeScreen === 'SavedReports' ? '#D7FF00' : '#C8C6C5'} size={16} />
            <Text style={[s.linkText, activeScreen === 'SavedReports' && s.linkTextActive]}>Saved Reports</Text>
          </TouchableOpacity>

          <View style={s.dividerSection}>
            <Text style={s.sectionHeader}>ACCOUNT</Text>
          </View>

          <TouchableOpacity
            style={[s.linkItem, activeScreen === 'Profile' && s.linkItemActive]}
            onPress={() => handleNav('Profile')}
            activeOpacity={0.7}
          >
            <ProfileIcon color={activeScreen === 'Profile' ? '#D7FF00' : '#C8C6C5'} size={16} />
            <Text style={[s.linkText, activeScreen === 'Profile' && s.linkTextActive]}>Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[s.linkItem, activeScreen === 'Settings' && s.linkItemActive]}
            onPress={() => handleNav('Settings')}
            activeOpacity={0.7}
          >
            <SettingsIcon color={activeScreen === 'Settings' ? '#D7FF00' : '#C8C6C5'} size={16} />
            <Text style={[s.linkText, activeScreen === 'Settings' && s.linkTextActive]}>Settings</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={s.linkItem}
            onPress={() => {
              setAlertVisible(true);
            }}
            activeOpacity={0.7}
          >
            <HelpIcon color="#C8C6C5" size={16} />
            <Text style={s.linkText}>Help & Support</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={s.footer}>
          <View style={s.avatarContainer}>
            <Image
              source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuASBC8TVlb9zb4C73Rsnbmw4adLZbz4-MXSsSsOJ0lgBUP-w0sPug5VxSQkq0aEYaS5SbSqzwKV052heNzRQt0svNLmOCPwWlYdo-i4phs13JUuXokGYL5DI26gIXpD_vwEofh4L2QAyO4eRuwi9vk_OwzMv8deHOJxxd_pTUuMG0x900NMCb-TOI_RK5BKZZkXaiK3NxWlJRSLoWEtH_jhKu8nSl4fgmjAZ55K5YaKfn7-qPqGhq9ibNuVXNX4MPvk31HrnzXeRe0' }}
              style={s.avatar}
            />
            <View style={s.onlineDot} />
          </View>
          <View style={s.userInfo}>
            <Text style={s.userName}>Couch Alex</Text>
            <Text style={s.userRole}>ELITE COACH ID: PN-9921</Text>
          </View>
          <TouchableOpacity
            style={s.logoutBtn}
            onPress={() => {
              onClose();
              alert('Logging out...');
            }}
            activeOpacity={0.7}
          >
            <LogoutIcon color="#FF4B4B" size={16} />
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Beta Limitation Custom Alert */}
      <AppAlert
        visible={alertVisible}
        title="Beta Limitation"
        message="Help & Support is currently unavailable in the Beta release."
        buttons={[{ label: 'OK', ghost: true, onPress: onClose }]}
        onDismiss={() => setAlertVisible(false)}
      />
    </View>
  );
}

const s = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 99,
  },
  backdropBg: {
    flex: 1,
    backgroundColor: '#000000',
  },
  drawer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: DRAWER_WIDTH,
    backgroundColor: '#000000',
    borderRightWidth: 1,
    borderRightColor: '#2D2D2D',
    zIndex: 100,
    flexDirection: 'column',
    paddingTop: Platform.OS === 'ios' ? 44 : 24,
  },
  header: {
    height: 64,
    borderBottomWidth: 1,
    borderBottomColor: '#2D2D2D',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  logoText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#D7FF00',
    letterSpacing: -0.5,
  },
  closeBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  links: {
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: 16,
    gap: 4,
  },
  linkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 12,
  },
  linkItemActive: {
    backgroundColor: '#201F1F',
  },
  linkText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#C8C6C5',
  },
  linkTextActive: {
    color: '#D7FF00',
    fontWeight: '700',
  },
  dividerSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  sectionHeader: {
    fontFamily: MONO,
    fontSize: 9,
    fontWeight: '700',
    color: 'rgba(200,198,197,0.5)',
    letterSpacing: 1,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#2D2D2D',
    backgroundColor: 'rgba(26,26,26,0.8)',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#D7FF00',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#00E676',
    borderWidth: 2,
    borderColor: '#000000',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  userRole: {
    fontFamily: MONO,
    fontSize: 8,
    fontWeight: '700',
    color: '#C8C6C5',
    letterSpacing: 0.5,
    marginTop: 1,
  },
  logoutBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
