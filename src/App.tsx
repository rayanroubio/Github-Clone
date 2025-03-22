import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Repository from './pages/Repository';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import Search from './pages/Search';
import CreateRepository from './pages/CreateRepository';

const queryClient = new QueryClient();

function App() {
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <div className="min-h-screen bg-white">
                    <Header />
                    <Dashboard />
                  </div>
                </ProtectedRoute>
              }
            />
            <Route
              path="/new"
              element={
                <ProtectedRoute>
                  <div className="min-h-screen bg-white">
                    <Header />
                    <CreateRepository />
                  </div>
                </ProtectedRoute>
              }
            />
            <Route
              path="/:username"
              element={
                <ProtectedRoute>
                  <div className="min-h-screen bg-white">
                    <Header />
                    <Profile />
                  </div>
                </ProtectedRoute>
              }
            />
            <Route
              path="/:username/:repo"
              element={
                <ProtectedRoute>
                  <div className="min-h-screen bg-white">
                    <Header />
                    <Repository />
                  </div>
                </ProtectedRoute>
              }
            />
            <Route
              path="/search"
              element={
                <ProtectedRoute>
                  <div className="min-h-screen bg-white">
                    <Header />
                    <Search />
                  </div>
                </ProtectedRoute>
              }
            />
          </Routes>
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
}

export default App; 