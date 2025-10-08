import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';

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
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Redirect to login if not authenticated */}
      <Route
        path="/dashboard"
        element={
          isAuthenticated ? (
            <div className="min-h-screen bg-background flex items-center justify-center">
              <div className="text-center space-y-6">
                <h1 className="text-4xl font-bold">🐸 Dashboard</h1>
                <p className="text-muted-foreground">Coming soon...</p>
              </div>
            </div>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      
      {/* Default route */}
      <Route
        path="/"
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
    </Routes>
  );
}

export default App
