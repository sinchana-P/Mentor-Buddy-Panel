import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useIsMobile } from '@/hooks/use-mobile';
import { Menu, Search, Bell } from 'lucide-react';

interface TopBarProps {
  onMobileMenuClick?: () => void;
}

export default function TopBar({ onMobileMenuClick }: TopBarProps) {
  const isMobile = useIsMobile();
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header className="bg-card border-b border-border h-16 flex items-center justify-between px-6">
      <div className="flex items-center space-x-4">
        {isMobile && (
          <Button 
            variant="ghost" 
            size="sm"
            onClick={onMobileMenuClick}
          >
            <Menu className="w-4 h-4" />
          </Button>
        )}
        <h1 className="text-xl font-semibold">Dashboard</h1>
      </div>

      <div className="flex items-center space-x-4">
        {/* Search */}
        {!isMobile && (
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search mentors, buddies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64 pl-9"
            />
          </div>
        )}

        {/* Notifications */}
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="w-4 h-4" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full"></span>
        </Button>
      </div>
    </header>
  );
}
