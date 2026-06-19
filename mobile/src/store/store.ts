import { create } from 'zustand';
import axios from 'axios';

// ─── Smart API URL discovery ────────────────────────────────────────────────────
// Probes a range of LAN IPs + known aliases simultaneously.
// Whichever responds first wins — self-heals when DHCP reassigns the PC's IP.
const PORT = 3000;

function buildCandidates(): string[] {
  const fixed = [
    process.env.EXPO_PUBLIC_API_URL,               // Primary URL (.env)
    process.env.EXPO_PUBLIC_API_URL_PRODUCTION,    // Secondary Production URL (.env)
    'https://player-nation-backend.onrender.com', // Common Render subdomain
    'https://player-nation.onrender.com',         // Alternative Render subdomain
    `http://10.0.2.2:${PORT}`,                     // Android Emulator alias
    `http://localhost:${PORT}`,                    // web / iOS simulator
    `http://192.168.1.8:${PORT}`,                  // Current Ethernet IP
    `http://192.168.137.1:${PORT}`,                // Current Windows Hotspot IP
  ].filter(Boolean) as string[];

  // Scan the most common subnets
  const subnet1 = Array.from({ length: 30 }, (_, i) => `http://192.168.1.${i + 1}:${PORT}`);
  const subnet0 = Array.from({ length: 30 }, (_, i) => `http://192.168.0.${i + 1}:${PORT}`);
  const subnet137 = Array.from({ length: 10 }, (_, i) => `http://192.168.137.${i + 1}:${PORT}`);

  return [...fixed, ...subnet1, ...subnet0, ...subnet137];
}

let resolvedApiUrl: string = process.env.EXPO_PUBLIC_API_URL || `http://10.0.2.2:${PORT}`;
let isDiscovered = false;
let discoveryPromise: Promise<string> | null = null;

async function probeUrl(baseUrl: string): Promise<string> {
  await axios.get(`${baseUrl}/health`, { timeout: 1500 });
  return baseUrl;
}

function promiseAny<T>(promises: Promise<T>[]): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    let rejectedCount = 0;
    const errors: any[] = [];
    if (promises.length === 0) {
      reject(new Error('All promises were rejected'));
      return;
    }
    promises.forEach((p, index) => {
      Promise.resolve(p)
        .then(resolve)
        .catch((err) => {
          errors[index] = err;
          rejectedCount++;
          if (rejectedCount === promises.length) {
            reject(new Error('All promises were rejected'));
          }
        });
    });
  });
}

async function discoverApiUrl(force = false): Promise<string> {
  if (isDiscovered && !force) {
    return resolvedApiUrl;
  }
  if (discoveryPromise) {
    return discoveryPromise;
  }

  discoveryPromise = (async () => {
    try {
      const url = await promiseAny(buildCandidates().map(probeUrl));
      console.log(`[API] ✅ Connected to backend at ${url}`);
      resolvedApiUrl = url;
      isDiscovered = true;
      return url;
    } catch {
      console.warn(`[API] ⚠️ Backend not found on any address. Last known: ${resolvedApiUrl}`);
      return resolvedApiUrl;
    } finally {
      discoveryPromise = null;
    }
  })();

  return discoveryPromise;
}

// Kick off discovery immediately (non-blocking)
discoverApiUrl();

export interface Match {
  matchId: number;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  date: string;
  competition: string;
  venue: string;
}

export interface Report {
  summary: string;
  keyMoments: string[];
  standoutPlayers: string[];
  teamAnalysis: string;
  recommendations: string[];
}

export interface MatchReportResponse {
  reportId: string;
  matchId: number;
  homeTeam: string;
  awayTeam: string;
  score: string;
  report: Report;
}

interface AppState {
  matches: Match[];
  filteredMatches: Match[];
  selectedMatch: Match | null;
  report: MatchReportResponse | null;
  isLoading: boolean;
  loadingMessage: string;
  error: string | null;
  searchQuery: string;
  savedReports: any[];

  // Actions
  fetchMatches: () => Promise<void>;
  setSelectedMatch: (match: Match | null) => void;
  setSearchQuery: (query: string) => void;
  generateReport: (matchId: number) => Promise<void>;
  clearReport: () => void;
  fetchMatchStats: (matchId: number) => Promise<any>;
  fetchSavedReports: () => Promise<void>;
  saveReport: (report: any) => Promise<void>;
  deleteSavedReport: (matchId: number) => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  matches: [],
  filteredMatches: [],
  selectedMatch: null,
  report: null,
  isLoading: false,
  loadingMessage: '',
  error: null,
  searchQuery: '',
  savedReports: [],

