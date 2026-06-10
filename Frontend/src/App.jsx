import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AppProvider } from './context/AppContext';

// Layout & Protection
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Jobs from './pages/Jobs';
import Profile from './pages/Profile';
import Portfolio from './pages/Portfolio';
import CommandPalette from './components/CommandPalette';

function App() {
  return (
    <AppProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/portfolio/:id" element={<Portfolio />} />

          {/* Protected Routes inside Layout */}
          <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/profile" element={<Profile />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <CommandPalette />
        <Toaster 
          position="top-right" 
          toastOptions={{
            style: {
              background: '#1a1d2e',
              color: '#e8eaf0',
              border: '1px solid rgba(255, 255, 255, 0.06)',
            },
            success: {
              iconTheme: {
                primary: '#22c55e',
                secondary: '#1a1d2e',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#1a1d2e',
              },
            },
          }} 
        />
      </Router>
    </AppProvider>
  );
}

export default App;
