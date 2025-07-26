import { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { useRoute } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import BuddyCard from '@/components/BuddyCard';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { ArrowLeft, MessageCircle, Edit, Plus } from 'lucide-react';
import { useLocation } from 'wouter';

export default function MentorProfilePage() {
  const [, params] = useRoute('/mentors/:id');
  const [, setLocation] = useLocation();
  const mentorId = params?.id;

  const [statusFilter, setStatusFilter] = useState('all');

  const { data: mentor, isLoading: mentorLoading } = useQuery({
    queryKey: ['/api/mentors', mentorId],
    enabled: !!mentorId,
  });

  const { data: assignedBuddies, isLoading: buddiesLoading } = useQuery({
    queryKey: ['/api/mentors', mentorId, 'buddies', statusFilter],
    enabled: !!mentorId,
  });

  if (mentorLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!mentor) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Mentor not found</p>
          <Button onClick={() => setLocation('/mentors')} className="mt-4">
            Back to Mentors
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => setLocation('/mentors')}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Mentors
        </Button>

        {/* Mentor Profile Header */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center space-x-6 mb-4 lg:mb-0">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={mentor.user?.avatarUrl} alt={mentor.user?.name} />
                  <AvatarFallback className="text-2xl">
                    {mentor.user?.name?.split(' ').map((n: string) => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-2xl font-bold mb-2">{mentor.user?.name}</h1>
                  <p className="text-muted-foreground mb-2">{mentor.expertise}</p>
                  <div className="flex items-center space-x-4">
                    <Badge variant="default">{mentor.user?.domainRole}</Badge>
                    <Badge variant={mentor.isActive ? "default" : "secondary"}>
                      {mentor.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <Button>
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Message
                </Button>
                <Button variant="outline">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              </div>
            </div>
            
            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t">
              <div className="text-center">
                <p className="text-2xl font-bold">{mentor.stats?.totalBuddies || 0}</p>
                <p className="text-sm text-muted-foreground">Total Buddies</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-500">{mentor.stats?.activeBuddies || 0}</p>
                <p className="text-sm text-muted-foreground">Active</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{mentor.stats?.completedTasks || 0}</p>
                <p className="text-sm text-muted-foreground">Tasks Completed</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{mentor.stats?.avgRating || 0}</p>
                <p className="text-sm text-muted-foreground">Avg Rating</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filter for Buddies */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-4 sm:space-y-0">
          <h2 className="text-xl font-bold">Assigned Buddies</h2>
          <div className="flex space-x-3">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="exited">Exited</SelectItem>
              </SelectContent>
            </Select>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Assign Buddy
            </Button>
          </div>
        </div>

        {/* Buddy Cards */}
        {buddiesLoading ? (
          <div className="flex items-center justify-center min-h-[200px]">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assignedBuddies?.map((buddy: any, index: number) => (
              <motion.div
                key={buddy.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <BuddyCard buddy={buddy} showMentor={false} />
              </motion.div>
            )) || (
              <div className="col-span-full text-center py-12">
                <div className="text-muted-foreground">
                  <p>No buddies assigned to this mentor</p>
                </div>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}
