import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  StatusBar,
  Platform,
  Dimensions,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SidebarDrawer from './SidebarDrawer';
import { useAppStore } from '../store/store';
import {
  MenuIcon,
  ProfileIcon,
  SearchIcon,
  AnalyticsIcon,
  StadiumIcon,
  SoccerIcon,
  BookmarkIcon,
  SettingsIcon,
  TrashIcon,
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

// ─── Themed In-App Alert ────────────────────────────────────────────────────────
type AlertBtn = { label: string; onPress?: () => void; destructive?: boolean; ghost?: boolean };
function AppAlert({
  visible, icon, title, message, buttons, onDismiss,
}: {
  visible: boolean; icon?: string; title: string; message: string;
  buttons: AlertBtn[]; onDismiss?: () => void;
}) {
  if (!visible) return null;
  return (
    <View style={ald.backdrop}>
      <TouchableOpacity style={StyleSheet.absoluteFillObject} onPress={onDismiss} activeOpacity={1} />
      <View style={ald.box}>
        {icon && (
          <View style={ald.iconWrap}>
            <Text style={ald.iconText}>{icon}</Text>
          </View>
        )}
        <Text style={ald.title}>{title}</Text>
        <Text style={ald.message}>{message}</Text>
        <View style={ald.btnRow}>
          {buttons.map((b, i) => (
            <TouchableOpacity
              key={i}
              style={[ald.btn, b.destructive && ald.btnDestructive, b.ghost && ald.btnGhost]}
              onPress={() => { b.onPress?.(); onDismiss?.(); }}
              activeOpacity={0.82}
            >
              <Text style={[ald.btnText, b.destructive && ald.btnTextDestructive, b.ghost && ald.btnTextGhost]}>
                {b.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
}
const ald = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.75)',
    zIndex: 999,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  box: {
    width: '100%',
    backgroundColor: '#1A1A1A',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#2D2D2D',
    padding: 24,
    alignItems: 'center',
  },
  iconWrap: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: '#0E0E0E',
    borderWidth: 1, borderColor: '#2D2D2D',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 16,
  },
  iconText: { fontSize: 26 },
  title: {
    fontFamily: 'Sora-ExtraBold',
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
  btnDestructive: { backgroundColor: 'rgba(255,75,75,0.12)', borderWidth: 1, borderColor: '#FF4B4B' },
  btnGhost: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#2D2D2D' },
  btnText: { fontFamily: 'JetBrainsMono-Bold', fontSize: 12, fontWeight: '800', color: '#0D0D0D', letterSpacing: 0.5 },
  btnTextDestructive: { color: '#FF4B4B' },
  btnTextGhost: { color: '#C8C6C5' },
});

function TeamFlag({ teamName, size = 32 }: { teamName?: string; size?: number }) {
  const safeName = teamName ?? '';
  const uri = safeName ? TEAM_BADGE_URLS[safeName] : undefined;
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
      <Text style={{ color: '#E5E2E1', fontWeight: '900', fontSize: 10, fontFamily: MONO }}>
        {safeName ? safeName.slice(0, 3).toUpperCase() : '?'}
      </Text>
    </View>
  );
}

export default function SavedReportsScreen({ navigation }: any) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [search, setSearch] = useState('');
  const [alertState, setAlertState] = useState<{ visible: boolean; icon?: string; title: string; message: string; buttons: AlertBtn[] }>({
    visible: false, title: '', message: '', buttons: [],
  });

  const showAlert = (icon: string, title: string, message: string, buttons: AlertBtn[]) =>
    setAlertState({ visible: true, icon, title, message, buttons });
  const hideAlert = () => setAlertState(a => ({ ...a, visible: false }));

  const { savedReports, fetchSavedReports, deleteSavedReport } = useAppStore();

  useEffect(() => {
    fetchSavedReports();
    const unsubscribe = navigation.addListener('focus', () => {
      fetchSavedReports();
    });
    return unsubscribe;
  }, [navigation]);

  const filtered = savedReports.filter((r: any) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      (r.homeTeam ?? '').toLowerCase().includes(q) ||
      (r.awayTeam ?? '').toLowerCase().includes(q) ||
      (r.competition ?? '').toLowerCase().includes(q)
    );
  });

  const handleViewReport = (reportItem: any) => {
    const scores = reportItem.score.split('-');
    const homeScore = parseInt(scores[0], 10) || 0;
    const awayScore = parseInt(scores[1], 10) || 0;

    useAppStore.setState({
      selectedMatch: {
        matchId: reportItem.matchId,
        homeTeam: reportItem.homeTeam,
        awayTeam: reportItem.awayTeam,
        homeScore,
        awayScore,
        date: reportItem.date,
        competition: reportItem.competition,
        venue: reportItem.venue,
      },
      report: {
        reportId: `rep_${reportItem.matchId}`,
        matchId: reportItem.matchId,
        homeTeam: reportItem.homeTeam,
        awayTeam: reportItem.awayTeam,
        score: reportItem.score,
        report: reportItem.report
      }
    });

    navigation.navigate('Report');
  };

  const handleDelete = (matchId: number, homeTeam: string, awayTeam: string) => {
    showAlert(
      undefined,
      'Delete Report',
      `Remove the saved report for ${homeTeam} vs ${awayTeam}? This cannot be undone.`,
      [
        {
          label: 'DELETE',
          destructive: true,
          onPress: async () => {
            try {
              await deleteSavedReport(matchId);
            } catch (error) {
              console.error('Delete error:', error);
            }
          },
        },
        { label: 'CANCEL', ghost: true },
      ]
    );
  };

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
          <View style={s.titleHeader}>
            <Text style={s.pageTitle}>Saved Reports</Text>
            <Text style={s.countText}>{filtered.length} TOTAL</Text>
          </View>
          <Text style={s.pageSubtitle}>Review your historical tactical analysis and match performance data.</Text>
        </View>

        {/* Search */}
        <View style={[s.searchWrap, searchFocused && s.searchFocused]}>
          <SearchIcon size={15} color={searchFocused ? '#D7FF00' : '#C8C6C5'} />
          <TextInput
            style={s.searchInput}
            placeholder="Search by team or competition..."
            placeholderTextColor="#8F9378"
            value={search}
            onChangeText={setSearch}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
        </View>

        {/* Reports List */}
        <View style={s.list}>
          {filtered.length === 0 ? (
            <View style={{ padding: 40, alignItems: 'center' }}>
              <BookmarkIcon size={48} color="#2D2D2D" />
              <Text style={{ color: '#C8C6C5', marginTop: 12, fontSize: 14, textAlign: 'center' }}>
                No saved reports found.
              </Text>
            </View>
          ) : (
            filtered.map((reportItem: any) => {
              const formattedDate = () => {
                const raw = reportItem.date ?? '';
                const parts = raw.split('-');
                const MONTHS = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
                return parts.length === 3
                  ? `${parts[2]} ${MONTHS[parseInt(parts[1], 10) - 1]} ${parts[0]}`
                  : raw || 'UNKNOWN DATE';
              };

              return (
                <View key={reportItem.matchId} style={s.card}>
                  <View style={s.cardHeader}>
                    <Text style={s.cardMetaLime}>{(reportItem.competition ?? 'FIFA WORLD CUP').toUpperCase()}</Text>
                    <Text style={s.cardMetaSec}>{formattedDate().toUpperCase()}</Text>
                  </View>

                  <View style={s.cardBody}>
                    <View style={s.teamCol}>
                      <View style={s.flagBox}>
                        <TeamFlag teamName={reportItem.homeTeam} size={36} />
                      </View>
                      <Text style={s.teamNameBelow}>{(reportItem.homeTeam ?? '').toUpperCase()}</Text>
                    </View>

                    {(() => {
                      const scores = reportItem.score.split('-');
                      const hs = parseInt(scores[0], 10) || 0;
                      const as = parseInt(scores[1], 10) || 0;
                      const penaltyString = reportItem.score.toLowerCase().includes('pen') || scores.length > 2
                        ? reportItem.score.substring(reportItem.score.indexOf('('))
                        : null;
                      return (
                        <View style={s.centerScoreCol}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                            <Text style={hs > as ? s.winnerText : s.scoreText}>{hs}</Text>
                            <Text style={[s.scoreText, { color: '#2D2D2D', marginHorizontal: 6 }]}>-</Text>
                            <Text style={as > hs ? s.winnerText : s.scoreText}>{as}</Text>
                          </View>
                          <Text style={s.ftLabel}>FT{penaltyString ? ` ${penaltyString.toUpperCase()}` : ''}</Text>
                        </View>
                      );
                    })()}

                    <View style={s.teamCol}>
                      <View style={s.flagBox}>
                        <TeamFlag teamName={reportItem.awayTeam} size={36} />
                      </View>
                      <Text style={s.teamNameBelow}>{(reportItem.awayTeam ?? '').toUpperCase()}</Text>
                    </View>
                  </View>

                  <View style={s.actionRow}>
                    <TouchableOpacity
                      style={[s.viewBtnFill, { flex: 1 }]}
                      activeOpacity={0.8}
                      onPress={() => handleViewReport(reportItem)}
                    >
                      <AnalyticsIcon size={12} color="#0D0D0D" />
                      <Text style={s.viewBtnFillText}>VIEW REPORT</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={s.deleteBtn}
                      activeOpacity={0.8}
                      onPress={() => handleDelete(reportItem.matchId, reportItem.homeTeam ?? '', reportItem.awayTeam ?? '')}
                    >
                      <TrashIcon size={16} color="#FF4B4B" />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>


      {/* Bottom Nav Bar */}
      <View style={bn.bar}>
        <TouchableOpacity style={bn.item} onPress={() => navigation.navigate('MatchList')} activeOpacity={0.7}>
          <SoccerIcon size={20} color="#C8C6C5" />
          <Text style={bn.label}>MATCHES</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[bn.item, bn.itemActive]} onPress={() => navigation.navigate('SavedReports')} activeOpacity={0.7}>
          <BookmarkIcon size={18} color="#D7FF00" />
          <Text style={[bn.label, bn.labelActive]}>SAVED</Text>
        </TouchableOpacity>
        <TouchableOpacity style={bn.item} onPress={() => navigation.navigate('Settings')} activeOpacity={0.7}>
          <SettingsIcon size={18} color="#C8C6C5" />
          <Text style={bn.label}>SETTINGS</Text>
        </TouchableOpacity>
      </View>

      {/* Sidebar Drawer */}
      <SidebarDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        navigation={navigation}
        activeScreen="SavedReports"
      />

      {/* In-App Alert */}
      <AppAlert
        visible={alertState.visible}
        icon={alertState.icon}
        title={alertState.title}
        message={alertState.message}
        buttons={alertState.buttons}
        onDismiss={hideAlert}
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
  titleWrap: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 16,
  },
  titleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  countText: {
    fontFamily: MONO,
    fontSize: 11,
    fontWeight: '700',
    color: '#C8C6C5',
    letterSpacing: 0.8,
  },
  pageSubtitle: {
    fontSize: 13,
    color: '#C8C6C5',
    marginTop: 4,
    lineHeight: 18,
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#2D2D2D',
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginBottom: 20,
    gap: 10,
  },
  searchFocused: { borderColor: '#D7FF00' },
  searchInput: {
    flex: 1,
    fontFamily: INTER,
    fontSize: 14,
    fontWeight: '400',
    color: '#E5E2E1',
  },
  list: {
    paddingHorizontal: 16,
    gap: 16,
  },
  card: {
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#2D2D2D',
    borderRadius: 6,
    padding: 16,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#2D2D2D',
    paddingBottom: 12,
    marginBottom: 16,
  },
  cardMetaLime: {
    fontFamily: MONO_BOLD,
    fontSize: 9,
    fontWeight: '700',
    color: '#D7FF00',
    letterSpacing: 0.8,
  },
  cardMetaSec: {
    fontFamily: MONO_BOLD,
    fontSize: 9,
    fontWeight: '700',
    color: '#C8C6C5',
    letterSpacing: 0.8,
  },
  cardBody: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  teamCol: {
    alignItems: 'center',
    width: '35%',
    gap: 8,
  },
  flagBox: {
    width: 60,
    height: 60,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2D2D2D',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0E0E0E',
    overflow: 'hidden',
    padding: 6,
  },
  teamNameBelow: {
    fontFamily: SORA_BOLD,
    fontSize: 11,
    fontWeight: '800',
    color: '#E5E2E1',
    letterSpacing: -0.2,
    textAlign: 'center',
  },
  centerScoreCol: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '30%',
    gap: 2,
  },
  scoreText: {
    fontFamily: SORA_EXTRABOLD,
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  winnerText: {
    fontFamily: SORA_EXTRABOLD,
    fontSize: 26,
    fontWeight: '800',
    color: '#D7FF00',
  },
  ftLabel: {
    fontFamily: MONO_BOLD,
    fontSize: 9,
    fontWeight: '700',
    color: '#C8C6C5',
    letterSpacing: 0.5,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  deleteBtn: {
    width: 48,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#FF4B4B',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 75, 75, 0.08)',
  },
  viewBtnFill: {
    backgroundColor: '#D7FF00',
    paddingVertical: 12,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  viewBtnFillText: {
    fontFamily: MONO_BOLD,
    fontSize: 11,
    fontWeight: '800',
    color: '#0D0D0D',
    letterSpacing: 1,
  },
  viewBtnOutline: {
    borderWidth: 1,
    borderColor: '#2D2D2D',
    paddingVertical: 12,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  viewBtnOutlineText: {
    fontFamily: MONO_BOLD,
    fontSize: 11,
    fontWeight: '800',
    color: '#D7FF00',
    letterSpacing: 1,
  },
  cardBodyMinimal: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    marginBottom: 20,
  },
  minimalHome: {
    fontFamily: SORA_BOLD,
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'right',
  },
  minimalAway: {
    fontFamily: SORA_BOLD,
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'left',
  },
  minimalScoreBox: {
    backgroundColor: 'rgba(45,45,45,0.5)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
    marginHorizontal: 16,
  },
  minimalScoreText: {
    fontFamily: MONO_BOLD,
    fontSize: 14,
    fontWeight: '800',
    color: '#D7FF00',
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
