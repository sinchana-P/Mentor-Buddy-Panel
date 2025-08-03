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
import { Settings as SettingsIcon, User, Shield, Bell, Palette, Crown, Sparkles } from 'lucide-react';

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
    <div className="min-h-screen p-6 space-y-8">
      {/* Premium Header */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="premium-card glass-card mb-8"
      >
        <div className="flex items-start gap-4 mb-4">
          <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mt-1">
            <SettingsIcon className="w-6 h-6 text-white/80" />
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <p className="text-white/60">Manage your account settings and preferences</p>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Profile Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="premium-card">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                <User className="w-4 h-4 text-white/80" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Profile Settings</h3>
                <p className="text-white/60 text-sm">Update your personal information and profile</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 bg-gradient-to-br from-white/20 to-white/10 rounded-full flex items-center justify-center ring-2 ring-white/10">
                  <span className="text-2xl font-bold text-white">
                    {profileData.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <button className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white/80 hover:text-white text-sm font-medium">
                    Change Avatar
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="name" className="form-label">Full Name</label>
                <input
                  id="name"
                  className="input-premium"
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  placeholder="Enter your full name"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="form-label">Email</label>
                <input
                  id="email"
                  type="email"
                  className="input-premium opacity-50 cursor-not-allowed"
                  value={profileData.email}
                  disabled
                />
                <p className="text-xs text-white/50">Email cannot be changed</p>
              </div>

              <div className="space-y-2">
                <label htmlFor="domainRole" className="form-label">Domain Role</label>
                <Select
                  value={profileData.domainRole}
                  onValueChange={(value) => setProfileData({ ...profileData, domainRole: value })}
                >
                  <SelectTrigger className="select-trigger">
                    <SelectValue placeholder="Select your domain role" />
                  </SelectTrigger>
                  <SelectContent className="select-content">
                    <SelectItem value="frontend" className="select-item">Frontend</SelectItem>
                    <SelectItem value="backend" className="select-item">Backend</SelectItem>
                    <SelectItem value="devops" className="select-item">DevOps</SelectItem>
                    <SelectItem value="qa" className="select-item">QA</SelectItem>
                    <SelectItem value="hr" className="select-item">HR</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label htmlFor="bio" className="form-label">Bio</label>
                <textarea
                  id="bio"
                  className="input-premium"
                  value={profileData.bio}
                  onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                  placeholder="Tell us about yourself..."
                  rows={3}
                />
              </div>

              <button onClick={handleProfileUpdate} disabled={isLoading} className="btn-gradient w-full">
                {isLoading ? 'Updating...' : 'Update Profile'}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Account Settings */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="premium-card">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                <Bell className="w-4 h-4 text-white/80" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Account Settings</h3>
                <p className="text-white/60 text-sm">Manage your account security and preferences</p>
              </div>
            </div>
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="form-label">Email Notifications</label>
                    <p className="text-xs text-white/60 mt-1">Receive email updates about your activities</p>
                  </div>
                  <Switch
                    checked={preferences.emailNotifications}
                    onCheckedChange={(checked) => setPreferences({ ...preferences, emailNotifications: checked })}
                  />
                </div>

                <div className="border-t border-white/10 pt-4"></div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="form-label">Push Notifications</label>
                    <p className="text-xs text-white/60 mt-1">Receive push notifications in your browser</p>
                  </div>
                  <Switch
                    checked={preferences.pushNotifications}
                    onCheckedChange={(checked) => setPreferences({ ...preferences, pushNotifications: checked })}
                  />
                </div>

                <div className="border-t border-white/10 pt-4"></div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="form-label">Dark Mode</label>
                    <p className="text-xs text-white/60 mt-1">Use dark theme for the application</p>
                  </div>
                  <Switch
                    checked={preferences.darkMode}
                    onCheckedChange={(checked) => setPreferences({ ...preferences, darkMode: checked })}
                  />
                </div>

                <div className="border-t border-white/10 pt-4"></div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="form-label">Weekly Reports</label>
                    <p className="text-xs text-white/60 mt-1">Receive weekly progress reports</p>
                  </div>
                  <Switch
                    checked={preferences.weeklyReports}
                    onCheckedChange={(checked) => setPreferences({ ...preferences, weeklyReports: checked })}
                  />
                </div>
              </div>

              <button onClick={handlePreferencesUpdate} disabled={isLoading} className="btn-gradient w-full">
                {isLoading ? 'Updating...' : 'Update Preferences'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Security Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <div className="premium-card">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
              <Shield className="w-4 h-4 text-white/80" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Security Settings</h3>
              <p className="text-white/60 text-sm">Manage your account security</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="currentPassword" className="form-label">Current Password</label>
              <input
                id="currentPassword"
                type="password"
                className="input-premium"
                placeholder="Enter your current password"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="newPassword" className="form-label">New Password</label>
              <input
                id="newPassword"
                type="password"
                className="input-premium"
                placeholder="Enter your new password"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="form-label">Confirm New Password</label>
              <input
                id="confirmPassword"
                type="password"
                className="input-premium"
                placeholder="Confirm your new password"
              />
            </div>

            <button onClick={handlePasswordChange} disabled={isLoading} className="btn-gradient w-full">
              {isLoading ? 'Changing...' : 'Change Password'}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Account Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <div className="premium-card">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
              <Crown className="w-4 h-4 text-white/80" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Account Information</h3>
              <p className="text-white/60 text-sm">Your account details and role information</p>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="form-label">User ID</label>
              <p className="text-sm text-white/80 font-mono bg-white/5 px-3 py-2 rounded-lg">{user?.id}</p>
            </div>
            <div className="space-y-2">
              <label className="form-label">Role</label>
              <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-300 border border-purple-500/30">
                {user?.role}
              </div>
            </div>
            <div className="space-y-2">
              <label className="form-label">Member Since</label>
              <p className="text-sm text-white/80 font-mono bg-white/5 px-3 py-2 rounded-lg">{(user as any)?.createdAt ? new Date((user as any).createdAt).toLocaleDateString() : 'N/A'}</p>
            </div>
            <div className="space-y-2">
              <label className="form-label">Last Login</label>
              <p className="text-sm text-white/80 bg-white/5 px-3 py-2 rounded-lg">{(user as any)?.lastLoginAt ? new Date((user as any).lastLoginAt).toLocaleDateString() : 'N/A'}</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
} 