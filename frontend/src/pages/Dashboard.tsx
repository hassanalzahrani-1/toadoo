import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { todosAPI } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckSquare, Clock, ListTodo, Trophy, Calendar } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

interface Todo {
  id: number;
  title: string;
  description: string | null;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  due_date: string | null;
  created_at: string;
  updated_at: string;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [rank, setRank] = useState<number | null>(null);

  useEffect(() => {
    fetchTodos();
    if (user) {
      fetchUserRank();
    }
  }, [user]);

  const fetchTodos = async () => {
    try {
      const response = await todosAPI.list();
      setTodos(response.data);
    } catch (error) {
      console.error('Failed to fetch todos:', error);
    } finally {
      setLoading(false);
    }
  };

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
    }
  };

  const getRankEmoji = (count: number) => {
    if (count >= 250) return '🐸✨ Ancient Toad';
    if (count >= 100) return '🤴🐸 Toad King';
    if (count >= 50) return '👑🐸 Swamp Lord';
    if (count >= 25) return '🐸🪷 Lily Pad Master';
    if (count >= 10) return '🐸💚 Pond Hopper';
    return '🐸 Young Toad';
  };

  const getNextRankInfo = (count: number) => {
    if (count >= 250) return { next: 'Max Rank!', needed: 0, total: 250 };
    if (count >= 100) return { next: '🐸✨ Ancient Toad', needed: 250 - count, total: 250 };
    if (count >= 50) return { next: '🤴🐸 Toad King', needed: 100 - count, total: 100 };
    if (count >= 25) return { next: '👑🐸 Swamp Lord', needed: 50 - count, total: 50 };
    if (count >= 10) return { next: '🐸🪷 Lily Pad Master', needed: 25 - count, total: 25 };
    return { next: '🐸💚 Pond Hopper', needed: 10 - count, total: 10 };
  };

  const totalTasks = todos.length;
  const inProgressTasks = todos.filter(t => t.status === 'in_progress').length;
  const completedTasks = todos.filter(t => t.status === 'completed').length;
  const recentTodos = todos
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 5);

  const stats = [
    {
      title: 'Total Tasks',
      value: totalTasks.toString(),
      description: 'Current session',
      icon: ListTodo,
      color: 'text-blue-600',
    },
    {
      title: 'In Progress',
      value: inProgressTasks.toString(),
      description: 'Currently working on',
      icon: Clock,
      color: 'text-yellow-600',
    },
    {
      title: 'Completed',
      value: completedTasks.toString(),
      description: 'Tasks finished',
      icon: CheckSquare,
      color: 'text-green-600',
    },
    {
      title: 'Global Rank',
      value: rank ? `#${rank}` : '—',
      description: 'Your ranking',
      icon: Trophy,
      color: 'text-purple-600',
    },
  ];

  const getStatusColor = (status: Todo['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending':
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: Todo['status']) => {
    switch (status) {
      case 'completed':
        return 'Done';
      case 'in_progress':
        return 'In Progress';
      case 'pending':
        return 'To Do';
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Welcome back, {user?.username}! 👋</h1>
        <p className="text-muted-foreground mt-2">
          Here's an overview of your tasks and productivity
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Rank Progress Card */}
      {user && (
        <Card>
          <CardHeader>
            <CardTitle>Rank Progress</CardTitle>
            <CardDescription>
              Current: {getRankEmoji(user.total_completed_count || 0)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {(() => {
              const nextRank = getNextRankInfo(user.total_completed_count || 0);
              const progress = nextRank.total > 0 ? ((user.total_completed_count || 0) / nextRank.total) * 100 : 0;
              return (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">
                      {nextRank.needed > 0 ? `Next: ${nextRank.next}` : nextRank.next}
                    </span>
                    <span className="text-muted-foreground">
                      {user.total_completed_count || 0} / {nextRank.total} tasks
                    </span>
                  </div>
                  <Progress value={progress} className="h-3" />
                  {nextRank.needed > 0 && (
                    <p className="text-xs text-muted-foreground">
                      {nextRank.needed} more task{nextRank.needed !== 1 ? 's' : ''} to rank up!
                    </p>
                  )}
                </div>
              );
            })()}
          </CardContent>
        </Card>
      )}

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your latest task updates</CardDescription>
        </CardHeader>
        <CardContent>
          {recentTodos.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <ListTodo className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No tasks yet. Create your first task to get started!</p>
            </div>
          ) : (
            <div className="space-y-4"> 
              {recentTodos.map((todo) => (
                <div
                  key={todo.id}
                  className="flex items-start justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{todo.title}</h4>
                      <Badge className={getStatusColor(todo.status)}>
                        {getStatusLabel(todo.status)}
                      </Badge>
                    </div>
                    {todo.description && (
                      <p className="text-sm text-muted-foreground mb-2">{todo.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Updated {new Date(todo.updated_at).toLocaleDateString()}
                      </span>
                      {todo.due_date && (
                        <span>Due: {new Date(todo.due_date).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
