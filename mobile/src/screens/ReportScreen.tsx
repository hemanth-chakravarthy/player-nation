import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  Image,
  Text,
  Animated,
  Platform,
  Dimensions,
  ImageBackground,
  Share,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { useAppStore } from '../store/store';
import { SafeAreaView } from 'react-native-safe-area-context';
import SidebarDrawer from './SidebarDrawer';
import {
  SoccerIcon,
  BookmarkIcon,
  SettingsIcon,
  WarningIcon,
  RefreshIcon,
  ChevronLeftIcon,
  MenuIcon,
  ProfileIcon,
  AnalyticsIcon,
  ClockIcon,
  StarIcon,
  TrendUpIcon,
  ShareIcon,
} from './Icons';

const SparkleIcon = ({ size = 14, color = '#D7FF00' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <Path d="M12 2L14.8 9.2L22 12L14.8 14.8L12 22L9.2 14.8L2 12L9.2 9.2L12 2Z" />
  </Svg>
);

const StarCircleIcon = ({ size = 14, color = '#D7FF00' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <Circle cx="12" cy="12" r="10" />
    <Path d="M12 6.5l1.8 3.7 4.1.6-3 2.9.7 4.1-3.6-1.9-3.6 1.9.7-4.1-3-2.9 4.1-.6z" fill={color} />
  </Svg>
);

const { width: W } = Dimensions.get('window');

// --- Design System Tokens ---
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
  neonAlpha10:          'rgba(215,255,0,0.10)',
  neonAlpha20:          'rgba(215,255,0,0.20)',
  neonAlpha25:          'rgba(215,255,0,0.25)',
};

const MONO = 'JetBrainsMono-Regular';
const MONO_BOLD = 'JetBrainsMono-Bold';
const SORA = 'Sora-Regular';
const SORA_BOLD = 'Sora-Bold';
const SORA_EXTRABOLD = 'Sora-ExtraBold';
const INTER = 'Inter-Regular';
const INTER_MEDIUM = 'Inter-Medium';
const INTER_BOLD = 'Inter-Bold';

// ─── Team Badge URLs ─────────────────────────────────────────────────────────────
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

// ─── TeamFlag ────────────────────────────────────────────────────────────────────
function TeamFlag({ teamName, size = 48 }: { teamName: string; size?: number }) {
  const uri = TEAM_BADGE_URLS[teamName];
  const w   = Math.round(size * 1.45);
  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={{ width: w, height: size, borderRadius: 4, borderWidth: 1, borderColor: C.steel }}
        resizeMode="contain"
      />
    );
  }
  return (
    <View style={{
      width: w, height: size, borderRadius: 4,
      backgroundColor: C.surfaceContainerHigh,
      borderWidth: 1, borderColor: C.steel,
      alignItems: 'center', justifyContent: 'center',
    }}>
      <Text style={{ color: C.onSurface, fontWeight: '900', fontSize: 11, fontFamily: MONO }}>
        {teamName.slice(0, 3).toUpperCase()}
      </Text>
    </View>
  );
}

// ─── Moment Meta (accent color + label) ─────────────────────────────────────────
function getMomentMeta(text: string): { accent: string; label: string } {
  const t = text.toLowerCase();
  if (t.includes('red card') || t.includes('sent off'))           return { accent: '#FF4B4B', label: 'RED CARD' };
  if (t.includes('own goal'))                                      return { accent: '#8D6E63', label: 'OWN GOAL' };
  if (t.includes('penalty'))                                       return { accent: '#42A5F5', label: 'PENALTY'  };
  if (t.includes('winner') || t.includes('winning'))              return { accent: '#FFD740', label: 'WINNER'   };
  if (t.includes('equaliz') || t.includes('equalise') || t.includes('equali')) return { accent: '#FF9800', label: 'EQUALIZER' };
  if (t.includes('save') || t.includes('kept'))                   return { accent: '#00E676', label: 'SAVE'     };
  return { accent: C.neonLime, label: 'GOAL' };
}

