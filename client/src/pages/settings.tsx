import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

export default function Settings() {
  const { user, updateUserRole } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    domainRole: user?.domainRole || '',
    // bio and avatarUrl are not in AuthUser, so remove or add fallback
    bio: (user as any)?.bio || '',
    avatarUrl: (user as any)?.avatarUrl || ''
  });
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    pushNotifications: true,
    darkMode: true,
    weeklyReports: false
  });

  // Remove isLoading from useMutation result
  const { mutate: updateProfile } = useMutation({
    mutationFn: (data: any) =>
      apiRequest('PATCH', '/api/settings', data),
    onSuccess: () => {
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleProfileUpdate = async () => {
    setIsLoading(true);
    try {
      // Update user profile
      // updateUserRole expects a specific type, so cast or validate
      await updateUserRole(profileData.domainRole as any);
      
      // TODO: Implement API call to update profile data
      // await apiRequest(`/api/users/${user?.id}`, {
      //   method: 'PATCH',
      //   body: profileData
      // });
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    setIsLoading(true);
    try {
      // TODO: Implement password change
      toast({
        title: "Password Changed",
        description: "Your password has been changed successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to change password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreferencesUpdate = async () => {
    setIsLoading(true);
    try {
      // TODO: Implement preferences update
      toast({
        title: "Preferences Updated",
        description: "Your preferences have been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update preferences. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences</p>
      </motion.div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Profile Settings */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Profile Settings</CardTitle>
              <CardDescription>Update your personal information and profile</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={profileData.avatarUrl} alt={profileData.name} />
                  <AvatarFallback className="text-lg">
                    {profileData.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Button variant="outline" size="sm">Change Avatar</Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  placeholder="Enter your full name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={profileData.email}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">Email cannot be changed</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="domainRole">Domain Role</Label>
                <Select
                  value={profileData.domainRole}
                  onValueChange={(value) => setProfileData({ ...profileData, domainRole: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your domain role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="frontend">Frontend</SelectItem>
                    <SelectItem value="backend">Backend</SelectItem>
                    <SelectItem value="devops">DevOps</SelectItem>
                    <SelectItem value="qa">QA</SelectItem>
                    <SelectItem value="hr">HR</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={profileData.bio}
                  onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                  placeholder="Tell us about yourself..."
                  rows={3}
                />
              </div>

              <Button onClick={handleProfileUpdate} disabled={isLoading} className="w-full">
                {isLoading ? 'Updating...' : 'Update Profile'}
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Account Settings */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>Manage your account security and preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Email Notifications</Label>
                    <p className="text-xs text-muted-foreground">Receive email updates about your activities</p>
                  </div>
                  <Switch
                    checked={preferences.emailNotifications}
                    onCheckedChange={(checked) => setPreferences({ ...preferences, emailNotifications: checked })}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Push Notifications</Label>
                    <p className="text-xs text-muted-foreground">Receive push notifications in your browser</p>
                  </div>
                  <Switch
                    checked={preferences.pushNotifications}
                    onCheckedChange={(checked) => setPreferences({ ...preferences, pushNotifications: checked })}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Dark Mode</Label>
                    <p className="text-xs text-muted-foreground">Use dark theme for the application</p>
                  </div>
                  <Switch
                    checked={preferences.darkMode}
                    onCheckedChange={(checked) => setPreferences({ ...preferences, darkMode: checked })}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Weekly Reports</Label>
                    <p className="text-xs text-muted-foreground">Receive weekly progress reports</p>
                  </div>
                  <Switch
                    checked={preferences.weeklyReports}
                    onCheckedChange={(checked) => setPreferences({ ...preferences, weeklyReports: checked })}
                  />
                </div>
              </div>

              <Button onClick={handlePreferencesUpdate} disabled={isLoading} className="w-full">
                {isLoading ? 'Updating...' : 'Update Preferences'}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Security Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Security Settings</CardTitle>
            <CardDescription>Manage your account security</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                placeholder="Enter your current password"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                placeholder="Enter your new password"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your new password"
              />
            </div>

            <Button onClick={handlePasswordChange} disabled={isLoading} className="w-full">
              {isLoading ? 'Changing...' : 'Change Password'}
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Account Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>Your account details and role information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-sm font-medium">User ID</Label>
                <p className="text-sm text-muted-foreground font-mono">{user?.id}</p>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Role</Label>
                <Badge variant="secondary">{user?.role}</Badge>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Member Since</Label>
                <p className="text-sm text-muted-foreground font-mono">{(user as any)?.createdAt ? new Date((user as any).createdAt).toLocaleDateString() : 'N/A'}</p>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Last Login</Label>
                <p className="text-sm text-muted-foreground">{(user as any)?.lastLoginAt ? new Date((user as any).lastLoginAt).toLocaleDateString() : 'N/A'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
} 