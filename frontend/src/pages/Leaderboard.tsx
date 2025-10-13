import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Award } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Create axios instance with auth
const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

interface LeaderboardEntry {
  rank: number;
  user_id: number;
  username: string;
  count: number;
  is_current_user: boolean;
}

export default function Leaderboard() {
  const [allTimeData, setAllTimeData] = useState<LeaderboardEntry[]>([]);
  const [monthlyData, setMonthlyData] = useState<LeaderboardEntry[]>([]);
  const [weeklyData, setWeeklyData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboards();
  }, []);

  const fetchLeaderboards = async () => {
    try {
      const [allTime, monthly, weekly] = await Promise.all([
        api.get('/todos/leaderboard', { params: { period: 'all-time' } }),
        api.get('/todos/leaderboard', { params: { period: 'monthly' } }),
        api.get('/todos/leaderboard', { params: { period: 'weekly' } }),
      ]);

      setAllTimeData(allTime.data.leaderboard);
      setMonthlyData(monthly.data.leaderboard);
      setWeeklyData(weekly.data.leaderboard);
    } catch (error: any) {
      console.error('Failed to fetch leaderboards:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error detail:', JSON.stringify(error.response?.data?.detail, null, 2));
    } finally {
      setLoading(false);
    }
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-500" />;
    if (rank === 3) return <Award className="h-5 w-5 text-amber-600" />;
    return <span className="text-muted-foreground">#{rank}</span>;
  };

  const getRankEmoji = (count: number) => {
    if (count >= 250) return '🐸✨';
    if (count >= 100) return '🤴🐸';
    if (count >= 50) return '👑🐸';
    if (count >= 25) return '🐸🪷';
    if (count >= 10) return '🐸💚';
    return '🐸';
  };

  const LeaderboardTable = ({ data }: { data: LeaderboardEntry[] }) => (
    <div className="space-y-2">
      {data.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No data yet. Start harvesting tasks!
        </div>
      ) : (
        data.map((entry) => (
          <div
            key={entry.user_id}
            className={`flex items-center justify-between p-4 rounded-lg border ${
              entry.is_current_user ? 'bg-primary/5 border-primary' : 'bg-card'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 flex justify-center">
                {getRankBadge(entry.rank)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{entry.username}</span>
                  {entry.is_current_user && (
                    <Badge variant="secondary" className="text-xs">You</Badge>
                  )}
                </div>
                <div className="text-sm text-muted-foreground">
                  {entry.count} tasks completed
                </div>
              </div>
            </div>
            <div className="text-3xl">
              {getRankEmoji(entry.count)}
            </div>
          </div>
        ))
      )}
    </div>
  );

  if (loading) {
    return <div className="text-center py-12">Loading leaderboard...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">🏆 Leaderboard</h1>
        <p className="text-muted-foreground mt-2">
          See how you rank against other users
        </p>
      </div>

      <Tabs defaultValue="all-time" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all-time">🏆 All-Time</TabsTrigger>
          <TabsTrigger value="monthly">📅 Monthly</TabsTrigger>
          <TabsTrigger value="weekly">📆 Weekly</TabsTrigger>
        </TabsList>

        <TabsContent value="all-time">
          <Card>
            <CardHeader>
              <CardTitle>All-Time Champions</CardTitle>
              <CardDescription>
                Total tasks completed since joining
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LeaderboardTable data={allTimeData} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monthly">
          <Card>
            <CardHeader>
              <CardTitle>This Month's Leaders</CardTitle>
              <CardDescription>
                Tasks completed in the last 30 days
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LeaderboardTable data={monthlyData} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="weekly">
          <Card>
            <CardHeader>
              <CardTitle>This Week's Top Performers</CardTitle>
              <CardDescription>
                Tasks completed in the last 7 days
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LeaderboardTable data={weeklyData} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>🐸 Toad Evolution</CardTitle>
          <CardDescription>Complete tasks to evolve your toad</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 text-center">
            <div>
              <div className="text-3xl mb-2">🐸</div>
              <div className="font-medium">Young Toad</div>
              <div className="text-sm text-muted-foreground">0-9 tasks</div>
            </div>
            <div>
              <div className="text-3xl mb-2">🐸💚</div>
              <div className="font-medium">Pond Hopper</div>
              <div className="text-sm text-muted-foreground">10-24 tasks</div>
            </div>
            <div>
              <div className="text-3xl mb-2">🐸🪷</div>
              <div className="font-medium">Lily Pad Master</div>
              <div className="text-sm text-muted-foreground">25-49 tasks</div>
            </div>
            <div>
              <div className="text-3xl mb-2">👑🐸</div>
              <div className="font-medium">Swamp Lord</div>
              <div className="text-sm text-muted-foreground">50-99 tasks</div>
            </div>
            <div>
              <div className="text-3xl mb-2">🤴🐸</div>
              <div className="font-medium">Toad King</div>
              <div className="text-sm text-muted-foreground">100-249 tasks</div>
            </div>
            <div>
              <div className="text-3xl mb-2">🐸✨</div>
              <div className="font-medium">Ancient Toad</div>
              <div className="text-sm text-muted-foreground">250+ tasks</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
