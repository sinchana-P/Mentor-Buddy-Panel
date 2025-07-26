import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users, 
  GraduationCap, 
  CheckSquare, 
  MessageCircle, 
  BookOpen, 
  TrendingUp,
  Clock,
  MoreHorizontal
} from 'lucide-react';

interface Activity {
  id: string;
  type: 'task_completed' | 'buddy_assigned' | 'message_sent' | 'progress_updated' | 'resource_added' | 'mentor_joined';
  title: string;
  description: string;
  timestamp: string;
  user?: {
    name: string;
    avatarUrl?: string;
    role: string;
  };
  metadata?: {
    taskTitle?: string;
    buddyName?: string;
    mentorName?: string;
    progress?: number;
    resourceTitle?: string;
  };
}

interface RecentActivitiesProps {
  maxItems?: number;
  showViewAll?: boolean;
}

export default function RecentActivities({ maxItems = 5, showViewAll = true }: RecentActivitiesProps) {
  const [activities] = useState<Activity[]>([
    {
      id: '1',
      type: 'task_completed',
      title: 'Task Completed',
      description: 'React Fundamentals course completed',
      timestamp: '2 hours ago',
      user: {
        name: 'Sarah Johnson',
        role: 'buddy'
      },
      metadata: {
        taskTitle: 'React Fundamentals',
        progress: 100
      }
    },
    {
      id: '2',
      type: 'buddy_assigned',
      title: 'New Buddy Assigned',
      description: 'Assigned to mentor John Smith',
      timestamp: '4 hours ago',
      user: {
        name: 'Mike Chen',
        role: 'buddy'
      },
      metadata: {
        mentorName: 'John Smith'
      }
    },
    {
      id: '3',
      type: 'message_sent',
      title: 'Message Sent',
      description: 'Sent feedback on TypeScript project',
      timestamp: '6 hours ago',
      user: {
        name: 'Emily Davis',
        role: 'mentor'
      },
      metadata: {
        buddyName: 'Alex Wilson'
      }
    },
    {
      id: '4',
      type: 'progress_updated',
      title: 'Progress Updated',
      description: 'Advanced to intermediate level',
      timestamp: '1 day ago',
      user: {
        name: 'David Brown',
        role: 'buddy'
      },
      metadata: {
        progress: 75
      }
    },
    {
      id: '5',
      type: 'resource_added',
      title: 'Resource Added',
      description: 'Added Docker tutorial to resources',
      timestamp: '2 days ago',
      user: {
        name: 'Lisa Wang',
        role: 'mentor'
      },
      metadata: {
        resourceTitle: 'Docker for Beginners'
      }
    },
    {
      id: '6',
      type: 'mentor_joined',
      title: 'New Mentor Joined',
      description: 'Welcome to the platform',
      timestamp: '3 days ago',
      user: {
        name: 'Robert Taylor',
        role: 'mentor'
      }
    }
  ]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'task_completed':
        return <CheckSquare className="h-4 w-4 text-green-500" />;
      case 'buddy_assigned':
        return <Users className="h-4 w-4 text-blue-500" />;
      case 'message_sent':
        return <MessageCircle className="h-4 w-4 text-purple-500" />;
      case 'progress_updated':
        return <TrendingUp className="h-4 w-4 text-orange-500" />;
      case 'resource_added':
        return <BookOpen className="h-4 w-4 text-indigo-500" />;
      case 'mentor_joined':
        return <GraduationCap className="h-4 w-4 text-teal-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'task_completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'buddy_assigned':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'message_sent':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'progress_updated':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'resource_added':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200';
      case 'mentor_joined':
        return 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const displayActivities = activities.slice(0, maxItems);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Recent Activities</CardTitle>
            <CardDescription>Latest updates from your team</CardDescription>
          </div>
          {showViewAll && (
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {displayActivities.map((activity, index) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex-shrink-0">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getActivityColor(activity.type)}`}>
                  {getActivityIcon(activity.type)}
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <p className="text-sm font-medium">{activity.title}</p>
                  <Badge variant="outline" className="text-xs">
                    {activity.user?.role}
                  </Badge>
                </div>
                
                <p className="text-sm text-muted-foreground mb-2">
                  {activity.description}
                </p>
                
                {activity.metadata && (
                  <div className="text-xs text-muted-foreground space-y-1">
                    {activity.metadata.taskTitle && (
                      <p>Task: {activity.metadata.taskTitle}</p>
                    )}
                    {activity.metadata.buddyName && (
                      <p>Buddy: {activity.metadata.buddyName}</p>
                    )}
                    {activity.metadata.mentorName && (
                      <p>Mentor: {activity.metadata.mentorName}</p>
                    )}
                    {activity.metadata.progress && (
                      <p>Progress: {activity.metadata.progress}%</p>
                    )}
                    {activity.metadata.resourceTitle && (
                      <p>Resource: {activity.metadata.resourceTitle}</p>
                    )}
                  </div>
                )}
                
                <p className="text-xs text-muted-foreground mt-2">
                  {activity.timestamp}
                </p>
              </div>
              
              {activity.user && (
                <div className="flex-shrink-0">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={activity.user.avatarUrl} alt={activity.user.name} />
                    <AvatarFallback className="text-xs">
                      {activity.user.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                </div>
              )}
            </motion.div>
          ))}
        </div>
        
        {showViewAll && activities.length > maxItems && (
          <div className="mt-4 pt-4 border-t">
            <Button variant="outline" className="w-full">
              View All Activities
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 