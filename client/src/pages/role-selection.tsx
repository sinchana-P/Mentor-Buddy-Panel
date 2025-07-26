import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Code, Server, Settings, Bug, Users } from 'lucide-react';
import { useLocation } from 'wouter';

const roles = [
  {
    id: 'frontend',
    name: 'Frontend',
    description: 'React, Vue, Angular',
    icon: Code,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/20',
  },
  {
    id: 'backend',
    name: 'Backend',
    description: 'Node.js, Python, Java',
    icon: Server,
    color: 'text-green-500',
    bgColor: 'bg-green-500/20',
  },
  {
    id: 'devops',
    name: 'DevOps',
    description: 'AWS, Docker, K8s',
    icon: Settings,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/20',
  },
  {
    id: 'qa',
    name: 'QA',
    description: 'Testing, Automation',
    icon: Bug,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500/20',
  },
  {
    id: 'hr',
    name: 'HR',
    description: 'Recruitment, People Ops',
    icon: Users,
    color: 'text-red-500',
    bgColor: 'bg-red-500/20',
  },
];

export default function RoleSelectionPage() {
  const { updateUserRole } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(false);

  const handleRoleSelect = async (domainRole: string) => {
    setLoading(true);

    // Default to 'buddy' role, but this could be configurable
    const { error } = await updateUserRole('buddy', domainRole);

    if (error) {
      toast({
        title: "Role Selection Failed",
        description: error,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Role Selected",
        description: `You've been assigned to the ${domainRole} domain.`,
      });
      setLocation('/dashboard');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-4xl"
      >
        <Card className="w-full">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Select Your Role</CardTitle>
            <CardDescription>
              Choose your technical domain to get started
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {roles.map((role, index) => {
                const Icon = role.icon;
                return (
                  <motion.div
                    key={role.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Button
                      variant="outline"
                      className="w-full h-auto p-6 text-left hover:border-primary transition-colors"
                      onClick={() => handleRoleSelect(role.id)}
                      disabled={loading}
                    >
                      <div className="flex flex-col items-center text-center space-y-3">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${role.bgColor}`}>
                          <Icon className={`w-6 h-6 ${role.color}`} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-base">{role.name}</h3>
                          <p className="text-sm text-muted-foreground">{role.description}</p>
                        </div>
                      </div>
                    </Button>
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