// ─── Section Header row ──────────────────────────────────────────────────────────
function SectionHeader({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <View style={sh.row}>
      <View style={sh.iconWrap}>{icon}</View>
      <Text style={sh.label}>{label}</Text>
    </View>
  );
}
const sh = StyleSheet.create({
  row:     { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  iconWrap: { width: 20, alignItems: 'center' },
  label:   { fontFamily: MONO, fontSize: 11, fontWeight: '700', color: C.neonLime, letterSpacing: 1.2 },
});

// ─── Glass Card (for executive summary, team analysis) ──────────────────────────
function GlassCard({ children }: { children: React.ReactNode }) {
  return <View style={gc.card}>{children}</View>;
}
const gc = StyleSheet.create({
  card: {
    backgroundColor:  C.glass,
    borderRadius:     12,
    borderWidth:       1,
    borderColor:      C.glassStroke,
    borderTopColor:   C.glassStrokeBright,
    padding:          18,
    marginBottom:     20,
  },
});

// ─── Bottom Nav ──────────────────────────────────────────────────────────────────
function BottomNav({ activeTab = 'matches', navigation }: { activeTab?: string; navigation: any }) {
  return (
    <View style={bn.bar}>
      <TouchableOpacity
        style={[bn.item, activeTab === 'matches'  && bn.itemActive]}
        onPress={() => navigation.navigate('MatchList')}
        activeOpacity={0.7}
      >
        <SoccerIcon size={20} color={activeTab === 'matches'  ? C.neonLime : C.secondary} />
        <Text style={[bn.label, activeTab === 'matches'  && bn.labelActive]}>MATCHES</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[bn.item, activeTab === 'saved'    && bn.itemActive]}
        onPress={() => navigation.navigate('SavedReports')}
        activeOpacity={0.7}
      >
        <BookmarkIcon size={18} color={activeTab === 'saved'    ? C.neonLime : C.secondary} />
        <Text style={[bn.label, activeTab === 'saved'    && bn.labelActive]}>SAVED</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[bn.item, activeTab === 'settings' && bn.itemActive]}
        onPress={() => navigation.navigate('Settings')}
        activeOpacity={0.7}
      >
        <SettingsIcon size={18} color={activeTab === 'settings' ? C.neonLime : C.secondary} />
        <Text style={[bn.label, activeTab === 'settings' && bn.labelActive]}>SETTINGS</Text>
      </TouchableOpacity>
    </View>
  );
}
const bn = StyleSheet.create({
  bar: {
    flexDirection: 'row', backgroundColor: C.obsidian,
    borderTopWidth: 1, borderTopColor: C.steel,
    paddingBottom: 10, paddingTop: 6, paddingHorizontal: 8,
    justifyContent: 'space-around',
  },
  item:      { flex: 1, alignItems: 'center', paddingVertical: 6, borderRadius: 10, gap: 3 },
  itemActive: { backgroundColor: C.surfaceContainer },
  label:     { fontFamily: MONO, fontSize: 9, fontWeight: '700', color: C.secondary, letterSpacing: 0.8, marginTop: 1 },
  labelActive: { color: C.neonLime },
});

