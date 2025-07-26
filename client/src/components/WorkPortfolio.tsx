import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Github, ExternalLink } from 'lucide-react';

interface PortfolioItem {
  id: string;
  title: string;
  description?: string;
  githubLink?: string;
  deployedUrl?: string;
  completedAt: string;
  technologies?: string[];
}

interface WorkPortfolioProps {
  portfolio: PortfolioItem[];
}

export default function WorkPortfolio({ portfolio }: WorkPortfolioProps) {
  if (!portfolio || portfolio.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Work Portfolio</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Github className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No portfolio items yet</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Work Portfolio</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {portfolio.map((item) => (
            <div key={item.id} className="border rounded-lg p-3">
              <h4 className="font-medium text-sm mb-2">{item.title}</h4>
              
              {item.description && (
                <p className="text-xs text-muted-foreground mb-2">{item.description}</p>
              )}
              
              <div className="flex items-center space-x-2 text-xs text-muted-foreground mb-2">
                <Calendar className="w-3 h-3" />
                <span>{new Date(item.completedAt).toLocaleDateString()}</span>
              </div>

              {item.technologies && item.technologies.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {item.technologies.map((tech) => (
                    <Badge key={tech} variant="outline" className="text-xs">
                      {tech}
                    </Badge>
                  ))}
                </div>
              )}

              <div className="flex space-x-2">
                {item.githubLink && (
                  <Button variant="outline" size="sm" asChild>
                    <a 
                      href={item.githubLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs"
                    >
                      <Github className="w-3 h-3 mr-1" />
                      Code
                    </a>
                  </Button>
                )}
                
                {item.deployedUrl && (
                  <Button variant="outline" size="sm" asChild>
                    <a 
                      href={item.deployedUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs"
                    >
                      <ExternalLink className="w-3 h-3 mr-1" />
                      Demo
                    </a>
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
