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
  Switch,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SidebarDrawer from './SidebarDrawer';
import {
  MenuIcon,
  ProfileIcon,
  ChevronRightIcon,
  LockIcon,
  MenuIcon as BellIcon, // using MenuIcon or importing specific BellIcon
  ProfileIcon as AlertIcon,
  AnalyticsIcon,
  HelpIcon as InfoIcon,
  LogoutIcon,
  SoccerIcon,
  BookmarkIcon,
  SettingsIcon,
  VerifiedIcon,
} from './Icons';

// Custom icons we mapped
const BellSVG = ({ size = 20, color = '#D7FF00' }) => (
  <MenuIcon size={size} color={color} /> // or draw specific bell if we need, but we can reuse or define inline SVG
);

const { width: W } = Dimensions.get('window');
const MONO = 'JetBrainsMono-Regular';
const MONO_BOLD = 'JetBrainsMono-Bold';
const SORA = 'Sora-Regular';
const SORA_BOLD = 'Sora-Bold';
const SORA_EXTRABOLD = 'Sora-ExtraBold';
const INTER = 'Inter-Regular';
const INTER_MEDIUM = 'Inter-Medium';
const INTER_BOLD = 'Inter-Bold';

export default function SettingsScreen({ navigation }: any) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [matchAlerts, setMatchAlerts] = useState(true);
  const [dataInsights, setDataInsights] = useState(false);
  const [teamUpdates, setTeamUpdates] = useState(true);

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
        {/* Title */}
        <View style={s.titleWrap}>
          <Text style={s.pageTitle}>Settings</Text>
          <Text style={s.pageSubtitle}>Configure your performance parameters and account details.</Text>
        </View>

        {/* Account Bento Card */}
        <View style={s.accountCard}>
          <View style={s.accountHero}>
            <Image
              source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCNUazwrB7XInm2buvOg_xVdyWHT6mBO42Ifw4FQ8rZH46NeYU4StUYfls0sLMzOOisj1fmLFfGOJPt5HPAV38U0imvlXcA9MtKV2r8i6RKcJ02Gt4YzOPD1fsiwmU_TwPla6lItV44Yj5gpTFL3sLQy4r5IjdtFe5jconEZgKXZk1CaZDifGybut7GQvxtcGMHRf10e2v96JVjayCbB1W2pn-8oHTc6ht1mCkzibSwQ3Ws25ExkpAdPOSysGIDh7cA8s1GNWsgd5s' }}
              style={s.coachAvatar}
            />
            <View>
              <Text style={s.coachName}>Couch Alex</Text>
              <Text style={s.coachId}>ELITE COACH ID: PN-9921</Text>
            </View>
          </View>

          <View style={s.accountDivider} />

          <TouchableOpacity style={s.actionRow} activeOpacity={0.7}>
            <Text style={s.actionText}>Account Information</Text>
            <ChevronRightIcon color="#C8C6C5" size={18} />
          </TouchableOpacity>

          <TouchableOpacity style={s.actionRow} activeOpacity={0.7}>
            <Text style={s.actionText}>Privacy & Security</Text>
            <LockIcon color="#C8C6C5" size={14} />
          </TouchableOpacity>
        </View>

        {/* Notifications Section */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <LockIcon color="#D7FF00" size={12} />
            <Text style={s.sectionLabel}>NOTIFICATIONS</Text>
          </View>

          <View style={s.listContainer}>
            <View style={s.rowItem}>
              <View style={{ flex: 1 }}>
                <Text style={s.rowTitle}>Match Alerts</Text>
                <Text style={s.rowSubtitle}>Instant updates on key match events.</Text>
              </View>
              <Switch
                value={matchAlerts}
                onValueChange={setMatchAlerts}
                trackColor={{ false: '#2D2D2D', true: '#D7FF00' }}
                thumbColor={matchAlerts ? '#000000' : '#C8C6C5'}
              />
            </View>

            <View style={s.rowItem}>
              <View style={{ flex: 1 }}>
                <Text style={s.rowTitle}>Data Insights</Text>
                <Text style={s.rowSubtitle}>Weekly tactical analysis summaries.</Text>
              </View>
              <Switch
                value={dataInsights}
                onValueChange={setDataInsights}
                trackColor={{ false: '#2D2D2D', true: '#D7FF00' }}
                thumbColor={dataInsights ? '#000000' : '#C8C6C5'}
              />
            </View>

            <View style={s.rowItem}>
              <View style={{ flex: 1 }}>
                <Text style={s.rowTitle}>Team Updates</Text>
                <Text style={s.rowSubtitle}>News from followed squads.</Text>
              </View>
              <Switch
                value={teamUpdates}
                onValueChange={setTeamUpdates}
                trackColor={{ false: '#2D2D2D', true: '#D7FF00' }}
                thumbColor={teamUpdates ? '#000000' : '#C8C6C5'}
              />
            </View>
          </View>
        </View>

        {/* Data Usage Section */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <AnalyticsIcon color="#D7FF00" size={12} />
            <Text style={s.sectionLabel}>DATA USAGE</Text>
          </View>

          <View style={s.usageCard}>
            <View style={s.usageLabels}>
              <Text style={s.usageTitle}>Storage Used</Text>
              <Text style={s.usageDetails}>1.2 GB / 5 GB</Text>
            </View>
            <View style={s.progressBarWrap}>
              <View style={[s.progressBar, { width: '24%' }]} />
            </View>
            <TouchableOpacity
              style={s.clearBtn}
              activeOpacity={0.8}
              onPress={() => alert('Cache cleared!')}
            >
              <Text style={s.clearBtnText}>CLEAR CACHE</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* About Section */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <InfoIcon color="#D7FF00" size={12} />
            <Text style={s.sectionLabel}>ABOUT</Text>
          </View>

          <View style={s.listContainer}>
            <View style={s.infoRow}>
              <Text style={s.infoText}>Version</Text>
              <Text style={s.infoValue}>2.4.0 (BETA)</Text>
            </View>

            <TouchableOpacity style={s.infoRowClickable} activeOpacity={0.7}>
              <Text style={s.infoText}>Terms of Service</Text>
              <ChevronRightIcon color="#C8C6C5" size={14} />
            </TouchableOpacity>

            <TouchableOpacity style={s.infoRowClickable} activeOpacity={0.7}>
              <Text style={s.infoText}>Privacy Policy</Text>
              <ChevronRightIcon color="#C8C6C5" size={14} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Logout Button */}
        <View style={s.logoutWrap}>
          <TouchableOpacity
            style={s.logoutButton}
            activeOpacity={0.8}
            onPress={() => alert('Logged out')}
          >
            <LogoutIcon color="#FFFFFF" size={16} />
            <Text style={s.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
          <Text style={s.loggedInAs}>LOGGED IN AS MSTERLING@PLAYERNATION.TECH</Text>
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
        activeScreen="Settings"
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
    fontFamily: SORA_EXTRABOLD,
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
  titleWrap: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 16,
  },
  pageTitle: {
    fontFamily: SORA_BOLD,
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  pageSubtitle: {
    fontFamily: INTER,
    fontSize: 13,
    color: '#C8C6C5',
    marginTop: 4,
    lineHeight: 18,
  },
  accountCard: {
    marginHorizontal: 16,
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#2D2D2D',
    borderRadius: 8,
    paddingVertical: 12,
    marginBottom: 20,
  },
  accountHero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  coachAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: '#D7FF00',
  },
  coachName: {
    fontFamily: SORA_BOLD,
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  coachId: {
    fontFamily: MONO_BOLD,
    fontSize: 9,
    fontWeight: '700',
    color: '#D7FF00',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  accountDivider: {
    height: 1,
    backgroundColor: '#2D2D2D',
    marginVertical: 12,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  actionText: {
    fontFamily: INTER,
    fontSize: 14,
    color: '#FFFFFF',
  },
  section: {
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
    paddingLeft: 4,
  },
  sectionLabel: {
    fontFamily: MONO_BOLD,
    fontSize: 10,
    fontWeight: '700',
    color: '#C8C6C5',
    letterSpacing: 1,
  },
  listContainer: {
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#2D2D2D',
    borderRadius: 8,
    overflow: 'hidden',
  },
  rowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2D2D2D',
  },
  rowTitle: {
    fontFamily: INTER_BOLD,
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  rowSubtitle: {
    fontFamily: INTER,
    fontSize: 12,
    color: '#C8C6C5',
    marginTop: 2,
  },
  usageCard: {
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#2D2D2D',
    borderRadius: 8,
    padding: 16,
  },
  usageLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  usageTitle: {
    fontFamily: INTER,
    fontSize: 14,
    color: '#FFFFFF',
  },
  usageDetails: {
    fontFamily: MONO_BOLD,
    fontSize: 10,
    fontWeight: '700',
    color: '#D7FF00',
    letterSpacing: 0.5,
  },
  progressBarWrap: {
    height: 4,
    backgroundColor: '#2D2D2D',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#D7FF00',
    borderRadius: 2,
  },
  clearBtn: {
    borderWidth: 1,
    borderColor: 'rgba(215,255,0,0.2)',
    paddingVertical: 10,
    borderRadius: 4,
    alignItems: 'center',
  },
  clearBtnText: {
    fontFamily: MONO_BOLD,
    fontSize: 11,
    fontWeight: '700',
    color: '#D7FF00',
    letterSpacing: 1,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2D2D2D',
  },
  infoRowClickable: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2D2D2D',
  },
  infoText: {
    fontFamily: INTER,
    fontSize: 14,
    color: '#FFFFFF',
  },
  infoValue: {
    fontFamily: MONO_BOLD,
    fontSize: 10,
    fontWeight: '700',
    color: '#C8C6C5',
    letterSpacing: 0.5,
  },
  logoutWrap: {
    paddingHorizontal: 16,
    marginTop: 12,
  },
  logoutButton: {
    backgroundColor: '#93000a',
    borderWidth: 1,
    borderColor: '#FF4B4B',
    paddingVertical: 14,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  logoutButtonText: {
    fontFamily: SORA_BOLD,
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  loggedInAs: {
    textAlign: 'center',
    fontFamily: MONO_BOLD,
    fontSize: 9,
    fontWeight: '700',
    color: '#C8C6C5',
    opacity: 0.5,
    letterSpacing: 0.5,
    marginTop: 12,
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