// ─── Animated Loading Screen ─────────────────────────────────────────────────────
function LoadingScreen({ loadingMessage }: { loadingMessage: string }) {
  // Bouncing dots
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  // Progress bar
  const progressAnim = useRef(new Animated.Value(0)).current;

  const progressMap: Record<string, number> = {
    'Extracting match event streams...':       0.15,
    'Aggregating possession and pass metrics...': 0.35,
    'Computing player ratings...':             0.55,
    'Building chronological timeline...':      0.70,
    'Prompting AI for narrative report...':    0.85,
    'Polishing insights and final analysis...': 0.98,
  };

  useEffect(() => {
    // Start bouncing dots
    const makeBounce = (dot: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, { toValue: -10, duration: 300, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0,   duration: 300, useNativeDriver: true }),
          Animated.delay(Math.max(0, 600 - delay)),
        ])
      );

    const a1 = makeBounce(dot1, 0);
    const a2 = makeBounce(dot2, 150);
    const a3 = makeBounce(dot3, 300);
    a1.start(); a2.start(); a3.start();

    return () => { a1.stop(); a2.stop(); a3.stop(); };
  }, []);

  useEffect(() => {
    const target = progressMap[loadingMessage] ?? 0.08;
    Animated.timing(progressAnim, {
      toValue:  target,
      duration: 800,
      useNativeDriver: false,
    }).start();
  }, [loadingMessage]);

  const barWidth = progressAnim.interpolate({
    inputRange:  [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={ls.screen}>
      <StatusBar barStyle="light-content" backgroundColor={C.obsidian} />

      {/* Ball icon */}
      <View style={ls.ballWrap}>
        <SoccerIcon size={42} color={C.neonLime} />
      </View>

      {/* Headline */}
      <Text style={ls.headline}>{loadingMessage || 'Analyzing match data...'}</Text>

      {/* Bouncing dots */}
      <View style={ls.dotsRow}>
        {[dot1, dot2, dot3].map((dot, i) => (
          <Animated.View
            key={i}
            style={[ls.dot, { transform: [{ translateY: dot }] }]}
          />
        ))}
      </View>

      {/* Glass terminal card */}
      <View style={ls.terminalCard}>
        <View style={ls.terminalHeader}>
          <Text style={ls.terminalLabel}>TACTICAL ENGINE v2.4</Text>
          <Text style={ls.terminalLive}>LIVE_DATA</Text>
        </View>

        <View style={ls.terminalRow}>
          <AnalyticsIcon size={14} color={C.neonLime} />
          <Text style={ls.terminalSubtext}>Correlating positional data with ball metrics</Text>
        </View>

        <Text style={ls.terminalBody}>Analysing 2,400+ on-field events…</Text>

        {/* Progress bar */}
        <View style={ls.progressTrack}>
          <Animated.View style={[ls.progressBar, { width: barWidth }]} />
        </View>
      </View>

      {/* Footer */}
      <Text style={ls.footer}>PLAYERNATION AI</Text>
    </View>
  );
}

const ls = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: C.obsidian,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  ballWrap: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: C.charcoal,
    borderWidth: 1, borderColor: C.neonAlpha25,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 28,
  },
  headline: {
    fontSize:     20,
    fontWeight:   '700',
    color:        C.onSurface,
    textAlign:    'center',
    letterSpacing: -0.3,
    marginBottom:  16,
    paddingHorizontal: 8,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:            8,
    marginBottom:  32,
  },
  dot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: C.neonLime,
  },
  terminalCard: {
    width:           '100%',
    backgroundColor: C.glass,
    borderRadius:    12,
    borderWidth:      1,
    borderColor:     C.glassStroke,
    borderTopColor:  C.glassStrokeBright,
    padding:         20,
    marginBottom:    32,
  },
  terminalHeader: {
    flexDirection:   'row',
    alignItems:      'center',
    justifyContent:  'space-between',
    paddingBottom:   12,
    marginBottom:    12,
    borderBottomWidth: 1,
    borderBottomColor: C.steel,
  },
  terminalLabel: {
    fontFamily:   MONO,
    fontSize:     10,
    fontWeight:   '700',
    color:        C.secondary,
    letterSpacing: 1,
  },
  terminalLive: {
    fontFamily:   MONO,
    fontSize:     10,
    fontWeight:   '700',
    color:        C.neonLime,
    letterSpacing: 0.5,
  },
  terminalRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:            10,
    marginBottom:   8,
  },
  terminalSubtext: {
    flex:      1,
    fontFamily: MONO,
    fontSize:   11,
    color:      C.secondary,
    letterSpacing: 0.3,
  },
  terminalBody: {
    fontSize:   12,
    color:      C.outline,
    marginBottom: 16,
    lineHeight:  17,
  },
  progressTrack: {
    height:          2,
    backgroundColor: C.steel,
    borderRadius:    1,
    overflow:        'hidden',
  },
  progressBar: {
    height:          2,
    backgroundColor: C.neonLime,
    borderRadius:    1,
  },
  footer: {
    fontFamily:   MONO,
    fontSize:     10,
    fontWeight:   '700',
    color:        C.outline,
    letterSpacing: 2,
    opacity:      0.5,
  },
});

