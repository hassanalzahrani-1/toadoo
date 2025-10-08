import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Bell, Lock, Palette, Globe, Clock, AlertTriangle } from 'lucide-react';
import { authAPI } from '@/lib/api';

type Theme = 'light' | 'dark' | 'system';
type TimeFormat = '12h' | '24h';

export default function Settings() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  
  // Load settings from localStorage
  const [emailNotifications, setEmailNotifications] = useState(() => 
    localStorage.getItem('emailNotifications') !== 'false'
  );
  const [pushNotifications, setPushNotifications] = useState(() => 
    localStorage.getItem('pushNotifications') === 'true'
  );
  const [theme, setTheme] = useState<Theme>(() => 
    (localStorage.getItem('theme') as Theme) || 'light'
  );
  const [timeFormat, setTimeFormat] = useState<TimeFormat>(() => 
    (localStorage.getItem('timeFormat') as TimeFormat) || '12h'
  );
  const [language, setLanguage] = useState(() => 
    localStorage.getItem('language') || 'en'
  );
  const [timezone, setTimezone] = useState(() => 
    localStorage.getItem('timezone') || 'utc'
  );

  // Save to localStorage when settings change
  useEffect(() => {
    localStorage.setItem('emailNotifications', String(emailNotifications));
  }, [emailNotifications]);

  useEffect(() => {
    localStorage.setItem('pushNotifications', String(pushNotifications));
  }, [pushNotifications]);

  useEffect(() => {
    localStorage.setItem('theme', theme);
    // Apply theme to document
    document.documentElement.classList.remove('light', 'dark');
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      document.documentElement.classList.add(systemTheme);
    } else {
      document.documentElement.classList.add(theme);
    }
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('timeFormat', timeFormat);
  }, [timeFormat]);

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('timezone', timezone);
  }, [timezone]);

  const handleSavePreferences = () => {
    toast.success('Preferences saved successfully!');
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== 'DELETE') {
      toast.error('Please type DELETE to confirm');
      return;
    }

    try {
      // Delete account from backend
      await authAPI.deleteAccount();
      
      // Logout and redirect
      logout();
      toast.success('Account deleted successfully');
      navigate('/register');
    } catch (error: any) {
      console.error('Failed to delete account:', error);
      const message = error.response?.data?.detail || 'Failed to delete account. Please try again.';
      toast.error(message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account preferences and settings
        </p>
      </div>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            <CardTitle>Notifications</CardTitle>
          </div>
          <CardDescription>Configure how you receive notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Email Notifications</p>
              <p className="text-sm text-muted-foreground">Receive email updates about your tasks</p>
            </div>
            <Button
              variant={emailNotifications ? 'default' : 'outline'}
              size="sm"
              onClick={() => setEmailNotifications(!emailNotifications)}
            >
              {emailNotifications ? 'Enabled' : 'Disabled'}
            </Button>
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Push Notifications</p>
              <p className="text-sm text-muted-foreground">Receive browser notifications</p>
            </div>
            <Button
              variant={pushNotifications ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPushNotifications(!pushNotifications)}
            >
              {pushNotifications ? 'Enabled' : 'Disabled'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Password */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            <CardTitle>Password</CardTitle>
          </div>
          <CardDescription>Change your password</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-password">Current Password</Label>
            <Input
              id="current-password"
              type="password"
              placeholder="Enter current password"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="new-password">New Password</Label>
            <Input
              id="new-password"
              type="password"
              placeholder="Enter new password"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm New Password</Label>
            <Input
              id="confirm-password"
              type="password"
              placeholder="Confirm new password"
            />
          </div>
          
          <Button>Update Password</Button>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            <CardTitle>Appearance</CardTitle>
          </div>
          <CardDescription>Customize how Toadoo looks</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Theme</Label>
            <div className="flex gap-2">
              <Button 
                variant={theme === 'light' ? 'default' : 'outline'} 
                className="flex-1"
                onClick={() => setTheme('light')}
              >
                Light
              </Button>
              <Button 
                variant={theme === 'dark' ? 'default' : 'outline'} 
                className="flex-1"
                onClick={() => setTheme('dark')}
              >
                Dark
              </Button>
              <Button 
                variant={theme === 'system' ? 'default' : 'outline'} 
                className="flex-1"
                onClick={() => setTheme('system')}
              >
                System
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Time Format */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            <CardTitle>Time Format</CardTitle>
          </div>
          <CardDescription>Choose how time is displayed</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Time Display</Label>
            <div className="flex gap-2">
              <Button 
                variant={timeFormat === '12h' ? 'default' : 'outline'} 
                className="flex-1"
                onClick={() => setTimeFormat('12h')}
              >
                12-hour (2:30 PM)
              </Button>
              <Button 
                variant={timeFormat === '24h' ? 'default' : 'outline'} 
                className="flex-1"
                onClick={() => setTimeFormat('24h')}
              >
                24-hour (14:30)
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Language & Region */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            <CardTitle>Language & Region</CardTitle>
          </div>
          <CardDescription>Set your language and timezone preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="language">Language</Label>
            <select
              id="language"
              className="w-full px-3 py-2 border rounded-md bg-background text-foreground"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              <option value="en">English</option>
              <option value="ar">العربية (Arabic)</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
            </select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="timezone">Timezone</Label>
            <select
              id="timezone"
              className="w-full px-3 py-2 border rounded-md bg-background text-foreground"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
            >
              <option value="utc">UTC</option>
              <option value="america/new_york">America/New York</option>
              <option value="europe/london">Europe/London</option>
              <option value="asia/dubai">Asia/Dubai</option>
              <option value="asia/riyadh">Asia/Riyadh</option>
              <option value="asia/tokyo">Asia/Tokyo</option>
            </select>
          </div>
          
          <Button onClick={handleSavePreferences}>Save Preferences</Button>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>Irreversible actions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Delete Account</p>
              <p className="text-sm text-muted-foreground">
                Permanently delete your account and all data
              </p>
            </div>
            <Button 
              variant="destructive" 
              size="sm"
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Delete Account
            </DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete your account and remove all your data from our servers.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="delete-confirm">
                Type <span className="font-bold">DELETE</span> to confirm
              </Label>
              <Input
                id="delete-confirm"
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                placeholder="DELETE"
              />
            </div>
          </div>

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setDeleteConfirmation('');
              }}
            >
              Cancel
            </Button>
            <Button 
              type="button" 
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={deleteConfirmation !== 'DELETE'}
            >
              Delete Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
