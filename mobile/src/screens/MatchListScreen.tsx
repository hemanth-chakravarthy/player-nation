import React, { useEffect, useState, useMemo } from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  StatusBar,
  TouchableOpacity,
  Image,
  Text,
  TextInput,
  ScrollView,
  Platform,
  Dimensions,
} from 'react-native';
import { useAppStore, Match } from '../store/store';
import { SafeAreaView } from 'react-native-safe-area-context';
import SidebarDrawer from './SidebarDrawer';
import {
  BookmarkIcon,
  SoccerIcon,
  SearchIcon,
  MenuIcon,
  ProfileIcon,
  RefreshIcon,
  WarningIcon,
  AnalyticsIcon,
  SettingsIcon,
} from './Icons';

const { width: W } = Dimensions.get('window');

// ─── Design System Tokens ───────────────────────────────────────────────────────
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
  // glass
  glass:                'rgba(26,26,26,0.92)',
  glassStroke:          'rgba(255,255,255,0.08)',
  glassStrokeBright:    'rgba(255,255,255,0.12)',
  // neon tints
  neonAlpha10:          'rgba(215,255,0,0.10)',
  neonAlpha25:          'rgba(215,255,0,0.25)',
  neonAlpha40:          'rgba(215,255,0,0.40)',
};

// ─── Font helpers ───────────────────────────────────────────────────────────────
const MONO = 'JetBrainsMono-Regular';
const MONO_BOLD = 'JetBrainsMono-Bold';
const SORA = 'Sora-Regular';
const SORA_BOLD = 'Sora-Bold';
const SORA_EXTRABOLD = 'Sora-ExtraBold';
const INTER = 'Inter-Regular';
const INTER_MEDIUM = 'Inter-Medium';
const INTER_BOLD = 'Inter-Bold';

// ─── Team Badge URLs ────────────────────────────────────────────────────────────
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

// ─── TeamFlag ───────────────────────────────────────────────────────────────────
// Shows a rectangular flag-style badge (like Stitch design: w-10 h-7)
function TeamFlag({ teamName, size = 40 }: { teamName: string; size?: number }) {
  const uri = TEAM_BADGE_URLS[teamName];
  const imgW = Math.round(size * 1.45);
  const imgH = size;
  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={{ width: imgW, height: imgH }}
        resizeMode="contain"
      />
    );
  }
  return (
    <View style={{
      width: imgW, height: imgH,
      alignItems: 'center', justifyContent: 'center',
    }}>
      <Text style={{ color: C.onSurface, fontWeight: '900', fontSize: 10, fontFamily: MONO }}>
        {teamName.slice(0, 3).toUpperCase()}
      </Text>
    </View>
  );
}

// ─── Filter Chips ────────────────────────────────────────────────────────────────
const FILTER_CHIPS = [
  { id: 'all',      label: 'ALL MATCHES' },
  { id: 'group',    label: 'GROUP STAGE' },
  { id: 'knockout', label: 'KNOCKOUTS'   },
  { id: 'final',    label: 'FINALS'      },
];

