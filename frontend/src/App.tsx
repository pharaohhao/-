import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { authService } from './services/auth';
import { useStore } from './store';
import Sidebar from './components/layout/Sidebar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import PersonaPage from './pages/PersonaPage';
import GraphPage from './pages/GraphPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  if (!authService.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-950">
      <Sidebar />
      <main className="ml-64 min-h-screen overflow-y-auto">
        {children}
      </main>
    </div>
  );
}

export default function App() {
  const loadPersonas = useStore((s) => s.loadPersonas);

  useEffect(() => {
    if (authService.isAuthenticated()) {
      loadPersonas();
    }
  }, [loadPersonas]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/persona/:id"
          element={
            <ProtectedRoute>
              <AppLayout>
                <PersonaPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/graph"
          element={
            <ProtectedRoute>
              <AppLayout>
                <GraphPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Home />
              </AppLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