  fetchMatches: async () => {
    set({ isLoading: true, error: null, loadingMessage: 'Fetching available matches...' });
    // Re-run discovery in case IP changed since app start
    await discoverApiUrl(true);
    try {
      const response = await axios.get<{ matches: Match[] }>(`${resolvedApiUrl}/matches`, { timeout: 8000 });
      set({
        matches: response.data.matches,
        filteredMatches: response.data.matches,
        isLoading: false,
      });
    } catch (err: any) {
      console.error('Failed to fetch matches:', err.message);
      set({
        error: `Could not connect to the cloud server at ${resolvedApiUrl || 'https://player-nation.onrender.com'}.\n\nSuggestions:\n• The backend service on Render might be inactive (Render's free tier spinning down after inactivity).\n• Please verify if the backend server is running.\n• Check your internet connection.`,
        isLoading: false,
      });
    }
  },

  setSelectedMatch: (match) => {
    set({ selectedMatch: match });
  },

  setSearchQuery: (query) => {
    const { matches } = get();
    const cleanQuery = query.toLowerCase().trim();
    if (!cleanQuery) {
      set({ searchQuery: query, filteredMatches: matches });
      return;
    }
    const filtered = matches.filter(
      (m) =>
        m.homeTeam.toLowerCase().includes(cleanQuery) ||
        m.awayTeam.toLowerCase().includes(cleanQuery) ||
        m.competition.toLowerCase().includes(cleanQuery)
    );
    set({ searchQuery: query, filteredMatches: filtered });
  },

  generateReport: async (matchId) => {
    set({ isLoading: true, error: null, report: null });

    const messages = [
      'Extracting match event streams...',
      'Aggregating possession and pass metrics...',
      'Computing player ratings...',
      'Building chronological timeline...',
      'Prompting AI for narrative report...',
      'Polishing insights and final analysis...',
    ];

    let currentMsgIndex = 0;
    set({ loadingMessage: messages[currentMsgIndex] });

    const intervalId = setInterval(() => {
      if (currentMsgIndex < messages.length - 1) {
        currentMsgIndex++;
        set({ loadingMessage: messages[currentMsgIndex] });
      }
    }, 1800);

    try {
      // Re-probe to make sure we have a live backend URL
      await discoverApiUrl();
      const response = await axios.post<MatchReportResponse>(
        `${resolvedApiUrl}/reports/generate`,
        { matchId },
        { timeout: 45000 }, // LLM can take time
      );
      clearInterval(intervalId);
      set({ report: response.data, isLoading: false });
    } catch (err: any) {
      clearInterval(intervalId);
      console.error('Failed to generate report:', err.message);
      set({
        error: err.response?.data?.error?.message || `Network error — backend at ${resolvedApiUrl} unreachable.`,
        isLoading: false,
      });
    }
  },

  clearReport: () => {
    set({ report: null, error: null });
  },

  fetchMatchStats: async (matchId) => {
    await discoverApiUrl();
    const response = await axios.get(`${resolvedApiUrl}/matches/${matchId}/stats`);
    return response.data;
  },

  fetchSavedReports: async () => {
    await discoverApiUrl();
    try {
      const response = await axios.get<{ reports: any[] }>(`${resolvedApiUrl}/reports/saved`);
      set({ savedReports: response.data.reports });
    } catch (err) {
      console.error('Failed to fetch saved reports:', err);
    }
  },

  saveReport: async (reportData) => {
    await discoverApiUrl();
    try {
      await axios.post(`${resolvedApiUrl}/reports/save`, reportData);
      const { fetchSavedReports } = get();
      await fetchSavedReports();
    } catch (err) {
      console.error('Failed to save report:', err);
    }
  },

  deleteSavedReport: async (matchId) => {
    await discoverApiUrl();
    try {
      await axios.delete(`${resolvedApiUrl}/reports/saved/${matchId}`);
      const { fetchSavedReports } = get();
      await fetchSavedReports();
    } catch (err) {
      console.error('Failed to delete saved report:', err);
    }
  }
}));
