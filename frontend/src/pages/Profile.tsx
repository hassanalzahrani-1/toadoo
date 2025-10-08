import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Mail, Shield, Calendar, CheckCircle, XCircle } from 'lucide-react';

export default function Profile() {
  const { user } = useAuth();

  if (!user) {
    return <div className="text-center py-12">Loading profile...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">My Profile</h1>
        <p className="text-muted-foreground mt-2">
          View your account information
        </p>
      </div>

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
