// App.jsx - Main application component with routing
import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';
import ScrollToTop from './components/ScrollToTop';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import CreateBlog from './pages/CreateBlog';
import EditBlog from './pages/EditBlog';
import BlogDetails from './pages/BlogDetails';
import Dashboard from './pages/Dashboard';
import Account from './pages/Account';
import Feed from './pages/Feed';
import Profile from './pages/Profile';
import api from './services/api';
import { initSocket, disconnectSocket } from './services/socket';

function App() {
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState('light');
  const [socket, setSocket] = useState(null);

  // Theme Logic
  useEffect(() => {
    // Check localStorage or system preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  // Auth Logic
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const response = await api.get('/auth/me');
        setUser(response.data);
      } catch (error) {
        console.error('Auth check failed:', error.response?.data?.message || error.message);
        localStorage.removeItem('token');
      }
    };

    checkAuth();
  }, []);

  // Initialize Socket.IO when user is authenticated
  useEffect(() => {
    if (user?._id) {
      const s = initSocket(user._id);
      setSocket(s);
    }
    return () => {
      disconnectSocket();
    };
  }, [user]);

  return (
    <BrowserRouter>
      <ScrollToTop />
      <MainLayout user={user} theme={theme} toggleTheme={toggleTheme} socket={socket}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/create-blog" element={<CreateBlog />} />
          <Route path="/edit-blog/:id" element={<EditBlog />} />
          <Route path="/blog/:id" element={<BlogDetails user={user} setUser={setUser} />} />
          <Route path="/feed" element={<Feed user={user} setUser={setUser} />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute user={user}>
                <Dashboard user={user} setUser={setUser} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/account"
            element={
              <ProtectedRoute user={user}>
                <Account />
              </ProtectedRoute>
            }
          />
          <Route path="/profile/:userId" element={<Profile user={user} />} />
        </Routes>
      </MainLayout>
    </BrowserRouter>
  );
}

export default App;