// ─── Main Report Screen ──────────────────────────────────────────────────────────
export default function ReportScreen({ navigation }: any) {
  const { report, isLoading, loadingMessage, error, selectedMatch, generateReport, clearReport, saveReport } =
    useAppStore();

  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);

  const handleRetry  = () => { if (selectedMatch) generateReport(selectedMatch.matchId); };
  const handleGoBack = () => { clearReport(); navigation.goBack(); };

  const handleShare = async () => {
    if (!report) return;
    try {
      const shareMessage = `⚽ PLAYERNATION AI MATCH REPORT ⚽\n\n` +
        `MATCH: ${report.homeTeam} vs ${report.awayTeam}\n` +
        `RESULT: ${report.score}\n` +
        `VENUE: ${selectedMatch?.venue ?? 'Unknown Stadium'}\n` +
        `DATE: ${selectedMatch?.date ?? 'Unknown Date'}\n\n` +
        `----------------------------------------\n\n` +
        `💡 EXECUTIVE SUMMARY:\n` +
        `${report.report.summary}\n\n` +
        `----------------------------------------\n\n` +
        `⚡ TURNING POINTS:\n` +
        `${report.report.keyMoments.map(m => `• ${m}`).join('\n')}\n\n` +
        `----------------------------------------\n\n` +
        `⭐ STANDOUT PERFORMERS:\n` +
        `${report.report.standoutPlayers.map(p => `• ${p}`).join('\n')}\n\n` +
        `----------------------------------------\n\n` +
        `📈 TEAM ANALYSIS:\n` +
        `${report.report.teamAnalysis}\n\n` +
        `----------------------------------------\n\n` +
        `🧠 TACTICAL INSIGHTS:\n` +
        `${report.report.recommendations.map((rec, i) => `${i + 1}. ${rec}`).join('\n')}\n\n` +
        `----------------------------------------\n\n` +
        `Powered by PlayerNation AI`;

      await Share.share({
        message: shareMessage,
      });
    } catch (error) {
      console.error('Failed to share report:', error);
    }
  };

  const handleSave = async () => {
    if (!report) return;
    try {
      const fullReportData = {
        matchId: selectedMatch?.matchId ?? Date.now(),
        homeTeam: report.homeTeam,
        awayTeam: report.awayTeam,
        score: report.score,
        competition: selectedMatch?.competition ?? 'FIFA World Cup 2018',
        date: selectedMatch?.date ?? '',
        venue: selectedMatch?.venue ?? '',
        report: report.report
      };
      await saveReport(fullReportData);
      alert('Report Saved Successfully!');
    } catch (error) {
      console.error('Failed to save report:', error);
      alert('Failed to save report.');
    }
  };

  // ── Loading ────────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: C.obsidian }} edges={['top']}>
        <LoadingScreen loadingMessage={loadingMessage} />
      </SafeAreaView>
    );
  }

  // ── Error ──────────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <SafeAreaView style={[gs.screen, gs.center]} edges={['top']}>
        <StatusBar barStyle="light-content" backgroundColor={C.obsidian} />
        <View style={[ls.ballWrap, { borderColor: 'rgba(255,75,75,0.3)' }]}>
          <WarningIcon size={36} color={C.errorRed} />
        </View>
        <Text style={[ls.headline, { color: C.errorRed }]}>Report Failed</Text>
        <Text style={{ color: C.secondary, fontSize: 13, textAlign: 'center', lineHeight: 20, paddingHorizontal: 24 }}>
          {error}
        </Text>
        <TouchableOpacity style={act.primary} onPress={handleRetry} activeOpacity={0.85}>
          <RefreshIcon size={16} color="#000" />
          <Text style={act.primaryText}>TRY AGAIN</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[act.secondary, { marginTop: 12 }]} onPress={handleGoBack} activeOpacity={0.8}>
          <ChevronLeftIcon size={16} color={C.neonLime} />
          <Text style={act.secondaryText}>BACK TO MATCHES</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (!report) {
    return (
      <SafeAreaView style={[gs.screen, gs.center]} edges={['top']}>
        <Text style={{ color: C.secondary, fontSize: 14 }}>No report loaded.</Text>
        <TouchableOpacity style={[act.primary, { marginTop: 20 }]} onPress={handleRetry} activeOpacity={0.85}>
          <Text style={act.primaryText}>GENERATE REPORT</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // ── Report ─────────────────────────────────────────────────────────────────────
  const { homeTeam, awayTeam, score, report: rd } = report;
  const [homeScore, awayScore] = score.split('-').map((s) => s.trim());
  const homeNum = parseInt(homeScore, 10);
  const awayNum = parseInt(awayScore, 10);
  const winner  = homeNum > awayNum ? 'home' : awayNum > homeNum ? 'away' : 'draw';

  const homeCode = homeTeam.slice(0, 3).toUpperCase();
  const awayCode = awayTeam.slice(0, 3).toUpperCase();

  // Format competition / date
  const comp      = selectedMatch?.competition ?? '';
  const dateRaw   = selectedMatch?.date ?? '';
  const dateParts = dateRaw.split('-');
  const MONTHS    = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
  const dateFmt   = dateParts.length === 3
    ? `${MONTHS[parseInt(dateParts[1], 10) - 1]} ${parseInt(dateParts[2], 10)}, ${dateParts[0]}`
    : dateRaw;

  return (
    <SafeAreaView style={gs.screen} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={C.obsidian} />

      {/* ── Top Bar ── */}
      <View style={tb.bar}>
        <TouchableOpacity onPress={() => setIsDrawerOpen(true)} style={tb.btn} activeOpacity={0.7}>
          <MenuIcon size={22} color={C.neonLime} />
        </TouchableOpacity>
        <Image
          source={require('../../assets/PlayerNationCrop1.png')}
          style={tb.logoImage}
          resizeMode="contain"
        />
        <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={tb.btn} activeOpacity={0.7}>
          <ProfileIcon size={20} color={C.neonLime} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={gs.scroll}>

        {/* HERO - Report Title */}
        <View style={hero.titleSection}>
          <View style={hero.badgeRow}>
            <View style={hero.finalBadge}>
              <Text style={hero.finalBadgeText}>FINAL REPORT</Text>
            </View>
            <Text style={hero.compText}>{comp.toUpperCase()}</Text>
          </View>

          <Text style={hero.matchTitle} numberOfLines={2}>
            {homeTeam.toUpperCase()} VS {awayTeam.toUpperCase()}
          </Text>

          <Text style={hero.dateLine}>
            {selectedMatch?.venue ? `${selectedMatch.venue}  •  ` : ''}{dateFmt}
          </Text>
        </View>

        {/* EXECUTIVE SUMMARY */}
        <SectionHeader icon={<SparkleIcon size={14} color={C.neonLime} />} label="EXECUTIVE SUMMARY" />
        <GlassCard>
          <Text style={gs.body}>{rd.summary}</Text>
        </GlassCard>

        {/* TURNING POINTS (timeline) */}
        <SectionHeader icon={<TrendUpIcon size={13} color={C.neonLime} />} label="TURNING POINTS" />
        <View style={tl.container}>
          {rd.keyMoments.map((moment, i) => {
            const { accent } = getMomentMeta(moment);
            const isLast = i === rd.keyMoments.length - 1;

            let badge = 'GOAL';
            let title = '';
            let body = moment;

            const dashIdx = moment.indexOf(' - ');
            const colonIdx = moment.indexOf(':');

            if (dashIdx > 0) {
              badge = moment.substring(0, dashIdx).trim();
              if (colonIdx > dashIdx) {
                title = moment.substring(dashIdx + 3, colonIdx).trim();
                body = moment.substring(colonIdx + 1).trim();
              } else {
                body = moment.substring(dashIdx + 3).trim();
              }
            } else if (colonIdx > 0) {
              badge = moment.substring(0, colonIdx).trim();
              body = moment.substring(colonIdx + 1).trim();
            }

            return (
              <View key={i} style={tl.item}>
                {!isLast && <View style={[tl.line, { backgroundColor: C.steel }]} />}
                <View style={[tl.dot, { backgroundColor: accent }]} />
                <View style={tl.content}>
                  <Text style={[tl.label, { color: accent }]}>{badge.toUpperCase()}</Text>
                  {title.length > 0 && <Text style={tl.title}>{title}</Text>}
                  <Text style={tl.text}>{body}</Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* STANDOUT PERFORMERS */}
        <SectionHeader icon={<StarCircleIcon size={14} color={C.neonLime} />} label="STANDOUT PERFORMERS" />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 12, paddingHorizontal: 0, paddingBottom: 4 }}
          style={{ marginBottom: 20 }}
        >
          {rd.standoutPlayers.map((player, i) => {
            const colonIdx  = player.indexOf(':');
            const commaIdx  = player.indexOf(',');
            const splitIdx  = colonIdx > 0 ? colonIdx : commaIdx > 0 ? commaIdx : 30;
            const playerName = player.slice(0, splitIdx).trim();
            const playerDesc = player.slice(splitIdx + 1).trim();
            const rating    = i === 0 ? '9.8' : i === 1 ? '9.4' : `${(8.8 - i * 0.3).toFixed(1)}`;
            
            const MessiUrl = 'https://images.unsplash.com/photo-1544698310-74ea9d1c8258?q=80&w=400&auto=format&fit=crop';
            const MbappeUrl = 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=400&auto=format&fit=crop';
            const GenericUrl = 'https://images.unsplash.com/photo-1518063319789-7217e6706b04?q=80&w=400&auto=format&fit=crop';
            const playerImg = playerName.toLowerCase().includes('messi') ? MessiUrl 
              : playerName.toLowerCase().includes('mbappé') || playerName.toLowerCase().includes('mbappe') ? MbappeUrl 
              : GenericUrl;

            return (
              <ImageBackground
                key={i}
                source={{ uri: playerImg }}
                style={{
                  width: 200,
                  height: 260,
                  borderRadius: 12,
                  overflow: 'hidden',
                  borderWidth: 1,
                  borderColor: C.steel,
                  marginRight: 12,
                  justifyContent: 'flex-end',
                }}
                resizeMode="cover"
              >
                <View style={{ ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.25)' }} />
                <View style={{
                  padding: 16,
                  backgroundColor: 'rgba(13,13,13,0.75)',
                  borderTopWidth: 1,
                  borderTopColor: 'rgba(255,255,255,0.08)',
                }}>
                  <Text style={{ fontSize: 20, fontWeight: '800', color: '#FFFFFF', marginBottom: 6 }} numberOfLines={1}>
                    {playerName}
                  </Text>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ fontSize: 12, color: C.secondary, fontFamily: MONO }}>
                      {playerDesc.toLowerCase().includes('goals') || playerDesc.toLowerCase().includes('scores') ? 'Clinical' : 'Key Player'}
                    </Text>
                    <View style={{ backgroundColor: C.neonLime, borderRadius: 4, paddingHorizontal: 6, paddingVertical: 3 }}>
                      <Text style={{ fontSize: 9, fontWeight: '800', color: '#000000', fontFamily: MONO }}>{rating} RATING</Text>
                    </View>
                  </View>
                </View>
              </ImageBackground>
            );
          })}
        </ScrollView>

        {/* TEAM ANALYSIS */}
        <SectionHeader icon={<TrendUpIcon size={13} color={C.neonLime} />} label="TEAM ANALYSIS" />
        <GlassCard>
          <Text style={gs.body}>{rd.teamAnalysis}</Text>
        </GlassCard>

        {/* TACTICAL INSIGHTS (numbered) */}
        <SectionHeader icon={<TrendUpIcon size={13} color={C.neonLime} />} label="TACTICAL INSIGHTS" />
        <GlassCard>
          {rd.recommendations.map((rec, i) => {
            const isLast   = i === rd.recommendations.length - 1;
            const dotIdx   = rec.indexOf('.');
            const colonIdx = rec.indexOf(':');
            const splitAt  = colonIdx > 0 && colonIdx < 50 ? colonIdx
                           : dotIdx   > 0 && dotIdx   < 60 ? dotIdx
                           : Math.min(60, rec.length);
            const title = rec.slice(0, splitAt).trim();
            const body  = rec.slice(splitAt + 1).trim();
            return (
              <View
                key={i}
                style={[ins.item, !isLast && ins.itemBorder]}
              >
                <View style={ins.numBox}>
                  <Text style={ins.numText}>{String(i + 1).padStart(2, '0')}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  {title.length > 0 && <Text style={ins.title}>{title}</Text>}
                  {body.length > 0  && <Text style={ins.body}>{body}</Text>}
                  {title.length === 0 && body.length === 0 && (
                    <Text style={ins.body}>{rec}</Text>
                  )}
                </View>
              </View>
            );
          })}
        </GlassCard>

        {/* ACTION BUTTONS */}
        <View style={act.row}>
          <TouchableOpacity style={act.primary} activeOpacity={0.88} onPress={handleShare}>
            <ShareIcon size={16} color="#000000" />
            <Text style={act.primaryText}>SHARE REPORT</Text>
          </TouchableOpacity>
          <TouchableOpacity style={act.secondary} onPress={handleSave} activeOpacity={0.88}>
            <BookmarkIcon size={16} color={C.neonLime} />
            <Text style={act.secondaryText}>SAVE REPORT</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <Text style={gs.footer}>Powered by PlayerNation AI  ·  FIFA World Cup 2018</Text>
      </ScrollView>

      <BottomNav activeTab="matches" navigation={navigation} />

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

// ─── Shared Styles ───────────────────────────────────────────────────────────────
const gs = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.obsidian },
  center: { justifyContent: 'center', alignItems: 'center', padding: 30 },
  scroll: { paddingHorizontal: 16, paddingBottom: 40 },
  body:   { fontFamily: INTER, fontSize: 15, color: C.secondary, lineHeight: 24 },
  footer: {
    textAlign:   'center',
    color:        C.outline,
    fontSize:     10,
    fontFamily:  MONO,
    letterSpacing: 0.4,
    marginTop:    8,
    marginBottom: 12,
    opacity:      0.6,
  },
});

