import { ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import AuthPage from '@/pages/auth';

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  // Since we now auto-create demo user in AuthContext, this should always pass
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // User should always exist now due to auto demo setup
  return <>{children}</>;
}
