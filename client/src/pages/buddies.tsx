import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Search, UserPlus, Filter, GraduationCap, Sparkles, Crown, Star, Target, TrendingUp, Users } from 'lucide-react';
import { Link } from 'wouter';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import type { Buddy, DomainRole } from '../types';


// Use the shared Buddy type from ../types
const buddyFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  domainRole: z.enum(['frontend', 'backend', 'devops', 'qa', 'hr'])
});

export default function BuddiesPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [domainFilter, setDomainFilter] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const buddyForm = useForm<z.infer<typeof buddyFormSchema>>({
    resolver: zodResolver(buddyFormSchema),
    defaultValues: {
      name: '',
      email: '',
      domainRole: 'frontend'
    }
  });

  const { data: buddies = [], isLoading } = useQuery<Buddy[]>({
    queryKey: ['/api/buddies', { status: statusFilter, domain: domainFilter, search }],
  });

  const createBuddyMutation = useMutation({
    mutationFn: (data: any) =>
      apiRequest('POST', '/api/buddies', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/buddies'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      setIsCreateDialogOpen(false);
      buddyForm.reset();
      toast({
        title: 'Success',
        description: 'Buddy created successfully!'
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to create buddy. Please try again.',
        variant: 'destructive'
      });
    }
  });

  const onCreateBuddy = (data: z.infer<typeof buddyFormSchema>) => {
    createBuddyMutation.mutate(data);
  };

  const filteredBuddies = buddies.filter(buddy => {
    const matchesSearch = buddy?.user?.name.toLowerCase().includes(search.toLowerCase()) ||
                         buddy?.user?.email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || buddy.status === statusFilter;
    const matchesDomain = domainFilter === 'all' || buddy.domainRole === domainFilter;
    
    return matchesSearch && matchesStatus && matchesDomain;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'inactive': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'exited': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getDomainColor = (domain: string) => {
    switch (domain) {
      case 'frontend': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'backend': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'devops': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'qa': return 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200';
      case 'hr': return 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen p-6">
        <div className="premium-card animate-pulse">
          <div className="space-y-6">
            <div className="h-8 loading-shimmer rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-48 premium-card loading-shimmer"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-8"
      >
        {/* Premium Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="premium-card glass-card"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 space-y-4 lg:space-y-0">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 gradient-success rounded-xl flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gradient">Buddies</h1>
                  <div className="flex items-center gap-2 mt-1">
                    <Sparkles className="w-4 h-4 text-green-400" />
                    <p className="text-foreground-secondary">Track buddy progress and development</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Stats Summary */}
            <div className="flex items-center gap-4">
              <div className="text-center px-4 py-2 glass-card rounded-lg">
                <p className="text-2xl font-bold text-gradient">{buddies.length}</p>
                <p className="text-xs text-foreground-muted">Total</p>
              </div>
              <div className="text-center px-4 py-2 glass-card rounded-lg">
                <p className="text-2xl font-bold text-gradient">{buddies.filter(b => b.status === 'active').length}</p>
                <p className="text-xs text-foreground-muted">Active</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Premium Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="premium-card"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 gradient-accent rounded-lg flex items-center justify-center">
              <Filter className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-premium">Filter & Search</h2>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-white/40" />
              <input
                className="input-premium pl-10 w-full"
                placeholder="Search buddies by name, email, or mentor..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            
            <div className="flex gap-3">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px] input-premium">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent className="premium-card border-white/10">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="exited">Exited</SelectItem>
                </SelectContent>
              </Select>

              <Select value={domainFilter} onValueChange={setDomainFilter}>
                <SelectTrigger className="w-[140px] input-premium">
                  <SelectValue placeholder="All Domains" />
                </SelectTrigger>
                <SelectContent className="premium-card border-white/10">
                  <SelectItem value="all">All Domains</SelectItem>
                  <SelectItem value="frontend">Frontend</SelectItem>
                  <SelectItem value="backend">Backend</SelectItem>
                  <SelectItem value="devops">DevOps</SelectItem>
                  <SelectItem value="qa">QA</SelectItem>
                  <SelectItem value="hr">HR</SelectItem>
                </SelectContent>
              </Select>

              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <button className="btn-gradient hover-lift flex items-center gap-2">
                    <UserPlus className="h-4 w-4" />
                    Add Buddy
                  </button>
                </DialogTrigger>
              
              <DialogContent className="sm:max-w-[500px] premium-card border-white/10">
                <DialogHeader>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 gradient-success rounded-lg flex items-center justify-center">
                      <UserPlus className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <DialogTitle className="text-xl font-bold text-premium">Add New Buddy</DialogTitle>
                      <DialogDescription className="text-foreground-secondary">Create a new buddy profile for mentorship tracking.</DialogDescription>
                    </div>
                  </div>
                </DialogHeader>
                
                <Form {...buddyForm}>
                  <form onSubmit={buddyForm.handleSubmit(onCreateBuddy)} className="space-y-4">
                    <FormField
                      control={buddyForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter buddy's full name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={buddyForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="buddy@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={buddyForm.control}
                      name="domainRole"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Domain</FormLabel>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select domain expertise" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="frontend">Frontend</SelectItem>
                              <SelectItem value="backend">Backend</SelectItem>
                              <SelectItem value="devops">DevOps</SelectItem>
                              <SelectItem value="qa">QA</SelectItem>
                              <SelectItem value="hr">HR</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex justify-end space-x-3 pt-6">
                      <button 
                        type="button" 
                        className="px-6 py-2.5 rounded-lg border border-white/20 bg-white/5 hover:bg-white/10 transition-all duration-300 text-white/80 hover:text-white"
                        onClick={() => setIsCreateDialogOpen(false)}
                      >
                        Cancel
                      </button>
                      <button type="submit" className="btn-gradient" disabled={createBuddyMutation.isPending}>
                        {createBuddyMutation.isPending ? 'Creating...' : 'Create Buddy'}
                      </button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
            </div>
          </div>
        </motion.div>

        {/* Premium Buddies Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 gradient-success rounded-lg flex items-center justify-center">
              <Users className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-premium">Buddy Progress</h2>
            <div className="ml-auto flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-lg">
              <Star className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-medium text-white">{filteredBuddies.length} Found</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBuddies.map((buddy, index) => (
              <motion.div
                key={buddy.id}
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ 
                  duration: 0.5, 
                  delay: index * 0.1,
                  type: "spring",
                  bounce: 0.3
                }}
                className="hover-lift"
              >
                <Link href={`/buddies/${buddy.id}`}>
                  <div className="premium-card cursor-pointer group relative overflow-hidden">
                    <div className="absolute inset-0 gradient-success opacity-5 group-hover:opacity-10 transition-opacity duration-300"></div>
                    
                    <div className="relative z-10">
                      {/* Header */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="relative">
                            <Avatar className="h-12 w-12 ring-2 ring-white/20">
                              <AvatarImage src={buddy.user.avatarUrl} />
                              <AvatarFallback className="bg-gradient-success text-white font-semibold">
                                {buddy.user.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-background ${
                              buddy.status === 'active' ? 'bg-green-500' : 
                              buddy.status === 'inactive' ? 'bg-yellow-500' : 'bg-red-500'
                            }`}></div>
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-semibold text-white text-lg truncate">{buddy.user.name}</h3>
                            <p className="text-sm text-white/60 truncate">{buddy.user.email}</p>
                          </div>
                        </div>
                        <div className={`status-${buddy.status} ml-2`}>
                          {buddy.status}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-white/70">Domain:</span>
                          <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                            buddy.domainRole === 'frontend' ? 'bg-blue-500/20 text-blue-300' :
                            buddy.domainRole === 'backend' ? 'bg-purple-500/20 text-purple-300' :
                            buddy.domainRole === 'devops' ? 'bg-orange-500/20 text-orange-300' :
                            buddy.domainRole === 'qa' ? 'bg-pink-500/20 text-pink-300' :
                            'bg-teal-500/20 text-teal-300'
                          }`}>
                            {buddy.domainRole}
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-sm text-white/70">Mentor:</span>
                          <span className="text-sm font-medium text-white">
                            {buddy.mentor?.name || 'Not assigned'}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-sm text-white/70">Progress:</span>
                          <span className="text-sm font-medium text-white">
                            {buddy.stats.completedTasks}/{buddy.stats.totalTasks} tasks
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-sm text-white/70">Started:</span>
                          <span className="text-sm text-white/80">
                            {new Date(buddy.startDate).toLocaleDateString()}
                          </span>
                        </div>

                        {buddy.stats.totalTasks > 0 && (
                          <div className="mt-4">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-xs text-white/60">Task Completion</span>
                              <span className="text-xs text-white/80">
                                {Math.round((buddy.stats.completedTasks / buddy.stats.totalTasks) * 100)}%
                              </span>
                            </div>
                            <div className="progress-premium">
                              <div 
                                className="progress-bar"
                                style={{ 
                                  width: `${(buddy.stats.completedTasks / buddy.stats.totalTasks) * 100}%` 
                                }}
                              ></div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {filteredBuddies.length === 0 && (
          <div className="premium-card text-center py-16">
            <div className="w-16 h-16 gradient-success rounded-full flex items-center justify-center mx-auto mb-4">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-premium mb-2">No buddies found</h3>
            <p className="text-foreground-secondary mb-6">
              {search || statusFilter !== 'all' || domainFilter !== 'all' 
                ? 'No buddies match your current search criteria' 
                : 'Get started by adding your first buddy to the mentorship program'}
            </p>
            {(search || statusFilter !== 'all' || domainFilter !== 'all') ? (
              <button 
                className="btn-gradient"
                onClick={() => {
                  setSearch('');
                  setStatusFilter('all');
                  setDomainFilter('all');
                }}
              >
                Clear Filters
              </button>
            ) : (
              <button 
                className="btn-gradient"
                onClick={() => setIsCreateDialogOpen(true)}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Add Your First Buddy
              </button>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}