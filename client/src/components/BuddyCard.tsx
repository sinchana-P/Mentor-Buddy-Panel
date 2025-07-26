import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { useLocation } from 'wouter';

interface BuddyCardProps {
  buddy: {
    id: string;
    user: {
      name: string;
      domainRole: string;
      avatarUrl?: string;
    };
    status: 'active' | 'inactive' | 'exited';
    joinDate: string;
    progress: number;
    mentor?: {
      user: {
        name: string;
      };
    };
    stats?: {
      completedTasks: number;
      totalTasks: number;
    };
  };
  showMentor?: boolean;
}

export default function BuddyCard({ buddy, showMentor = true }: BuddyCardProps) {
  const [, setLocation] = useLocation();

  const handleClick = () => {
    setLocation(`/buddies/${buddy.id}`);
  };

  const getStatusColor = (status: string) => {
    const colors = {
      active: 'text-green-500 bg-green-500/20',
      inactive: 'text-yellow-500 bg-yellow-500/20',
      exited: 'text-red-500 bg-red-500/20',
    };
    return colors[status as keyof typeof colors] || 'text-gray-500 bg-gray-500/20';
  };

  return (
    <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
      <Card 
        className="cursor-pointer transition-all duration-300 hover:border-green-500 hover:shadow-lg"
        onClick={handleClick}
      >
        <CardContent className="p-6">
          <div className="flex items-center space-x-4 mb-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={buddy.user.avatarUrl} alt={buddy.user.name} />
              <AvatarFallback>
                {buddy.user.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold truncate">{buddy.user.name}</h3>
              <p className="text-muted-foreground text-sm">
                Junior {buddy.user.domainRole} Developer
              </p>
              <Badge className={getStatusColor(buddy.status)}>
                {buddy.status}
              </Badge>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Join Date:</span>
              <span>{new Date(buddy.joinDate).toLocaleDateString()}</span>
            </div>
            
            {showMentor && buddy.mentor && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Mentor:</span>
                <span className="text-primary">{buddy.mentor.user.name}</span>
              </div>
            )}
            
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tasks Completed:</span>
              <span className="font-semibold text-green-500">
                {buddy.stats?.completedTasks || 0}/{buddy.stats?.totalTasks || 0}
              </span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progress:</span>
              <span className="font-semibold">{buddy.progress}%</span>
            </div>
          </div>

          <div className="mt-4">
            <Progress value={buddy.progress} className="h-2" />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