function FilterChips({ active, onSelect }: { active: string; onSelect: (id: string) => void }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={fc.row}
      style={{ marginBottom: 16 }}
    >
      {FILTER_CHIPS.map((chip) => {
        const isActive = chip.id === active;
        return (
          <TouchableOpacity
            key={chip.id}
            onPress={() => onSelect(chip.id)}
            style={[fc.chip, isActive ? fc.chipActive : fc.chipInactive]}
            activeOpacity={0.75}
          >
            <Text style={[fc.chipText, isActive ? fc.chipTextActive : fc.chipTextInactive]}>
              {chip.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const fc = StyleSheet.create({
  row:           { paddingHorizontal: 0, gap: 8, paddingBottom: 2 },
  chip:          { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 6, borderWidth: 1 },
  chipActive:    { backgroundColor: C.neonLime, borderColor: C.neonLime },
  chipInactive:  { backgroundColor: C.charcoal,  borderColor: C.steel },
  chipText:      { fontFamily: MONO, fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  chipTextActive:   { color: '#000000' },
  chipTextInactive: { color: C.secondary },
});

// ─── Match Card ──────────────────────────────────────────────────────────────────
// Styled after the Stitch glass-card design:
// header row: date • stage | bookmark
// body: [flag + code]  home-score | away-score  [code + flag]
// footer: full-width neon-lime CTA button
// ─── Match Card ──────────────────────────────────────────────────────────────────
// Styled after the Stitch glass-card design:
// Featured Card (Large layout) vs Regular Card (Compact inline layout)
function MatchCard({
  item,
  onPress,
  showButton,
  onButtonPress,
}: {
  item: Match;
  onPress: () => void;
  showButton: boolean;
  onButtonPress: () => void;
}) {
  const parts = item.date.split('-');
  const MONTHS = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
  const dateLabel = parts.length === 3
    ? `${MONTHS[parseInt(parts[1], 10) - 1]} ${parseInt(parts[2], 10)}, ${parts[0]}`
    : item.date;

  const comp = item.competition.toUpperCase();
  const stage =
    comp.includes('FINAL') && !comp.includes('SEMI') && !comp.includes('QUARTER') ? 'FINAL'
    : comp.includes('SEMI')         ? 'SEMI-FINAL'
    : comp.includes('QUARTER')      ? 'QUARTER-FINAL'
    : comp.includes('ROUND OF 16')  ? 'ROUND OF 16'
    : comp.includes('R16')          ? 'ROUND OF 16'
    : 'GROUP STAGE';

  const homeCode = item.homeTeam.slice(0, 3).toUpperCase();
  const awayCode = item.awayTeam.slice(0, 3).toUpperCase();

  const isHomeWinner = item.homeScore > item.awayScore;
  const isAwayWinner = item.awayScore > item.homeScore;

  // Render a large prominent featured card if selected or first
  if (showButton) {
    return (
      <TouchableOpacity
        style={mc.card}
        onPress={onPress}
        activeOpacity={0.88}
      >
        {/* ── Header row ── */}
        <View style={mc.header}>
          <View style={mc.liveRow}>
            <Text style={mc.dateText}>{dateLabel.toUpperCase()}</Text>
          </View>
          <Text style={mc.stadiumLabel}>{item.venue.toUpperCase() || 'LUSAIL STADIUM'}</Text>
        </View>

        {/* ── Body: Flags side by side with large score in center ── */}
        <View style={[mc.body, { paddingVertical: 24, paddingHorizontal: 18, justifyContent: 'space-around' }]}>
          <View style={mc.teamCol}>
            <View style={mc.flagCircle}>
              <TeamFlag teamName={item.homeTeam} size={42} />
            </View>
            <Text style={mc.featuredTeamCode}>{homeCode}</Text>
          </View>

          <View style={mc.featuredScoreCol}>
            <Text style={mc.featuredScoreText}>
              <Text style={{ color: C.neonLime }}>{item.homeScore}</Text>
              <Text style={{ color: C.steel }}> - </Text>
              <Text style={{ color: C.onSurface }}>{item.awayScore}</Text>
            </Text>
            <View style={mc.stageBadge}>
              <Text style={mc.stageBadgeText}>{stage}</Text>
            </View>
          </View>

          <View style={mc.teamCol}>
            <View style={mc.flagCircle}>
              <TeamFlag teamName={item.awayTeam} size={42} />
            </View>
            <Text style={mc.featuredTeamCode}>{awayCode}</Text>
          </View>
        </View>

        <TouchableOpacity style={mc.cta} onPress={onButtonPress} activeOpacity={0.8}>
          <Text style={mc.ctaText}>MATCH DETAILS  →</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  }

  // Render a regular compact inline card, but made spacious, removing any live indicators
  return (
    <TouchableOpacity
      style={mc.card}
      onPress={onPress}
      activeOpacity={0.88}
    >
      {/* ── Header row ── */}
      <View style={mc.header}>
        <Text style={mc.headerLabel}>{dateLabel.toUpperCase()} • {stage}</Text>
        <BookmarkIcon color={C.secondary} size={14} />
      </View>

      {/* ── Inline Teams & Score ── */}
      <View style={[mc.body, { paddingVertical: 24, paddingHorizontal: 18 }]}>
        <View style={mc.inlineTeamLeft}>
          <View style={mc.flagCircleInline}>
            <TeamFlag teamName={item.homeTeam} size={32} />
          </View>
          <Text style={mc.inlineTeamCode}>{homeCode}</Text>
        </View>

        <View style={mc.inlineScoreWrap}>
          <Text style={[mc.inlineScoreText, isHomeWinner ? mc.winnerText : mc.loserText]}>
            {item.homeScore}
          </Text>
          <Text style={[mc.inlineScoreText, { color: C.steel }]}>-</Text>
          <Text style={[mc.inlineScoreText, isAwayWinner ? mc.winnerText : mc.loserText]}>
            {item.awayScore}
          </Text>
        </View>

        <View style={mc.inlineTeamRight}>
          <Text style={mc.inlineTeamCode}>{awayCode}</Text>
          <View style={mc.flagCircleInline}>
            <TeamFlag teamName={item.awayTeam} size={32} />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const mc = StyleSheet.create({
  card: {
    backgroundColor:  C.charcoal,
    borderRadius:     6,
    marginBottom:     16,
    borderWidth:      1,
    borderColor:      C.steel,
    overflow:         'hidden',
  },
  header: {
    flexDirection:    'row',
    alignItems:       'center',
    justifyContent:   'space-between',
    paddingHorizontal: 16,
    paddingVertical:  12,
    borderBottomWidth: 1,
    borderBottomColor: C.steel,
  },
  headerLabel: {
    fontFamily:   MONO_BOLD,
    fontSize:     10,
    fontWeight:   '700',
    color:        C.secondary,
    letterSpacing: 0.8,
  },
  liveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: C.errorRed,
  },
  dateText: {
    fontFamily: MONO_BOLD,
    fontSize: 10,
    color: C.secondary,
  },
  stadiumLabel: {
    fontFamily: MONO_BOLD,
    fontSize: 9,
    color: C.secondary,
  },
  body: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
  },
  teamCol: {
    alignItems: 'center',
    width: '30%',
    gap: 8,
  },
  flagCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: C.steel,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.obsidian,
    overflow: 'hidden',
  },
  featuredTeamCode: {
    fontFamily: SORA_BOLD,
    fontSize: 16,
    fontWeight: '800',
    color: C.onSurface,
  },
  featuredScoreCol: {
    alignItems: 'center',
    gap: 4,
  },
  featuredScoreText: {
    fontFamily: SORA_EXTRABOLD,
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: -1,
  },
  stageBadge: {
    backgroundColor: 'rgba(45,45,45,0.5)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  stageBadgeText: {
    fontFamily: MONO_BOLD,
    fontSize: 8,
    color: C.secondary,
  },
  inlineTeamLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  inlineTeamRight: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 12,
    flex: 1,
  },
  inlineTeamCode: {
    fontFamily: SORA_BOLD,
    fontSize: 16,
    color: C.onSurface,
  },
  flagCircleInline: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1.5,
    borderColor: C.steel,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.obsidian,
    overflow: 'hidden',
  },
  inlineScoreWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 8,
  },
  inlineScoreText: {
    fontFamily: SORA_EXTRABOLD,
    fontSize: 20,
    fontWeight: '800',
    minWidth: 16,
    textAlign: 'center',
  },
  winnerText: {
    color: C.neonLime,
  },
  loserText: {
    color: C.onSurface,
  },
  cta: {
    backgroundColor:  C.neonLime,
    paddingVertical:  14,
    flexDirection:    'row',
    alignItems:       'center',
    justifyContent:   'center',
  },
  ctaText: {
    fontFamily:   MONO_BOLD,
    fontSize:     11,
    fontWeight:   '700',
    color:        '#000000',
    letterSpacing: 1.2,
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
        <BookmarkIcon size={18} color={activeTab === 'saved'  ? C.neonLime : C.secondary} />
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
    flexDirection:   'row',
    backgroundColor: C.obsidian,
    borderTopWidth:  1,
    borderTopColor:  C.steel,
    paddingBottom:   10,
    paddingTop:       6,
    paddingHorizontal: 8,
    justifyContent: 'space-around',
  },
  item: {
    flex:        1,
    alignItems:  'center',
    paddingVertical: 6,
    borderRadius: 10,
    gap:          3,
  },
  itemActive: {
    backgroundColor: C.surfaceContainer,
  },
  label: {
    fontFamily:   MONO_BOLD,
    fontSize:      9,
    fontWeight:   '700',
    color:         C.secondary,
    letterSpacing: 0.8,
    marginTop:     1,
  },
  labelActive: { color: C.neonLime },
});

// ─── Main Screen ─────────────────────────────────────────────────────────────────
export default function MatchListScreen({ navigation }: any) {
  const {
    matches, filteredMatches, isLoading, error,
    fetchMatches, setSelectedMatch, generateReport, setSearchQuery,
  } = useAppStore();

  const [localSearch, setLocalSearch]   = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchFocused, setSearchFocused] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedMatchId, setSelectedMatchId] = useState<number | null>(null);

  useEffect(() => { fetchMatches(); }, []);

  const handleSelectMatch = (match: Match) => {
    setSelectedMatch(match);
    navigation.navigate('MatchDetail');
  };

  const handleSearch = (text: string) => {
    setLocalSearch(text);
    setSearchQuery(text);
  };

  const displayedMatches = useMemo(() => {
    let base = filteredMatches;
    const f = activeFilter;
    if (f === 'group') {
      base = base.filter(m => m.competition.toLowerCase().includes('group'));
    } else if (f === 'knockout') {
      base = base.filter(m => !m.competition.toLowerCase().includes('group'));
    } else if (f === 'final') {
      base = base.filter(m => m.competition.toLowerCase().endsWith('- final'));
    }
    return base;
  }, [filteredMatches, activeFilter]);

  return (
    <SafeAreaView style={s.screen} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={C.obsidian} />

      {/* ── Header ── */}
      <View style={s.header}>
        <TouchableOpacity style={s.headerBtn} onPress={() => setIsDrawerOpen(true)} activeOpacity={0.7}>
          <MenuIcon color={C.neonLime} size={22} />
        </TouchableOpacity>

        <Image
          source={require('../../assets/PlayerNationCrop1.png')}
          style={s.logoImage}
          resizeMode="contain"
        />

        <TouchableOpacity style={s.headerBtn} onPress={() => navigation.navigate('Profile')} activeOpacity={0.7}>
          <ProfileIcon color={C.neonLime} size={20} />
        </TouchableOpacity>
      </View>

      {/* ── Content ── */}
      {isLoading && matches.length === 0 ? (
        /* Loading state */
        <View style={s.center}>
          <View style={s.loadingBadge}>
            <SoccerIcon size={32} color={C.neonLime} />
          </View>
          <Text style={s.loadingTitle}>Connecting to backend...</Text>
          <Text style={s.loadingHint}>Make sure the server is running</Text>
        </View>

      ) : error && matches.length === 0 ? (
        /* Error state */
        <View style={s.center}>
          <View style={[s.loadingBadge, { borderColor: 'rgba(255,75,75,0.3)' }]}>
            <WarningIcon size={32} color={C.errorRed} />
          </View>
          <Text style={[s.loadingTitle, { color: '#FF4B4B' }]}>Connection Failed</Text>
          <Text style={s.loadingHint}>{error}</Text>
          <TouchableOpacity style={s.retryBtn} onPress={fetchMatches} activeOpacity={0.85}>
            <Text style={s.retryText}>TRY AGAIN</Text>
          </TouchableOpacity>
        </View>

      ) : (
        <FlatList
          data={displayedMatches}
          renderItem={({ item, index }) => {
            const isFirst = index === 0;
            const isSelected = item.matchId === selectedMatchId;
            const showButton = isFirst || isSelected;
            return (
              <MatchCard
                item={item}
                showButton={showButton}
                onPress={() => setSelectedMatchId(item.matchId)}
                onButtonPress={() => handleSelectMatch(item)}
              />
            );
          }}
          keyExtractor={(item) => item.matchId.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={s.listContent}
          ListHeaderComponent={
            <>
              {/* Search bar */}
              <View style={[s.searchWrap, searchFocused && s.searchFocused]}>
                <SearchIcon size={15} color={searchFocused ? C.neonLime : C.secondary} />
                <TextInput
                  style={s.searchInput}
                  placeholder="Search FIFA World Cup matches..."
                  placeholderTextColor={C.outline}
                  value={localSearch}
                  onChangeText={handleSearch}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                />
              </View>

              {/* Filter chips */}
              <FilterChips active={activeFilter} onSelect={setActiveFilter} />

              {/* Section label */}
              <View style={s.sectionRow}>
                <Text style={s.sectionLabel}>FIFA WORLD CUP 2018</Text>
                <View style={s.countChip}>
                  <View style={s.countDot} />
                  <Text style={s.countText}>{displayedMatches.length} MATCHES</Text>
                </View>
              </View>
            </>
          }
          ListEmptyComponent={
            <View style={s.center}>
              <Text style={s.emptyText}>No matches found.</Text>
              <Text style={[s.loadingHint, { marginTop: 8 }]}>Try adjusting your search or filter</Text>
            </View>
          }
        />
      )}

      {/* ── FAB (refresh) ── */}
      {!isLoading && (
        <TouchableOpacity
          style={s.fab}
          onPress={fetchMatches}
          activeOpacity={0.85}
        >
          <RefreshIcon size={20} color="#000000" />
        </TouchableOpacity>
      )}

      {/* ── Bottom Nav ── */}
      <BottomNav activeTab="matches" navigation={navigation} />

      {/* ── Sidebar Drawer ── */}
      <SidebarDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        navigation={navigation}
        activeScreen="MatchList"
      />
    </SafeAreaView>
  );
}

// ─── Root Styles ─────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.obsidian },

  // Header
  header: {
    flexDirection:    'row',
    alignItems:       'center',
    justifyContent:   'space-between',
    paddingHorizontal: 16,
    height:            64,
    borderBottomWidth: 1,
    borderBottomColor: C.steel,
    backgroundColor:   C.obsidian,
  },
  headerBtn: {
    width: 40, height: 40,
    alignItems: 'center', justifyContent: 'center',
  },
  logoText: {
    fontFamily:   SORA_EXTRABOLD,
    fontSize:     20,
    fontWeight:   '900',
    fontStyle:    'italic',
    color:        C.neonLime,
    letterSpacing: -0.5,
  },
  logoImage: {
    height: 140,
    width: 200,
  },

  // List
  listContent: {
    paddingHorizontal: 16,
    paddingTop:        16,
    paddingBottom:     100, // clear FAB + nav
  },

  // Search
  searchWrap: {
    flexDirection:   'row',
    alignItems:      'center',
    backgroundColor: C.charcoal,
    borderRadius:    12,
    borderWidth:      1,
    borderColor:     C.steel,
    paddingHorizontal: 14,
    paddingVertical:   13,
    marginBottom:    16,
    gap:              10,
  },
  searchFocused: { borderColor: C.neonLime },
  searchInput: {
    flex:       1,
    fontFamily: INTER,
    fontSize:   15,
    fontWeight: '400',
    color:      C.onSurface,
  },

  // Section label row
  sectionRow: {
    flexDirection:   'row',
    alignItems:      'center',
    justifyContent:  'space-between',
    marginBottom:    16,
  },
  sectionLabel: {
    fontFamily:   MONO_BOLD,
    fontSize:     10,
    fontWeight:   '700',
    color:        C.outline,
    letterSpacing: 1.2,
  },
  countChip: {
    flexDirection:   'row',
    alignItems:      'center',
    backgroundColor: C.surfaceContainer,
    borderRadius:    999,
    paddingHorizontal: 10,
    paddingVertical:    4,
    gap:               5,
    borderWidth:        1,
    borderColor:       C.steel,
  },
  countDot: {
    width: 5, height: 5, borderRadius: 2.5,
    backgroundColor: C.neonLime,
  },
  countText: {
    fontFamily:   MONO_BOLD,
    fontSize:      9,
    fontWeight:   '700',
    color:         C.neonLime,
    letterSpacing: 0.8,
  },

  // States
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems:     'center',
    padding:        30,
    minHeight:      400,
  },
  loadingBadge: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: C.charcoal,
    borderWidth: 1,
    borderColor: C.neonAlpha25,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 20,
  },
  loadingTitle: {
    fontFamily:   SORA_BOLD,
    fontSize:   18,
    fontWeight: '700',
    color:      C.onSurface,
    marginBottom: 6,
    textAlign:  'center',
  },
  loadingHint: {
    fontFamily:   INTER,
    fontSize:   13,
    color:      C.secondary,
    textAlign:  'center',
    lineHeight:  19,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontFamily:   INTER_MEDIUM,
    fontSize:   16,
    fontWeight: '600',
    color:      C.outline,
    textAlign:  'center',
  },
  retryBtn: {
    marginTop:       24,
    backgroundColor: C.neonLime,
    borderRadius:     8,
    paddingHorizontal: 28,
    paddingVertical:   12,
  },
  retryText: {
    fontFamily:   MONO_BOLD,
    fontSize:     12,
    fontWeight:   '700',
    color:        '#000000',
    letterSpacing: 1,
  },

  // FAB
  fab: {
    position:        'absolute',
    bottom:           80,
    right:            24,
    width:            56,
    height:           56,
    borderRadius:     6,
    backgroundColor: C.neonLime,
    alignItems:       'center',
    justifyContent:   'center',
    elevation:        8,
    shadowColor:     C.neonLime,
    shadowOffset:    { width: 0, height: 0 },
    shadowOpacity:   0.35,
    shadowRadius:    15,
    zIndex:           40,
  },
});
