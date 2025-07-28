import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { apiRequest } from '@/lib/queryClient';
import { Loader2 } from 'lucide-react';
import type { Buddy } from '../types';

interface AssignBuddyModalProps {
  isOpen: boolean;
  onClose: () => void;
  mentorId: string;
  mentorName: string;
}

export default function AssignBuddyModal({ isOpen, onClose, mentorId, mentorName }: AssignBuddyModalProps) {
  const [selectedBuddyId, setSelectedBuddyId] = useState('');
  const queryClient = useQueryClient();

  // Fetch available buddies (not assigned to any mentor)
  const { data, isLoading } = useQuery({
    queryKey: ['/api/buddies', { status: 'active', unassigned: true }],
    enabled: isOpen,
  });

  const availableBuddies: Buddy[] = (data?.filter((b: any) => !b.mentor) ?? []) as Buddy[];

  const assignBuddyMutation = useMutation({
    mutationFn: (data: any) =>
      apiRequest('POST', '/api/assign-buddy', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/mentors', mentorId, 'buddies'] });
      queryClient.invalidateQueries({ queryKey: ['/api/buddies'] });
      onClose();
      setSelectedBuddyId('');
    },
  });

  const handleAssign = () => {
    if (selectedBuddyId) {
      assignBuddyMutation.mutate({ buddyId: selectedBuddyId, mentorId });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Assign Buddy to Mentor</DialogTitle>
          <DialogDescription>
            Select a buddy to assign to {mentorName}. Only unassigned active buddies are shown.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="buddy">Select Buddy</Label>
            <Select value={selectedBuddyId} onValueChange={setSelectedBuddyId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a buddy..." />
              </SelectTrigger>
              <SelectContent>
                {isLoading ? (
                  <SelectItem value="" disabled>
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading buddies...
                    </div>
                  </SelectItem>
                ) : availableBuddies.length === 0 ? (
                  <SelectItem value="" disabled>
                    No available buddies
                  </SelectItem>
                ) : (
                  availableBuddies.map((buddy: Buddy) => (
                    <SelectItem key={buddy.id} value={buddy.id}>
                      {buddy.user?.name || 'Unknown Buddy'} ({buddy.user?.domainRole || 'Unknown'})
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleAssign} 
            disabled={!selectedBuddyId || assignBuddyMutation.isPending}
          >
            {assignBuddyMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Assign Buddy
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 