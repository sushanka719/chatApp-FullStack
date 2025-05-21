import './App.css'
import {Login} from './pages/Login'
import {Routes, Route, Navigate} from 'react-router-dom'
import {Signup} from './pages/Signup'
import {VerifyEmail} from './pages/VerifyEmail'
import { ChatApp } from './components/ChatApp'
import { useEffect } from 'react'
import { useAuthStore } from './stores/Features/authStore'

// ProtectedRoute Component
const ProtectedRoute = ({ isAuthenticated, children }) => {
  if (!isAuthenticated) {
    // Redirect to login if not authenticated
    return <Navigate to="/" />;
  }
  return children;
};

function App() {
  const {
    user,
    isLoading,
    isAuthenticated,
    error,
    checkAuth,
  } = useAuthStore();

  useEffect(() => {
    checkAuth(); // Check authentication status on mount
  }, []);

  if (isLoading) {
    return <div>Checking authentication...</div>;
  }

  return (
    <div>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verifyEmail" element={<VerifyEmail />} />

        <Route
          path="/chatApp"
          element={
         
              <ChatApp />
         
          }
        />

        {/* Redirect authenticated users to /chatApp if they try to access login/signup */}
        {isAuthenticated && (
          <>
            <Route path="/signup" element={<Navigate to="/chatApp" />} />
            <Route path="/verifyEmail" element={<Navigate to="/chatApp" />} />
          </>
        )}
      </Routes>
    </div>
  );
}

export default App;
