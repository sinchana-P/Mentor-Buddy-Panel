import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface Topic {
  id: string;
  name: string;
  checked: boolean;
}

interface TechnicalChecklistProps {
  buddyId: string;
  progress: {
    topics: Topic[];
    percentage: number;
  };
}

export default function TechnicalChecklist({ buddyId, progress }: TechnicalChecklistProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateProgressMutation = useMutation({
    mutationFn: async ({ topicId, checked }: { topicId: string; checked: boolean }) => {
      return apiRequest('PATCH', `/api/buddies/${buddyId}/progress/${topicId}`, { checked });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/buddies', buddyId, 'progress'] });
      toast({
        title: "Progress Updated",
        description: "Technical progress has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleTopicToggle = (topicId: string, checked: boolean) => {
    updateProgressMutation.mutate({ topicId, checked });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Technical Progress</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {progress.topics?.map((topic) => (
            <div key={topic.id} className="flex items-center space-x-3">
              <Checkbox
                id={topic.id}
                checked={topic.checked}
                onCheckedChange={(checked) => handleTopicToggle(topic.id, checked as boolean)}
                disabled={updateProgressMutation.isPending}
              />
              <label
                htmlFor={topic.id}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {topic.name}
              </label>
            </div>
          )) || (
            <div className="text-center py-4 text-muted-foreground">
              <p>No topics available</p>
            </div>
          )}
        </div>

        <div className="mt-6 pt-4 border-t">
          <div className="flex justify-between text-sm mb-2">
            <span>Progress</span>
            <span className="font-semibold">{progress.percentage}%</span>
          </div>
          <Progress value={progress.percentage} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
}
