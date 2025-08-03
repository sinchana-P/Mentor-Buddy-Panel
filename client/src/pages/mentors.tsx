import { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import MentorCard from '@/components/MentorCard';
import { Plus, Search, UserCheck, Filter, Star, Sparkles, Crown, Users } from 'lucide-react';
import { useGetMentorsQuery, useCreateMentorMutation } from '@/api/mentorsApi';
import { useToast } from '@/hooks/use-toast';

const mentorFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  domainRole: z.enum(['frontend', 'backend', 'devops', 'qa', 'hr']),
  expertise: z.string().min(10, 'Please describe expertise (minimum 10 characters)'),
  experience: z.string().min(10, 'Please describe experience (minimum 10 characters)'),
});

export default function MentorsPage() {
  const [filters, setFilters] = useState({
    role: 'all',
    status: 'all',
    search: '',
  });
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { toast } = useToast();

  const mentorForm = useForm<z.infer<typeof mentorFormSchema>>({
    resolver: zodResolver(mentorFormSchema),
    defaultValues: {
      name: '',
      email: '',
      domainRole: 'frontend',
      expertise: '',
      experience: '',
    }
  });

  const { data: mentors = [], isLoading } = useGetMentorsQuery({
    domain: filters.role !== 'all' ? filters.role : undefined,
    search: filters.search || undefined,
  });

  const [createMentor] = useCreateMentorMutation();

  const handleCreateMentor = async (data: z.infer<typeof mentorFormSchema>) => {
    try {
      await createMentor(data as any).unwrap();
      setIsCreateDialogOpen(false);
      mentorForm.reset();
      toast({
        title: "Success",
        description: "Mentor created successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.data?.message || "Failed to create mentor",
        variant: "destructive",
      });
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const onSubmit = (data: z.infer<typeof mentorFormSchema>) => {
    handleCreateMentor(data);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
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
          className="premium-card glass-card mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 space-y-4 lg:space-y-0">
            <div className="space-y-3">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center mt-1">
                  <Crown className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gradient mb-2">Mentors</h1>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <p className="text-foreground-secondary">Premium mentor management system</p>
                  </div>
                </div>
              </div>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <button className="btn-gradient hover-lift flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Add Mentor
                </button>
              </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] premium-card border-white/10 fixed-modal">
              <DialogHeader>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
                    <UserCheck className="w-4 h-4 text-white" />
                  </div>
                  <DialogTitle className="text-xl font-bold text-premium">Add New Mentor</DialogTitle>
                </div>
              </DialogHeader>
              <Form {...mentorForm}>
                <form onSubmit={mentorForm.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={mentorForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="form-label">Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter mentor's full name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={mentorForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="form-label">Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="Enter email address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={mentorForm.control}
                    name="domainRole"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="form-label">Domain Role</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select domain" />
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
                  <FormField
                    control={mentorForm.control}
                    name="expertise"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="form-label">Expertise</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe technical expertise and skills..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={mentorForm.control}
                    name="experience"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="form-label">Experience</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe work experience and background..."
                            {...field}
                          />
                        </FormControl>
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
                    <button type="submit" className="btn-gradient" disabled={false}>
                      Create Mentor
                    </button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Premium Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="premium-card mb-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 gradient-accent rounded-lg flex items-center justify-center">
              <Filter className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-premium">Filter & Search</h2>
          </div>
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-white/40" />
              <input
                className="input-premium pl-10 w-full"
                placeholder="Search mentors by name, expertise, or domain..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>
            <Select value={filters.role} onValueChange={(value) => handleFilterChange('role', value)}>
              <SelectTrigger className="w-[180px] input-premium">
                <SelectValue placeholder="All Roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="frontend">Frontend</SelectItem>
                <SelectItem value="backend">Backend</SelectItem>
                <SelectItem value="devops">DevOps</SelectItem>
                <SelectItem value="qa">QA</SelectItem>
                <SelectItem value="hr">HR</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
              <SelectTrigger className="w-[180px] input-premium">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </motion.div>

        {/* Premium Mentors Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 gradient-success rounded-lg flex items-center justify-center">
              <Users className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-premium">Available Mentors</h2>
            <div className="ml-auto flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-lg">
              <Star className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-medium text-white">{mentors?.length || 0} Total</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {mentors && mentors.length > 0 ? mentors.map((mentor: any, index: number) => (
              <motion.div
                key={mentor.id}
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ 
                  duration: 0.5, 
                  delay: index * 0.1,
                  type: "spring",
                  bounce: 0.3
                }}
                className="hover-lift h-full" // Added h-full for consistent height
              >
                <MentorCard mentor={mentor} />
              </motion.div>
            )) : (
              <div className="col-span-full">
                <div className="premium-card text-center py-16">
                  <div className="w-16 h-16 gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-premium mb-2">No mentors found</h3>
                  <p className="text-foreground-secondary mb-6">No mentors match your current search criteria</p>
                  <button 
                    className="btn-gradient"
                    onClick={() => setFilters({ role: 'all', status: 'all', search: '' })}
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
      </motion.div>
    </div>
)}