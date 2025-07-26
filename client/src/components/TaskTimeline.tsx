import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Code, Clock, ExternalLink, Github } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  dueDate: string;
  createdAt: string;
  submissions?: Array<{
    id: string;
    githubLink?: string;
    deployedUrl?: string;
    notes?: string;
    feedback?: string;
    createdAt: string;
  }>;
}

interface TaskTimelineProps {
  tasks: Task[];
  buddy: {
    user: {
      name: string;
      avatarUrl?: string;
    };
    mentor: {
      user: {
        name: string;
        avatarUrl?: string;
      };
    };
  };
}

export default function TaskTimeline({ tasks, buddy }: TaskTimelineProps) {
  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'text-gray-500 bg-gray-500/20',
      in_progress: 'text-yellow-500 bg-yellow-500/20',
      completed: 'text-green-500 bg-green-500/20',
      overdue: 'text-red-500 bg-red-500/20',
    };
    return colors[status as keyof typeof colors] || 'text-gray-500 bg-gray-500/20';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <Code className="w-5 h-5 text-white" />;
      case 'in_progress':
        return <Clock className="w-5 h-5 text-white" />;
      default:
        return <Code className="w-5 h-5 text-white" />;
    }
  };

  if (!tasks || tasks.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Code className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>No tasks assigned yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {tasks.map((task, index) => (
        <motion.div
          key={task.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
          className="flex space-x-4"
        >
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              {getStatusIcon(task.status)}
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold">{task.title}</h3>
                    <p className="text-xs text-muted-foreground">
                      {new Date(task.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge className={getStatusColor(task.status)}>
                    {task.status.replace('_', ' ')}
                  </Badge>
                </div>
                
                <p className="text-sm text-muted-foreground mb-3">
                  {task.description}
                </p>

                {/* Submissions */}
                {task.submissions?.map((submission) => (
                  <div key={submission.id} className="bg-muted rounded p-3 mb-3">
                    <div className="flex items-center space-x-2 mb-2">
                      <Avatar className="w-6 h-6">
                        <AvatarImage src={buddy.user.avatarUrl} alt={buddy.user.name} />
                        <AvatarFallback className="text-xs">
                          {buddy.user.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">{buddy.user.name}</span>
                      <span className="text-xs text-muted-foreground">submitted</span>
                    </div>
                    
                    <div className="space-y-2">
                      {submission.githubLink && (
                        <div className="flex items-center space-x-2">
                          <Github className="w-4 h-4 text-muted-foreground" />
                          <a 
                            href={submission.githubLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline"
                          >
                            View Code
                          </a>
                        </div>
                      )}
                      
                      {submission.deployedUrl && (
                        <div className="flex items-center space-x-2">
                          <ExternalLink className="w-4 h-4 text-muted-foreground" />
                          <a 
                            href={submission.deployedUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline"
                          >
                            View Demo
                          </a>
                        </div>
                      )}
                      
                      {submission.notes && (
                        <p className="text-sm">{submission.notes}</p>
                      )}
                    </div>
                  </div>
                ))}

                {/* Mentor Feedback */}
                {task.submissions?.[0]?.feedback && (
                  <div className="bg-primary/10 rounded p-3">
                    <div className="flex items-center space-x-2 mb-2">
                      <Avatar className="w-6 h-6">
                        <AvatarImage src={buddy.mentor.user.avatarUrl} alt={buddy.mentor.user.name} />
                        <AvatarFallback className="text-xs">
                          {buddy.mentor.user.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">{buddy.mentor.user.name}</span>
                      <span className="text-xs text-muted-foreground">provided feedback</span>
                    </div>
                    <p className="text-sm">{task.submissions[0].feedback}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
