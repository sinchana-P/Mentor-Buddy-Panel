import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { apiRequest } from '@/lib/queryClient';
import { Loader2 } from 'lucide-react';

interface EditMentorModalProps {
  isOpen: boolean;
  onClose: () => void;
  mentor: any;
}

export default function EditMentorModal({ isOpen, onClose, mentor }: EditMentorModalProps) {
  const [formData, setFormData] = useState({
    name: mentor?.user?.name || '',
    email: mentor?.user?.email || '',
    expertise: mentor?.expertise || '',
    bio: mentor?.bio || '',
    domainRole: mentor?.user?.domainRole || '',
    isActive: mentor?.isActive ?? true,
  });

  const queryClient = useQueryClient();

  const updateMentorMutation = useMutation({
    mutationFn: (data: any) =>
      apiRequest('PATCH', `/api/mentors/${mentor.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/mentors', mentor.id] });
      queryClient.invalidateQueries({ queryKey: ['/api/mentors'] });
      onClose();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMentorMutation.mutate(formData);
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Mentor Profile</DialogTitle>
          <DialogDescription>
            Update the mentor's information and preferences.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter full name"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Enter email address"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="expertise">Expertise</Label>
            <Input
              id="expertise"
              value={formData.expertise}
              onChange={(e) => handleInputChange('expertise', e.target.value)}
              placeholder="e.g., React, Node.js, DevOps"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="domainRole">Domain Role</Label>
            <Select value={formData.domainRole} onValueChange={(value) => handleInputChange('domainRole', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select domain role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="frontend">Frontend</SelectItem>
                <SelectItem value="backend">Backend</SelectItem>
                <SelectItem value="fullstack">Full Stack</SelectItem>
                <SelectItem value="devops">DevOps</SelectItem>
                <SelectItem value="qa">QA</SelectItem>
                <SelectItem value="hr">HR</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              placeholder="Tell us about your experience and mentoring approach..."
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={formData.isActive ? 'active' : 'inactive'} onValueChange={(value) => handleInputChange('isActive', value === 'active')}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </form>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={updateMentorMutation.isPending}
          >
            {updateMentorMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 