// ─── Top Bar ─────────────────────────────────────────────────────────────────────
const tb = StyleSheet.create({
  bar: {
    flexDirection:    'row',
    alignItems:       'center',
    justifyContent:   'space-between',
    paddingHorizontal: 16,
    height:            64,
    borderBottomWidth: 1,
    borderBottomColor: C.steel,
    backgroundColor:   C.obsidian,
  },
  btn:  { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  logo: { fontSize: 20, fontWeight: '900', fontStyle: 'italic', color: C.neonLime, letterSpacing: -0.5 },
  logoImage: {
    height: 140,
    width: 200,
  },
});

// ─── Hero Styles ─────────────────────────────────────────────────────────────────
const hero = StyleSheet.create({
  titleSection: {
    paddingTop:    20,
    paddingBottom: 16,
    gap:            6,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:            10,
    marginBottom:   4,
  },
  finalBadge: {
    backgroundColor: C.neonLime,
    paddingHorizontal: 8,
    paddingVertical:   3,
    borderRadius:      3,
  },
  finalBadgeText: {
    fontFamily:   MONO,
    fontSize:     10,
    fontWeight:   '700',
    color:        '#000000',
    letterSpacing: 1,
  },
  compText: {
    fontFamily:   MONO,
    fontSize:      9,
    fontWeight:   '700',
    color:         C.secondary,
    letterSpacing: 0.8,
  },
  matchTitle: {
    fontFamily:   SORA_EXTRABOLD,
    fontSize:     36,
    fontWeight:   '900',
    color:        '#FFFFFF',
    letterSpacing: -0.5,
    lineHeight:    42,
  },
  dateLine: {
    fontFamily: INTER,
    fontSize:   14,
    color:      C.secondary,
    fontWeight: '400',
    marginTop:  4,
  },
  // Score card
  scoreCard: {
    flexDirection:  'row',
    alignItems:     'center',
    backgroundColor: C.charcoal,
    borderRadius:    8,
    borderWidth:      1,
    borderColor:     C.steel,
    padding:         20,
    marginBottom:    24,
    gap:             8,
  },
  teamBlock: {
    flex:       1,
    alignItems: 'center',
    gap:         8,
  },
  teamCode: {
    fontFamily:   SORA_BOLD,
    fontSize:     16,
    fontWeight:   '800',
    color:        C.onSurface,
    letterSpacing: -0.2,
  },
  winnerChip: {
    backgroundColor: C.neonAlpha10,
    borderRadius:    4,
    paddingHorizontal: 6,
    paddingVertical:   2,
    borderWidth:       1,
    borderColor:      C.neonAlpha25,
  },
  winnerText: {
    fontFamily:   MONO_BOLD,
    fontSize:      9,
    fontWeight:   '700',
    color:         C.neonLime,
    letterSpacing: 0.8,
  },
  scoreCenter: { flex: 1.2, alignItems: 'center', gap: 10 },
  scoreDisplay: {
    fontFamily:   SORA_EXTRABOLD,
    fontSize:     28,
    fontWeight:   '900',
    color:        C.neonLime,
    letterSpacing: 1,
  },
  ftPill: {
    flexDirection:   'row',
    alignItems:      'center',
    gap:              5,
    backgroundColor: C.surfaceContainerHigh,
    borderRadius:    999,
    paddingHorizontal: 10,
    paddingVertical:    4,
    borderWidth:        1,
    borderColor:       C.steel,
  },
  ftDot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: C.neonLime },
  ftText: { fontFamily: MONO_BOLD, fontSize: 9, fontWeight: '700', color: C.neonLime, letterSpacing: 1 },
  statRow: { flexDirection: 'row', gap: 6, marginTop: 4 },
  statPill: {
    flex:             1,
    alignItems:       'center',
    backgroundColor:  C.surfaceContainer,
    borderRadius:      6,
    paddingVertical:   6,
    paddingHorizontal: 4,
    borderWidth:        1,
    borderColor:       C.steel,
  },
  statNum: { fontFamily: SORA_BOLD, fontSize: 14, fontWeight: '800', color: C.neonLime },
  statLbl: { fontFamily: MONO_BOLD, fontSize: 8, color: C.outline, letterSpacing: 0.5, marginTop: 1 },
});

