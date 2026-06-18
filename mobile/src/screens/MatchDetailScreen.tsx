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
import { useAppStore, Match } from '../store/store';
import SidebarDrawer from './SidebarDrawer';
import {
  MenuIcon,
  ProfileIcon,
  RefreshIcon,
  WarningIcon,
  ShieldIcon,
  SoccerIcon,
  SubIcon,
  AnalyticsIcon,
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

// Design System Tokens (exactly matching Stitch screenshots)
const C = {
  obsidian:             '#000000',
  charcoal:             '#1A1A1A',
  steel:                '#2D2D2D',
  neonLime:             '#D7FF00',
  onSurface:            '#E5E2E1',
  secondary:            '#C8C6C5',
  outline:              '#8F9378',
  surfaceContainer:     '#201F1F',
  surfaceContainerHigh: '#2A2A2A',
  errorRed:             '#FF4B4B',
  successGreen:         '#00E676',
  glass:                'rgba(26,26,26,0.92)',
  glassStroke:          'rgba(255,255,255,0.08)',
  glassStrokeBright:    'rgba(255,255,255,0.12)',
};

// Team Badge URLs (same as MatchListScreen)
const TEAM_BADGE_URLS: Record<string, string> = {
  'Argentina':      'https://r2.thesportsdb.com/images/media/team/badge/3zplhu1726167477.png',
  'France':         'https://r2.thesportsdb.com/images/media/team/badge/p3n0z51726166851.png',
  'Croatia':        'https://r2.thesportsdb.com/images/media/team/badge/vvtsyu1455465317.png',
  'Brazil':         'https://r2.thesportsdb.com/images/media/team/badge/jl6dip1726167280.png',
  'Belgium':        'https://r2.thesportsdb.com/images/media/team/badge/8xlvxv1592062265.png',
  'England':        'https://r2.thesportsdb.com/images/media/team/badge/vf5ttc1726166739.png',
  'Uruguay':        'https://r2.thesportsdb.com/images/media/team/badge/6vjbr11726167756.png',
  'Russia':         'https://r2.thesportsdb.com/images/media/team/badge/nz50i51689197440.png',
  'Portugal':       'https://r2.thesportsdb.com/images/media/team/badge/swqvpy1455466083.png',
  'Spain':          'https://r2.thesportsdb.com/images/media/team/badge/ncgqyr1726166942.png',
  'Sweden':         'https://r2.thesportsdb.com/images/media/team/badge/h5adzg1591981772.png',
  'Mexico':         'https://r2.thesportsdb.com/images/media/team/badge/3rmosi1748525208.png',
  'Switzerland':    'https://r2.thesportsdb.com/images/media/team/badge/mb7yqe1717365808.png',
  'Denmark':        'https://r2.thesportsdb.com/images/media/team/badge/e13arj1717365623.png',
  'Colombia':       'https://r2.thesportsdb.com/images/media/team/badge/4ymyku1691180081.png',
  'Japan':          'https://r2.thesportsdb.com/images/media/team/badge/ffsyxz1591989843.png',
  'Senegal':        'https://r2.thesportsdb.com/images/media/team/badge/slayb01780546342.png',
  'Poland':         'https://r2.thesportsdb.com/images/media/team/badge/ttvrxy1455466076.png',
  'Germany':        'https://r2.thesportsdb.com/images/media/team/badge/1xysi51726167152.png',
  'Nigeria':        'https://r2.thesportsdb.com/images/media/team/badge/qruyxr1455466056.png',
  'Costa Rica':     'https://r2.thesportsdb.com/images/media/team/badge/bss90a1637840151.png',
  'Korea Republic': 'https://r2.thesportsdb.com/images/media/team/badge/a8nqfs1589564916.png',
  'Peru':           'https://r2.thesportsdb.com/images/media/team/badge/unszat1529144812.png',
  'Iceland':        'https://r2.thesportsdb.com/images/media/team/badge/xc6kuy1742982312.png',
  'Serbia':         'https://r2.thesportsdb.com/images/media/team/badge/oxvynb1689195538.png',
  'Saudi Arabia':   'https://r2.thesportsdb.com/images/media/team/badge/24xwpq1594125742.png',
  'Egypt':          'https://r2.thesportsdb.com/images/media/team/badge/uheyzo1742102234.png',
  'Tunisia':        'https://r2.thesportsdb.com/images/media/team/badge/7r89rg1526727277.png',
  'Iran':           'https://r2.thesportsdb.com/images/media/team/badge/uttpvw1455465617.png',
  'Morocco':        'https://r2.thesportsdb.com/images/media/team/badge/hbmwkj1731791275.png',
  'Australia':      'https://upload.wikimedia.org/wikipedia/en/thumb/b/b1/Football_Federation_Australia_logo.svg/800px-Football_Federation_Australia_logo.svg.png',
  'Panama':         'https://upload.wikimedia.org/wikipedia/en/thumb/3/37/FEPAFUT_Logo.svg/800px-FEPAFUT_Logo.svg.png',
};

function TeamFlag({ teamName, size = 48 }: { teamName: string; size?: number }) {
  const uri = TEAM_BADGE_URLS[teamName];
  const w   = Math.round(size * 1.45);
  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={{ width: w, height: size }}
        resizeMode="contain"
      />
    );
  }
  return (
    <View style={{
      width: w, height: size,
      alignItems: 'center', justifyContent: 'center',
    }}>
      <Text style={{ color: C.onSurface, fontWeight: '900', fontSize: 11, fontFamily: MONO }}>
        {teamName.slice(0, 3).toUpperCase()}
      </Text>
    </View>
  );
}

