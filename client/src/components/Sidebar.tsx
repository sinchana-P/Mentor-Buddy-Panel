import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useIsMobile } from '@/hooks/use-mobile';
import { 
  LayoutDashboard, 
  Presentation, 
  GraduationCap, 
  CheckSquare, 
  BarChart3, 
  Users, 
  X,
  LogOut,
  BookOpen,
  Settings,
  Sparkles,
  Crown
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Mentors', href: '/mentors', icon: Presentation },
  { name: 'Buddies', href: '/buddies', icon: GraduationCap },
  { name: 'Tasks', href: '/tasks', icon: CheckSquare },
  { name: 'Resources', href: '/resources', icon: BookOpen },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function Sidebar() {
  const [location] = useLocation();
  const { user, signOut } = useAuth();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      {/* Mobile sidebar overlay */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Premium Sidebar */}
      <motion.div
        initial={false}
        animate={isMobile ? { x: sidebarOpen ? 0 : -320 } : { x: 0 }}
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 premium-card transform transition-transform duration-300",
          !isMobile && "relative transform-none"
        )}
        style={{
          background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.04) 100%)',
          backdropFilter: 'blur(20px)',
          borderRight: '1px solid rgba(255, 255, 255, 0.1)'
        }}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-white/10">
          <motion.div 
            className="flex items-center space-x-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center shadow-lg">
              <Crown className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold text-gradient">Mentor-Buddy</span>
              <div className="flex items-center gap-1 mt-0.5">
                <Sparkles className="w-3 h-3 text-purple-400" />
                <span className="text-xs text-purple-400 font-medium">Premium</span>
              </div>
            </div>
          </motion.div>
          {isMobile && (
            <Button 
              variant="ghost" 
              size="sm"
              className="hover:bg-white/10 text-white"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Premium Navigation */}
        <nav className="mt-6 px-3">
          <div className="space-y-2">
            {navigation.map((item, index) => {
              const Icon = item.icon;
              const isActive = location === item.href || (item.href !== '/dashboard' && location.startsWith(item.href));
              
              return (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
                >
                  <Link href={item.href}>
                    <button
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden",
                        isActive 
                          ? "glass-card bg-white/10 text-white shadow-lg" 
                          : "hover:bg-white/5 text-white/80 hover:text-white"
                      )}
                      onClick={() => isMobile && setSidebarOpen(false)}
                    >
                      {isActive && (
                        <motion.div
                          className="absolute inset-0 gradient-primary opacity-20 rounded-xl"
                          layoutId="sidebar-active"
                          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                      )}
                      
                      <div className={cn(
                        "w-5 h-5 transition-all duration-300 relative z-10",
                        isActive ? "text-white" : "text-white/60 group-hover:text-white"
                      )}>
                        <Icon className="w-5 h-5" />
                      </div>
                      
                      <span className={cn(
                        "font-medium relative z-10 transition-all duration-300",
                        isActive ? "text-white" : "text-white/80 group-hover:text-white"
                      )}>
                        {item.name}
                      </span>
                      
                      {isActive && (
                        <motion.div
                          className="ml-auto w-2 h-2 bg-white rounded-full relative z-10"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.2 }}
                        />
                      )}
                    </button>
                  </Link>
                </motion.div>
              );
            })}
          </div>

          {/* Premium User Profile */}
          <motion.div 
            className="mt-8 px-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
          >
            <div className="premium-card relative overflow-hidden">
              <div className="absolute inset-0 gradient-primary opacity-10"></div>
              <div className="relative z-10">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="relative">
                    <Avatar className="w-12 h-12 ring-2 ring-white/20">
                      <AvatarImage src={user?.avatarUrl} alt={user?.name} />
                      <AvatarFallback className="bg-gradient-primary text-white font-semibold">
                        {user?.name?.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background animate-pulse"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                      <p className="text-xs text-purple-300 capitalize font-medium">{user?.role}</p>
                    </div>
                  </div>
                </div>
                
                <button 
                  className="w-full px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white/90 hover:text-white text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2 group"
                  onClick={signOut}
                >
                  <LogOut className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300" />
                  Sign Out
                </button>
              </div>
            </div>
          </motion.div>
        </nav>
      </motion.div>
    </>
  );
}