// ─── Timeline Styles ─────────────────────────────────────────────────────────────
const tl = StyleSheet.create({
  container: {
    paddingLeft:    24,
    borderLeftWidth: 1,
    borderLeftColor: C.steel,
    marginBottom:   20,
    marginLeft:     12,
  },
  item: {
    flexDirection: 'column',
    alignItems:    'flex-start',
    marginBottom:  24,
    position:      'relative',
  },
  line: {
    position:        'absolute',
    left:            -24.5,
    top:             12,
    bottom:          -24,
    width:            1,
  },
  dot: {
    width:        8,
    height:       8,
    borderRadius: 4,
    position:     'absolute',
    left:         -28,
    top:           4,
  },
  content: {
    flex:        1,
    marginLeft:   4,
  },
  label: {
    fontFamily:   MONO_BOLD,
    fontSize:     11,
    fontWeight:   '700',
    letterSpacing: 0.8,
    marginBottom:  4,
  },
  title: {
    fontFamily:   SORA_BOLD,
    fontSize:     18,
    fontWeight:   '800',
    color:        '#FFFFFF',
    marginTop:     2,
    marginBottom:  4,
  },
  text: { fontFamily: INTER, fontSize: 13, color: C.secondary, lineHeight: 20 },
});

// ─── Player Card Styles ───────────────────────────────────────────────────────────
const pl = StyleSheet.create({
  card: {
    width:           200,
    backgroundColor: C.charcoal,
    borderRadius:    8,
    borderWidth:      1,
    borderColor:     C.steel,
    overflow:        'hidden',
    flexShrink:       0,
  },
  cardTop: {
    height:          8,
    alignItems:      'flex-start',
    justifyContent:  'center',
    paddingHorizontal: 12,
  },
  rankText: { display: 'none' },  // rank indicated by color only
  cardBody: { padding: 14, gap: 6 },
  playerName: {
    fontFamily:   SORA_BOLD,
    fontSize:     15,
    fontWeight:   '700',
    color:        C.onSurface,
    letterSpacing: -0.2,
  },
  playerDesc: {
    fontFamily: INTER,
    fontSize:   12,
    color:      C.secondary,
    lineHeight:  17,
  },
  ratingChip: {
    alignSelf:       'flex-start',
    backgroundColor: C.neonAlpha10,
    borderRadius:     4,
    paddingHorizontal: 8,
    paddingVertical:   3,
    borderWidth:       1,
    borderColor:      C.neonAlpha25,
    marginTop:         2,
  },
  ratingText: {
    fontFamily:   MONO_BOLD,
    fontSize:      9,
    fontWeight:   '700',
    color:         C.neonLime,
    letterSpacing: 0.8,
  },
});

