import { ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import AuthPage from '@/pages/auth';

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  const createTestUser = async () => {
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'demo@mentorpanel.com',
          name: 'Demo User',
          role: 'manager',
          domainRole: 'frontend',
        }),
      });
      
      if (response.ok) {
        const userData = await response.json();
        console.log('Demo user created:', userData);
        localStorage.setItem('user_profile', JSON.stringify(userData));
        window.location.reload();
      }
    } catch (error) {
      console.error('Error creating demo user:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="max-w-md w-full space-y-6 p-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Mentor-Buddy Panel</h1>
            <p className="text-muted-foreground mb-6">Demo Mode - Click below to access the dashboard</p>
            <button 
              onClick={createTestUser}
              className="w-full px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Enter as Demo User
            </button>
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm text-muted-foreground mb-2">Or use Supabase Authentication:</p>
              <AuthPage />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
