import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { MessageCircle, Edit, Trash2 } from 'lucide-react';
import { useLocation } from 'wouter';
import MessageModal from './MessageModal';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useUpdateMentorMutation, useDeleteMentorMutation } from '@/api/mentorsApi';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface MentorCardProps {
  mentor: {
    id: string;
    user: {
      name: string;
      domainRole: string;
      avatarUrl?: string;
    } | null;
    expertise: string;
    experience: string;
    responseRate: number;
    isActive: boolean;
    stats?: {
      buddiesCount: number;
      completedTasks: number;
    };
  };
}

const mentorFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  domainRole: z.enum(['frontend', 'backend', 'devops', 'qa', 'hr']),
  expertise: z.string().min(10, 'Please describe expertise (minimum 10 characters)'),
  experience: z.string().min(10, 'Please describe experience (minimum 10 characters)'),
});

export default function MentorCard({ mentor }: MentorCardProps) {
  const [, setLocation] = useLocation();
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const { toast } = useToast();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  
  const mentorForm = useForm({
    resolver: zodResolver(mentorFormSchema),
    defaultValues: {
      name: mentor.user?.name || '',
      domainRole: mentor.user?.domainRole || 'frontend',
      expertise: mentor.expertise,
      experience: mentor.experience,
    },
  });

  const [updateMentor] = useUpdateMentorMutation();
  const [deleteMentor] = useDeleteMentorMutation();

  const handleUpdateMentor = async (data: any) => {
    try {
      if (!mentor.id) {
        throw new Error('Mentor ID is missing');
      }
      await updateMentor({ id: mentor.id, mentorData: data }).unwrap();
      setIsEditOpen(false);
      toast({ title: 'Mentor updated', description: 'Mentor details updated.' });
    } catch (error: any) {
      console.error('Failed to update mentor:', error);
      toast({ title: 'Error', description: error?.message || 'Failed to update mentor', variant: 'destructive' });
    }
  };

  const handleDeleteMentor = async () => {
    try {
      await deleteMentor(mentor.id).unwrap();
      setIsDeleteOpen(false);
      toast({ title: 'Mentor deleted', description: 'Mentor has been removed.' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete mentor', variant: 'destructive' });
    }
  };

  const handleClick = () => {
    setLocation(`/mentors/${mentor.id}`);
  };

  const getDomainColor = (domain: string) => {
    const colors = {
      frontend: 'bg-white/10 text-blue-300',
      backend: 'bg-white/10 text-green-300',
      devops: 'bg-white/10 text-purple-300',
      qa: 'bg-white/10 text-yellow-300',
      hr: 'bg-white/10 text-red-300',
    };
    return colors[domain as keyof typeof colors] || 'bg-white/10 text-gray-300';
  };

  return (
    <motion.div 
      whileHover={{ y: -2 }} 
      transition={{ duration: 0.2 }}
      className="h-full" // Ensure full height for flex parent
    >
      <div 
        className="premium-card cursor-pointer h-full flex flex-col group relative" // Added group and relative
        onClick={handleClick}
        style={{ minHeight: '320px', maxHeight: '320px' }} // Fixed card dimensions
      >
        {/* Header */}
        <div className="text-center mb-4">
          <Avatar className="w-16 h-16 mx-auto mb-3 ring-2 ring-white/10">
            <AvatarImage src={mentor.user?.avatarUrl} alt={mentor.user?.name || 'Mentor'} />
            <AvatarFallback className="text-sm font-semibold bg-gradient-to-br from-white/20 to-white/10 text-white">
              {mentor.user?.name ? mentor.user.name.split(' ').map(n => n[0]).join('') : 'M'}
            </AvatarFallback>
          </Avatar>
          
          <h3 className="text-lg font-semibold mb-1 text-white truncate">{mentor.user?.name || 'Unknown Mentor'}</h3>
          <p className="text-white/60 text-xs mb-2 truncate" title={mentor.expertise}>{mentor.expertise}</p>
          <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
            mentor.user?.domainRole === 'frontend' ? 'bg-white/10 text-blue-300' :
            mentor.user?.domainRole === 'backend' ? 'bg-white/10 text-green-300' :
            mentor.user?.domainRole === 'devops' ? 'bg-white/10 text-purple-300' :
            mentor.user?.domainRole === 'qa' ? 'bg-white/10 text-yellow-300' :
            mentor.user?.domainRole === 'hr' ? 'bg-white/10 text-red-300' :
            'bg-white/10 text-gray-300'
          }`}>
            {mentor.user?.domainRole || 'Unknown'}
          </div>
        </div>

        {/* Stats Section - Flexible */}
        <div className="flex-1 space-y-3">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-lg font-bold text-white">{mentor.stats?.buddiesCount || 0}</p>
              <p className="text-white/50 text-xs">Buddies</p>
            </div>
            <div>
              <p className="text-lg font-bold text-green-400">{mentor.stats?.completedTasks || 0}</p>
              <p className="text-white/50 text-xs">Tasks</p>
            </div>
            <div>
              <p className="text-lg font-bold text-white">{mentor.responseRate}%</p>
              <p className="text-white/50 text-xs">Response</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div>
            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-white/40 to-white/60 rounded-full transition-all duration-500"
                style={{ width: `${mentor.responseRate}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Actions Section - Inside card header */}
        <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            className="p-1.5 rounded-md bg-white/10 hover:bg-white/20 transition-colors text-white/60 hover:text-white"
            onClick={(e) => {
              e.stopPropagation();
              setIsMessageModalOpen(true);
            }}
          >
            <MessageCircle className="h-3.5 w-3.5" />
          </button>
          
          <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
            <DialogTrigger asChild>
              <button 
                className="p-1.5 rounded-md bg-white/10 hover:bg-white/20 transition-colors text-white/60 hover:text-white"
                onClick={(e) => { e.stopPropagation(); }}
              >
                <Edit className="w-3.5 h-3.5" />
              </button>
            </DialogTrigger>
            <DialogContent className="premium-card border-white/10 fixed-modal">
              <DialogHeader><DialogTitle className="text-white">Edit Mentor</DialogTitle></DialogHeader>
              <form onSubmit={mentorForm.handleSubmit(handleUpdateMentor)} className="space-y-4">
                <Input {...mentorForm.register('name')} placeholder="Full Name" className="input-premium" />
                <Select value={mentorForm.watch('domainRole')} onValueChange={v => mentorForm.setValue('domainRole', v)}>
                  <SelectTrigger className="input-premium"><SelectValue placeholder="Domain" /></SelectTrigger>
                  <SelectContent className="premium-card border-white/10">
                    <SelectItem value="frontend">Frontend</SelectItem>
                    <SelectItem value="backend">Backend</SelectItem>
                    <SelectItem value="devops">DevOps</SelectItem>
                    <SelectItem value="qa">QA</SelectItem>
                    <SelectItem value="hr">HR</SelectItem>
                  </SelectContent>
                </Select>
                <Textarea {...mentorForm.register('expertise')} placeholder="Expertise" className="input-premium" />
                <Textarea {...mentorForm.register('experience')} placeholder="Experience" className="input-premium" />
                <div className="flex justify-end gap-2">
                  <button type="button" className="px-4 py-2 rounded-lg border border-white/20 bg-white/5 hover:bg-white/10 transition-colors text-white/80 hover:text-white" onClick={() => setIsEditOpen(false)}>Cancel</button>
                  <button type="submit" className="btn-gradient">Save</button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
          
          <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
            <DialogTrigger asChild>
              <button 
                className="p-1.5 rounded-md bg-white/5 hover:bg-red-500/20 transition-colors text-red-400 hover:text-red-300"
                onClick={(e) => { e.stopPropagation(); }}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </DialogTrigger>
            <DialogContent className="premium-card border-white/10 fixed-modal">
              <DialogHeader><DialogTitle className="text-white">Delete Mentor</DialogTitle></DialogHeader>
              <p className="text-white/80">Are you sure you want to delete this mentor?</p>
              <div className="flex justify-end gap-2 mt-4">
                <button type="button" className="px-4 py-2 rounded-lg border border-white/20 bg-white/5 hover:bg-white/10 transition-colors text-white/80 hover:text-white" onClick={() => setIsDeleteOpen(false)}>Cancel</button>
                <button type="button" className="px-4 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 transition-colors text-red-300 hover:text-red-200" onClick={handleDeleteMentor}>Delete</button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <MessageModal
        isOpen={isMessageModalOpen}
        onClose={() => setIsMessageModalOpen(false)}
        recipient={{
          id: mentor.id,
          name: mentor.user?.name || 'Unknown Mentor',
          avatarUrl: mentor.user?.avatarUrl,
          role: 'mentor',
          domainRole: mentor.user?.domainRole || 'unknown'
        }}
      />
    </motion.div>
  );
}
