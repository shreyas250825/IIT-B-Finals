import { Navigate, useLocation } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const location = useLocation();
  
  // Check if user is authenticated
  const userStr = localStorage.getItem('user');
  let isAuthenticated = false;
  
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      isAuthenticated = user.isAuthenticated === true;
    } catch (e) {
      console.error('Failed to parse user data:', e);
      localStorage.removeItem('user');
    }
  }

  if (!isAuthenticated) {
    // Redirect to sign in page, preserving the intended destination
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
