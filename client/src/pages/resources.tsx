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
  Plus
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
        return 'text-green-500 bg-green-500/20';
      case 'intermediate':
        return 'text-yellow-500 bg-yellow-500/20';
      case 'advanced':
        return 'text-red-500 bg-red-500/20';
      default:
        return 'text-gray-500 bg-gray-500/20';
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
    <div className="container mx-auto p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Resources</h1>
            <p className="text-muted-foreground">Learning materials, documentation, and tools</p>
          </div>
          <Button onClick={() => setIsAddModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Resource
          </Button>
        </div>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="space-y-4"
      >
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search resources..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="frontend">Frontend</SelectItem>
                <SelectItem value="backend">Backend</SelectItem>
                <SelectItem value="devops">DevOps</SelectItem>
                <SelectItem value="qa">QA</SelectItem>
                <SelectItem value="hr">HR</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="documentation">Documentation</SelectItem>
                <SelectItem value="video">Video</SelectItem>
                <SelectItem value="article">Article</SelectItem>
                <SelectItem value="course">Course</SelectItem>
                <SelectItem value="tool">Tool</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </motion.div>

      {/* Resources Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
      >
        {filteredResources.map((resource, index) => (
          <motion.div
            key={resource.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 * index }}
          >
            <Card className="h-full hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    {getTypeIcon(resource.type)}
                    <Badge variant="outline" className="text-xs">
                      {resource.type}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleBookmark(resource.id)}
                    >
                      <Bookmark className={`h-4 w-4 ${resource.isBookmarked ? 'fill-current text-yellow-500' : ''}`} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleShare(resource)}
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <CardTitle className="text-lg">{resource.title}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {resource.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-1">
                  {resource.tags.map((tag, tagIndex) => (
                    <Badge key={tagIndex} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                
                <div className="flex items-center justify-between">
                  <Badge className={getDifficultyColor(resource.difficulty)}>
                    {resource.difficulty}
                  </Badge>
                  {resource.rating && (
                    <div className="flex items-center space-x-1">
                      <span className="text-sm font-medium">{resource.rating}</span>
                      <span className="text-yellow-500">⭐</span>
                    </div>
                  )}
                </div>

                {resource.duration && (
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{resource.duration}</span>
                  </div>
                )}

                {resource.author && (
                  <div className="text-sm text-muted-foreground">
                    By {resource.author}
                  </div>
                )}

                <div className="flex gap-2">
                  <Button asChild className="flex-1">
                    <a href={resource.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Open
                    </a>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDownload(resource)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {filteredResources.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No resources found</h3>
          <p className="text-muted-foreground">
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