import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { apiRequest } from '@/lib/queryClient';
import { Loader2, Plus } from 'lucide-react';

interface AddResourceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddResourceModal({ isOpen, onClose }: AddResourceModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: '',
    category: '',
    url: '',
    tags: '',
    difficulty: '',
    duration: '',
    author: ''
  });

  const queryClient = useQueryClient();

  const addResourceMutation = useMutation({
    mutationFn: (data: any) =>
      apiRequest('POST', '/api/resources', {
        ...data,
        tags: data.tags.split(',').map((tag: string) => tag.trim()).filter(Boolean)
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/resources'] });
      onClose();
      setFormData({
        title: '',
        description: '',
        type: '',
        category: '',
        url: '',
        tags: '',
        difficulty: '',
        duration: '',
        author: ''
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addResourceMutation.mutate(formData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="fixed-modal sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-white">Add New Resource</DialogTitle>
          <DialogDescription className="text-white/70">
            Add a new learning resource to the platform.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="title" className="form-label">Title *</label>
              <input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Resource title"
                className="input-premium"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="url" className="form-label">URL *</label>
              <input
                id="url"
                type="url"
                value={formData.url}
                onChange={(e) => handleInputChange('url', e.target.value)}
                placeholder="https://example.com"
                className="input-premium"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="form-label">Description *</label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Brief description of the resource"
              rows={3}
              className="input-premium"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="type" className="form-label">Type *</label>
              <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                <SelectTrigger className="select-trigger">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent className="select-content">
                  <SelectItem value="documentation" className="select-item">Documentation</SelectItem>
                  <SelectItem value="video" className="select-item">Video</SelectItem>
                  <SelectItem value="article" className="select-item">Article</SelectItem>
                  <SelectItem value="course" className="select-item">Course</SelectItem>
                  <SelectItem value="tool" className="select-item">Tool</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label htmlFor="category" className="form-label">Category *</label>
              <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                <SelectTrigger className="select-trigger">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="select-content">
                  <SelectItem value="frontend" className="select-item">Frontend</SelectItem>
                  <SelectItem value="backend" className="select-item">Backend</SelectItem>
                  <SelectItem value="fullstack" className="select-item">Full Stack</SelectItem>
                  <SelectItem value="devops" className="select-item">DevOps</SelectItem>
                  <SelectItem value="qa" className="select-item">QA</SelectItem>
                  <SelectItem value="hr" className="select-item">HR</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="difficulty" className="form-label">Difficulty *</label>
              <Select value={formData.difficulty} onValueChange={(value) => handleInputChange('difficulty', value)}>
                <SelectTrigger className="select-trigger">
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent className="select-content">
                  <SelectItem value="beginner" className="select-item">Beginner</SelectItem>
                  <SelectItem value="intermediate" className="select-item">Intermediate</SelectItem>
                  <SelectItem value="advanced" className="select-item">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label htmlFor="duration" className="form-label">Duration</label>
              <input
                id="duration"
                value={formData.duration}
                onChange={(e) => handleInputChange('duration', e.target.value)}
                placeholder="e.g., 2 hours, 30 min"
                className="input-premium"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="author" className="form-label">Author</label>
            <input
              id="author"
              value={formData.author}
              onChange={(e) => handleInputChange('author', e.target.value)}
              placeholder="Resource author or creator"
              className="input-premium"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="tags" className="form-label">Tags</label>
            <input
              id="tags"
              value={formData.tags}
              onChange={(e) => handleInputChange('tags', e.target.value)}
              placeholder="react, javascript, frontend (comma separated)"
              className="input-premium"
            />
          </div>
        </form>
        
        <DialogFooter>
          <button onClick={onClose} className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white/80 hover:text-white">
            Cancel
          </button>
          <button 
            onClick={handleSubmit} 
            disabled={addResourceMutation.isPending || !formData.title || !formData.url || !formData.type || !formData.category || !formData.difficulty}
            className="btn-gradient"
          >
            {addResourceMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Plus className="mr-2 h-4 w-4" />
            Add Resource
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 