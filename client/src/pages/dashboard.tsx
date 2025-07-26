import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import StatsCard from '@/components/StatsCard';
import { useLocation } from 'wouter';
import { Users, GraduationCap, BarChart3, Presentation, University, TrendingUp } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const { data: stats = {} } = useQuery({
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
    <div className="p-6 space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.name}! Here's your mentoring overview.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Mentors"
            value={stats?.totalMentors || 0}
            icon={Users}
            color="text-blue-500"
            bgColor="bg-blue-500/20"
          />
          <StatsCard
            title="Active Buddies"
            value={stats?.activeBuddies || 0}
            icon={GraduationCap}
            color="text-green-500"
            bgColor="bg-green-500/20"
          />
          <StatsCard
            title="Tasks This Week"
            value={stats?.weeklyTasks || 0}
            icon={BarChart3}
            color="text-yellow-500"
            bgColor="bg-yellow-500/20"
          />
          <StatsCard
            title="Completion Rate"
            value={`${stats?.completionRate || 0}%`}
            icon={TrendingUp}
            color="text-purple-500"
            bgColor="bg-purple-500/20"
          />
        </div>

        {/* Role Selection Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Select Role to Manage</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {roleCards.map((role, index) => {
              const Icon = role.icon;
              return (
                <motion.div
                  key={role.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Card className={`cursor-pointer transition-all duration-300 ${role.borderColor}`}>
                    <CardContent className="p-6">
                      <div className="text-center">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${role.bgColor}`}>
                          <Icon className={`w-8 h-8 ${role.color}`} />
                        </div>
                        <CardTitle className="text-lg mb-2">{role.title}</CardTitle>
                        <CardDescription className="mb-4">{role.description}</CardDescription>
                        
                        <div className="flex justify-center space-x-4 text-sm mb-4">
                          <div className="text-center">
                            <p className="font-semibold">{role.stats.total}</p>
                            <p className="text-muted-foreground">Total</p>
                          </div>
                          <div className="text-center">
                            <p className={`font-semibold ${role.color}`}>{role.stats.active}</p>
                            <p className="text-muted-foreground">Active</p>
                          </div>
                        </div>

                        <Button 
                          className="w-full"
                          onClick={() => setLocation(`/${role.id}`)}
                        >
                          Manage {role.title}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity?.map((activity: any, index: number) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="flex items-center space-x-4 p-4 rounded-lg bg-muted/50"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      <span className="font-medium">{activity.mentorName}</span>
                      <span className="text-muted-foreground"> {activity.action} </span>
                      <span className="font-medium">{activity.buddyName}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
                  </div>
                  <Badge variant="secondary">{activity.type}</Badge>
                </motion.div>
              )) || (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No recent activity to display</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
