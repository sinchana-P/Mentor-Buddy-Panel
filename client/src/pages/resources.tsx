import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BookOpen, 
  Video, 
  FileText, 
  ExternalLink, 
  Download, 
  Search, 
  Filter,
  Play,
  Bookmark,
  Share2,
  Clock,
  Plus,
  Sparkles
} from 'lucide-react';
import AddResourceModal from '@/components/AddResourceModal';

interface Resource {
  id: string;
  title: string;
  description: string;
  type: 'documentation' | 'video' | 'article' | 'tool' | 'course';
  category: string;
  url: string;
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration?: string;
  author?: string;
  rating?: number;
  isBookmarked?: boolean;
}

export default function Resources() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [resources, setResources] = useState<Resource[]>([]);
  const [filteredResources, setFilteredResources] = useState<Resource[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    // TODO: Fetch resources from API
    const mockResources: Resource[] = [
      {
        id: '1',
        title: 'React Fundamentals',
        description: 'Complete guide to React basics and core concepts',
        type: 'course',
        category: 'frontend',
        url: 'https://react.dev/learn',
        tags: ['react', 'javascript', 'frontend'],
        difficulty: 'beginner',
        duration: '4 hours',
        author: 'React Team',
        rating: 4.8,
        isBookmarked: false
      },
      {
        id: '2',
        title: 'TypeScript Handbook',
        description: 'Official TypeScript documentation and tutorials',
        type: 'documentation',
        category: 'frontend',
        url: 'https://www.typescriptlang.org/docs/',
        tags: ['typescript', 'javascript', 'frontend'],
        difficulty: 'intermediate',
        author: 'Microsoft',
        rating: 4.9,
        isBookmarked: true
      },
      {
        id: '3',
        title: 'Node.js Best Practices',
        description: 'Comprehensive guide to Node.js development patterns',
        type: 'article',
        category: 'backend',
        url: 'https://github.com/goldbergyoni/nodebestpractices',
        tags: ['nodejs', 'backend', 'javascript'],
        difficulty: 'advanced',
        author: 'Yoni Goldberg',
        rating: 4.7,
        isBookmarked: false
      },
      {
        id: '4',
        title: 'Docker for Beginners',
        description: 'Learn Docker containerization from scratch',
        type: 'video',
        category: 'devops',
        url: 'https://www.youtube.com/watch?v=3c-iBn73dDE',
        tags: ['docker', 'devops', 'containers'],
        difficulty: 'beginner',
        duration: '2 hours',
        author: 'TechWorld with Nana',
        rating: 4.6,
        isBookmarked: false
      },
      {
        id: '5',
        title: 'Testing with Jest',
        description: 'Complete testing guide using Jest framework',
        type: 'course',
        category: 'qa',
        url: 'https://jestjs.io/docs/getting-started',
        tags: ['testing', 'jest', 'javascript'],
        difficulty: 'intermediate',
        duration: '3 hours',
        author: 'Jest Team',
        rating: 4.5,
        isBookmarked: false
      },
      {
        id: '6',
        title: 'Git Workflow Guide',
        description: 'Best practices for Git workflow and collaboration',
        type: 'documentation',
        category: 'devops',
        url: 'https://git-scm.com/book/en/v2',
        tags: ['git', 'version-control', 'collaboration'],
        difficulty: 'intermediate',
        author: 'Git Team',
        rating: 4.8,
        isBookmarked: true
      }
    ];
    
    setResources(mockResources);
    setFilteredResources(mockResources);
  }, []);

  useEffect(() => {
    let filtered = resources;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(resource =>
        resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(resource => resource.category === selectedCategory);
    }

    // Filter by difficulty
    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter(resource => resource.difficulty === selectedDifficulty);
    }

    // Filter by type
    if (selectedType !== 'all') {
      filtered = filtered.filter(resource => resource.type === selectedType);
    }

    setFilteredResources(filtered);
  }, [searchTerm, selectedCategory, selectedDifficulty, selectedType, resources]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'documentation':
        return <FileText className="h-4 w-4" />;
      case 'video':
        return <Video className="h-4 w-4" />;
      case 'article':
        return <BookOpen className="h-4 w-4" />;
      case 'course':
        return <Play className="h-4 w-4" />;
      case 'tool':
        return <ExternalLink className="h-4 w-4" />;
      default:
        return <BookOpen className="h-4 w-4" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-500/20 text-green-300 border border-green-500/30';
      case 'intermediate':
        return 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30';
      case 'advanced':
        return 'bg-red-500/20 text-red-300 border border-red-500/30';
      default:
        return 'bg-white/10 text-white/70 border border-white/20';
    }
  };

  const handleBookmark = (resourceId: string) => {
    setResources(prev => prev.map(resource =>
      resource.id === resourceId
        ? { ...resource, isBookmarked: !resource.isBookmarked }
        : resource
    ));
  };

  const handleShare = async (resource: Resource) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: resource.title,
          text: resource.description,
          url: resource.url,
        });
      } else {
        await navigator.clipboard.writeText(resource.url);
        // TODO: Show toast notification for copied URL
      }
    } catch (error) {
      console.error('Error sharing resource:', error);
    }
  };

  const handleDownload = async (resource: Resource) => {
    try {
      // For external URLs, we can't directly download, so we'll open in new tab
      // For actual files, we would implement proper download logic
      window.open(resource.url, '_blank');
    } catch (error) {
      console.error('Error downloading resource:', error);
    }
  };

  return (
    <div className="min-h-screen p-6 space-y-8">
      {/* Premium Header */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="premium-card glass-card mb-8"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mt-1">
              <BookOpen className="w-6 h-6 text-white/80" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-white mb-2">Resources</h1>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <p className="text-white/60">Learning materials, documentation, and tools</p>
              </div>
            </div>
          </div>
          <button onClick={() => setIsAddModalOpen(true)} className="btn-gradient mt-1">
            <Plus className="h-4 w-4 mr-2" />
            Add Resource
          </button>
        </div>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="premium-card"
      >
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 h-4 w-4" />
            <input
              placeholder="Search resources..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-premium pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="select-trigger w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="select-content">
                <SelectItem value="all" className="select-item">All Categories</SelectItem>
                <SelectItem value="frontend" className="select-item">Frontend</SelectItem>
                <SelectItem value="backend" className="select-item">Backend</SelectItem>
                <SelectItem value="devops" className="select-item">DevOps</SelectItem>
                <SelectItem value="qa" className="select-item">QA</SelectItem>
                <SelectItem value="hr" className="select-item">HR</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
              <SelectTrigger className="select-trigger w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="select-content">
                <SelectItem value="all" className="select-item">All Levels</SelectItem>
                <SelectItem value="beginner" className="select-item">Beginner</SelectItem>
                <SelectItem value="intermediate" className="select-item">Intermediate</SelectItem>
                <SelectItem value="advanced" className="select-item">Advanced</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="select-trigger w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="select-content">
                <SelectItem value="all" className="select-item">All Types</SelectItem>
                <SelectItem value="documentation" className="select-item">Documentation</SelectItem>
                <SelectItem value="video" className="select-item">Video</SelectItem>
                <SelectItem value="article" className="select-item">Article</SelectItem>
                <SelectItem value="course" className="select-item">Course</SelectItem>
                <SelectItem value="tool" className="select-item">Tool</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </motion.div>

      {/* Resources Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredResources.map((resource, index) => (
          <motion.div
            key={resource.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 * index }}
            className="premium-card group hover:bg-white/[0.08] transition-all duration-300 h-full flex flex-col"
          >
            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <div className="text-white/80">
                    {getTypeIcon(resource.type)}
                  </div>
                  <div className="px-2 py-1 rounded-full text-xs font-medium bg-white/10 text-white/70 border border-white/20">
                    {resource.type}
                  </div>
                </div>
                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleBookmark(resource.id)}
                    className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                  >
                    <Bookmark className={`h-4 w-4 ${resource.isBookmarked ? 'fill-current text-yellow-400' : 'text-white/60'}`} />
                  </button>
                  <button
                    onClick={() => handleShare(resource)}
                    className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white/60 hover:text-white"
                  >
                    <Share2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{resource.title}</h3>
              <p className="text-white/70 text-sm mb-4 line-clamp-2">
                {resource.description}
              </p>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-1">
                  {resource.tags.map((tag, tagIndex) => (
                    <div key={tagIndex} className="px-2 py-1 rounded-full text-xs font-medium bg-white/5 text-white/60 border border-white/10">
                      {tag}
                    </div>
                  ))}
                </div>
                
                <div className="flex items-center justify-between">
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    resource.difficulty === 'beginner' ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
                    resource.difficulty === 'intermediate' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' :
                    resource.difficulty === 'advanced' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                    'bg-white/10 text-white/70 border border-white/20'
                  }`}>
                    {resource.difficulty}
                  </div>
                  {resource.rating && (
                    <div className="flex items-center space-x-1">
                      <span className="text-sm font-medium text-white/80">{resource.rating}</span>
                      <span className="text-yellow-400">⭐</span>
                    </div>
                  )}
                </div>

                {resource.duration && (
                  <div className="flex items-center space-x-2 text-sm text-white/60">
                    <Clock className="h-4 w-4" />
                    <span>{resource.duration}</span>
                  </div>
                )}

                {resource.author && (
                  <div className="text-sm text-white/60">
                    By {resource.author}
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <a 
                href={resource.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn-gradient flex-1 text-center inline-flex items-center justify-center"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open
              </a>
              <button 
                onClick={() => handleDownload(resource)}
                className="p-3 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white/60 hover:text-white"
              >
                <Download className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredResources.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="premium-card text-center py-12"
        >
          <BookOpen className="h-12 w-12 mx-auto text-white/40 mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No resources found</h3>
          <p className="text-white/60">
            Try adjusting your search criteria or filters
          </p>
        </motion.div>
      )}

      <AddResourceModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  );
} 