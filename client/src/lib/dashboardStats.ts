import { supabase } from '@/lib/supabase';

export type TimeRange = 'all' | 'today' | 'week' | 'month';

export interface DashboardStats {
  totalPlayers: number;
  totalGames: number;
  averageScore: number;
  totalErrors: number;
  topPlayers: Array<{
    name: string;
    totalScore: number;
    gamesPlayed: number;
    averageScore: number;
  }>;
  testStats: {
    totalTests: number;
    testsByUnit: Record<string, number>;
    testsByType: Record<string, number>;
  };
  errorStats: {
    topErrorWords: Array<{
      word: string;
      errorCount: number;
      percentage: number;
    }>;
    totalErrorWords: number;
  };
  playerProgress: Array<{
    name: string;
    gamesPlayed: number;
    totalScore: number;
    bestScore: number;
    averageScore: number;
    trend: 'up' | 'down' | 'stable';
  }>;
}

function getDateRangeFilter(timeRange: TimeRange): Date | null {
  const now = new Date();
  switch (timeRange) {
    case 'today':
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      return today;
    case 'week':
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return weekAgo;
    case 'month':
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      return monthAgo;
    default:
      return null;
  }
}

export async function fetchDashboardStats(timeRange: TimeRange = 'all'): Promise<DashboardStats> {
  try {
    const { data: players } = await supabase.from('players').select('*');
    let { data: gameResults } = await supabase.from('game_results').select('*');
    const { data: errorWords } = await supabase.from('error_words').select('*');
    const { data: testHistory } = await supabase.from('test_history').select('*');

    // Filter by date range
    const dateFilter = getDateRangeFilter(timeRange);
    if (dateFilter && gameResults) {
      gameResults = gameResults.filter((g) => {
        const gameDate = new Date(g.created_at);
        return gameDate >= dateFilter;
      });
    }

    if (dateFilter && errorWords) {
      const filtered = errorWords.filter((e) => {
        const errorDate = new Date(e.last_error);
        return errorDate >= dateFilter;
      });
      // Recalculate error stats based on filtered data
      const errorCounts: Record<string, number> = {};
      filtered.forEach((e) => {
        errorCounts[e.word] = (errorCounts[e.word] || 0) + (e.error_count || 0);
      });
    }

    if (dateFilter && testHistory) {
      const filtered = testHistory.filter((t) => {
        const testDate = new Date(t.created_at);
        return testDate >= dateFilter;
      });
    }

    const totalPlayers = players?.length || 0;
    const totalGames = gameResults?.length || 0;
    const averageScore =
      totalGames > 0
        ? Math.round(
            ((gameResults?.reduce((sum, g) => sum + (g.score || 0), 0) || 0) /
              totalGames) *
              100
          ) / 100
        : 0;
    const totalErrors = errorWords?.reduce((sum, e) => sum + (e.error_count || 0), 0) || 0;

    const topPlayers = (players || [])
      .map((p) => ({
        name: p.name,
        totalScore: p.total_score || 0,
        gamesPlayed: p.games_played || 0,
        averageScore: p.games_played ? (p.total_score || 0) / p.games_played : 0,
      }))
      .sort((a, b) => b.totalScore - a.totalScore)
      .slice(0, 5);

    const testsByUnit: Record<string, number> = {};
    const testsByType: Record<string, number> = {};

    (testHistory || []).forEach((test) => {
      if (test.unit) testsByUnit[test.unit] = (testsByUnit[test.unit] || 0) + 1;
      if (test.test_type) testsByType[test.test_type] = (testsByType[test.test_type] || 0) + 1;
    });

    const sortedErrorWords = (errorWords || [])
      .sort((a, b) => (b.error_count || 0) - (a.error_count || 0))
      .slice(0, 10);

    const topErrorWords = sortedErrorWords.map((e) => ({
      word: e.word,
      errorCount: e.error_count || 0,
      percentage: totalErrors > 0 ? Math.round(((e.error_count || 0) / totalErrors) * 100) : 0,
    }));

    const playerProgress: Array<{
      name: string;
      gamesPlayed: number;
      totalScore: number;
      bestScore: number;
      averageScore: number;
      trend: 'up' | 'down' | 'stable';
    }> = (players || [])
      .map((p) => {
        const playerGames = (gameResults || []).filter((g) => g.player_id === p.id);
        const recentGames = playerGames.slice(-5);
        let trend: 'up' | 'down' | 'stable' = 'stable';

        if (recentGames.length >= 2) {
          const lastScore = recentGames[recentGames.length - 1].score || 0;
          const firstScore = recentGames[0].score || 0;
          if (lastScore > firstScore) trend = 'up';
          else if (lastScore < firstScore) trend = 'down';
        }

        return {
          name: p.name,
          gamesPlayed: p.games_played || 0,
          totalScore: p.total_score || 0,
          bestScore: p.best_score || 0,
          averageScore: p.games_played ? (p.total_score || 0) / p.games_played : 0,
          trend,
        };
      })
      .sort((a, b) => b.gamesPlayed - a.gamesPlayed);

    return {
      totalPlayers,
      totalGames,
      averageScore,
      totalErrors,
      topPlayers,
      testStats: {
        totalTests: testHistory?.length || 0,
        testsByUnit,
        testsByType,
      },
      errorStats: {
        topErrorWords,
        totalErrorWords: errorWords?.length || 0,
      },
      playerProgress,
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw error;
  }
}
