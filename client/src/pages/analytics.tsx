import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Calendar, TrendingUp, Users, Target, Clock, CheckCircle, AlertCircle } from 'lucide-react';

export default function Analytics() {
  const [timeRange, setTimeRange] = useState('30d');
  const [isLoading, setIsLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState({
    overview: {
      totalMentors: 0,
      totalBuddies: 0,
      activeTasks: 0,
      completedTasks: 0,
      completionRate: 0,
      averageRating: 0
    },
    trends: {
      weeklyTasks: [],
      monthlyProgress: [],
      mentorPerformance: []
    },
    insights: []
  });

  useEffect(() => {
    // TODO: Fetch analytics data
    setAnalyticsData({
      overview: {
        totalMentors: 12,
        totalBuddies: 45,
        activeTasks: 23,
        completedTasks: 156,
        completionRate: 87,
        averageRating: 4.2
      },
      trends: {
        weeklyTasks: [
          { week: 'Week 1', tasks: 15, completed: 12 },
          { week: 'Week 2', tasks: 18, completed: 16 },
          { week: 'Week 3', tasks: 22, completed: 19 },
          { week: 'Week 4', tasks: 20, completed: 18 }
        ],
        monthlyProgress: [
          { month: 'Jan', progress: 65 },
          { month: 'Feb', progress: 72 },
          { month: 'Mar', progress: 78 },
          { month: 'Apr', progress: 85 }
        ],
        mentorPerformance: [
          { name: 'John Doe', rating: 4.5, tasks: 25 },
          { name: 'Jane Smith', rating: 4.8, tasks: 30 },
          { name: 'Mike Johnson', rating: 4.2, tasks: 18 }
        ]
      },
      insights: [
        {
          type: 'success',
          title: 'High Completion Rate',
          description: 'Task completion rate increased by 15% this month',
          icon: CheckCircle
        },
        {
          type: 'warning',
          title: 'Mentor Workload',
          description: 'Some mentors have high task loads, consider redistribution',
          icon: AlertCircle
        }
      ]
    });
    setIsLoading(false);
  }, [timeRange]);

  const getMetricIcon = (metric: string) => {
    switch (metric) {
      case 'mentors':
        return <Users className="h-4 w-4" />;
      case 'buddies':
        return <Users className="h-4 w-4" />;
      case 'tasks':
        return <Target className="h-4 w-4" />;
      case 'completion':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <TrendingUp className="h-4 w-4" />;
    }
  };

  const getMetricColor = (metric: string) => {
    switch (metric) {
      case 'mentors':
        return 'text-blue-500 bg-blue-500/20';
      case 'buddies':
        return 'text-green-500 bg-green-500/20';
      case 'tasks':
        return 'text-purple-500 bg-purple-500/20';
      case 'completion':
        return 'text-orange-500 bg-orange-500/20';
      default:
        return 'text-gray-500 bg-gray-500/20';
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="grid gap-6 md:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex justify-between items-center"
      >
        <div>
          <h1 className="text-3xl font-bold mb-2">Analytics</h1>
          <p className="text-muted-foreground">Track performance and insights</p>
        </div>
        <div className="flex items-center space-x-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </motion.div>

      {/* Overview Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Mentors</CardTitle>
            <Badge className={getMetricColor('mentors')}>
              {getMetricIcon('mentors')}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.overview.totalMentors}</div>
            <p className="text-xs text-muted-foreground">
              +2 from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Buddies</CardTitle>
            <Badge className={getMetricColor('buddies')}>
              {getMetricIcon('buddies')}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.overview.totalBuddies}</div>
            <p className="text-xs text-muted-foreground">
              +8 from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Tasks</CardTitle>
            <Badge className={getMetricColor('tasks')}>
              {getMetricIcon('tasks')}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.overview.activeTasks}</div>
            <p className="text-xs text-muted-foreground">
              {analyticsData.overview.completedTasks} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <Badge className={getMetricColor('completion')}>
              {getMetricIcon('completion')}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.overview.completionRate}%</div>
            <Progress value={analyticsData.overview.completionRate} className="mt-2" />
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Weekly Task Trends */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Weekly Task Trends</CardTitle>
              <CardDescription>Task creation and completion over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.trends.weeklyTasks.map((week, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{week.week}</span>
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-muted-foreground">
                        {week.completed}/{week.tasks} completed
                      </span>
                      <Progress 
                        value={(week.completed / week.tasks) * 100} 
                        className="w-20" 
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Monthly Progress */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Monthly Progress</CardTitle>
              <CardDescription>Overall progress tracking</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.trends.monthlyProgress.map((month, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{month.month}</span>
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-muted-foreground">
                        {month.progress}%
                      </span>
                      <Progress value={month.progress} className="w-20" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Mentor Performance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Mentors</CardTitle>
            <CardDescription>Mentors with highest ratings and task completion</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.trends.mentorPerformance.map((mentor, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{mentor.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {mentor.tasks} tasks completed
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary">{mentor.rating} ⭐</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Insights & Recommendations</CardTitle>
            <CardDescription>AI-powered insights for improvement</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.insights.map((insight, index) => (
                <div key={index} className="flex items-start space-x-4 p-4 border rounded-lg">
                  <insight.icon className={`h-5 w-5 mt-0.5 ${
                    insight.type === 'success' ? 'text-green-500' : 'text-yellow-500'
                  }`} />
                  <div>
                    <p className="font-medium">{insight.title}</p>
                    <p className="text-sm text-muted-foreground">{insight.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
} 