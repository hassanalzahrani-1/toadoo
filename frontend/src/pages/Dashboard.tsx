import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckSquare, Clock, ListTodo, TrendingUp } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();

  const stats = [
    {
      title: 'Total Tasks',
      value: '0',
      description: 'All your tasks',
      icon: ListTodo,
      color: 'text-blue-600',
    },
    {
      title: 'In Progress',
      value: '0',
      description: 'Currently working on',
      icon: Clock,
      color: 'text-yellow-600',
    },
    {
      title: 'Completed',
      value: '0',
      description: 'Tasks finished',
      icon: CheckSquare,
      color: 'text-green-600',
    },
    {
      title: 'Completion Rate',
      value: '0%',
      description: 'Overall progress',
      icon: TrendingUp,
      color: 'text-purple-600',
    },
  ];

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

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your latest task updates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <ListTodo className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No tasks yet. Create your first task to get started!</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
