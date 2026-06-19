import { Toaster } from "@/components/ui/sonner";
import { lazy, Suspense } from 'react';
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { GameProvider } from "./contexts/GameContext";
import { PlayerProvider } from "./contexts/PlayerContext";
import { MultiplayerProvider } from "./contexts/MultiplayerContext";
import { AdminProvider } from "./contexts/AdminContext";
import { AudioSettingsProvider } from "./contexts/AudioSettingsContext";
import { OfflineProvider } from "./contexts/OfflineContext";
import { DailyChallengesProvider } from "./contexts/DailyChallengesContext";
import { ProgressProvider } from "./contexts/ProgressContext";
import MenuPage from "./pages/MenuPage";
import AuthPage from "./pages/AuthPage";

// Lazy load pages for better performance
const SelectionPage = lazy(() => import("./pages/SelectionPage"));
const GamePage = lazy(() => import("./pages/GamePage"));
const ResultsPage = lazy(() => import("./pages/ResultsPage"));
const PlayerSelectionPage = lazy(() => import("./pages/PlayerSelectionPage"));
const ChallengesPage = lazy(() => import("./pages/ChallengesPage"));
const LearningPlanPage = lazy(() => import("./pages/LearningPlanPage"));
const MultiplayerPage = lazy(() => import("./pages/MultiplayerPage"));
const MultiplayerGamePage = lazy(() => import("./pages/MultiplayerGamePage"));
const AdminPage = lazy(() => import("./pages/AdminPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const LeaderboardPage = lazy(() => import("./pages/LeaderboardPage"));
const CollectionSelectionPage = lazy(() => import("./pages/CollectionSelectionPage"));
const CollectionSelectionPageDebug = lazy(() => import("./pages/CollectionSelectionPageDebug"));
const DailyChallengesPage = lazy(() => import("./pages/DailyChallengesPage"));
const PlayerProfilePage = lazy(() => import("./pages/PlayerProfilePage"));

const LoadingFallback = () => (
  <div className="min-h-screen bg-gradient-to-b from-[#FFD93D] via-[#FFF8E7] to-[#FFE5B4] flex items-center justify-center">
    <div className="text-center">
      <div className="arcade-title text-[#2E3192] text-3xl">LOADING...</div>
    </div>
  </div>
);



function GameRouter() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Switch>
        <Route path="/" component={MenuPage} />
        <Route path="/auth" component={AuthPage} />
        <Route path="/admin" component={AdminPage} />
        <Route path="/profile" component={ProfilePage} />
        <Route path="/leaderboard" component={LeaderboardPage} />
        <Route path="/collections" component={CollectionSelectionPage} />
        <Route path="/debug/collections" component={CollectionSelectionPageDebug} />
        <Route path="/daily-challenges" component={DailyChallengesPage} />
        <Route path="/player-profile" component={PlayerProfilePage} />
        <Route path="/players" component={PlayerSelectionPage} />
        <Route path="/selection" component={SelectionPage} />
        <Route path="/game" component={GamePage} />
        <Route path="/results" component={ResultsPage} />
        <Route path="/challenges" component={ChallengesPage} />
        <Route path="/learning-plan" component={LearningPlanPage} />
        <Route path="/multiplayer" component={MultiplayerPage} />
        <Route path="/multiplayer-game/:sessionId" component={MultiplayerGamePage} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}
function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <OfflineProvider>
      <DailyChallengesProvider>
        <AudioSettingsProvider>
          <AdminProvider>
            <PlayerProvider>
              <ProgressProvider>
                <MultiplayerProvider>
                  <GameProvider>
                    <GameRouter />
                  </GameProvider>
                </MultiplayerProvider>
              </ProgressProvider>
            </PlayerProvider>
          </AdminProvider>
        </AudioSettingsProvider>
      </DailyChallengesProvider>
    </OfflineProvider>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
