import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { useAuth } from './contexts/AuthContext';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import DashboardLayout from './components/layout/DashboardLayout';
import Dashboard from './pages/Dashboard';
import TasksKanban from './pages/TasksKanban';
import Admin from './pages/Admin';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Leaderboard from './pages/Leaderboard';

function App() {
  const { loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🐸</div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-right" richColors />
      <Routes>
      {/* Public routes */}
      <Route path="/" element={!isAuthenticated ? <Landing /> : <Navigate to="/app/dashboard" replace />} />
      <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/app/dashboard" replace />} />
      <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/app/dashboard" replace />} />
      
      {/* Protected routes with layout */}
      <Route
        path="/app"
        element={isAuthenticated ? <DashboardLayout /> : <Navigate to="/login" replace />}
      >
        <Route index element={<Navigate to="/app/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="tasks" element={<TasksKanban />} />
        <Route path="leaderboard" element={<Leaderboard />} />
        <Route path="admin" element={<Admin />} />
        <Route path="profile" element={<Profile />} />
        <Route path="settings" element={<Settings />} />
      </Route>
      
      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </>
  );
}

export default App
