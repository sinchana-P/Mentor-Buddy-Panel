import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import StatsCard from '@/components/StatsCard';
import RecentActivities from '@/components/RecentActivities';
import { useLocation } from 'wouter';
import { Users, GraduationCap, BarChart3, Presentation, University, TrendingUp, Zap, Target, Award, Clock } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const { data: stats = {} as any } = useQuery({
    queryKey: ['/api/dashboard/stats'],
    enabled: !!user,
  });

  const { data: recentActivity = [] } = useQuery({
    queryKey: ['/api/dashboard/activity'],
    enabled: !!user,
  });

  const roleCards = [
    {
      id: 'mentors',
      title: 'Mentors',
      description: 'Manage mentor profiles and assignments',
      icon: Presentation,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/20',
      borderColor: 'hover:border-blue-500',
      stats: {
        total: stats?.mentors?.total || 0,
        active: stats?.mentors?.active || 0,
      },
    },
    {
      id: 'buddies',
      title: 'Buddies',
      description: 'Track buddy progress and development',
      icon: University,
      color: 'text-green-500',
      bgColor: 'bg-green-500/20',
      borderColor: 'hover:border-green-500',
      stats: {
        total: stats?.buddies?.total || 0,
        active: stats?.buddies?.active || 0,
      },
    },
    {
      id: 'analytics',
      title: 'Analytics',
      description: 'View reports and performance metrics',
      icon: BarChart3,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/20',
      borderColor: 'hover:border-purple-500',
      stats: {
        reports: stats?.analytics?.reports || 0,
        growth: stats?.analytics?.growth || '+0%',
      },
    },
  ];

  return (
    <div className="min-h-screen p-6 space-y-8">
      {/* Hero Section with Premium Welcome */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative overflow-hidden"
      >
        <div className="premium-card glass-card mb-8">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <motion.h1 
                className="text-4xl font-bold text-gradient"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
              >
                Welcome back, {user?.name}
              </motion.h1>
              <motion.p 
                className="text-foreground-secondary text-lg"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                Here's your mentoring platform overview
              </motion.p>
            </div>
            <div className="hidden md:block">
              <div className="w-20 h-20 rounded-full gradient-primary animate-float flex items-center justify-center">
                <Award className="w-10 h-10 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Premium Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="gradient-card gradient-primary hover-lift"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm font-medium">Total Mentors</p>
                <p className="text-3xl font-bold text-white">{stats?.totalMentors || 0}</p>
                <p className="text-white/60 text-xs mt-1">+12% from last month</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="gradient-card gradient-success hover-lift"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm font-medium">Active Buddies</p>
                <p className="text-3xl font-bold text-white">{stats?.activeBuddies || 0}</p>
                <p className="text-white/60 text-xs mt-1">+8% from last month</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="gradient-card gradient-accent hover-lift"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm font-medium">Tasks This Week</p>
                <p className="text-3xl font-bold text-white">{stats?.weeklyTasks || 0}</p>
                <p className="text-white/60 text-xs mt-1">+24 new tasks</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="gradient-card gradient-purple hover-lift"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm font-medium">Completion Rate</p>
                <p className="text-3xl font-bold text-white">{stats?.completionRate || 0}%</p>
                <p className="text-white/60 text-xs mt-1">+5% improvement</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Premium Role Management Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-premium">Platform Management</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {roleCards.map((role, index) => {
              const Icon = role.icon;
              return (
                <motion.div
                  key={role.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
                  className="premium-card hover-lift cursor-pointer group"
                  onClick={() => setLocation(`/${role.id}`)}
                >
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 gradient-primary rounded-xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-bold text-premium mb-2">{role.title}</h3>
                      <p className="text-foreground-secondary text-sm mb-4">{role.description}</p>
                    </div>
                    
                    <div className="flex justify-center gap-6 mb-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gradient">{role.stats.total}</p>
                        <p className="text-xs text-foreground-muted">Total</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gradient">{role.stats.active}</p>
                        <p className="text-xs text-foreground-muted">Active</p>
                      </div>
                    </div>

                    <button className="btn-gradient w-full group-hover:scale-105 transition-transform duration-300">
                      Manage {role.title}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Premium Activity & Actions Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activities with Premium Design */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="premium-card"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 gradient-accent rounded-lg flex items-center justify-center">
                <Clock className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-xl font-bold text-premium">Recent Activities</h3>
            </div>
            <RecentActivities maxItems={5} />
          </motion.div>
          
          {/* Premium Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.9, duration: 0.6 }}
            className="premium-card"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 gradient-success rounded-lg flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-xl font-bold text-premium">Quick Actions</h3>
            </div>
            
            <div className="space-y-3">
              <button 
                className="w-full p-4 glass-card hover-lift flex items-center gap-3 text-left"
                onClick={() => setLocation('/tasks')}
              >
                <div className="w-10 h-10 gradient-primary rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Create New Task</p>
                  <p className="text-sm text-foreground-secondary">Assign tasks to buddies</p>
                </div>
              </button>
              
              <button 
                className="w-full p-4 glass-card hover-lift flex items-center gap-3 text-left"
                onClick={() => setLocation('/buddies')}
              >
                <div className="w-10 h-10 gradient-success rounded-lg flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Assign Buddy to Mentor</p>
                  <p className="text-sm text-foreground-secondary">Connect learning pairs</p>
                </div>
              </button>
              
              <button 
                className="w-full p-4 glass-card hover-lift flex items-center gap-3 text-left"
                onClick={() => setLocation('/resources')}
              >
                <div className="w-10 h-10 gradient-accent rounded-lg flex items-center justify-center">
                  <University className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Add Learning Resource</p>
                  <p className="text-sm text-foreground-secondary">Expand the knowledge base</p>
                </div>
              </button>
              
              <button 
                className="w-full p-4 glass-card hover-lift flex items-center gap-3 text-left"
                onClick={() => setLocation('/analytics')}
              >
                <div className="w-10 h-10 gradient-purple rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">View Analytics Report</p>
                  <p className="text-sm text-foreground-secondary">Track platform performance</p>
                </div>
              </button>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
