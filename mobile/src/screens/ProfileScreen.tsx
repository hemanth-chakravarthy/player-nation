import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  Platform,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SidebarDrawer from './SidebarDrawer';
import {
  MenuIcon,
  ProfileIcon,
  VerifiedIcon,
  EditIcon,
  FileIcon,
  SoccerIcon,
  TrendUpIcon,
  EmailIcon,
  ChevronRightIcon,
  LockIcon,
  LogoutIcon,
  BookmarkIcon,
  SettingsIcon,
} from './Icons';

const { width: W } = Dimensions.get('window');
const MONO = 'JetBrainsMono-Regular';
const MONO_BOLD = 'JetBrainsMono-Bold';
const SORA = 'Sora-Regular';
const SORA_BOLD = 'Sora-Bold';
const SORA_EXTRABOLD = 'Sora-ExtraBold';
const INTER = 'Inter-Regular';
const INTER_MEDIUM = 'Inter-Medium';
const INTER_BOLD = 'Inter-Bold';

export default function ProfileScreen({ navigation }: any) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <SafeAreaView style={s.screen} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.headerBtn} onPress={() => setIsDrawerOpen(true)} activeOpacity={0.7}>
          <MenuIcon color="#D7FF00" size={22} />
        </TouchableOpacity>

        <Image
          source={require('../../assets/PlayerNationCrop1.png')}
          style={s.logoImage}
          resizeMode="contain"
        />

        <TouchableOpacity style={s.headerBtn} onPress={() => navigation.navigate('Profile')} activeOpacity={0.7}>
          <ProfileIcon color="#D7FF00" size={20} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        {/* Profile Hero Section */}
        <View style={s.hero}>
          {/* Pulse Blur effect in background */}
          <View style={s.pulseBg} />

          <View style={s.avatarContainer}>
            <View style={s.avatarBorder}>
              <Image
                source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBiFlqSA9fa7nN1JZ0DO8gt2EdjV3FfZ9PClpu87KNmPwGZCCvtlNUDontRl1DNaQr9HVi1_z63xOfobJZfXnYVAm9Ijs1GDBsl8jURo-N3eqJ_lPvgwEYTuXgLypimfVe3H4OhWjUw4DdysHg6PZd0Y7mjO5zyPejis9za_0uUSTikbuT1pMrjYPmaI_fB4CnPU8f_p-Hw_XNy8WLXGouP_dkHcmWq6jDQaVgQaH16VjFebff37vZfI7icYUPchTtjXcfttWaHS5I' }}
                style={s.avatar}
              />
            </View>
            <View style={s.verifiedBadge}>
              <VerifiedIcon size={12} color="#0D0D0D" />
            </View>
          </View>

          <Text style={s.heroName}>Coach Alex</Text>
          <Text style={s.heroRole}>HEAD COACH</Text>

          <TouchableOpacity style={s.editBtn} activeOpacity={0.8}>
            <EditIcon size={14} color="#0D0D0D" />
            <Text style={s.editBtnText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Bento Grid */}
        <View style={s.grid}>
          <View style={s.gridRow}>
            {/* Stat 1 */}
            <View style={s.statCard}>
              <View style={s.statContent}>
                <Text style={s.statLabel}>REPORTS GENERATED</Text>
                <Text style={s.statValue}>24</Text>
              </View>
              <View style={s.statIconBg}>
                <FileIcon size={40} color="rgba(255,255,255,0.06)" />
              </View>
            </View>

            {/* Stat 2 */}
            <View style={s.statCard}>
              <View style={s.statContent}>
                <Text style={s.statLabel}>MATCHES ANALYZED</Text>
                <Text style={s.statValue}>12</Text>
              </View>
              <View style={s.statIconBg}>
                <SoccerIcon size={40} color="rgba(255,255,255,0.06)" />
              </View>
            </View>
          </View>

          {/* Large Stat/Insight Card */}
          <View style={s.ratingCard}>
            <View style={s.ratingHeader}>
              <View style={{ flex: 1 }}>
                <Text style={s.ratingLabel}>PERFORMANCE RATING</Text>
                <Text style={s.ratingTitle}>Top 5% League Coach</Text>
                <Text style={s.ratingDesc}>Based on tactical accuracy and win percentage across analyzed matches.</Text>
              </View>
              <View style={s.ratingIconContainer}>
                <TrendUpIcon size={24} color="#D7FF00" />
              </View>
            </View>
          </View>
        </View>

        {/* Quick Settings / Actions */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>ACCOUNT DETAILS</Text>
          <View style={s.accountList}>
            <View style={s.accountRow}>
              <View style={s.rowLeft}>
                <EmailIcon size={16} color="#C8C6C5" />
                <Text style={s.rowText}>alex.walker@playernation.ai</Text>
              </View>
              <ChevronRightIcon size={18} color="#C8C6C5" />
            </View>

            <View style={s.accountRow}>
              <View style={s.rowLeft}>
                <LockIcon size={16} color="#C8C6C5" />
                <Text style={s.rowText}>Two-Factor Auth</Text>
              </View>
              <Text style={s.authStatus}>ENABLED</Text>
            </View>

            <TouchableOpacity style={s.logoutRow} activeOpacity={0.7} onPress={() => alert('Logged out')}>
              <View style={s.rowLeft}>
                <LogoutIcon size={16} color="#FF4B4B" />
                <Text style={s.logoutText}>Logout</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Nav Bar */}
      <View style={bn.bar}>
        <TouchableOpacity style={bn.item} onPress={() => navigation.navigate('MatchList')} activeOpacity={0.7}>
          <SoccerIcon size={20} color="#C8C6C5" />
          <Text style={bn.label}>MATCHES</Text>
        </TouchableOpacity>
        <TouchableOpacity style={bn.item} onPress={() => navigation.navigate('SavedReports')} activeOpacity={0.7}>
          <BookmarkIcon size={18} color="#C8C6C5" />
          <Text style={bn.label}>SAVED</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[bn.item, bn.itemActive]} onPress={() => navigation.navigate('Settings')} activeOpacity={0.7}>
          <SettingsIcon size={18} color="#D7FF00" />
          <Text style={[bn.label, bn.labelActive]}>SETTINGS</Text>
        </TouchableOpacity>
      </View>

      {/* Sidebar Drawer */}
      <SidebarDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        navigation={navigation}
        activeScreen="Profile"
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#000000' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 64,
    borderBottomWidth: 1,
    borderBottomColor: '#2D2D2D',
    backgroundColor: '#000000',
  },
  headerBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 20,
    fontWeight: '900',
    fontStyle: 'italic',
    color: '#D7FF00',
    letterSpacing: -0.5,
  },
  logoImage: {
    height: 140,
    width: 200,
  },
  content: {
    paddingBottom: 120,
  },
  hero: {
    alignItems: 'center',
    paddingVertical: 32,
    position: 'relative',
  },
  pulseBg: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: '#D7FF00',
    opacity: 0.03,
    top: 20,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  avatarBorder: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 2,
    borderColor: '#D7FF00',
    padding: 3,
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
    backgroundColor: '#1A1A1A',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#D7FF00',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#000000',
  },
  heroName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  heroRole: {
    fontFamily: MONO,
    fontSize: 11,
    fontWeight: '700',
    color: '#D7FF00',
    letterSpacing: 1,
    marginTop: 6,
  },
  editBtn: {
    marginTop: 20,
    backgroundColor: '#D7FF00',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 4,
    gap: 8,
  },
  editBtnText: {
    fontFamily: MONO_BOLD,
    color: '#0D0D0D',
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  grid: {
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 24,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#2D2D2D',
    borderRadius: 8,
    padding: 16,
    height: 120,
    position: 'relative',
    overflow: 'hidden',
    justifyContent: 'space-between',
  },
  statContent: {
    zIndex: 2,
  },
  statLabel: {
    fontFamily: MONO_BOLD,
    fontSize: 9,
    fontWeight: '700',
    color: '#C8C6C5',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  statValue: {
    fontFamily: SORA_EXTRABOLD,
    fontSize: 36,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  statIconBg: {
    position: 'absolute',
    right: -10,
    bottom: -10,
    zIndex: 1,
  },
  ratingCard: {
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#2D2D2D',
    borderLeftWidth: 4,
    borderLeftColor: '#D7FF00',
    borderRadius: 8,
    padding: 20,
  },
  ratingHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  ratingLabel: {
    fontFamily: MONO_BOLD,
    fontSize: 10,
    fontWeight: '700',
    color: '#D7FF00',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  ratingTitle: {
    fontFamily: SORA_BOLD,
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  ratingDesc: {
    fontSize: 13,
    color: '#C8C6C5',
    lineHeight: 18,
  },
  ratingIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#2D2D2D',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontFamily: MONO,
    fontSize: 10,
    fontWeight: '700',
    color: '#C8C6C5',
    letterSpacing: 1,
    paddingLeft: 8,
    marginBottom: 10,
  },
  accountList: {
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#2D2D2D',
    borderRadius: 12,
    overflow: 'hidden',
  },
  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2D2D2D',
  },
  logoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rowText: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  authStatus: {
    fontFamily: MONO_BOLD,
    fontSize: 10,
    fontWeight: '700',
    color: '#D7FF00',
    letterSpacing: 0.5,
  },
  logoutText: {
    fontSize: 14,
    color: '#FF4B4B',
    fontWeight: '600',
  },
});

const bn = StyleSheet.create({
  bar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: '#000000',
    borderTopWidth: 1,
    borderTopColor: '#2D2D2D',
    paddingBottom: Platform.OS === 'ios' ? 24 : 10,
    paddingTop: 6,
    paddingHorizontal: 8,
    justifyContent: 'space-around',
    zIndex: 10,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
    borderRadius: 10,
    gap: 3,
  },
  itemActive: {
    backgroundColor: '#201F1F',
  },
  label: {
    fontFamily: MONO_BOLD,
    fontSize: 9,
    fontWeight: '700',
    color: '#C8C6C5',
    letterSpacing: 0.8,
    marginTop: 1,
  },
  labelActive: { color: '#D7FF00' },
});
