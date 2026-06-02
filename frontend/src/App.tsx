import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { authService } from './services/auth';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  if (!authService.isAuthenticated()) {
    return <Navigate to="/login" />;
  }
  return <>{children}</>;
}

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-950 text-gray-100">
        <Routes>
          <Route path="/login" element={<div className="flex items-center justify-center min-h-screen"><h1 className="text-2xl">Login</h1></div>} />
          <Route path="/register" element={<div className="flex items-center justify-center min-h-screen"><h1 className="text-2xl">Register</h1></div>} />
          <Route path="/" element={<ProtectedRoute><div className="flex items-center justify-center min-h-screen"><h1 className="text-2xl">Home</h1></div></ProtectedRoute>} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
