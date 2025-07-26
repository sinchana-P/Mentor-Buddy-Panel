// Test authentication helper - for development purposes
import { useAuth } from '@/hooks/useAuth';

export function TestAuthButton() {
  const { user } = useAuth();
  
  const createTestUser = async () => {
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'test@example.com',
          name: 'Test User',
          role: 'manager',
          domainRole: 'frontend',
        }),
      });
      
      if (response.ok) {
        const userData = await response.json();
        console.log('Test user created:', userData);
        // Store in localStorage for testing
        localStorage.setItem('user_profile', JSON.stringify(userData));
        window.location.reload();
      }
    } catch (error) {
      console.error('Error creating test user:', error);
    }
  };

  if (user) {
    return (
      <div className="p-4 bg-green-100 text-green-800 rounded">
        <p>Authenticated as: {user.name} ({user.role})</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-yellow-100 text-yellow-800 rounded">
      <p>Not authenticated</p>
      <button 
        onClick={createTestUser}
        className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Create Test User (Dev Only)
      </button>
    </div>
  );
}