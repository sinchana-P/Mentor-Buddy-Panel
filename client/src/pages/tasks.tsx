import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Calendar, Plus, Search, Filter, CheckCircle, Clock, AlertCircle, Edit, Trash2, ClipboardList, Sparkles } from 'lucide-react';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiRequest } from '@/lib/queryClient';

const taskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  buddyId: z.string().min(1, 'Please select a buddy'),
  dueDate: z.string().optional(),
});

type TaskFormData = z.infer<typeof taskSchema>;

export default function TasksPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const form = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: '',
      description: '',
      buddyId: '',
      dueDate: '',
    },
  });

  const editForm = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: '',
      description: '',
      buddyId: '',
      dueDate: '',
    },
  });

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['/api/tasks', { status: statusFilter, search }],
  });

  const { data: buddies = [] } = useQuery({
    queryKey: ['/api/buddies'],
  });

  const createTaskMutation = useMutation({
    mutationFn: async (data: TaskFormData) => {
      const response = await apiRequest('POST', '/api/tasks', {
        ...data,
        dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : null,
        mentorId: 'mentor-1', // This would be dynamic based on current user
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      setIsCreateDialogOpen(false);
      form.reset();
    },
  });

  // Add edit and delete mutations
  const editTaskMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string, data: Partial<TaskFormData> }) => {
      await apiRequest('PATCH', `/api/tasks/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      setEditingTaskId(null);
      editForm.reset();
    },
  });
  
  const deleteTaskMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest('DELETE', `/api/tasks/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      setDeletingTaskId(null);
    },
  });

  // Handle editing a task
  const handleEditTask = (task: any) => {
    setEditingTaskId(task.id);
    editForm.reset({
      title: task.title,
      description: task.description,
      buddyId: task.buddyId,
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 10) : '',
    });
  };

  // Handle edit form submission
  const onEditSubmit = (data: TaskFormData) => {
    if (editingTaskId) {
      editTaskMutation.mutate({ id: editingTaskId, data });
    }
  };

  // Handle delete confirmation
  const handleDeleteTask = (taskId: string) => {
    deleteTaskMutation.mutate(taskId);
  };

  const filteredTasks = Array.isArray(tasks) ? tasks.filter((task: any) => {
    const matchesSearch = task.title.toLowerCase().includes(search.toLowerCase()) ||
                         task.description.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  }) : [];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'in_progress': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'overdue': return <AlertCircle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'overdue': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const onSubmit = (data: TaskFormData) => {
    createTaskMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-1/4"></div>
            <div className="grid gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
  );
}

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
            <ClipboardList className="w-6 h-6 text-white/80" />
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-white mb-2">Tasks</h1>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <p className="text-white/60">Create and manage tasks for your buddies</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Filters and Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="premium-card mb-6"
      >
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 h-4 w-4" />
            <input
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-premium pl-10"
            />
          </div>
          
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="select-trigger w-[140px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>

            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <button className="btn-gradient">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Task
                </button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Create New Task</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="form-label">Title</FormLabel>
                          <FormControl>
                            <input placeholder="Enter task title" {...field} className="input-premium" />
                          </FormControl>
                          <FormMessage className="text-red-400" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="form-label">Description</FormLabel>
                          <FormControl>
                            <textarea placeholder="Enter task description" {...field} className="input-premium" rows={3} />
                          </FormControl>
                          <FormMessage className="text-red-400" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="buddyId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="form-label">Assign to Buddy</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="select-trigger">
                                <SelectValue placeholder="Select a buddy" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Array.isArray(buddies) && buddies.map((buddy: any) => (
                                <SelectItem key={buddy.id} value={buddy.id}>
                                  {buddy.user?.name || 'Unknown Buddy'} ({buddy.user?.domainRole || 'Unknown'})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-red-400" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="dueDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="form-label">Due Date (Optional)</FormLabel>
                          <FormControl>
                            <input type="date" {...field} className="input-premium" />
                          </FormControl>
                          <FormMessage className="text-red-400" />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end gap-2 pt-4">
                      <button
                        type="button"
                        onClick={() => setIsCreateDialogOpen(false)}
                        className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white/80 hover:text-white"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={createTaskMutation.isPending}
                        className="btn-gradient"
                      >
                        {createTaskMutation.isPending ? 'Creating...' : 'Create Task'}
                      </button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </motion.div>

      {/* Tasks List */}
      <div className="space-y-4">
        {filteredTasks.map((task: any, index: number) => (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="premium-card group hover:bg-white/[0.08] transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                {getStatusIcon(task.status)}
                <h3 className="text-lg font-bold text-white">{task.title}</h3>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => handleEditTask(task)}
                  className="opacity-0 group-hover:opacity-100 p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all duration-200 text-white/60 hover:text-white"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setDeletingTaskId(task.id)}
                  className="opacity-0 group-hover:opacity-100 p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 transition-all duration-200 text-red-400 hover:text-red-300"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                  task.status === 'completed' ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
                  task.status === 'in_progress' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' :
                  task.status === 'overdue' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                  'bg-white/10 text-white/70 border border-white/20'
                }`}>
                  {task.status || 'pending'}
                </div>
              </div>
            </div>
            <p className="text-white/70 mb-4">{task.description}</p>
            <div className="flex items-center justify-between text-sm text-white/60">
              <div className="flex items-center gap-4">
                <span>Assigned to: {task.buddy?.user?.name || 'Unknown'}</span>
                {task.dueDate && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Due: {new Date(task.dueDate).toLocaleDateString()}
                  </div>
                )}
              </div>
              <span>Created: {new Date(task.createdAt).toLocaleDateString()}</span>
            </div>
            {task.submissions?.length > 0 && (
              <div className="mt-4 pt-4 border-t border-white/10">
                <h4 className="font-medium mb-2 text-white">Latest Submission:</h4>
                <div className="text-sm text-white/70">
                  {task.submissions[0].notes && (
                    <p>{task.submissions[0].notes}</p>
                  )}
                  <div className="flex gap-4 mt-2">
                    {task.submissions[0].githubLink && (
                      <a href={task.submissions[0].githubLink} target="_blank" rel="noopener noreferrer"
                         className="text-blue-400 hover:text-blue-300 hover:underline transition-colors">
                        GitHub Repository
                      </a>
                    )}
                    {task.submissions[0].deployedUrl && (
                      <a href={task.submissions[0].deployedUrl} target="_blank" rel="noopener noreferrer"
                         className="text-blue-400 hover:text-blue-300 hover:underline transition-colors">
                        Live Demo
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
          ))}

        {filteredTasks.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="premium-card text-center py-12"
          >
            <Clock className="h-12 w-12 text-white/40 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No tasks found</h3>
            <p className="text-white/60 mb-4">
              {search || statusFilter !== 'all' 
                ? 'Try adjusting your filters' 
                : 'Get started by creating your first task'}
            </p>
            <button
              onClick={() => setIsCreateDialogOpen(true)}
              className="btn-gradient"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Task
            </button>
          </motion.div>
        )}
        </div>

      {/* Edit Task Modal */}
      <Dialog open={!!editingTaskId} onOpenChange={() => setEditingTaskId(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>
            <Form {...editForm}>
              <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="form-label">Title</FormLabel>
                    <FormControl>
                      <input placeholder="Enter task title" {...field} className="input-premium" />
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="form-label">Description</FormLabel>
                    <FormControl>
                      <textarea placeholder="Enter task description" {...field} className="input-premium" rows={3} />
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="buddyId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="form-label">Assign to Buddy</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="select-trigger">
                          <SelectValue placeholder="Select a buddy" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Array.isArray(buddies) && buddies.map((buddy: any) => (
                          <SelectItem key={buddy.id} value={buddy.id}>
                            {buddy.user?.name || 'Unknown Buddy'} ({buddy.user?.domainRole || 'Unknown'})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="form-label">Due Date (Optional)</FormLabel>
                    <FormControl>
                      <input type="date" {...field} className="input-premium" />
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-2 pt-4">
                <button type="button" onClick={() => setEditingTaskId(null)} className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white/80 hover:text-white">
                  Cancel
                </button>
                <button type="submit" disabled={editTaskMutation.isPending} className="btn-gradient">
                  {editTaskMutation.isPending ? 'Saving...' : 'Save'}
                </button>
              </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

      {/* Delete Task Modal */}
      <Dialog open={!!deletingTaskId} onOpenChange={() => setDeletingTaskId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Task</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">Are you sure you want to delete this task? This action cannot be undone.</p>
          <div className="flex justify-end gap-2 mt-4">
            <button type="button" onClick={() => setDeletingTaskId(null)} className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white/80 hover:text-white">
              Cancel
            </button>
            <button 
              type="button" 
              onClick={() => deletingTaskId && handleDeleteTask(deletingTaskId)} 
              disabled={deleteTaskMutation.isPending}
              className="px-4 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 transition-colors text-red-400 hover:text-red-300 border border-red-500/30"
            >
              {deleteTaskMutation.isPending ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}