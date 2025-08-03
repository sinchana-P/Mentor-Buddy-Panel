import { Link, useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/hooks/useAuth';
import { useIsMobile } from '@/hooks/use-mobile';
import { 
  LayoutDashboard, 
  Users, 
  UserCheck, 
  ClipboardList, 
  BookOpen,
  GraduationCap,
  Settings,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';
import TopBar from './TopBar';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Mentors', href: '/mentors', icon: Users },
  { name: 'Buddies', href: '/buddies', icon: UserCheck },
  { name: 'Tasks', href: '/tasks', icon: ClipboardList },
  { name: 'Resources', href: '/resources', icon: BookOpen },
  { name: 'Curriculum', href: '/curriculum', icon: GraduationCap },
];

interface LayoutProps {
  children?: React.ReactNode;
  theme?: string;
  setTheme?: (theme: string) => void;
}

export default function Layout({ children, theme, setTheme }: LayoutProps) {
  const [location] = useLocation();
  const { user, signOut } = useAuth();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    // Clear cached data and redirect
    localStorage.removeItem('user_profile');
    localStorage.removeItem('supabase_user_mapping');
    window.location.href = '/';
  };

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return location === '/' || location === '/dashboard';
    }
    return location === href || location.startsWith(href + '/');
  };

  const Sidebar = () => (
    <div className="flex flex-col h-full premium-card">
      {/* User Profile Section - Top */}
      <div className="p-6 border-b border-white/10">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-white/20 to-white/10 rounded-full flex items-center justify-center ring-2 ring-white/10 mx-auto mb-4">
            <span className="text-2xl font-bold text-white">
              {user?.name?.split(' ').map(n => n[0]).join('') || 'U'}
            </span>
          </div>
          <h3 className="text-lg font-bold text-white mb-1">
            {user?.name || 'James Black'}
          </h3>
          <p className="text-sm text-white/60 mb-2">
            {user?.email || 'jamesblack@gmail.com'}
          </p>
        </div>
        {isMobile && (
          <button 
            className="absolute top-4 right-4 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-white/60 hover:text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3">
        <div className="space-y-1 py-4">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link key={item.href} href={item.href}>
                <button
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-left",
                    active 
                      ? "bg-white/10 text-white shadow-sm" 
                      : "hover:bg-white/5 text-white/70 hover:text-white"
                  )}
                  onClick={() => isMobile && setSidebarOpen(false)}
                >
                  <Icon className={cn(
                    "h-5 w-5 transition-colors",
                    active ? "text-white" : "text-white/60"
                  )} />
                  <span className={cn(
                    "font-medium",
                    active ? "text-white" : "text-white/70"
                  )}>
                    {item.name}
                  </span>
                </button>
              </Link>
            );
          })}
        </div>
      </ScrollArea>

      {/* Bottom Actions */}
      <div className="p-3 border-t border-white/10 space-y-1">
        <Link href="/settings">
          <button className={cn(
            "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
            isActive('/settings') 
              ? "bg-white/10 text-white shadow-sm"
              : "hover:bg-white/5 text-white/70 hover:text-white"
          )}>
            <Settings className="h-5 w-5" />
            <span className="font-medium">Settings</span>
          </button>
        </Link>
        <button 
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-500/10 text-red-400 hover:text-red-300 transition-colors"
          onClick={handleSignOut}
        >
          <LogOut className="h-5 w-5" />
          <span className="font-medium">Log out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-background">
      {/* Mobile sidebar overlay */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/50 lg:hidden" 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-background border-r border-white/10 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
        isMobile && !sidebarOpen && "-translate-x-full"
      )}>
        <Sidebar />
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar for all screens */}
        <TopBar theme={theme || 'dark'} setTheme={setTheme || (() => {})} />
        {/* Page content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}