// ─── Tactical Insights Styles ─────────────────────────────────────────────────────
const ins = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems:    'flex-start',
    gap:            12,
    paddingVertical: 12,
  },
  itemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: C.steel,
  },
  numBox: {
    width:           32, height: 32,
    borderRadius:     4,
    backgroundColor: C.surfaceContainerHigh,
    alignItems:      'center', justifyContent: 'center',
    flexShrink:       0, marginTop: 1,
  },
  numText: {
    fontFamily:   MONO_BOLD,
    fontSize:     11,
    fontWeight:   '700',
    color:        C.neonLime,
    letterSpacing: 0.5,
  },
  title: {
    fontFamily:   SORA_BOLD,
    fontSize:     14,
    fontWeight:   '600',
    color:        C.onSurface,
    marginBottom:  3,
    lineHeight:    20,
  },
  body: { fontFamily: INTER, fontSize: 13, color: C.secondary, lineHeight: 20 },
});

// ─── Action Button Styles ─────────────────────────────────────────────────────────
const act = StyleSheet.create({
  row: {
    flexDirection:   'column',
    gap:              12,
    marginTop:         12,
    marginBottom:     24,
    width:            '100%',
  },
  primary: {
    flexDirection:   'row',
    alignItems:      'center',
    justifyContent:  'center',
    gap:              8,
    backgroundColor: C.neonLime,
    borderRadius:    4,
    paddingVertical:  14,
    width:            '100%',
  },
  primaryText: {
    fontFamily:   MONO_BOLD,
    fontSize:     11,
    fontWeight:   '700',
    color:        '#000000',
    letterSpacing: 1,
  },
  secondary: {
    flexDirection: 'row',
    alignItems:    'center',
    justifyContent: 'center',
    gap:            8,
    borderWidth:    1,
    borderColor:   C.neonLime,
    borderRadius:  4,
    paddingVertical: 14,
    width:            '100%',
  },
  secondaryText: {
    fontFamily:   MONO_BOLD,
    fontSize:     11,
    fontWeight:   '700',
    color:        C.neonLime,
    letterSpacing: 1,
  },
});
