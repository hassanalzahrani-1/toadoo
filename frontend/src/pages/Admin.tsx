import { useState, useEffect } from 'react';
import { adminAPI } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label as FormLabel } from '@/components/ui/label';
import { Users, Activity, CheckCircle, AlertCircle, Trash2, Edit, RefreshCw, Search, BarChart3 } from 'lucide-react';
import { Bar, BarChart, XAxis, YAxis, Pie, PieChart, Label } from "recharts";
import type { ChartConfig } from "@/components/ui/chart";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";

interface User {
  id: number;
  email: string;
  username: string;
  role: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
}

interface Stats {
  users: {
    total: number;
    active: number;
    admins: number;
    inactive: number;
  };
  todos: {
    total: number;
    completed: number;
    pending: number;
    in_progress: number;
    lifetime_completed: number;
  };
}

export default function Admin() {
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState('user');
  const [selectedActive, setSelectedActive] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true);
    
    try {
      const [usersRes, statsRes] = await Promise.all([
        adminAPI.getUsers(),
        adminAPI.getStats(),
      ]);
      setUsers(usersRes.data);
      setStats(statsRes.data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to fetch admin data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setSelectedRole(user.role);
    setSelectedActive(user.is_active);
    setIsEditOpen(true);
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;

    try {
      // Update role if changed
      if (selectedRole !== editingUser.role) {
        await adminAPI.updateUserRole(editingUser.id, selectedRole);
      }
      
      // Update status if changed
      if (selectedActive !== editingUser.is_active) {
        await adminAPI.updateUserStatus(editingUser.id, selectedActive);
      }
      
      setIsEditOpen(false);
      setEditingUser(null);
      fetchData();
    } catch (error) {
      console.error('Failed to update user:', error);
      alert('Failed to update user');
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;

    try {
      await adminAPI.deleteUser(userId);
      fetchData();
    } catch (error) {
      console.error('Failed to delete user:', error);
      alert('Failed to delete user');
    }
  };

  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return <div className="text-center py-12">Loading admin dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Manage users and view system statistics
          </p>
          {lastUpdated && (
            <p className="text-xs text-muted-foreground mt-1">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchData(true)}
          disabled={refreshing}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="stats" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="stats">
            <BarChart3 className="h-4 w-4 mr-2" />
            Statistics
          </TabsTrigger>
          <TabsTrigger value="users">
            <Users className="h-4 w-4 mr-2" />
            User Management
          </TabsTrigger>
        </TabsList>

        {/* Stats Tab */}
        <TabsContent value="stats" className="space-y-6">
          {/* Stats Grid */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.users.total}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.users.active} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <Activity className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.users.active}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.users.total > 0 ? Math.round((stats.users.active / stats.users.total) * 100) : 0}% of total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
              <CheckCircle className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.todos.total}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Across all users
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Lifetime Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.todos.lifetime_completed}</div>
              <p className="text-xs text-muted-foreground mt-1">
                All-time harvested tasks
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Charts Section */}
      {stats && (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Task Status Bar Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Current Tasks Breakdown</CardTitle>
              <CardDescription>Active tasks on users' boards</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  tasks: {
                    label: "Tasks",
                  },
                  pending: {
                    label: "Pending",
                    color: "hsl(var(--chart-1))",
                  },
                  in_progress: {
                    label: "In Progress",
                    color: "hsl(var(--chart-2))",
                  },
                  completed: {
                    label: "Completed",
                    color: "hsl(var(--chart-3))",
                  },
                } satisfies ChartConfig}
              >
                <BarChart
                  data={[
                    {
                      status: "Pending",
                      tasks: stats.todos.pending,
                      fill: "var(--color-pending)",
                    },
                    {
                      status: "In Progress",
                      tasks: stats.todos.in_progress,
                      fill: "var(--color-in_progress)",
                    },
                    {
                      status: "Completed",
                      tasks: stats.todos.completed,
                      fill: "var(--color-completed)",
                    },
                  ]}
                  layout="vertical"
                  margin={{ left: 0 }}
                >
                  <YAxis
                    dataKey="status"
                    type="category"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                  />
                  <XAxis dataKey="tasks" type="number" hide />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                  />
                  <Bar dataKey="tasks" layout="vertical" radius={5} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* User Status Radial Chart */}
          <Card className="flex flex-col">
            <CardHeader className="items-center pb-0">
              <CardTitle>User Engagement</CardTitle>
              <CardDescription>Active vs Inactive breakdown</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-0">
              <ChartContainer
                config={{
                  users: {
                    label: "Users",
                  },
                  active: {
                    label: "Active",
                    color: "hsl(var(--chart-1))",
                  },
                  inactive: {
                    label: "Inactive",
                    color: "hsl(var(--chart-2))",
                  },
                } satisfies ChartConfig}
                className="mx-auto aspect-square max-h-[250px]"
              >
                <PieChart>
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                  />
                  <Pie
                    data={[
                      { status: "active", users: stats.users.active, fill: "var(--color-active)" },
                      { status: "inactive", users: stats.users.inactive, fill: "var(--color-inactive)" },
                    ]}
                    dataKey="users"
                    nameKey="status"
                    innerRadius={60}
                    strokeWidth={5}
                  >
                    <Label
                      content={({ viewBox }) => {
                        if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                          return (
                            <text
                              x={viewBox.cx}
                              y={viewBox.cy}
                              textAnchor="middle"
                              dominantBaseline="middle"
                            >
                              <tspan
                                x={viewBox.cx}
                                y={viewBox.cy}
                                className="fill-foreground text-3xl font-bold"
                              >
                                {stats.users.total.toLocaleString()}
                              </tspan>
                              <tspan
                                x={viewBox.cx}
                                y={(viewBox.cy || 0) + 24}
                                className="fill-muted-foreground"
                              >
                                Total Users
                              </tspan>
                            </text>
                          )
                        }
                      }}
                    />
                  </Pie>
                  <ChartLegend
                    content={<ChartLegendContent nameKey="status" />}
                    className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
                  />
                </PieChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Lifetime Achievement */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>🏆 Lifetime Achievement</CardTitle>
              <CardDescription>All-time completed tasks across the platform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center py-8">
                <div className="text-center space-y-2">
                  <div className="text-6xl font-bold text-green-600">
                    {stats.todos.lifetime_completed.toLocaleString()}
                  </div>
                  <div className="text-lg text-muted-foreground">
                    Total tasks harvested by all users
                  </div>
                  <div className="text-sm text-muted-foreground">
                    These tasks have been completed and archived permanently
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>
      )}
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>View and manage all users in the system</CardDescription>
                </div>
                <div className="relative w-64">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredUsers.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No users found matching "{searchQuery}"</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Username</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Verified</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.username}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.is_active ? (
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                    ) : (
                      <Badge className="bg-red-100 text-red-800">Inactive</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {user.is_verified ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-yellow-600" />
                    )}
                  </TableCell>
                  <TableCell>
                    {new Date(user.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditUser(user)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteUser(user.id)}
                        disabled={user.role === 'admin'}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit User Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user role and status
            </DialogDescription>
          </DialogHeader>
          
          {editingUser && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <FormLabel>Username</FormLabel>
                <div className="text-sm font-medium">{editingUser.username}</div>
              </div>

              <div className="space-y-2">
                <FormLabel>Email</FormLabel>
                <div className="text-sm text-muted-foreground">{editingUser.email}</div>
              </div>

              <div className="space-y-2">
                <FormLabel htmlFor="role">Role</FormLabel>
                <select
                  id="role"
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md bg-background text-foreground"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="space-y-2">
                <FormLabel htmlFor="active">Status</FormLabel>
                <select
                  id="active"
                  value={selectedActive ? 'active' : 'inactive'}
                  onChange={(e) => setSelectedActive(e.target.value === 'active')}
                  className="w-full px-3 py-2 border rounded-md bg-background text-foreground"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleUpdateUser}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
