import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { useLocation } from 'wouter';

interface MentorCardProps {
  mentor: {
    id: string;
    user: {
      name: string;
      domainRole: string;
      avatarUrl?: string;
    };
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

export default function MentorCard({ mentor }: MentorCardProps) {
  const [, setLocation] = useLocation();

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
              <AvatarImage src={mentor.user.avatarUrl} alt={mentor.user.name} />
              <AvatarFallback className="text-lg">
                {mentor.user.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            
            <h3 className="text-lg font-semibold mb-1">{mentor.user.name}</h3>
            <p className="text-muted-foreground text-sm mb-2">{mentor.expertise}</p>
            <Badge className={getDomainColor(mentor.user.domainRole)}>
              {mentor.user.domainRole}
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
        </CardContent>
      </Card>
    </motion.div>
  );
}
