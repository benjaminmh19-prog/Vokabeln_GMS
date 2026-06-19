import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  Users,
  Gamepad2,
  TrendingUp,
  AlertCircle,
  RefreshCw,
  BarChart3,
  ArrowUp,
  ArrowDown,
  Minus,
  Download,
} from 'lucide-react';
import { fetchDashboardStats, DashboardStats, TimeRange } from '@/lib/dashboardStats';
import { exportDashboardToPDF } from '@/lib/dashboardPdfExport';

export default function TeacherDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>('all');

  const loadStats = async (range: TimeRange = timeRange) => {
    setIsLoading(true);
    try {
      const data = await fetchDashboardStats(range);
      setStats(data);
      setLastUpdated(new Date());
      toast.success('Statistiken aktualisiert');
    } catch (error) {
      toast.error('Fehler beim Laden der Statistiken');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTimeRangeChange = (range: TimeRange) => {
    setTimeRange(range);
    loadStats(range);
  };

  useEffect(() => {
    loadStats();
  }, []);

  if (!stats) {
    return (
      <Card className="p-6 border-2 border-[#2E3192]">
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500 font-bold">Statistiken werden geladen...</p>
        </div>
      </Card>
    );
  }

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <ArrowUp className="w-4 h-4 text-green-600" />;
      case 'down':
        return <ArrowDown className="w-4 h-4 text-red-600" />;
      default:
        return <Minus className="w-4 h-4 text-gray-600" />;
    }
  };

  const handleExportPDF = () => {
    if (stats) {
      try {
        exportDashboardToPDF(stats);
        toast.success('PDF-Bericht erfolgreich heruntergeladen');
      } catch (error) {
        toast.error('Fehler beim Erstellen des PDF-Berichts');
        console.error(error);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-[#2E3192] flex items-center gap-2">
          <BarChart3 className="w-8 h-8" />
          Lehrer-Dashboard
        </h2>
          {/* Time Range Filters */}
          <div className="flex gap-1">
            {(["all", "today", "week", "month"] as TimeRange[]).map((range) => {
              const labels: Record<TimeRange, string> = {
                all: "Alle",
                today: "Heute",
                week: "7 Tage",
                month: "30 Tage",
              };
              return (
                <Button
                  key={range}
                  onClick={() => handleTimeRangeChange(range)}
                  className={`text-xs font-bold border-2 rounded-lg px-3 py-1 ${
                    timeRange === range
                      ? "bg-[#2E3192] text-white border-[#2E3192]"
                      : "bg-white text-[#2E3192] border-[#2E3192] hover:bg-[#FFD93D]"
                  }`}
                >
                  {labels[range]}
                </Button>
              );
            })}
          </div>
        <div className="flex items-center gap-2">
          {lastUpdated && (
            <span className="text-xs text-gray-600">
              Aktualisiert: {lastUpdated.toLocaleTimeString('de-DE')}
            </span>
          )}
          <Button
            onClick={handleExportPDF}
            className="bg-gradient-to-r from-[#FF9F1C] to-[#FFD93D] hover:from-[#FF8C00] hover:to-[#FFC700] text-[#2E3192] font-bold border-2 border-[#2E3192] rounded-lg px-4 py-2"
          >
            <Download className="w-4 h-4" />
          </Button>
          <Button
            onClick={() => loadStats()}
            disabled={isLoading}
            className="bg-[#2E3192] hover:bg-[#1a1a5f] text-white font-bold border-2 border-[#FFD93D] rounded-lg px-4 py-2"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Players */}
        <Card className="p-4 border-2 border-[#2E3192] bg-gradient-to-br from-[#FFD93D] to-[#FFE5B4]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-700">SPIELER</p>
              <p className="text-3xl font-bold text-[#2E3192] mt-2">{stats.totalPlayers}</p>
            </div>
            <Users className="w-12 h-12 text-[#2E3192] opacity-30" />
          </div>
        </Card>

        {/* Total Games */}
        <Card className="p-4 border-2 border-[#2E3192] bg-gradient-to-br from-[#FF9F1C] to-[#FFB84D]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-700">SPIELE</p>
              <p className="text-3xl font-bold text-[#2E3192] mt-2">{stats.totalGames}</p>
            </div>
            <Gamepad2 className="w-12 h-12 text-[#2E3192] opacity-30" />
          </div>
        </Card>

        {/* Average Score */}
        <Card className="p-4 border-2 border-[#2E3192] bg-gradient-to-br from-[#2E3192] to-[#1a1a5f]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-white">DURCHSCHNITT</p>
              <p className="text-3xl font-bold text-[#FFD93D] mt-2">{stats.averageScore}</p>
            </div>
            <TrendingUp className="w-12 h-12 text-[#FFD93D] opacity-30" />
          </div>
        </Card>

        {/* Total Errors */}
        <Card className="p-4 border-2 border-[#2E3192] bg-gradient-to-br from-red-100 to-red-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-700">FEHLER</p>
              <p className="text-3xl font-bold text-red-600 mt-2">{stats.totalErrors}</p>
            </div>
            <AlertCircle className="w-12 h-12 text-red-600 opacity-30" />
          </div>
        </Card>
      </div>

      {/* Top Players */}
      <Card className="p-6 border-2 border-[#2E3192]">
        <h3 className="text-xl font-bold text-[#2E3192] mb-4">Top 5 Spieler</h3>
        <div className="space-y-3">
          {stats.topPlayers.length === 0 ? (
            <p className="text-gray-500 text-sm">Keine Spieler vorhanden</p>
          ) : (
            stats.topPlayers.map((player, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 bg-gradient-to-r from-[#FFD93D] to-[#FFE5B4] border-2 border-[#2E3192] rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-[#2E3192] text-white font-bold rounded-full w-8 h-8 flex items-center justify-center text-sm">
                    {idx + 1}
                  </div>
                  <div>
                    <p className="font-bold text-[#2E3192]">{player.name}</p>
                    <p className="text-xs text-gray-700">
                      {player.gamesPlayed} Spiele | Ø {player.averageScore.toFixed(1)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-[#2E3192]">{player.totalScore}</p>
                  <p className="text-xs text-gray-700">Punkte</p>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Test Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tests by Unit */}
        <Card className="p-6 border-2 border-[#2E3192]">
          <h3 className="text-xl font-bold text-[#2E3192] mb-4">Tests nach Unit</h3>
          <div className="space-y-2">
            {Object.entries(stats.testStats.testsByUnit).length === 0 ? (
              <p className="text-gray-500 text-sm">Keine Tests erstellt</p>
            ) : (
              Object.entries(stats.testStats.testsByUnit).map(([unit, count]) => (
                <div key={unit} className="flex items-center justify-between">
                  <span className="font-bold text-[#2E3192]">{unit}</span>
          {/* Time Range Filters */}
          <div className="flex gap-1">
            {(["all", "today", "week", "month"] as TimeRange[]).map((range) => {
              const labels: Record<TimeRange, string> = {
                all: "Alle",
                today: "Heute",
                week: "7 Tage",
                month: "30 Tage",
              };
              return (
                <Button
                  key={range}
                  onClick={() => handleTimeRangeChange(range)}
                  className={`text-xs font-bold border-2 rounded-lg px-3 py-1 ${
                    timeRange === range
                      ? "bg-[#2E3192] text-white border-[#2E3192]"
                      : "bg-white text-[#2E3192] border-[#2E3192] hover:bg-[#FFD93D]"
                  }`}
                >
                  {labels[range]}
                </Button>
              );
            })}
          </div>
                  <div className="flex items-center gap-2">
                    <div className="bg-gradient-to-r from-[#FFD93D] to-[#FF9F1C] rounded-full h-2 w-32" />
                    <span className="font-bold text-[#2E3192] min-w-[2rem]">{count}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Tests by Type */}
        <Card className="p-6 border-2 border-[#2E3192]">
          <h3 className="text-xl font-bold text-[#2E3192] mb-4">Tests nach Typ</h3>
          <div className="space-y-2">
            {Object.entries(stats.testStats.testsByType).length === 0 ? (
              <p className="text-gray-500 text-sm">Keine Tests erstellt</p>
            ) : (
              Object.entries(stats.testStats.testsByType).map(([type, count]) => {
                const typeLabel: Record<string, string> = {
                  'english-to-german': 'EN → DE',
                  'german-to-english': 'DE → EN',
                  mixed: 'Gemischt',
                };
                return (
                  <div key={type} className="flex items-center justify-between">
                    <span className="font-bold text-[#2E3192]">{typeLabel[type] || type}</span>
          {/* Time Range Filters */}
          <div className="flex gap-1">
            {(["all", "today", "week", "month"] as TimeRange[]).map((range) => {
              const labels: Record<TimeRange, string> = {
                all: "Alle",
                today: "Heute",
                week: "7 Tage",
                month: "30 Tage",
              };
              return (
                <Button
                  key={range}
                  onClick={() => handleTimeRangeChange(range)}
                  className={`text-xs font-bold border-2 rounded-lg px-3 py-1 ${
                    timeRange === range
                      ? "bg-[#2E3192] text-white border-[#2E3192]"
                      : "bg-white text-[#2E3192] border-[#2E3192] hover:bg-[#FFD93D]"
                  }`}
                >
                  {labels[range]}
                </Button>
              );
            })}
          </div>
                    <div className="flex items-center gap-2">
                      <div className="bg-gradient-to-r from-[#2E3192] to-[#1a1a5f] rounded-full h-2 w-32" />
                      <span className="font-bold text-[#2E3192] min-w-[2rem]">{count}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>
      </div>

      {/* Top Error Words */}
      <Card className="p-6 border-2 border-[#2E3192]">
        <h3 className="text-xl font-bold text-[#2E3192] mb-4">Häufigste Fehler</h3>
        <div className="space-y-2">
          {stats.errorStats.topErrorWords.length === 0 ? (
            <p className="text-gray-500 text-sm">Keine Fehler registriert</p>
          ) : (
            stats.errorStats.topErrorWords.map((error, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 bg-red-50 border-2 border-red-200 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-red-600 text-white font-bold rounded-full w-8 h-8 flex items-center justify-center text-sm">
                    {idx + 1}
                  </div>
                  <p className="font-bold text-gray-800">{error.word}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-red-600">{error.errorCount}x</p>
                  <p className="text-xs text-gray-600">{error.percentage}%</p>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Player Progress */}
      <Card className="p-6 border-2 border-[#2E3192]">
        <h3 className="text-xl font-bold text-[#2E3192] mb-4">Spieler-Fortschritt</h3>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {stats.playerProgress.length === 0 ? (
            <p className="text-gray-500 text-sm">Keine Spieler vorhanden</p>
          ) : (
            stats.playerProgress.map((player, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 bg-blue-50 border-2 border-blue-200 rounded-lg"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="flex-1">
                    <p className="font-bold text-[#2E3192]">{player.name}</p>
                    <p className="text-xs text-gray-600">
                      {player.gamesPlayed} Spiele | Ø {player.averageScore.toFixed(1)} | Best {player.bestScore}
                    </p>
                  </div>
                </div>
          {/* Time Range Filters */}
          <div className="flex gap-1">
            {(["all", "today", "week", "month"] as TimeRange[]).map((range) => {
              const labels: Record<TimeRange, string> = {
                all: "Alle",
                today: "Heute",
                week: "7 Tage",
                month: "30 Tage",
              };
              return (
                <Button
                  key={range}
                  onClick={() => handleTimeRangeChange(range)}
                  className={`text-xs font-bold border-2 rounded-lg px-3 py-1 ${
                    timeRange === range
                      ? "bg-[#2E3192] text-white border-[#2E3192]"
                      : "bg-white text-[#2E3192] border-[#2E3192] hover:bg-[#FFD93D]"
                  }`}
                >
                  {labels[range]}
                </Button>
              );
            })}
          </div>
                <div className="flex items-center gap-2">
                  {getTrendIcon(player.trend)}
                  <p className="font-bold text-[#2E3192] min-w-[3rem] text-right">{player.totalScore}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Summary Stats */}
      <Card className="p-6 border-2 border-[#2E3192] bg-gradient-to-r from-[#FFD93D] to-[#FFE5B4]">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-xs font-bold text-gray-700">TESTS ERSTELLT</p>
            <p className="text-2xl font-bold text-[#2E3192] mt-1">{stats.testStats.totalTests}</p>
          </div>
          <div>
            <p className="text-xs font-bold text-gray-700">FEHLER-WÖRTER</p>
            <p className="text-2xl font-bold text-[#2E3192] mt-1">{stats.errorStats.totalErrorWords}</p>
          </div>
          <div>
            <p className="text-xs font-bold text-gray-700">DURCHSCHN. FEHLER/SPIEL</p>
            <p className="text-2xl font-bold text-[#2E3192] mt-1">
              {stats.totalGames > 0 ? (stats.totalErrors / stats.totalGames).toFixed(1) : 0}
            </p>
          </div>
          <div>
            <p className="text-xs font-bold text-gray-700">ERFOLGSQUOTE</p>
            <p className="text-2xl font-bold text-[#2E3192] mt-1">
              {stats.totalGames > 0
                ? (((stats.totalGames * 100 - stats.totalErrors) / (stats.totalGames * 100)) * 100).toFixed(0)
                : 0}
              %
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
