import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, UserPlus, Filter } from 'lucide-react';


type Buddy = {
  id: string;
  user: {
    name: string;
    email: string;
    avatarUrl?: string;
  };
  mentor: {
    name: string;
  } | null;
  domainRole: string;
  status: 'active' | 'inactive' | 'exited';
  startDate: string;
  stats: {
    completedTasks: number;
    totalTasks: number;
  };
};

export default function BuddiesPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [domainFilter, setDomainFilter] = useState<string>('all');

  const { data: buddies = [], isLoading } = useQuery<Buddy[]>({
    queryKey: ['/api/buddies', { status: statusFilter, domain: domainFilter, search }],
  });

  const filteredBuddies = buddies.filter(buddy => {
    const matchesSearch = buddy.user.name.toLowerCase().includes(search.toLowerCase()) ||
                         buddy.user.email.toLowerCase().includes(search.toLowerCase());
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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-48 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Buddies</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage and track buddy progress</p>
        </div>

        {/* Filters and Search */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search buddies..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[120px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="exited">Exited</SelectItem>
              </SelectContent>
            </Select>

            <Select value={domainFilter} onValueChange={setDomainFilter}>
              <SelectTrigger className="w-[130px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Domains</SelectItem>
                <SelectItem value="frontend">Frontend</SelectItem>
                <SelectItem value="backend">Backend</SelectItem>
                <SelectItem value="devops">DevOps</SelectItem>
                <SelectItem value="qa">QA</SelectItem>
                <SelectItem value="hr">HR</SelectItem>
              </SelectContent>
            </Select>

            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
              <UserPlus className="h-4 w-4 mr-2" />
              Add Buddy
            </Button>
          </div>
        </div>

        {/* Buddies Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBuddies.map((buddy) => (
            <Card key={buddy.id} className="hover:shadow-lg transition-shadow duration-200 cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={buddy.user.avatarUrl} />
                      <AvatarFallback className="bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-200">
                        {buddy.user.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{buddy.user.name}</CardTitle>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{buddy.user.email}</p>
                    </div>
                  </div>
                  <Badge className={getStatusColor(buddy.status)}>
                    {buddy.status}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Domain:</span>
                    <Badge className={getDomainColor(buddy.domainRole)}>
                      {buddy.domainRole}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Mentor:</span>
                    <span className="text-sm font-medium">
                      {buddy.mentor?.name || 'Not assigned'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Tasks:</span>
                    <span className="text-sm font-medium">
                      {buddy.stats.completedTasks}/{buddy.stats.totalTasks} completed
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Start Date:</span>
                    <span className="text-sm">
                      {new Date(buddy.startDate).toLocaleDateString()}
                    </span>
                  </div>

                  {buddy.stats.totalTasks > 0 && (
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${(buddy.stats.completedTasks / buddy.stats.totalTasks) * 100}%` 
                        }}
                      ></div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredBuddies.length === 0 && (
          <div className="text-center py-12">
            <UserPlus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No buddies found</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {search || statusFilter !== 'all' || domainFilter !== 'all' 
                ? 'Try adjusting your filters' 
                : 'Get started by adding your first buddy'}
            </p>
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
              <UserPlus className="h-4 w-4 mr-2" />
              Add Buddy
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}