import { useState } from 'react';
import { useParams } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Calendar, CheckCircle, Clock, GitBranch, Globe } from 'lucide-react';

import { Link } from 'wouter';
import { apiRequest } from '@/lib/queryClient';

export default function BuddyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('tasks');

  const { data: buddy, isLoading } = useQuery({
    queryKey: ['/api/buddies', id],
    enabled: !!id,
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ['/api/buddies', id, 'tasks'],
    enabled: !!id,
  });

  const { data: progress } = useQuery({
    queryKey: ['/api/buddies', id, 'progress'],
    enabled: !!id,
  });

  const { data: portfolio = [] } = useQuery({
    queryKey: ['/api/buddies', id, 'portfolio'],
    enabled: !!id,
  });

  const updateProgressMutation = useMutation({
    mutationFn: ({ topicId, checked }: { topicId: string; checked: boolean }) =>
      apiRequest(`/api/buddies/${id}/progress/${topicId}`, {
        method: 'PATCH',
        body: { checked },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/buddies', id, 'progress'] });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="p-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-1/3"></div>
            <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!buddy) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="p-6 text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Buddy not found</h1>
          <Link href="/buddies">
            <Button className="mt-4">Back to Buddies</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleProgressUpdate = (topicId: string, checked: boolean) => {
    updateProgressMutation.mutate({ topicId, checked });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="p-6">
        <div className="mb-6">
          <Link href="/buddies">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Buddies
            </Button>
          </Link>
          
          <div className="flex items-center gap-6">
            <Avatar className="h-20 w-20">
              <AvatarImage src={buddy.user?.avatarUrl} />
              <AvatarFallback className="bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-200 text-2xl">
                {buddy.user?.name?.split(' ').map(n => n[0]).join('') || 'B'}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{buddy.user?.name}</h1>
              <p className="text-gray-600 dark:text-gray-400">{buddy.user?.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge className={`${buddy.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 
                  buddy.status === 'inactive' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                  'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
                  {buddy.status}
                </Badge>
                <Badge variant="outline">{buddy.domainRole}</Badge>
              </div>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
            <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
          </TabsList>

          <TabsContent value="tasks" className="space-y-4">
            <div className="grid gap-4">
              {tasks.map((task: any) => (
                <Card key={task.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{task.title}</CardTitle>
                      <Badge variant={task.status === 'completed' ? 'default' : 'secondary'}>
                        {task.status || 'pending'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">{task.description}</p>
                    
                    {task.dueDate && (
                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                        <Calendar className="h-4 w-4" />
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                      </div>
                    )}

                    {task.submissions?.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-medium">Submissions:</h4>
                        {task.submissions.map((submission: any) => (
                          <div key={submission.id} className="border rounded-lg p-3 bg-gray-50 dark:bg-gray-800">
                            {submission.githubLink && (
                              <div className="flex items-center gap-2 text-sm">
                                <GitBranch className="h-4 w-4" />
                                <a href={submission.githubLink} target="_blank" rel="noopener noreferrer" 
                                   className="text-blue-600 hover:underline">
                                  GitHub Repository
                                </a>
                              </div>
                            )}
                            {submission.deployedUrl && (
                              <div className="flex items-center gap-2 text-sm">
                                <Globe className="h-4 w-4" />
                                <a href={submission.deployedUrl} target="_blank" rel="noopener noreferrer"
                                   className="text-blue-600 hover:underline">
                                  Live Demo
                                </a>
                              </div>
                            )}
                            {submission.notes && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{submission.notes}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}

              {tasks.length === 0 && (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No tasks yet</h3>
                  <p className="text-gray-600 dark:text-gray-400">Tasks will appear here when assigned by a mentor</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="progress" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Technical Progress</CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Track learning milestones and skill development
                </p>
              </CardHeader>
              <CardContent>
                {progress && (
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Overall Progress</span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {progress.percentage}%
                        </span>
                      </div>
                      <Progress value={progress.percentage} className="h-2" />
                    </div>

                    <div className="space-y-3">
                      {progress.topics?.map((topic: any) => (
                        <div key={topic.id} className="flex items-center space-x-3">
                          <Checkbox
                            checked={topic.checked}
                            onCheckedChange={(checked) => handleProgressUpdate(topic.id, checked as boolean)}
                            disabled={updateProgressMutation.isPending}
                          />
                          <span className={`flex-1 ${topic.checked ? 'line-through text-gray-500' : ''}`}>
                            {topic.name}
                          </span>
                          {topic.checked && (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="portfolio" className="space-y-4">
            <div className="grid gap-6">
              {portfolio.map((project: any) => (
                <Card key={project.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle>{project.title}</CardTitle>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Completed on {new Date(project.completedAt).toLocaleDateString()}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">{project.description}</p>
                    
                    <div className="flex gap-4 mb-4">
                      {project.githubLink && (
                        <a href={project.githubLink} target="_blank" rel="noopener noreferrer"
                           className="flex items-center gap-2 text-blue-600 hover:underline">
                          <GitBranch className="h-4 w-4" />
                          Code
                        </a>
                      )}
                      {project.deployedUrl && (
                        <a href={project.deployedUrl} target="_blank" rel="noopener noreferrer"
                           className="flex items-center gap-2 text-blue-600 hover:underline">
                          <Globe className="h-4 w-4" />
                          Live Demo
                        </a>
                      )}
                    </div>

                    {project.technologies?.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {project.technologies.map((tech: string) => (
                          <Badge key={tech} variant="outline">{tech}</Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}

              {portfolio.length === 0 && (
                <div className="text-center py-8">
                  <GitBranch className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No projects yet</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Completed tasks will automatically be added to the portfolio
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="details" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Buddy Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                  <Input value={buddy.user?.name || ''} readOnly />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                  <Input value={buddy.user?.email || ''} readOnly />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Domain Role</label>
                  <Input value={buddy.domainRole || ''} readOnly />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                  <Input value={buddy.status || ''} readOnly />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Assigned Mentor</label>
                  <Input value={buddy.mentor?.name || 'Not assigned'} readOnly />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Start Date</label>
                  <Input value={buddy.startDate ? new Date(buddy.startDate).toLocaleDateString() : ''} readOnly />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}