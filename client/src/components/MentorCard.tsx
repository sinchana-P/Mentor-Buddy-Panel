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
      frontend: 'text-blue-500 bg-blue-500/20',
      backend: 'text-green-500 bg-green-500/20',
      devops: 'text-purple-500 bg-purple-500/20',
      qa: 'text-yellow-500 bg-yellow-500/20',
      hr: 'text-red-500 bg-red-500/20',
    };
    return colors[domain as keyof typeof colors] || 'text-gray-500 bg-gray-500/20';
  };

  return (
    <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
      <Card 
        className="cursor-pointer transition-all duration-300 hover:border-primary hover:shadow-lg"
        onClick={handleClick}
      >
        <CardContent className="p-6">
          <div className="text-center">
            <Avatar className="w-20 h-20 mx-auto mb-4">
              <AvatarImage src={mentor.user?.avatarUrl} alt={mentor.user?.name || 'Mentor'} />
              <AvatarFallback className="text-lg">
                {mentor.user?.name ? mentor.user.name.split(' ').map(n => n[0]).join('') : 'M'}
              </AvatarFallback>
            </Avatar>
            
            <h3 className="text-lg font-semibold mb-1">{mentor.user?.name || 'Unknown Mentor'}</h3>
            <p className="text-muted-foreground text-sm mb-2">{mentor.expertise}</p>
            <Badge className={getDomainColor(mentor.user?.domainRole || 'unknown')}>
              {mentor.user?.domainRole || 'Unknown'}
            </Badge>
          </div>

          <div className="mt-4 pt-4 border-t">
            <div className="flex justify-between text-sm">
              <div className="text-center">
                <p className="font-semibold">{mentor.stats?.buddiesCount || 0}</p>
                <p className="text-muted-foreground">Buddies</p>
              </div>
              <div className="text-center">
                <p className="font-semibold text-green-500">{mentor.stats?.completedTasks || 0}</p>
                <p className="text-muted-foreground">Tasks</p>
              </div>
              <div className="text-center">
                <p className="font-semibold">{mentor.experience}</p>
                <p className="text-muted-foreground">Exp</p>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">Response Rate</span>
              <span className="text-xs font-medium">{mentor.responseRate}%</span>
            </div>
            <Progress value={mentor.responseRate} className="h-1" />
          </div>

          <div className="mt-4 pt-4 border-t">
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={(e) => {
                e.stopPropagation();
                setIsMessageModalOpen(true);
              }}
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Message
            </Button>
          </div>

          <div className="flex justify-end gap-2 mb-2">
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
              <DialogTrigger asChild>
                <Button size="icon" variant="ghost" onClick={e => { e.stopPropagation(); setIsEditOpen(true); }}><Edit className="w-4 h-4" /></Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Edit Mentor</DialogTitle></DialogHeader>
                <form onSubmit={mentorForm.handleSubmit(handleUpdateMentor)} className="space-y-4">
                  <Input {...mentorForm.register('name')} placeholder="Full Name" />
                  <Select value={mentorForm.watch('domainRole')} onValueChange={v => mentorForm.setValue('domainRole', v)}>
                    <SelectTrigger><SelectValue placeholder="Domain" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="frontend">Frontend</SelectItem>
                      <SelectItem value="backend">Backend</SelectItem>
                      <SelectItem value="devops">DevOps</SelectItem>
                      <SelectItem value="qa">QA</SelectItem>
                      <SelectItem value="hr">HR</SelectItem>
                    </SelectContent>
                  </Select>
                  <Textarea {...mentorForm.register('expertise')} placeholder="Expertise" />
                  <Textarea {...mentorForm.register('experience')} placeholder="Experience" />
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
                    <Button type="submit">Save</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
            <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
              <DialogTrigger asChild>
                <Button size="icon" variant="ghost" onClick={e => { e.stopPropagation(); setIsDeleteOpen(true); }}><Trash2 className="w-4 h-4 text-red-500" /></Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Delete Mentor</DialogTitle></DialogHeader>
                <p>Are you sure you want to delete this mentor?</p>
                <div className="flex justify-end gap-2 mt-4">
                  <Button type="button" variant="outline" onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
                  <Button type="button" variant="destructive" onClick={handleDeleteMentor}>Delete</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

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