export default function MatchDetailScreen({ navigation }: any) {
  const { selectedMatch, generateReport, fetchMatchStats } = useAppStore();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [loadingStats, setLoadingStats] = useState(true);
  const [statsData, setStatsData] = useState<any>(null);

  const match = selectedMatch;
  const isArgFra = match?.homeTeam === 'Argentina' && match?.awayTeam === 'France';

  React.useEffect(() => {
    if (match) {
      setLoadingStats(true);
      fetchMatchStats(match.matchId)
        .then((data) => {
          setStatsData(data);
          setLoadingStats(false);
        })
        .catch((err) => {
          console.error('Failed to load match stats:', err);
          setLoadingStats(false);
        });
    }
  }, [match]);

  if (!match) {
    return (
      <SafeAreaView style={s.screen} edges={['top']}>
        <View style={s.center}>
          <Text style={{ color: C.secondary }}>No match selected.</Text>
          <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
            <Text style={s.backBtnText}>BACK TO MATCHES</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Fallback / defaults while loading or if call fails
  const possessionHome = statsData ? statsData.possessionHome : 50;
  const possessionAway = statsData ? statsData.possessionAway : 50;
  const shotsHome = statsData ? statsData.shotsHome : 0;
  const shotsAway = statsData ? statsData.shotsAway : 0;
  const foulsHome = statsData ? statsData.foulsHome : 0;
  const foulsAway = statsData ? statsData.foulsAway : 0;
  const foulsCount = statsData ? (foulsHome + foulsAway) : 0;
  const foulsText = statsData ? statsData.foulsText : 'Tactical duel';

  interface PlayerLineupItem {
    number: string;
    name: string;
    role?: string;
    goals?: string;
    sub?: boolean;
  }

  const homeLineup: PlayerLineupItem[] = statsData ? statsData.homeLineup : [];
  const awayLineup: PlayerLineupItem[] = statsData ? statsData.awayLineup : [];

  const handleGenerateReport = () => {
    generateReport(match.matchId);
    navigation.navigate('Report');
  };

  const formattedDate = () => {
    const parts = match.date.split('-');
    const MONTHS = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
    return parts.length === 3
      ? `${parts[0] === '2022' ? 'DEC 18, 2022' : `${MONTHS[parseInt(parts[1], 10) - 1]} ${parseInt(parts[2], 10)}, ${parts[0]}`}`
      : match.date;
  };

  const cleanPlayerName = (name: string) => {
    if (!name) return '';
    try {
      // Decode potential JSON double-escaped unicode sequences (e.g. \u0160 -> Š)
      let decoded = name;
      if (name.includes('\\u')) {
        decoded = JSON.parse(`"${name}"`);
      }
      return decoded
        .replace(/[\u0160Š]/g, 'S')
        .replace(/[\u0106Ć]/g, 'C')
        .replace(/[\u010dČ]/g, 'C')
        .replace(/[\u017dŽ]/g, 'Z')
        .replace(/[\u0161š]/g, 's')
        .replace(/[\u0107ć]/g, 'c')
        .replace(/[\u010fč]/g, 'c')
        .replace(/[\u017ež]/g, 'z')
        .replace(/[\u00e1á\u00e0à\u00e2â\u00e3ã\u00e4ä]/g, 'a')
        .replace(/[\u00e9é\u00e8è\u00eaê\u00ebë]/g, 'e')
        .replace(/[\u00edí\u00ecì\u00eeî\u00efï]/g, 'i')
        .replace(/[\u00f3ó\u00f2ò\u00f4ô\u00f5õ\u00f6ö]/g, 'o')
        .replace(/[\u00faú\u00f9ù\u00fbû\u00fcü]/g, 'u');
    } catch {
      return name
        .replace(/\\u0160/g, 'S')
        .replace(/Š/g, 'S');
    }
  };

  return (
    <SafeAreaView style={s.screen} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={C.obsidian} />

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.headerBtn} onPress={() => setIsDrawerOpen(true)} activeOpacity={0.7}>
          <MenuIcon size={22} color={C.neonLime} />
        </TouchableOpacity>

        <Image
          source={require('../../assets/PlayerNationCrop1.png')}
          style={s.logoImage}
          resizeMode="contain"
        />

        <TouchableOpacity style={s.headerBtn} onPress={() => navigation.navigate('Profile')} activeOpacity={0.7}>
          <ProfileIcon size={20} color={C.neonLime} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {/* Scoreboard Block (Transparent container matching design detail screenshot) */}
        <View style={[s.scoreboardCard, { backgroundColor: 'transparent', borderWidth: 0, paddingBottom: 0 }]}>
          <View style={s.scoreboardRow}>
            {/* Home */}
            <View style={s.scoreboardTeam}>
              <View style={s.flagCircle}>
                <TeamFlag teamName={match.homeTeam} size={48} />
              </View>
              <Text style={s.teamCodeText}>{match.homeTeam.slice(0, 3).toUpperCase()}</Text>
            </View>

            {/* Score */}
            <View style={s.scoreboardScoreWrap}>
              <Text style={s.scoreText}>{match.homeScore} – {match.awayScore}</Text>
              {isArgFra && <Text style={s.penaltyText}>(4 - 2 PEN)</Text>}
              <View style={s.ftBadge}>
                <Text style={s.ftText}>FULL TIME</Text>
              </View>
            </View>

            {/* Away */}
            <View style={s.scoreboardTeam}>
              <View style={s.flagCircle}>
                <TeamFlag teamName={match.awayTeam} size={48} />
              </View>
              <Text style={s.teamCodeText}>{match.awayTeam.slice(0, 3).toUpperCase()}</Text>
            </View>
          </View>

          {/* Subtext info */}
          <Text style={s.scoreboardInfo}>
            {match.competition.toUpperCase()} • {formattedDate().toUpperCase()}{'\n'}
            {match.venue.toUpperCase()}
          </Text>
        </View>

        {/* Stats Section: Possession */}
        <View style={s.statsSection}>
          <View style={s.statsHeader}>
            <Text style={s.statsLabel}>POSSESSION</Text>
            <RefreshIcon size={12} color={C.neonLime} />
          </View>

          <View style={s.possessionRow}>
            {/* Home Side */}
            <View style={{ width: '22%', alignItems: 'flex-start' }}>
              <Text style={s.possessionVal}>{possessionHome}%</Text>
              <Text style={s.possessionCode}>{match.homeTeam.slice(0, 3).toUpperCase()}</Text>
            </View>

            {/* Bar Track */}
            <View style={s.possessionTrack}>
              <View style={[s.possessionBarHome, { width: `${possessionHome}%` }]} />
              <View style={[s.possessionBarAway, { width: `${possessionAway}%` }]} />
            </View>

            {/* Away Side */}
            <View style={{ width: '22%', alignItems: 'flex-end' }}>
              <Text style={[s.possessionVal, { textAlign: 'right' }]}>{possessionAway}%</Text>
              <Text style={[s.possessionCode, { textAlign: 'right' }]}>{match.awayTeam.slice(0, 3).toUpperCase()}</Text>
            </View>
          </View>
        </View>

        {/* Stats Grid: Shots & Fouls */}
        <View style={s.grid}>
          {/* Shots Card */}
          <View style={s.gridCard}>
            <Text style={s.gridCardTitle}>SHOTS</Text>
            <Text style={s.gridCardValue}>
              {shotsHome} <Text style={{ color: C.secondary, fontSize: 13 }}>/ {shotsAway}</Text>
            </Text>
            <View style={s.shotsTrack}>
              <View style={[s.shotsBar, { width: `${(shotsHome / (shotsHome + shotsAway)) * 100}%` }]} />
            </View>
          </View>

          {/* Fouls Card */}
          <View style={s.gridCard}>
            <Text style={s.gridCardTitle}>FOULS</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
              <Text style={s.gridCardValue}>{foulsCount}</Text>
              <WarningIcon size={14} color={C.errorRed} />
            </View>
            <Text style={s.foulsSubtext}>{foulsText}</Text>
          </View>
        </View>

        {/* Team Lineups */}
        <View style={s.lineupHeaderRow}>
          <Text style={s.lineupHeaderTitle}>TEAM LINEUPS</Text>
          <TouchableOpacity activeOpacity={0.7}>
            <Text style={s.tacticalViewLink}>TACTICAL VIEW</Text>
          </TouchableOpacity>
        </View>

        {/* Lineups List */}
        <View style={s.lineupsContainer}>
          {/* Home Team Squad */}
          <View style={s.lineupCard}>
            <Text style={s.lineupCardTitle}>{match.homeTeam.toUpperCase()}  <Text style={s.formationText}>4-3-3</Text></Text>
            <View style={s.playerList}>
              {homeLineup.map((p, i) => (
                <View key={i} style={s.playerRow}>
                  <Text style={[s.playerNum, p.number === '10' && s.playerNumActive]}>{p.number}</Text>
                  <Text style={[s.playerName, p.number === '10' && s.playerNameActive]}>{cleanPlayerName(p.name)}</Text>
                  {p.role === 'shield' && <ShieldIcon size={12} color={C.secondary} />}
                  {p.goals && (
                    <View style={{ flexDirection: 'row', gap: 2 }}>
                      {Array.from({ length: p.goals.split('⚽').length - 1 }).map((_, idx) => (
                        <SoccerIcon key={idx} size={12} color={C.neonLime} />
                      ))}
                    </View>
                  )}
                </View>
              ))}
            </View>
          </View>

          {/* Away Team Squad */}
          <View style={s.lineupCard}>
            <Text style={s.lineupCardTitle}>{match.awayTeam.toUpperCase()}  <Text style={s.formationText}>4-2-3-1</Text></Text>
            <View style={s.playerList}>
              {awayLineup.map((p, i) => (
                <View key={i} style={s.playerRow}>
                  <Text style={[s.playerNum, p.number === '10' && s.playerNumActive]}>{p.number}</Text>
                  <Text style={[s.playerName, p.number === '10' && s.playerNameActive]}>{cleanPlayerName(p.name)}</Text>
                  {p.role === 'shield' && <ShieldIcon size={12} color={C.secondary} />}
                  {p.goals && (
                    <View style={{ flexDirection: 'row', gap: 2 }}>
                      {Array.from({ length: p.goals.split('⚽').length - 1 }).map((_, idx) => (
                        <SoccerIcon key={idx} size={12} color={C.neonLime} />
                      ))}
                    </View>
                  )}
                  {p.sub && <SubIcon size={12} color={C.neonLime} />}
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Stadium Feature Image with Generate AI Report Button overlay */}
        <View style={s.stadiumCard}>
          <Image
            source={require('../../assets/FootballStadium.jpg')}
            style={s.stadiumImage}
          />
          <View style={s.stadiumOverlay}>
            <View style={s.stadiumBadgeFloating}>
              <Text style={s.stadiumBadgeText}>{match.venue.toUpperCase()} LIVE</Text>
            </View>
            <TouchableOpacity style={s.generateReportBtn} activeOpacity={0.88} onPress={handleGenerateReport}>
              <AnalyticsIcon size={16} color="#0D0D0D" />
              <Text style={[s.generateReportText, { fontWeight: '900' }]}>GENERATE AI REPORT</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Nav Bar */}
      <View style={bn.bar}>
        <TouchableOpacity style={[bn.item, bn.itemActive]} onPress={() => navigation.navigate('MatchList')} activeOpacity={0.7}>
          <SoccerIcon size={20} color={C.neonLime} />
          <Text style={[bn.label, bn.labelActive]}>MATCHES</Text>
        </TouchableOpacity>
        <TouchableOpacity style={bn.item} onPress={() => navigation.navigate('SavedReports')} activeOpacity={0.7}>
          <BookmarkIcon size={18} color={C.secondary} />
          <Text style={bn.label}>SAVED</Text>
        </TouchableOpacity>
        <TouchableOpacity style={bn.item} onPress={() => navigation.navigate('Settings')} activeOpacity={0.7}>
          <SettingsIcon size={18} color={C.secondary} />
          <Text style={bn.label}>SETTINGS</Text>
        </TouchableOpacity>
      </View>

      {/* Sidebar Drawer */}
      <SidebarDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        navigation={navigation}
        activeScreen="MatchList"
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.obsidian },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  backBtn: {
    marginTop: 20,
    backgroundColor: '#D7FF00',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backBtnText: {
    fontFamily: MONO_BOLD,
    color: '#0D0D0D',
    fontWeight: '800',
    fontSize: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 64,
    borderBottomWidth: 1,
    borderBottomColor: '#2D2D2D',
    backgroundColor: C.obsidian,
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
  scroll: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 120,
  },
  scoreboardCard: {
    backgroundColor: 'transparent',
    alignItems: 'center',
    marginBottom: 20,
  },
  flagCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 1.5,
    borderColor: '#2D2D2D',
    backgroundColor: '#0E0E0E',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    padding: 6,
  },
  scoreboardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 16,
  },
  scoreboardTeam: {
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  teamCodeText: {
    fontFamily: SORA_BOLD,
    fontSize: 16,
    fontWeight: '800',
    color: '#E5E2E1',
  },
  scoreboardScoreWrap: {
    alignItems: 'center',
    flex: 1.2,
  },
  scoreText: {
    fontFamily: SORA_EXTRABOLD,
    fontSize: 32,
    fontWeight: '900',
    color: '#D7FF00',
  },
  penaltyText: {
    fontSize: 12,
    fontFamily: MONO,
    color: '#C8C6C5',
    marginTop: 2,
  },
  ftBadge: {
    backgroundColor: '#2D2D2D',
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginTop: 8,
  },
  ftText: {
    fontFamily: MONO_BOLD,
    fontSize: 9,
    fontWeight: '700',
    color: '#E5E2E1',
    letterSpacing: 0.5,
  },
  scoreboardInfo: {
    fontFamily: INTER_MEDIUM,
    textAlign: 'center',
    fontSize: 11,
    lineHeight: 16,
    color: '#C8C6C5',
    fontWeight: '500',
  },
  statsSection: {
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2D2D2D',
    padding: 16,
    marginBottom: 12,
  },
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statsLabel: {
    fontFamily: MONO_BOLD,
    fontSize: 10,
    fontWeight: '700',
    color: '#C8C6C5',
    letterSpacing: 1,
  },
  possessionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  possessionVal: {
    fontFamily: SORA_BOLD,
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  possessionCode: {
    fontFamily: MONO_BOLD,
    fontSize: 10,
    color: '#C8C6C5',
    fontWeight: '600',
  },
  possessionTrack: {
    flex: 1,
    height: 6,
    backgroundColor: '#2D2D2D',
    borderRadius: 3,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  possessionBarHome: {
    height: '100%',
    backgroundColor: '#D7FF00',
  },
  possessionBarAway: {
    height: '100%',
    backgroundColor: '#2D2D2D',
  },
  grid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  gridCard: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2D2D2D',
    padding: 16,
    justifyContent: 'space-between',
  },
  gridCardTitle: {
    fontFamily: MONO,
    fontSize: 10,
    fontWeight: '700',
    color: '#C8C6C5',
    letterSpacing: 1,
  },
  gridCardValue: {
    fontFamily: SORA_BOLD,
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 6,
  },
  shotsTrack: {
    height: 4,
    backgroundColor: '#2D2D2D',
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: 12,
  },
  shotsBar: {
    height: '100%',
    backgroundColor: '#D7FF00',
    borderRadius: 2,
  },
  foulsSubtext: {
    fontFamily: INTER,
    fontSize: 11,
    color: '#C8C6C5',
    marginTop: 6,
    fontWeight: '500',
  },
  lineupHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  lineupHeaderTitle: {
    fontFamily: SORA_BOLD,
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  tacticalViewLink: {
    fontFamily: MONO,
    fontSize: 10,
    fontWeight: '700',
    color: '#D7FF00',
    letterSpacing: 0.5,
  },
  lineupsContainer: {
    gap: 12,
    marginBottom: 20,
  },
  lineupCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2D2D2D',
    padding: 16,
  },
  lineupCardTitle: {
    fontFamily: SORA_BOLD,
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#2D2D2D',
    paddingBottom: 10,
    marginBottom: 10,
  },
  formationText: {
    fontFamily: INTER_MEDIUM,
    color: '#C8C6C5',
    fontWeight: '500',
    fontSize: 11,
  },
  playerList: {
    gap: 8,
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 2,
  },
  playerNum: {
    fontFamily: MONO,
    fontSize: 12,
    fontWeight: '700',
    color: '#C8C6C5',
    width: 20,
  },
  playerNumActive: {
    color: '#D7FF00',
  },
  playerName: {
    fontFamily: INTER,
    fontSize: 13,
    color: '#E5E2E1',
    flex: 1,
  },
  playerNameActive: {
    fontFamily: INTER_BOLD,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  stadiumCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2D2D2D',
    height: 180,
    position: 'relative',
    overflow: 'hidden',
    marginTop: 10,
  },
  stadiumImage: {
    width: '100%',
    height: '100%',
    opacity: 0.5,
  },
  stadiumOverlay: {
    ...StyleSheet.absoluteFillObject,
    padding: 16,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stadiumBadgeFloating: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(13,13,13,0.85)',
    borderWidth: 1,
    borderColor: '#2D2D2D',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
  },
  stadiumBadgeText: {
    fontFamily: MONO,
    fontSize: 9,
    fontWeight: '700',
    color: '#C8C6C5',
    letterSpacing: 1,
  },
  generateReportBtn: {
    backgroundColor: '#D7FF00',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 4,
    gap: 8,
    width: '100%',
    justifyContent: 'center',
  },
  generateReportText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0D0D0D',
    letterSpacing: 0.5,
  },
});

const bn = StyleSheet.create({
  bar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: C.obsidian,
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
