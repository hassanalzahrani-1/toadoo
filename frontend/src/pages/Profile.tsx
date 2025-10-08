import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { User, Mail, Shield, Calendar, CheckCircle, XCircle, Trophy } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export default function Profile() {
  const { user } = useAuth();
  const [rank, setRank] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserRank();
    }
  }, [user]);

  const fetchUserRank = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(`${API_URL}/todos/leaderboard?period=all-time`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const myEntry = response.data.leaderboard.find((entry: any) => entry.is_current_user);
      if (myEntry) {
        setRank(myEntry.rank);
      }
    } catch (error) {
      console.error('Failed to fetch rank:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankEmoji = (count: number) => {
    if (count >= 250) return '👑 Master';
    if (count >= 100) return '💎 Diamond';
    if (count >= 50) return '🥇 Gold';
    if (count >= 10) return '🥈 Silver';
    return '🥉 Bronze';
  };

  const getNextRankInfo = (count: number) => {
    if (count >= 250) return { next: 'Max Rank!', needed: 0, total: 250 };
    if (count >= 100) return { next: '👑 Master', needed: 250 - count, total: 250 };
    if (count >= 50) return { next: '💎 Diamond', needed: 100 - count, total: 100 };
    if (count >= 10) return { next: '🥇 Gold', needed: 50 - count, total: 50 };
    return { next: '🥈 Silver', needed: 10 - count, total: 10 };
  };

  if (!user) {
    return <div className="text-center py-12">Loading profile...</div>;
  }

  const nextRank = getNextRankInfo(user.total_completed_count || 0);
  const progress = nextRank.total > 0 ? ((user.total_completed_count || 0) / nextRank.total) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">My Profile</h1>
        <p className="text-muted-foreground mt-2">
          View your account information
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Lifetime Completed */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lifetime Completed</CardTitle>
            <Trophy className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{user.total_completed_count || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {getRankEmoji(user.total_completed_count || 0)}
            </p>
          </CardContent>
        </Card>

        {/* Global Rank */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Global Ranking</CardTitle>
            <Trophy className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {loading ? '...' : `#${rank || '—'}`}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {rank ? 'Out of all users' : 'Complete tasks to rank'}
            </p>
          </CardContent>
        </Card>

        {/* Next Rank */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Rank</CardTitle>
            <Trophy className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{nextRank.next}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {nextRank.needed > 0 ? `${nextRank.needed} tasks needed` : 'Max rank achieved!'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Progress Card */}
      {nextRank.needed > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Progress to {nextRank.next}</CardTitle>
            <CardDescription>Keep completing tasks to unlock the next rank!</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{user.total_completed_count || 0} / {nextRank.total} tasks</span>
                <span className="text-muted-foreground">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-3" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Profile Card */}
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>Your personal details and account status</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Username */}
          <div className="flex items-start gap-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground">Username</p>
              <p className="text-lg font-semibold">{user.username}</p>
            </div>
          </div>

          {/* Email */}
          <div className="flex items-start gap-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Mail className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <p className="text-lg font-semibold">{user.email}</p>
            </div>
          </div>

          {/* Role */}
          <div className="flex items-start gap-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Shield className="h-5 w-5 text-purple-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground">Role</p>
              <div className="mt-1">
                <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                  {user.role}
                </Badge>
              </div>
            </div>
          </div>

          {/* Account Status */}
          <div className="flex items-start gap-4">
            <div className={`p-2 rounded-lg ${user.is_active ? 'bg-green-100' : 'bg-red-100'}`}>
              {user.is_active ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground">Account Status</p>
              <div className="mt-1">
                <Badge className={user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                  {user.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </div>
          </div>

          {/* Verification Status */}
          <div className="flex items-start gap-4">
            <div className={`p-2 rounded-lg ${user.is_verified ? 'bg-green-100' : 'bg-yellow-100'}`}>
              {user.is_verified ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-yellow-600" />
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground">Email Verification</p>
              <div className="mt-1">
                <Badge className={user.is_verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                  {user.is_verified ? 'Verified' : 'Not Verified'}
                </Badge>
              </div>
            </div>
          </div>

          {/* Member Since */}
          <div className="flex items-start gap-4">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Calendar className="h-5 w-5 text-gray-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground">Member Since</p>
              <p className="text-lg font-semibold">
                {new Date(user.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
